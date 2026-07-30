#!/usr/bin/env node
/** Coordinated fail-closed release for @godxjp/ui and @godxjp/ui-mcp. */
import { execFileSync, spawnSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { isAbsolute, join, resolve } from "node:path";
import {
  RELEASE_STEPS,
  assertOnlyCoordinatedManifestChanges,
  assertPublishedVersions,
  assertTargetAvailability,
  buildReleasePlan,
  readPackage,
  releaseCommandForStep,
  runRelease,
} from "./release-core.mjs";

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : fallback;
};
const recovery = args.includes("--recovery");
const uiBump = recovery ? "skip" : flag("--ui", "skip");
const mcpBump = recovery ? "sync" : flag("--mcp", "skip");
const dryRun = args.includes("--dry-run");
const repositoryRoot = process.cwd();
const recoveryGitPath = execFileSync(
  "git",
  ["rev-parse", "--git-path", "godx-release-recovery.json"],
  {
    cwd: repositoryRoot,
    encoding: "utf8",
  },
).trim();
const recoveryPath = isAbsolute(recoveryGitPath)
  ? recoveryGitPath
  : resolve(repositoryRoot, recoveryGitPath);

function command(binary, commandArgs, cwd = repositoryRoot) {
  console.log(
    `\n$ ${[binary, ...commandArgs].join(" ")}${cwd !== repositoryRoot ? `  (in ${cwd})` : ""}`,
  );
  execFileSync(binary, commandArgs, { cwd, stdio: "inherit" });
}

function packageVersionExists(packageName, version) {
  const result = spawnSync("npm", ["view", `${packageName}@${version}`, "version", "--json"], {
    cwd: repositoryRoot,
    encoding: "utf8",
  });
  if (result.status === 0) return true;
  const output = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
  if (/E404|404 Not Found|is not in this registry/i.test(output)) return false;
  throw new Error(
    `Registry availability check failed for ${packageName}@${version}: ${output.trim()}`,
  );
}

function commitTargetMetadata(plan) {
  command("git", ["add", "package.json", "mcp/package.json"]);
  const hasChanges =
    spawnSync("git", ["diff", "--cached", "--quiet"], {
      cwd: repositoryRoot,
      stdio: "inherit",
    }).status !== 0;
  if (!hasChanges) return;
  command("git", [
    "commit",
    "-m",
    `chore(release): @godxjp/ui + @godxjp/ui-mcp @${plan.targetVersion}`,
  ]);
}

function executeReleaseStep(step, plan, packedArtifacts, progress) {
  switch (step) {
    case RELEASE_STEPS.VerifyRoot:
      command("pnpm", ["run", "verify:release"]);
      return;
    case RELEASE_STEPS.InstallMcp:
      command("pnpm", ["install", "--frozen-lockfile"], join(repositoryRoot, "mcp"));
      return;
    case RELEASE_STEPS.BuildMcp:
      command("pnpm", ["build"], join(repositoryRoot, "mcp"));
      return;
    case RELEASE_STEPS.TestMcp:
      command("pnpm", ["test"], join(repositoryRoot, "mcp"));
      return;
    case RELEASE_STEPS.VerifyLockstep:
      command("node", ["scripts/check-release-lockstep.mjs"]);
      return;
    case RELEASE_STEPS.VerifyNpmAuth:
      command("npm", ["whoami"]);
      return;
    case RELEASE_STEPS.VerifyTargetAvailability: {
      const uiExists = packageVersionExists("@godxjp/ui", plan.targetVersion);
      const mcpExists = packageVersionExists("@godxjp/ui-mcp", plan.targetVersion);
      assertTargetAvailability({ recovery: plan.recovery, progress, uiExists, mcpExists });
      return;
    }
    case RELEASE_STEPS.VerifyPublishTree: {
      const status = execFileSync(
        "git",
        ["status", "--porcelain=v1", "-z", "--untracked-files=all"],
        {
          cwd: repositoryRoot,
          encoding: "utf8",
        },
      );
      assertOnlyCoordinatedManifestChanges(status);
      return;
    }
    case RELEASE_STEPS.VerifyPublishedVersions:
      assertPublishedVersions(
        packageVersionExists("@godxjp/ui", plan.targetVersion),
        packageVersionExists("@godxjp/ui-mcp", plan.targetVersion),
      );
      return;
    case RELEASE_STEPS.PublishUi:
    case RELEASE_STEPS.PublishMcp:
    case RELEASE_STEPS.PromoteUiLatest:
    case RELEASE_STEPS.PromoteMcpLatest:
    case RELEASE_STEPS.RemoveUiStagingTag:
    case RELEASE_STEPS.RemoveMcpStagingTag: {
      const [binary, commandArgs] = releaseCommandForStep(step, plan, packedArtifacts);
      command(binary, commandArgs);
      return;
    }
    case RELEASE_STEPS.CommitTargetMetadata:
      commitTargetMetadata(plan);
      return;
    default:
      throw new Error(`Unknown release step "${step}".`);
  }
}

