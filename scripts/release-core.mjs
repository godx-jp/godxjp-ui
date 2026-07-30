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
  PublishUi: "publish-ui",
  PublishMcp: "publish-mcp",
  CommitTargetMetadata: "commit-target-metadata",
});

const VALID_UI_BUMPS = new Set(["patch", "minor", "major", "skip"]);
const VALID_MCP_BUMPS = new Set(["sync", "skip"]);
const SEMVER = /^(\d+)\.(\d+)\.(\d+)$/;

export function targetVersionFor(currentVersion, uiBump) {
  const match = SEMVER.exec(currentVersion);

  if (!match) {
    throw new Error(`Current UI version "${currentVersion}" is not a plain x.y.z semver.`);
  }

  const [, rawMajor, rawMinor, rawPatch] = match;
  const major = Number(rawMajor);
  const minor = Number(rawMinor);
  const patch = Number(rawPatch);

  if (uiBump === "skip") {
    return currentVersion;
  }

  if (uiBump === "patch") {
    return `${major}.${minor}.${patch + 1}`;
  }

  if (uiBump === "minor") {
    return `${major}.${minor + 1}.0`;
  }

  if (uiBump === "major") {
    return `${major + 1}.0.0`;
  }

  throw new Error(`Unsupported UI bump "${uiBump}".`);
}

export function compatibilityFor(version) {
  const match = SEMVER.exec(version);

  if (!match) {
    throw new Error(`Target UI version "${version}" is not a plain x.y.z semver.`);
  }

  return `${match[1]}.${match[2]}.x`;
}

export function buildReleasePlan({ currentVersion, uiBump, mcpBump }) {
  if (
    !VALID_UI_BUMPS.has(uiBump) ||
    !VALID_MCP_BUMPS.has(mcpBump) ||
    (uiBump === "skip" && mcpBump === "skip")
  ) {
    throw new Error(
      "Usage: node scripts/release.mjs --ui <patch|minor|major|skip> --mcp <sync|skip>",
    );
  }

  if (uiBump !== "skip" && mcpBump !== "sync") {
    throw new Error(
      "Lockstep: bumping @godxjp/ui requires --mcp sync so both packages ship together.",
    );
  }

  const targetVersion = targetVersionFor(currentVersion, uiBump);
  const steps = [
    RELEASE_STEPS.ApplyTargetMetadata,
    RELEASE_STEPS.VerifyRoot,
    RELEASE_STEPS.InstallMcp,
    RELEASE_STEPS.BuildMcp,
    RELEASE_STEPS.TestMcp,
    RELEASE_STEPS.VerifyLockstep,
    RELEASE_STEPS.PackTargetManifests,
  ];

  if (uiBump !== "skip") {
    steps.push(RELEASE_STEPS.PublishUi);
  }

  if (mcpBump === "sync") {
    steps.push(RELEASE_STEPS.PublishMcp);
  }

  steps.push(RELEASE_STEPS.CommitTargetMetadata);

  return {
    targetVersion,
    compatibility: compatibilityFor(targetVersion),
    publishesUi: uiBump !== "skip",
    publishesMcp: mcpBump === "sync",
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

export function assertTargetMetadata(ui, mcp, targetVersion, source = "package") {
  const expectedCompatibility = compatibilityFor(targetVersion);
  const errors = [];

  if (ui.version !== targetVersion) {
    errors.push(`${source} UI version ${ui.version} != target ${targetVersion}`);
  }

  if (mcp.version !== targetVersion) {
    errors.push(`${source} MCP version ${mcp.version} != target ${targetVersion}`);
  }

  if (ui.godxUiMcp !== targetVersion) {
    errors.push(`${source} godxUiMcp ${ui.godxUiMcp} != target ${targetVersion}`);
  }

  if (mcp.godxUiCompatibility !== expectedCompatibility) {
    errors.push(
      `${source} godxUiCompatibility ${mcp.godxUiCompatibility} != ${expectedCompatibility}`,
    );
  }

  if (errors.length > 0) {
    throw new Error(`Release metadata is not coordinated:\n- ${errors.join("\n- ")}`);
  }
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

  if (!filename) {
    throw new Error(`npm pack did not report an artifact for ${packageArgument}.`);
  }

  return JSON.parse(
    execFile("tar", ["-xzO", "-f", join(packDirectory, filename), "package/package.json"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }),
  );
}

export function packAndVerifyTargetManifests({ rootDir, targetVersion, execFile = execFileSync }) {
  const packDirectory = mkdtempSync(join(tmpdir(), "godxjp-release-pack-"));

  try {
    const ui = packManifest(rootDir, ".", packDirectory, execFile);
    const mcp = packManifest(rootDir, "mcp", packDirectory, execFile);

    assertTargetMetadata(ui, mcp, targetVersion, "packed");

    return { ui, mcp };
  } finally {
    rmSync(packDirectory, { force: true, recursive: true });
  }
}

export function runRelease({
  rootDir,
  uiBump,
  mcpBump,
  dryRun = false,
  runStep,
  packTargetManifests = packAndVerifyTargetManifests,
  onStep = () => {},
}) {
  const currentVersion = readPackage(rootDir).version;
  const plan = buildReleasePlan({ currentVersion, uiBump, mcpBump });
  let packedManifests = null;

  for (const step of plan.steps) {
    const executesDuringDryRun =
      step === RELEASE_STEPS.ApplyTargetMetadata || step === RELEASE_STEPS.PackTargetManifests;

    onStep(step, dryRun && !executesDuringDryRun ? "planned" : "executed");

    if (dryRun && !executesDuringDryRun) {
      continue;
    }

    if (step === RELEASE_STEPS.ApplyTargetMetadata) {
      const { ui, mcp } = applyTargetMetadata(rootDir, plan.targetVersion);
      assertTargetMetadata(ui, mcp, plan.targetVersion);
      continue;
    }

    if (step === RELEASE_STEPS.PackTargetManifests) {
      packedManifests = packTargetManifests({
        rootDir,
        targetVersion: plan.targetVersion,
      });
      continue;
    }

    runStep(step, plan);
  }

  return { plan, packedManifests };
}
