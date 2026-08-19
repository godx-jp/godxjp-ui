import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  closeSync,
  cpSync,
  existsSync,
  fsyncSync,
  mkdtempSync,
  mkdirSync,
  openSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve, sep } from "node:path";

export const RELEASE_STEPS = Object.freeze({
  ApplyTargetMetadata: "apply-target-metadata",
  VerifyRoot: "verify-root",
  InstallMcp: "install-mcp",
  BuildMcp: "build-mcp",
  TestMcp: "test-mcp",
  VerifyLockstep: "verify-lockstep",
  PackTargetManifests: "pack-target-manifests",
  VerifyNpmAuth: "verify-npm-auth",
  VerifyTargetAvailability: "verify-target-availability",
  RecordPreviousLatestTags: "record-previous-latest-tags",
  VerifyPublishTree: "verify-publish-tree",
  PublishUi: "publish-ui-staged",
  PublishMcp: "publish-mcp-staged",
  VerifyPublishedVersions: "verify-published-versions",
  PromoteUiLatest: "promote-ui-latest",
  PromoteMcpLatest: "promote-mcp-latest",
  CommitTargetMetadata: "commit-target-metadata",
});

/**
 * The single, constant, OVERWRITABLE staging dist-tag (issue #266). Earlier releases staged under
 * a per-version tag (`godx-staging-${targetVersion}`) and planned a final `npm dist-tag rm` pair —
 * but deleting a dist-tag requires npm DELETE rights the CI automation token does not have (and a
 * human login is still OTP-gated), so the rm steps aborted every release and the tags accumulated
 * forever. Publishing every release under this one constant tag makes each release overwrite the
 * previous staging pointer instead: nothing accumulates and no delete permission is ever needed.
 * The trade-off is accepted and asserted: after a successful release `godx-staging` simply equals
 * `latest` (both point at the released version) until the next release moves both.
 *
 * The six legacy tags already on the registry (`godx-staging-18.{7,8,9}.0` on @godxjp/ui and
 * @godxjp/ui-mcp) need a ONE-TIME manual removal by a human with 2FA/OTP (command in issue #266);
 * this script never creates versioned staging tags again.
 */
export const STAGE_TAG = "godx-staging";
const LEGACY_STAGE_TAG_FOR = (targetVersion) => `godx-staging-${targetVersion}`;

/**
 * Every gate that MUST have run — at the coordinated TARGET version — before the first byte is
 * published. Issue #230: `npm version` + immediate `npm publish` made the UI tarball immutable on
 * npm while it still declared the previous `godxUiMcp`, and any MCP failure was discovered too late
 * to repair. The target metadata is therefore written FIRST and every gate observes it.
 */
export const PREFLIGHT_STEPS = Object.freeze([
  RELEASE_STEPS.ApplyTargetMetadata,
  RELEASE_STEPS.VerifyRoot,
  RELEASE_STEPS.InstallMcp,
  RELEASE_STEPS.BuildMcp,
  RELEASE_STEPS.TestMcp,
  RELEASE_STEPS.VerifyLockstep,
  RELEASE_STEPS.PackTargetManifests,
  RELEASE_STEPS.VerifyNpmAuth,
  RELEASE_STEPS.VerifyTargetAvailability,
  RELEASE_STEPS.VerifyPublishTree,
]);

const PUBLISH_STEPS = new Set([RELEASE_STEPS.PublishUi, RELEASE_STEPS.PublishMcp]);

/** Pure ordering invariant: no publish step may precede any preflight gate. */
export function assertPreflightOrder(steps) {
  const firstPublish = steps.findIndex((step) => PUBLISH_STEPS.has(step));
  if (firstPublish === -1) return steps;
  for (const gate of PREFLIGHT_STEPS) {
    const at = steps.indexOf(gate);
    if (at === -1) throw new Error(`Release plan omits preflight gate "${gate}" before publish.`);
    if (at > firstPublish)
      throw new Error(`Release plan runs preflight gate "${gate}" after publish.`);
  }
  return steps;
}

const COORDINATED_MANIFESTS = new Set(["package.json", "mcp/package.json"]);
const VALID_UI_BUMPS = new Set(["patch", "minor", "major", "skip"]);
const VALID_MCP_BUMPS = new Set(["sync", "skip"]);
const SEMVER = /^(\d+)\.(\d+)\.(\d+)$/;

export function targetVersionFor(currentVersion, uiBump) {
  const match = SEMVER.exec(currentVersion);
  if (!match) throw new Error(`Current UI version "${currentVersion}" is not plain x.y.z semver.`);
  const [major, minor, patch] = match.slice(1).map(Number);
  if (uiBump === "skip") return currentVersion;
  if (uiBump === "patch") return `${major}.${minor}.${patch + 1}`;
  if (uiBump === "minor") return `${major}.${minor + 1}.0`;
  if (uiBump === "major") return `${major + 1}.0.0`;
  throw new Error(`Unsupported UI bump "${uiBump}".`);
}

