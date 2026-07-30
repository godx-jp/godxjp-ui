import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  closeSync,
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
  RemoveUiStagingTag: "remove-ui-staging-tag",
  RemoveMcpStagingTag: "remove-mcp-staging-tag",
  CommitTargetMetadata: "commit-target-metadata",
});

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
    stageTagRemovalAttempted: false,
    stageTagRemoved: false,
    previousLatest: null,
  };
}

function initialProgress(targetVersion, stageTag, sourceHead) {
  return {
    schemaVersion: 2,
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
}) {
  if (!VALID_UI_BUMPS.has(uiBump) || !VALID_MCP_BUMPS.has(mcpBump)) {
    throw new Error(
      "Usage: node scripts/release.mjs --ui <patch|minor|major> --mcp sync [--metadata-plan]",
    );
  }
  if (recoveryState) {
    if (uiBump !== "skip" || mcpBump !== "sync") throw new Error("Recovery must use --recovery.");
    if (currentVersion !== recoveryState.targetVersion) {
      throw new Error("Recovery target does not match preserved manifests.");
    }
  } else if (uiBump === "skip" && mcpBump === "sync") {
    throw new Error("MCP-only sync is recovery-only; use recorded --recovery state.");
  } else if (uiBump === "skip" || mcpBump !== "sync") {
    throw new Error("A UI release requires --mcp sync.");
  }

  const targetVersion = recoveryState?.targetVersion ?? targetVersionFor(currentVersion, uiBump);
  const stageTag = recoveryState?.stageTag ?? `godx-staging-${targetVersion}`;
  const progress = structuredClone(
    recoveryState ?? initialProgress(targetVersion, stageTag, sourceHead),
  );
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
  if (!progress.ui.stageTagRemoved) steps.push(RELEASE_STEPS.RemoveUiStagingTag);
  if (!progress.mcp.stageTagRemoved) steps.push(RELEASE_STEPS.RemoveMcpStagingTag);
  if (!progress.committed) steps.push(RELEASE_STEPS.CommitTargetMetadata);
  return { targetVersion, stageTag, recovery: Boolean(recoveryState), progress, steps };
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
    "stageTagRemovalAttempted",
    "stageTagRemoved",
    "previousLatest",
  ];
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
    state.schemaVersion !== 2 ||
    !SEMVER.test(state.targetVersion) ||
    !/^[0-9a-f]{40,64}$/.test(state.sourceHead)
  ) {
    throw new Error("Recovery state schema/version is invalid.");
  }
  if (state.sourceHead !== sourceHead)
    throw new Error("Recovery source HEAD differs from current HEAD.");
  if (state.stageTag !== `godx-staging-${state.targetVersion}`)
    throw new Error("Recovery staging tag is invalid.");
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
    exactKeys(progress, packageKeys, `${packageName} progress`);
    const booleanFields = packageKeys.filter((key) => key !== "previousLatest");
    if (
      !booleanFields.every((key) => typeof progress[key] === "boolean") ||
      (progress.previousLatest !== null &&
        (typeof progress.previousLatest !== "string" || !SEMVER.test(progress.previousLatest))) ||
      (progress.promoted && !progress.published) ||
      (progress.stageTagRemovalAttempted && !progress.published) ||
      (progress.stageTagRemoved && (!progress.published || !progress.stageTagRemovalAttempted)) ||
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
  return structuredClone(state);
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
    if (!exactIntegrity) {
      throw new Error(`${packageName} registry integrity/staging tag differs from recovery state.`);
    }
    if (progress.stageTagRemoved) {
      if (registry.tags?.[stageTag] !== undefined) {
        throw new Error(`${packageName} staging tag reappeared after recorded removal.`);
      }
      return;
    }
    if (progress.stageTagRemovalAttempted) {
      if (registry.tags?.[stageTag] === undefined) {
        progress.stageTagRemoved = true;
        return;
      }
      if (!exactStageTag) {
        throw new Error(`${packageName} ambiguous staging-tag removal cannot be reconciled.`);
      }
      return;
    }
    if (!exactStageTag) {
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

export function assertRegistryArtifact(
  registry,
  artifact,
  targetVersion,
  stageTag,
  packageName,
  requireStageTag = true,
) {
  if (
    !registry.exists ||
    registry.integrity !== artifact.integrity ||
    (requireStageTag && registry.tags?.[stageTag] !== targetVersion) ||
    (!requireStageTag && registry.tags?.[stageTag] !== undefined)
  ) {
    throw new Error(
      `${packageName} registry artifact integrity or staging tag does not match verified tarball.`,
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

export function releaseCommandForStep(step, plan, artifacts) {
  if (step === RELEASE_STEPS.PublishUi || step === RELEASE_STEPS.PublishMcp) {
    const tarball = step === RELEASE_STEPS.PublishUi ? artifacts.uiTarball : artifacts.mcpTarball;
    return ["npm", ["publish", tarball, "--access", "public", "--tag", plan.stageTag]];
  }
  const packageName = step.includes("-ui-") ? "@godxjp/ui" : "@godxjp/ui-mcp";
  if (step === RELEASE_STEPS.PromoteUiLatest || step === RELEASE_STEPS.PromoteMcpLatest) {
    return ["npm", ["dist-tag", "add", `${packageName}@${plan.targetVersion}`, "latest"]];
  }
  if (step === RELEASE_STEPS.RemoveUiStagingTag || step === RELEASE_STEPS.RemoveMcpStagingTag) {
    return ["npm", ["dist-tag", "rm", packageName, plan.stageTag]];
  }
  throw new Error(`No release command for ${step}.`);
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
      if (step === RELEASE_STEPS.RemoveUiStagingTag || step === RELEASE_STEPS.RemoveMcpStagingTag) {
        const packageState = step === RELEASE_STEPS.RemoveUiStagingTag ? progress.ui : progress.mcp;
        if (packageState.stageTagRemoved) continue;
        packageState.stageTagRemovalAttempted = true;
        persist(step);
        runStep(step, plan, artifacts, progress);
        packageState.stageTagRemoved = true;
        persist();
        continue;
      }
      runStep(step, plan, artifacts, progress);
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
      activeStep === RELEASE_STEPS.PromoteMcpLatest &&
      progress.ui.promoted &&
      !progress.mcp.promoted
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