function makeDryRunWorkspace() {
  const workspace = mkdtempSync(join(tmpdir(), "godxjp-release-dry-run-"));
  mkdirSync(join(workspace, "mcp"));
  cpSync(join(repositoryRoot, "package.json"), join(workspace, "package.json"));
  cpSync(join(repositoryRoot, "mcp/package.json"), join(workspace, "mcp/package.json"));
  return workspace;
}

let workspace = repositoryRoot;
try {
  if (recovery && !existsSync(recoveryPath))
    throw new Error(`No recovery state at ${recoveryPath}.`);
  const recoveryState = recovery ? JSON.parse(readFileSync(recoveryPath, "utf8")) : null;
  const currentVersion = readPackage(repositoryRoot).version;
  buildReleasePlan({ currentVersion, uiBump, mcpBump, recoveryState });

  if (!dryRun) {
    const status = execFileSync(
      "git",
      ["status", "--porcelain=v1", "-z", "--untracked-files=all"],
      {
        cwd: repositoryRoot,
        encoding: "utf8",
      },
    );
    if (recovery) assertOnlyCoordinatedManifestChanges(status);
    else if (status)
      throw new Error("Working tree is not clean. Commit or stash changes before releasing.");
  } else {
    if (recovery) throw new Error("Recovery mode cannot be combined with --dry-run.");
    workspace = makeDryRunWorkspace();
    console.log(
      "Dry-run: isolated manifests; no auth, registry mutation, publish, tag, or commit runs.",
    );
  }

  const result = runRelease({
    rootDir: workspace,
    uiBump,
    mcpBump,
    recoveryState,
    dryRun,
    runStep: executeReleaseStep,
    writeRecoveryState: (state) =>
      writeFileSync(recoveryPath, `${JSON.stringify(state, null, 2)}\n`),
    clearRecoveryState: () => rmSync(recoveryPath, { force: true }),
    onStep: (step, mode) => console.log(`[${mode}] ${step}`),
  });

  if (dryRun) {
    const { ui, mcp } = result.packedManifests;
    console.log(
      JSON.stringify(
        {
          targetVersion: result.plan.targetVersion,
          stageTag: result.plan.stageTag,
          steps: result.plan.steps,
          packed: {
            ui: { version: ui.version, godxUiMcp: ui.godxUiMcp },
            mcp: { version: mcp.version, godxUiCompatibility: mcp.godxUiCompatibility },
          },
        },
        null,
        2,
      ),
    );
    console.log(
      "✓ Dry-run passed with coordinated verified tarballs and no network release action.",
    );
  }
} catch (error) {
  console.error(`✗ Release aborted: ${error.message}`);
  if (existsSync(recoveryPath)) console.error(`Recovery state: ${recoveryPath}`);
  process.exitCode = 1;
} finally {
  if (dryRun && workspace !== repositoryRoot) rmSync(workspace, { force: true, recursive: true });
}