export function compatibilityFor(version) {
  const match = SEMVER.exec(version);
  if (!match) throw new Error(`Target UI version "${version}" is not plain x.y.z semver.`);
  return `${match[1]}.${match[2]}.x`;
}

function packageProgress() {
  return {
    publishAttempted: false,
    published: false,
    promoted: false,
    compensated: false,
    previousLatest: null,
  };
}

function initialProgress(targetVersion, stageTag, sourceHead) {
  return {
    schemaVersion: 3,
    sourceHead,
    targetVersion,
    stageTag,
    manifests: null,
    artifacts: null,
    latestRecorded: false,
    latestCompensation: null,
    ui: packageProgress(),
    mcp: packageProgress(),
    committed: false,
    failedStep: null,
    error: null,
  };
}

export function buildReleasePlan({
  currentVersion,
  uiBump,
  mcpBump,
  sourceHead = "dry-run",
  recoveryState = null,
  adoptStagedVersion = null,
}) {
  if (!VALID_UI_BUMPS.has(uiBump) || !VALID_MCP_BUMPS.has(mcpBump)) {
    throw new Error(
      "Usage: node scripts/release.mjs --ui <patch|minor|major> --mcp sync [--metadata-plan]",
    );
  }
  if (recoveryState && adoptStagedVersion) {
    throw new Error("Recovery state and staged adoption are mutually exclusive.");
  }
  if (adoptStagedVersion) {
    if (!SEMVER.test(adoptStagedVersion) || adoptStagedVersion === currentVersion) {
      throw new Error("Staged adoption requires a different plain x.y.z target version.");
    }
    if (uiBump !== "skip" || mcpBump !== "sync") {
      throw new Error("Staged adoption must use --ui skip --mcp sync.");
    }
  } else if (recoveryState) {
    if (uiBump !== "skip" || mcpBump !== "sync") throw new Error("Recovery must use --recovery.");
    if (currentVersion !== recoveryState.targetVersion) {
      throw new Error("Recovery target does not match preserved manifests.");
    }
  } else if (uiBump === "skip" && mcpBump === "sync") {
    throw new Error("MCP-only sync is recovery-only; use recorded --recovery state.");
  } else if (uiBump === "skip" || mcpBump !== "sync") {
    throw new Error("A UI release requires --mcp sync.");
  }

  const targetVersion =
    recoveryState?.targetVersion ?? adoptStagedVersion ?? targetVersionFor(currentVersion, uiBump);
  // Recovery keeps whatever tag the interrupted release actually published under — including the
  // legacy per-version `godx-staging-${targetVersion}` from pre-#266 recovery files.
  const stageTag = recoveryState?.stageTag ?? STAGE_TAG;
  const progress = structuredClone(
    recoveryState ?? initialProgress(targetVersion, stageTag, sourceHead),
  );
  if (adoptStagedVersion) {
    progress.ui.publishAttempted = true;
    progress.ui.published = true;
    progress.mcp.publishAttempted = true;
    progress.mcp.published = true;
  }
  const steps = [
    RELEASE_STEPS.ApplyTargetMetadata,
    RELEASE_STEPS.VerifyRoot,
    RELEASE_STEPS.InstallMcp,
    RELEASE_STEPS.BuildMcp,
    RELEASE_STEPS.TestMcp,
    RELEASE_STEPS.VerifyLockstep,
    RELEASE_STEPS.PackTargetManifests,
    RELEASE_STEPS.VerifyNpmAuth,
    RELEASE_STEPS.VerifyTargetAvailability,
  ];
  if (!progress.latestRecorded) steps.push(RELEASE_STEPS.RecordPreviousLatestTags);
  steps.push(RELEASE_STEPS.VerifyPublishTree);
  if (!progress.ui.published) steps.push(RELEASE_STEPS.PublishUi);
  if (!progress.mcp.published) steps.push(RELEASE_STEPS.PublishMcp);
  steps.push(RELEASE_STEPS.VerifyPublishedVersions);
  if (!progress.ui.promoted) steps.push(RELEASE_STEPS.PromoteUiLatest);
  if (!progress.mcp.promoted) steps.push(RELEASE_STEPS.PromoteMcpLatest);
  if (!progress.committed) steps.push(RELEASE_STEPS.CommitTargetMetadata);
  assertPreflightOrder(steps);
  return {
    targetVersion,
    stageTag,
    recovery: Boolean(recoveryState),
    adoptStaged: Boolean(adoptStagedVersion),
    progress,
    steps,
  };
}

function packagePath(rootDir, packageDirectory) {
  return join(rootDir, packageDirectory, "package.json");
}

export function readPackage(rootDir, packageDirectory = ".") {
  return JSON.parse(readFileSync(packagePath(rootDir, packageDirectory), "utf8"));
}

function manifestBytes(rootDir) {
  return {
    ui: readFileSync(packagePath(rootDir, "."), "utf8"),
    mcp: readFileSync(packagePath(rootDir, "mcp"), "utf8"),
  };
}

function restoreManifests(rootDir, snapshot) {
  writeFileSync(packagePath(rootDir, "."), snapshot.ui);
  writeFileSync(packagePath(rootDir, "mcp"), snapshot.mcp);
}

