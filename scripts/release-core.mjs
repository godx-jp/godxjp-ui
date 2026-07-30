import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

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

  const major = Number(match[1]);
  const minor = Number(match[2]);
  const patch = Number(match[3]);
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

function initialProgress(targetVersion, stageTag) {
  return {
    schemaVersion: 1,
    targetVersion,
    stageTag,
    ui: { publishAttempted: false, published: false, promoted: false, stageTagRemoved: false },
    mcp: { publishAttempted: false, published: false, promoted: false, stageTagRemoved: false },
    committed: false,
    failedStep: null,
    error: null,
  };
}

export function buildReleasePlan({ currentVersion, uiBump, mcpBump, recoveryState = null }) {
  if (!VALID_UI_BUMPS.has(uiBump) || !VALID_MCP_BUMPS.has(mcpBump)) {
    throw new Error(
      "Usage: node scripts/release.mjs --ui <patch|minor|major> --mcp sync [--dry-run]",
    );
  }

  if (recoveryState) {
    if (uiBump !== "skip" || mcpBump !== "sync") {
      throw new Error("Recovery must run with --recovery (equivalent to --ui skip --mcp sync). ");
    }
    if (
      !SEMVER.test(recoveryState.targetVersion) ||
      currentVersion !== recoveryState.targetVersion
    ) {
      throw new Error("Recovery state target must match the preserved coordinated manifests.");
    }
  } else if (uiBump === "skip" && mcpBump === "sync") {
    throw new Error("MCP-only sync is recovery-only; re-run with --recovery and recorded state.");
  } else if (uiBump === "skip" || mcpBump !== "sync") {
    throw new Error("A UI release requires --mcp sync so both packages ship in lockstep.");
  }

  const targetVersion = recoveryState?.targetVersion ?? targetVersionFor(currentVersion, uiBump);
  const stageTag = recoveryState?.stageTag ?? `godx-staging-${targetVersion}`;
  const progress = structuredClone(recoveryState ?? initialProgress(targetVersion, stageTag));
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
    RELEASE_STEPS.VerifyPublishTree,
  ];

  if (!progress.ui.published) steps.push(RELEASE_STEPS.PublishUi);
  if (!progress.mcp.published) steps.push(RELEASE_STEPS.PublishMcp);
  steps.push(RELEASE_STEPS.VerifyPublishedVersions);
  if (!progress.ui.promoted) steps.push(RELEASE_STEPS.PromoteUiLatest);
  if (!progress.mcp.promoted) steps.push(RELEASE_STEPS.PromoteMcpLatest);
  if (!progress.ui.stageTagRemoved) steps.push(RELEASE_STEPS.RemoveUiStagingTag);
  if (!progress.mcp.stageTagRemoved) steps.push(RELEASE_STEPS.RemoveMcpStagingTag);
  if (!progress.committed) steps.push(RELEASE_STEPS.CommitTargetMetadata);

  return {
    targetVersion,
    compatibility: compatibilityFor(targetVersion),
    stageTag,
    recovery: Boolean(recoveryState),
    publishesUi: !progress.ui.published,
    publishesMcp: !progress.mcp.published,
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

function writePackage(rootDir, packageDirectory, packageJson) {
  writeFileSync(
    packagePath(rootDir, packageDirectory),
    `${JSON.stringify(packageJson, null, 2)}\n`,
  );
}

function snapshotManifests(rootDir) {
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
  writePackage(rootDir, ".", ui);
  writePackage(rootDir, "mcp", mcp);
  return { ui, mcp };
}

export function assertOnlyCoordinatedManifestChanges(statusOutput) {
  const unexpected = statusOutput
    .split("\0")
    .filter(Boolean)
    .filter((entry) => {
      const path = entry.length >= 4 && entry[2] === " " ? entry.slice(3) : entry;
      return !COORDINATED_MANIFESTS.has(path);
    });
  if (unexpected.length) {
    throw new Error(
      `Release preflight changed files outside package manifests:\n- ${unexpected.join("\n- ")}`,
    );
  }
}

export function assertTargetAvailability({ recovery, progress, uiExists, mcpExists }) {
  if (!recovery && (uiExists || mcpExists)) {
    throw new Error("Target UI/MCP version already exists; refusing an overwrite/partial release.");
  }
  if (recovery) {
    if (progress.ui.published !== uiExists) {
      throw new Error(
        `Recovery UI registry state mismatch (recorded=${progress.ui.published}, exists=${uiExists}).`,
      );
    }
    if (progress.mcp.published !== mcpExists) {
      throw new Error(
        `Recovery MCP registry state mismatch (recorded=${progress.mcp.published}, exists=${mcpExists}).`,
      );
    }
  }
}

export function assertPublishedVersions(uiExists, mcpExists) {
  if (!uiExists || !mcpExists) {
    throw new Error(
      "Both staged package versions must exist before either latest tag is promoted.",
    );
  }
}

export function assertTargetMetadata(ui, mcp, targetVersion, source = "package") {
  const expectedCompatibility = compatibilityFor(targetVersion);
  const errors = [];
  if (ui.version !== targetVersion)
    errors.push(`${source} UI version ${ui.version} != ${targetVersion}`);
  if (mcp.version !== targetVersion)
    errors.push(`${source} MCP version ${mcp.version} != ${targetVersion}`);
  if (ui.godxUiMcp !== targetVersion)
    errors.push(`${source} godxUiMcp ${ui.godxUiMcp} != ${targetVersion}`);
  if (mcp.godxUiCompatibility !== expectedCompatibility) {
    errors.push(
      `${source} godxUiCompatibility ${mcp.godxUiCompatibility} != ${expectedCompatibility}`,
    );
  }
  if (errors.length)
    throw new Error(`Release metadata is not coordinated:\n- ${errors.join("\n- ")}`);
}

function packManifest(rootDir, packageDirectory, packDirectory, execFile) {
  const packageArgument = packageDirectory === "." ? "." : `./${packageDirectory}`;
  const result = JSON.parse(
    execFile(
      "npm",
      ["pack", packageArgument, "--pack-destination", packDirectory, "--ignore-scripts", "--json"],
      {
        cwd: rootDir,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      },
    ),
  );
  const filename = result.at(0)?.filename;
  if (!filename) throw new Error(`npm pack did not report an artifact for ${packageArgument}.`);
  const tarballPath = join(packDirectory, filename);
  const manifest = JSON.parse(
    execFile("tar", ["-xzO", "-f", tarballPath, "package/package.json"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }),
  );
  return { manifest, tarballPath };
}

export function packAndVerifyTargetManifests({ rootDir, targetVersion, execFile = execFileSync }) {
  const packDirectory = mkdtempSync(join(tmpdir(), "godxjp-release-pack-"));
  try {
    const uiArtifact = packManifest(rootDir, ".", packDirectory, execFile);
    const mcpArtifact = packManifest(rootDir, "mcp", packDirectory, execFile);
    assertTargetMetadata(uiArtifact.manifest, mcpArtifact.manifest, targetVersion, "packed");
    return {
      ui: uiArtifact.manifest,
      mcp: mcpArtifact.manifest,
      uiTarball: uiArtifact.tarballPath,
      mcpTarball: mcpArtifact.tarballPath,
      cleanup: () => rmSync(packDirectory, { force: true, recursive: true }),
    };
  } catch (error) {
    rmSync(packDirectory, { force: true, recursive: true });
    throw error;
  }
}

export function releaseCommandForStep(step, plan, packedArtifacts) {
  if (step === RELEASE_STEPS.PublishUi || step === RELEASE_STEPS.PublishMcp) {
    if (!packedArtifacts) throw new Error("Verified release tarballs are unavailable.");
    const tarball =
      step === RELEASE_STEPS.PublishUi ? packedArtifacts.uiTarball : packedArtifacts.mcpTarball;
    return ["npm", ["publish", tarball, "--access", "public", "--tag", plan.stageTag]];
  }
  const packageName = step.includes("-ui-") ? "@godxjp/ui" : "@godxjp/ui-mcp";
  if (step === RELEASE_STEPS.PromoteUiLatest || step === RELEASE_STEPS.PromoteMcpLatest) {
    return ["npm", ["dist-tag", "add", `${packageName}@${plan.targetVersion}`, "latest"]];
  }
  if (step === RELEASE_STEPS.RemoveUiStagingTag || step === RELEASE_STEPS.RemoveMcpStagingTag) {
    return ["npm", ["dist-tag", "rm", packageName, plan.stageTag]];
  }
  throw new Error(`No npm release command for step "${step}".`);
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
  recoveryState = null,
  dryRun = false,
  runStep,
  packTargetManifests = packAndVerifyTargetManifests,
  writeRecoveryState = () => {},
  clearRecoveryState = () => {},
  onStep = () => {},
}) {
  const originalManifests = snapshotManifests(rootDir);
  const currentVersion = readPackage(rootDir).version;
  const plan = buildReleasePlan({ currentVersion, uiBump, mcpBump, recoveryState });
  const progress = plan.progress;
  progress.failedStep = null;
  progress.error = null;
  let packedArtifacts = null;
  let publishStarted = Boolean(recoveryState);
  let activeStep = null;

  const persist = (failedStep = null, error = null) => {
    writeRecoveryState(recoverySnapshot(progress, failedStep, error));
  };

  try {
    for (const step of plan.steps) {
      activeStep = step;
      const executesDuringDryRun =
        step === RELEASE_STEPS.ApplyTargetMetadata || step === RELEASE_STEPS.PackTargetManifests;
      onStep(step, dryRun && !executesDuringDryRun ? "planned" : "executed");
      if (dryRun && !executesDuringDryRun) continue;

      if (step === RELEASE_STEPS.ApplyTargetMetadata) {
        const { ui, mcp } = applyTargetMetadata(rootDir, plan.targetVersion);
        assertTargetMetadata(ui, mcp, plan.targetVersion);
        continue;
      }
      if (step === RELEASE_STEPS.PackTargetManifests) {
        packedArtifacts = packTargetManifests({ rootDir, targetVersion: plan.targetVersion });
        continue;
      }
      if (step === RELEASE_STEPS.PublishUi || step === RELEASE_STEPS.PublishMcp) {
        const packageProgress = step === RELEASE_STEPS.PublishUi ? progress.ui : progress.mcp;
        packageProgress.publishAttempted = true;
        publishStarted = true;
        persist(step);
        runStep(step, plan, packedArtifacts, progress);
        packageProgress.published = true;
        persist();
        continue;
      }

      runStep(step, plan, packedArtifacts, progress);
      if (step === RELEASE_STEPS.PromoteUiLatest) progress.ui.promoted = true;
      if (step === RELEASE_STEPS.PromoteMcpLatest) progress.mcp.promoted = true;
      if (step === RELEASE_STEPS.RemoveUiStagingTag) progress.ui.stageTagRemoved = true;
      if (step === RELEASE_STEPS.RemoveMcpStagingTag) progress.mcp.stageTagRemoved = true;
      if (step === RELEASE_STEPS.CommitTargetMetadata) {
        progress.committed = true;
        clearRecoveryState();
      } else if (publishStarted) {
        persist();
      }
    }
    return { plan, packedManifests: packedArtifacts, progress };
  } catch (error) {
    if (!publishStarted) restoreManifests(rootDir, originalManifests);
    else persist(activeStep, error);
    throw error;
  } finally {
    packedArtifacts?.cleanup?.();
  }
}