export function applyTargetMetadata(rootDir, targetVersion) {
  const ui = readPackage(rootDir);
  const mcp = readPackage(rootDir, "mcp");
  ui.version = targetVersion;
  ui.godxUiMcp = targetVersion;
  mcp.version = targetVersion;
  mcp.godxUiCompatibility = compatibilityFor(targetVersion);
  writeFileSync(packagePath(rootDir, "."), `${JSON.stringify(ui, null, 2)}\n`);
  writeFileSync(packagePath(rootDir, "mcp"), `${JSON.stringify(mcp, null, 2)}\n`);
  return { ui, mcp };
}

export function integrityFor(path) {
  return `sha512-${createHash("sha512").update(readFileSync(path)).digest("base64")}`;
}

export function writeJsonAtomic(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  const temporary = `${path}.${process.pid}.${Date.now()}.tmp`;
  const descriptor = openSync(temporary, "wx", 0o600);
  try {
    writeFileSync(descriptor, `${JSON.stringify(value, null, 2)}\n`);
    fsyncSync(descriptor);
  } finally {
    closeSync(descriptor);
  }
  renameSync(temporary, path);
  const directoryDescriptor = openSync(dirname(path), "r");
  try {
    fsyncSync(directoryDescriptor);
  } finally {
    closeSync(directoryDescriptor);
  }
}

export function assertTargetMetadata(ui, mcp, targetVersion, source = "package") {
  const errors = [];
  if (ui.version !== targetVersion) errors.push(`${source} UI version mismatch`);
  if (mcp.version !== targetVersion) errors.push(`${source} MCP version mismatch`);
  if (ui.godxUiMcp !== targetVersion) errors.push(`${source} godxUiMcp mismatch`);
  if (mcp.godxUiCompatibility !== compatibilityFor(targetVersion))
    errors.push(`${source} compatibility mismatch`);
  if (errors.length) throw new Error(`Release metadata is not coordinated: ${errors.join(", ")}`);
}

export function validateRecoveryState(state, { sourceHead, rootDir, recoveryDirectory }) {
  const exactKeys = (value, keys, label) => {
    if (
      !value ||
      typeof value !== "object" ||
      Object.keys(value).sort().join("\0") !== [...keys].sort().join("\0")
    ) {
      throw new Error(`Recovery ${label} shape is invalid.`);
    }
  };
  const packageKeys = [
    "publishAttempted",
    "published",
    "promoted",
    "compensated",
    "previousLatest",
  ];
  // Pre-#266 (schemaVersion 2) recovery files carry the per-version staging tag plus two
  // removal-progress flags. They stay loadable: the flags are validated, then stripped from the
  // normalised clone (the removal steps no longer exist), and the legacy stageTag is preserved so
  // reconciliation checks the tag the interrupted release actually published under.
  const legacyStageKeys = ["stageTagRemovalAttempted", "stageTagRemoved"];
  exactKeys(
    state,
    [
      "schemaVersion",
      "sourceHead",
      "targetVersion",
      "stageTag",
      "manifests",
      "artifacts",
      "latestRecorded",
      "latestCompensation",
      "ui",
      "mcp",
      "committed",
      "failedStep",
      "error",
      "updatedAt",
    ],
    "state",
  );
  if (
    (state.schemaVersion !== 2 && state.schemaVersion !== 3) ||
    !SEMVER.test(state.targetVersion) ||
    !/^[0-9a-f]{40,64}$/.test(state.sourceHead)
  ) {
    throw new Error("Recovery state schema/version is invalid.");
  }
  if (state.sourceHead !== sourceHead)
    throw new Error("Recovery source HEAD differs from current HEAD.");
  if (
    state.stageTag !== STAGE_TAG &&
    state.stageTag !== LEGACY_STAGE_TAG_FOR(state.targetVersion)
  ) {
    throw new Error("Recovery staging tag is invalid.");
  }
  exactKeys(state.manifests, ["original", "target"], "manifests");
  exactKeys(state.manifests.original, ["ui", "mcp"], "original manifests");
  exactKeys(state.manifests.target, ["ui", "mcp"], "target manifests");
  if (
    !["ui", "mcp"].every(
      (name) =>
        typeof state.manifests.original[name] === "string" &&
        typeof state.manifests.target[name] === "string",
    )
  ) {
    throw new Error("Recovery manifest snapshots are incomplete.");
  }
  const current = manifestBytes(rootDir);
  if (current.ui !== state.manifests.target.ui || current.mcp !== state.manifests.target.mcp) {
    throw new Error("Current manifests differ from exact recovery target bytes.");
  }
  const targetUi = JSON.parse(state.manifests.target.ui);
  const targetMcp = JSON.parse(state.manifests.target.mcp);
  assertTargetMetadata(targetUi, targetMcp, state.targetVersion, "recovery target");
  JSON.parse(state.manifests.original.ui);
  JSON.parse(state.manifests.original.mcp);
  exactKeys(state.artifacts, ["ui", "mcp"], "artifacts");
  const recoveryRoot = `${resolve(recoveryDirectory)}${sep}`;
  for (const packageName of ["ui", "mcp"]) {
    const artifact = state.artifacts?.[packageName];
    exactKeys(artifact, ["path", "integrity"], `${packageName} artifact`);
    if (
      typeof artifact.path !== "string" ||
      typeof artifact.integrity !== "string" ||
      !/^sha512-[A-Za-z0-9+/]+={0,2}$/.test(artifact.integrity) ||
      !resolve(artifact.path).startsWith(recoveryRoot)
    ) {
      throw new Error(`Recovery ${packageName} artifact path/integrity is invalid.`);
    }
    if (!existsSync(artifact.path) || integrityFor(artifact.path) !== artifact.integrity) {
      throw new Error(`Recovery ${packageName} artifact differs from recorded SHA512 integrity.`);
    }
    const progress = state[packageName];
    const legacyShape = legacyStageKeys.every((key) => Object.hasOwn(progress ?? {}, key));
    const shapeKeys = legacyShape ? [...packageKeys, ...legacyStageKeys] : packageKeys;
    exactKeys(progress, shapeKeys, `${packageName} progress`);
    const booleanFields = shapeKeys.filter((key) => key !== "previousLatest");
    if (
      !booleanFields.every((key) => typeof progress[key] === "boolean") ||
      (progress.previousLatest !== null &&
        (typeof progress.previousLatest !== "string" || !SEMVER.test(progress.previousLatest))) ||
      (progress.promoted && !progress.published) ||
      (legacyShape && progress.stageTagRemovalAttempted && !progress.published) ||
      (legacyShape &&
        progress.stageTagRemoved &&
        (!progress.published || !progress.stageTagRemovalAttempted)) ||
      (progress.compensated && (!progress.published || progress.promoted))
    ) {
      throw new Error(`Recovery ${packageName} progress invariants are invalid.`);
    }
  }
  if (state.latestCompensation !== null) {
    exactKeys(state.latestCompensation, ["observed", "restored"], "latest compensation");
    exactKeys(state.latestCompensation.observed, ["ui", "mcp"], "observed latest tags");
    exactKeys(state.latestCompensation.restored, ["ui", "mcp"], "restored latest tags");
    for (const snapshot of [state.latestCompensation.observed, state.latestCompensation.restored]) {
      if (
        !["ui", "mcp"].every(
          (name) =>
            snapshot[name] === null ||
            (typeof snapshot[name] === "string" && SEMVER.test(snapshot[name])),
        )
      ) {
        throw new Error("Recovery latest compensation versions are invalid.");
      }
    }
  }
  if (
    state.latestRecorded !== true ||
    state.committed !== false ||
    (state.failedStep !== null && typeof state.failedStep !== "string") ||
    (state.error !== null && typeof state.error !== "string") ||
    typeof state.updatedAt !== "string" ||
    (state.mcp.promoted && !state.ui.promoted && !state.ui.compensated) ||
    (state.latestCompensation !== null &&
      (typeof state.latestCompensation !== "object" ||
        !state.ui.compensated ||
        !state.mcp.compensated))
  ) {
    throw new Error("Recovery transaction invariants are invalid.");
  }
  // Normalise to the current shape: legacy removal flags disappear (their steps no longer exist)
  // while the legacy stageTag is kept, so re-persisted snapshots validate as schemaVersion 3.
  const normalized = structuredClone(state);
  normalized.schemaVersion = 3;
  for (const packageName of ["ui", "mcp"]) {
    for (const key of legacyStageKeys) delete normalized[packageName][key];
  }
  return normalized;
}

export function assertOnlyCoordinatedManifestChanges(statusOutput) {
  const unexpected = statusOutput
    .split("\0")
    .filter(Boolean)
    .filter((entry) => {
      const path = entry.length >= 4 && entry[2] === " " ? entry.slice(3) : entry;
      return !COORDINATED_MANIFESTS.has(path);
    });
  if (unexpected.length)
    throw new Error(`Preflight drift outside manifests:\n- ${unexpected.join("\n- ")}`);
}

export function reconcilePackagePublication({
  progress,
  registry,
  artifact,
  targetVersion,
  stageTag,
  packageName,
}) {
  if (!registry.exists) {
    if (progress.published)
      throw new Error(`${packageName}@${targetVersion} disappeared from registry.`);
    return;
  }
  const exactIntegrity = registry.integrity === artifact.integrity;
  const exactStageTag = registry.tags?.[stageTag] === targetVersion;
  if (progress.published) {
    if (!exactIntegrity || !exactStageTag) {
      throw new Error(`${packageName} registry integrity/staging tag differs from recovery state.`);
    }
    return;
  }
  if (progress.publishAttempted && exactIntegrity && exactStageTag) {
    progress.published = true;
    return;
  }
  throw new Error(
    `${packageName}@${targetVersion} exists but cannot be reconciled to the verified artifact; inspect recovery state.`,
  );
}

export function assertFreshTargets(uiRegistry, mcpRegistry) {
  if (uiRegistry.exists || mcpRegistry.exists)
    throw new Error("Target version already exists; refusing partial/overwrite release.");
}

/**
 * The staging tag must always point at the released version — including AFTER latest promotion:
 * with the single overwritable `godx-staging` there is no removal step, so after a successful
 * release the staging tag simply equals `latest` (both = targetVersion) until the next release
 * overwrites it. That equality is the accepted post-#266 steady state, not an anomaly.
 */
export function assertRegistryArtifact(registry, artifact, targetVersion, stageTag, packageName) {
  if (
    !registry.exists ||
    registry.integrity !== artifact.integrity ||
    registry.tags?.[stageTag] !== targetVersion
  ) {
    const observedStageTag = registry.tags?.[stageTag] ?? null;
    throw new Error(
      `${packageName} registry artifact integrity or staging tag does not match verified tarball: ` +
        `expected integrity=${artifact.integrity}, ${stageTag}=${targetVersion}; ` +
        `observed integrity=${registry.integrity ?? null}, ${stageTag}=${observedStageTag}.`,
    );
  }
}

function packManifest(rootDir, packageDirectory, artifactDirectory, execFile) {
  const argument = packageDirectory === "." ? "." : `./${packageDirectory}`;
  const result = JSON.parse(
    execFile(
      "npm",
      ["pack", argument, "--pack-destination", artifactDirectory, "--ignore-scripts", "--json"],
      {
        cwd: rootDir,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      },
    ),
  );
  const filename = result.at(0)?.filename;
  if (!filename) throw new Error(`npm pack did not report ${argument}.`);
  const path = join(artifactDirectory, filename);
  const manifest = JSON.parse(
    execFile("tar", ["-xzO", "-f", path, "package/package.json"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }),
  );
  return { manifest, path, integrity: integrityFor(path) };
}

export function packAndVerifyTargetManifests({
  rootDir,
  targetVersion,
  artifactDirectory,
  execFile = execFileSync,
}) {
  const directory = artifactDirectory ?? mkdtempSync(join(tmpdir(), "godxjp-release-pack-"));
  rmSync(directory, { force: true, recursive: true });
  mkdirSync(directory, { recursive: true });
  try {
    const ui = packManifest(rootDir, ".", directory, execFile);
    const mcp = packManifest(rootDir, "mcp", directory, execFile);
    assertTargetMetadata(ui.manifest, mcp.manifest, targetVersion, "packed");
    return {
      ui: ui.manifest,
      mcp: mcp.manifest,
      uiTarball: ui.path,
      mcpTarball: mcp.path,
      uiIntegrity: ui.integrity,
      mcpIntegrity: mcp.integrity,
      cleanup: () => rmSync(directory, { force: true, recursive: true }),
    };
  } catch (error) {
    rmSync(directory, { force: true, recursive: true });
    throw error;
  }
}

/**
 * The single source of truth for every side-effecting *command* a release issues, as a pure
 * function of (step, plan, artifacts). The executor in scripts/release.mjs only dispatches these —
 * it never composes a publish or a gate itself, so the order below is exactly the order that runs
 * and a no-network test can assert it (issue #230).
 *
 * `cwd` is a symbolic location ("root" | "mcp"), resolved by the executor against the repository.
 */
const publishCommand = (tarball, plan, packageName) => {
  if (typeof tarball !== "string" || !tarball) {
    throw new Error(
      `Refusing to publish ${packageName}: no verified tarball from the preflight pack.`,
    );
  }
  return {
    binary: "npm",
    args: ["publish", tarball, "--access", "public", "--tag", plan.stageTag],
    cwd: "root",
  };
};

const STEP_COMMANDS = Object.freeze({
  [RELEASE_STEPS.VerifyRoot]: () => ({
    binary: "pnpm",
    args: ["run", "verify:release"],
    cwd: "root",
  }),
  [RELEASE_STEPS.InstallMcp]: () => ({
    binary: "pnpm",
    args: ["install", "--frozen-lockfile"],
    cwd: "mcp",
  }),
  [RELEASE_STEPS.BuildMcp]: () => ({ binary: "pnpm", args: ["build"], cwd: "mcp" }),
  [RELEASE_STEPS.TestMcp]: () => ({ binary: "pnpm", args: ["test"], cwd: "mcp" }),
  [RELEASE_STEPS.VerifyLockstep]: () => ({
    binary: "node",
    args: ["scripts/check-release-lockstep.mjs"],
    cwd: "root",
  }),
  [RELEASE_STEPS.VerifyNpmAuth]: () => ({ binary: "npm", args: ["whoami"], cwd: "root" }),
  [RELEASE_STEPS.PublishUi]: (plan, artifacts) =>
    publishCommand(artifacts?.uiTarball, plan, "@godxjp/ui"),
  [RELEASE_STEPS.PublishMcp]: (plan, artifacts) =>
    publishCommand(artifacts?.mcpTarball, plan, "@godxjp/ui-mcp"),
  [RELEASE_STEPS.PromoteUiLatest]: (plan) => ({
    binary: "npm",
    args: ["dist-tag", "add", `@godxjp/ui@${plan.targetVersion}`, "latest"],
    cwd: "root",
  }),
  [RELEASE_STEPS.PromoteMcpLatest]: (plan) => ({
    binary: "npm",
    args: ["dist-tag", "add", `@godxjp/ui-mcp@${plan.targetVersion}`, "latest"],
    cwd: "root",
  }),
});

export function stepHasCommand(step) {
  return Object.hasOwn(STEP_COMMANDS, step);
}

export function releaseCommandForStep(step, plan, artifacts) {
  if (!stepHasCommand(step)) throw new Error(`No release command for ${step}.`);
  return { step, ...STEP_COMMANDS[step](plan, artifacts) };
}

/** The full ordered command sequence a plan will issue — pure, offline, assertable. */
export function planReleaseCommands(
  plan,
  artifacts = { uiTarball: "<ui.tgz>", mcpTarball: "<mcp.tgz>" },
) {
  return plan.steps
    .filter((step) => stepHasCommand(step))
    .map((step) => releaseCommandForStep(step, plan, artifacts));
}

const GATE_COMMAND_STEPS = Object.freeze([
  RELEASE_STEPS.VerifyRoot,
  RELEASE_STEPS.InstallMcp,
  RELEASE_STEPS.BuildMcp,
  RELEASE_STEPS.TestMcp,
  RELEASE_STEPS.VerifyLockstep,
  RELEASE_STEPS.VerifyNpmAuth,
]);

/**
 * Pure guard over a planned command sequence: versions are never mutated by a package manager
 * (the coordinated manifests are written first instead), and no publish runs before every gate.
 */
export function assertReleaseCommandPlan(commands) {
  const mutation = commands.find(
    (entry) => (entry.binary === "npm" || entry.binary === "pnpm") && entry.args[0] === "version",
  );
  if (mutation) {
    throw new Error(
      `Release plan must not bump with "${mutation.binary} version"; the coordinated target ` +
        "version and both compatibility fields are written before any gate.",
    );
  }
  const firstPublish = commands.findIndex(
    (entry) => entry.binary === "npm" && entry.args[0] === "publish",
  );
  if (firstPublish === -1) return commands;
  for (const step of GATE_COMMAND_STEPS) {
    const at = commands.findIndex((entry) => entry.step === step);
    if (at === -1) throw new Error(`Release plan omits preflight gate "${step}" before publish.`);
    if (at > firstPublish)
      throw new Error(`Release plan runs preflight gate "${step}" after publish.`);
  }
  return commands;
}

/** Copy just the coordinated manifests into a throwaway tree so a plan can pack without touching the repo. */
export function createManifestPlanWorkspace(rootDir) {
  const workspace = mkdtempSync(join(tmpdir(), "godxjp-release-metadata-plan-"));
  mkdirSync(join(workspace, "mcp"));
  cpSync(join(rootDir, "package.json"), join(workspace, "package.json"));
  cpSync(join(rootDir, "mcp/package.json"), join(workspace, "mcp/package.json"));
  return workspace;
}

/**
 * The release executor. Every effect goes through exactly two injected primitives, so the whole
 * step machine can be driven offline by a test with a recording fake:
 *   run(binary, args, cwd)      → streams, throws on non-zero
 *   capture(binary, args, cwd)  → { status, stdout, stderr }, never throws
 */
export function createReleaseRuntime({
  repositoryRoot,
  run,
  capture,
  wait = (milliseconds) =>
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, milliseconds),
  registryVerificationAttempts = 6,
  registryVerificationDelayMs = 2_000,
}) {
  const cwdFor = (location) => (location === "mcp" ? join(repositoryRoot, "mcp") : repositoryRoot);
  const execute = (descriptor) => run(descriptor.binary, descriptor.args, cwdFor(descriptor.cwd));

  const npmJson = (args, missingIsNull = false) => {
    const result = capture("npm", args, repositoryRoot);
    if (result.status === 0) return JSON.parse(result.stdout || "null");
    const output = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
    if (missingIsNull && /E404|404 Not Found|is not in this registry/i.test(output)) return null;
    throw new Error(`npm ${args.join(" ")} failed: ${output.trim()}`);
  };

  const registryState = (packageName, version) => {
    const integrity = npmJson(
      ["view", `${packageName}@${version}`, "dist.integrity", "--json"],
      true,
    );
    const tags = npmJson(["view", packageName, "dist-tags", "--json"], true) ?? {};
    return { exists: typeof integrity === "string", integrity, tags };
  };

  const gitStatus = () => {
    const result = capture(
      "git",
      ["status", "--porcelain=v1", "-z", "--untracked-files=all"],
      repositoryRoot,
    );
    if (result.status !== 0) throw new Error(`git status failed: ${(result.stderr ?? "").trim()}`);
    return result.stdout ?? "";
  };

  const commitTargetMetadata = (plan) => {
    execute({ binary: "git", args: ["add", "package.json", "mcp/package.json"], cwd: "root" });
    const dirty = capture("git", ["diff", "--cached", "--quiet"], repositoryRoot).status !== 0;
    if (dirty) {
      execute({
        binary: "git",
        args: ["commit", "-m", `chore(release): UI + MCP @${plan.targetVersion}`],
        cwd: "root",
      });
    }
  };

  const compensateLatest = (plan, progress) => {
    const observed = {
      ui: registryState("@godxjp/ui", plan.targetVersion).tags.latest ?? null,
      mcp: registryState("@godxjp/ui-mcp", plan.targetVersion).tags.latest ?? null,
    };
    const restore = (packageName, previousLatest, currentLatest) => {
      if (currentLatest === previousLatest) return;
      if (previousLatest) {
        execute({
          binary: "npm",
          args: ["dist-tag", "add", `${packageName}@${previousLatest}`, "latest"],
          cwd: "root",
        });
      } else {
        execute({ binary: "npm", args: ["dist-tag", "rm", packageName, "latest"], cwd: "root" });
      }
    };
    restore("@godxjp/ui", progress.ui.previousLatest, observed.ui);
    restore("@godxjp/ui-mcp", progress.mcp.previousLatest, observed.mcp);
    const restored = {
      ui: registryState("@godxjp/ui", plan.targetVersion).tags.latest ?? null,
      mcp: registryState("@godxjp/ui-mcp", plan.targetVersion).tags.latest ?? null,
    };
    if (
      restored.ui !== progress.ui.previousLatest ||
      restored.mcp !== progress.mcp.previousLatest
    ) {
      throw new Error(
        `latest rollback verification failed: ${JSON.stringify({ observed, restored })}`,
      );
    }
    return { observed, restored };
  };

  const runStep = (step, plan, artifacts, progress) => {
    if (stepHasCommand(step)) {
      execute(releaseCommandForStep(step, plan, artifacts));
      return;
    }
    switch (step) {
      case RELEASE_STEPS.VerifyTargetAvailability: {
        const uiRegistry = registryState("@godxjp/ui", plan.targetVersion);
        const mcpRegistry = registryState("@godxjp/ui-mcp", plan.targetVersion);
        if (plan.adoptStaged) {
          assertRegistryArtifact(
            uiRegistry,
            progress.artifacts.ui,
            plan.targetVersion,
            plan.stageTag,
            "@godxjp/ui",
          );
          assertRegistryArtifact(
            mcpRegistry,
            progress.artifacts.mcp,
            plan.targetVersion,
            plan.stageTag,
            "@godxjp/ui-mcp",
          );
          return;
        }
        if (!plan.recovery) {
          assertFreshTargets(uiRegistry, mcpRegistry);
          return;
        }
        reconcilePackagePublication({
          progress: progress.ui,
          registry: uiRegistry,
          artifact: progress.artifacts.ui,
          targetVersion: plan.targetVersion,
          stageTag: plan.stageTag,
          packageName: "@godxjp/ui",
        });
        reconcilePackagePublication({
          progress: progress.mcp,
          registry: mcpRegistry,
          artifact: progress.artifacts.mcp,
          targetVersion: plan.targetVersion,
          stageTag: plan.stageTag,
          packageName: "@godxjp/ui-mcp",
        });
        return;
      }
      case RELEASE_STEPS.RecordPreviousLatestTags:
        progress.ui.previousLatest =
          registryState("@godxjp/ui", plan.targetVersion).tags.latest ?? null;
        progress.mcp.previousLatest =
          registryState("@godxjp/ui-mcp", plan.targetVersion).tags.latest ?? null;
        return;
      case RELEASE_STEPS.VerifyPublishTree:
        assertOnlyCoordinatedManifestChanges(gitStatus());
        return;
      case RELEASE_STEPS.VerifyPublishedVersions: {
        let verificationError;
        for (let attempt = 1; attempt <= registryVerificationAttempts; attempt += 1) {
          try {
            assertRegistryArtifact(
              registryState("@godxjp/ui", plan.targetVersion),
              progress.artifacts.ui,
              plan.targetVersion,
              plan.stageTag,
              "@godxjp/ui",
            );
            assertRegistryArtifact(
              registryState("@godxjp/ui-mcp", plan.targetVersion),
              progress.artifacts.mcp,
              plan.targetVersion,
              plan.stageTag,
              "@godxjp/ui-mcp",
            );
            return;
          } catch (error) {
            verificationError = error;
            if (attempt < registryVerificationAttempts) wait(registryVerificationDelayMs);
          }
        }
        throw verificationError;
      }
      case RELEASE_STEPS.CommitTargetMetadata:
        commitTargetMetadata(plan);
        return;
      default:
        throw new Error(`Unknown release step "${step}".`);
    }
  };

  return { runStep, compensateLatest, registryState, gitStatus };
}

function recoverySnapshot(progress, failedStep = null, error = null) {
  return {
    ...structuredClone(progress),
    failedStep,
    error: error ? String(error.message ?? error) : null,
    updatedAt: new Date().toISOString(),
  };
}

export function runRelease({
  rootDir,
  uiBump,
  mcpBump,
  sourceHead = "dry-run",
  recoveryState = null,
  adoptStagedVersion = null,
  recoveryDirectory = null,
  dryRun = false,
  runStep,
  packTargetManifests = packAndVerifyTargetManifests,
  writeRecoveryState = () => {},
  clearRecoveryState = () => {},
  compensateLatest = () => {},
  onStep = () => {},
}) {
  const original = manifestBytes(rootDir);
  const plan = buildReleasePlan({
    currentVersion: readPackage(rootDir).version,
    uiBump,
    mcpBump,
    sourceHead,
    recoveryState,
    adoptStagedVersion,
  });
  const progress = plan.progress;
  progress.failedStep = null;
  progress.error = null;
  let artifacts = recoveryState
    ? {
        ui: JSON.parse(progress.manifests.target.ui),
        mcp: JSON.parse(progress.manifests.target.mcp),
        uiTarball: progress.artifacts.ui.path,
        mcpTarball: progress.artifacts.mcp.path,
        uiIntegrity: progress.artifacts.ui.integrity,
        mcpIntegrity: progress.artifacts.mcp.integrity,
      }
    : null;
  let publishStarted = Boolean(recoveryState);
  let activeStep = null;
  let succeeded = false;
  const persist = (failedStep = null, error = null) =>
    writeRecoveryState(recoverySnapshot(progress, failedStep, error));

  try {
    for (const step of plan.steps) {
      activeStep = step;
      const localPlanStep =
        step === RELEASE_STEPS.ApplyTargetMetadata || step === RELEASE_STEPS.PackTargetManifests;
      onStep(step, dryRun && !localPlanStep ? "planned" : "executed");
      if (dryRun && !localPlanStep) continue;
      if (step === RELEASE_STEPS.ApplyTargetMetadata) {
        applyTargetMetadata(rootDir, plan.targetVersion);
        const target = manifestBytes(rootDir);
        if (!recoveryState) progress.manifests = { original, target };
        continue;
      }
      if (step === RELEASE_STEPS.PackTargetManifests) {
        if (!recoveryState) {
          artifacts = packTargetManifests({
            rootDir,
            targetVersion: plan.targetVersion,
            artifactDirectory: recoveryDirectory ? join(recoveryDirectory, "artifacts") : undefined,
          });
          progress.artifacts = {
            ui: { path: artifacts.uiTarball, integrity: artifacts.uiIntegrity },
            mcp: { path: artifacts.mcpTarball, integrity: artifacts.mcpIntegrity },
          };
        }
        continue;
      }
      if (step === RELEASE_STEPS.PublishUi || step === RELEASE_STEPS.PublishMcp) {
        const packageState = step === RELEASE_STEPS.PublishUi ? progress.ui : progress.mcp;
        if (packageState.published) continue;
        packageState.publishAttempted = true;
        publishStarted = true;
        persist(step);
        runStep(step, plan, artifacts, progress);
        packageState.published = true;
        persist();
        continue;
      }
      if (
        (step === RELEASE_STEPS.PromoteUiLatest || step === RELEASE_STEPS.PromoteMcpLatest) &&
        (progress.ui.compensated ||
          progress.mcp.compensated ||
          progress.latestCompensation !== null)
      ) {
        progress.ui.compensated = false;
        progress.mcp.compensated = false;
        progress.latestCompensation = null;
        persist(step);
      }
      runStep(step, plan, artifacts, progress);
      if (step === RELEASE_STEPS.VerifyTargetAvailability && plan.adoptStaged) {
        publishStarted = true;
      }
      if (step === RELEASE_STEPS.RecordPreviousLatestTags) progress.latestRecorded = true;
      if (step === RELEASE_STEPS.PromoteUiLatest) progress.ui.promoted = true;
      if (step === RELEASE_STEPS.PromoteMcpLatest) progress.mcp.promoted = true;
      if (step === RELEASE_STEPS.CommitTargetMetadata) {
        progress.committed = true;
        clearRecoveryState();
      } else if (publishStarted) persist();
    }
    succeeded = true;
    return { plan, packedManifests: artifacts, progress };
  } catch (error) {
    let recoveryError = error;
    if (
      activeStep === RELEASE_STEPS.PromoteUiLatest ||
      activeStep === RELEASE_STEPS.PromoteMcpLatest
    ) {
      try {
        progress.latestCompensation = compensateLatest(plan, progress);
        progress.ui.promoted = false;
        progress.mcp.promoted = false;
        progress.ui.compensated = true;
        progress.mcp.compensated = true;
      } catch (compensationError) {
        recoveryError = new Error(
          `${error.message}; latest compensation also failed: ${compensationError.message}`,
        );
      }
    }
    if (!publishStarted) restoreManifests(rootDir, original);
    else persist(activeStep, recoveryError);
    throw recoveryError;
  } finally {
    if (dryRun || !publishStarted || succeeded) artifacts?.cleanup?.();
  }
}
