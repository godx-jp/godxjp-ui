#!/usr/bin/env node
/** Coordinated, staged and recoverable release for @godxjp/ui + @godxjp/ui-mcp. */
import { execFileSync, spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { isAbsolute, join, resolve } from "node:path";
import {
  RELEASE_STEPS,
  assertFreshTargets,
  assertOnlyCoordinatedManifestChanges,
  assertRegistryArtifact,
  buildReleasePlan,
  readPackage,
  reconcilePackagePublication,
  releaseCommandForStep,
  runRelease,
  validateRecoveryState,
  writeJsonAtomic,
} from "./release-core.mjs";

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : fallback;
};
const recovery = args.includes("--recovery");
const metadataPlan = args.includes("--metadata-plan") || args.includes("--dry-run");
const uiBump = recovery ? "skip" : flag("--ui", "skip");
const mcpBump = recovery ? "sync" : flag("--mcp", "skip");
const repositoryRoot = process.cwd();
const sourceHead = execFileSync("git", ["rev-parse", "HEAD"], {
  cwd: repositoryRoot,
  encoding: "utf8",
}).trim();
const recoveryGitPath = execFileSync("git", ["rev-parse", "--git-path", "godx-release-recovery"], {
  cwd: repositoryRoot,
  encoding: "utf8",
}).trim();
const recoveryDirectory = isAbsolute(recoveryGitPath)
  ? recoveryGitPath
  : resolve(repositoryRoot, recoveryGitPath);
const recoveryPath = join(recoveryDirectory, "state.json");

function command(binary, commandArgs, cwd = repositoryRoot) {
  console.log(
    `\n$ ${[binary, ...commandArgs].join(" ")}${cwd !== repositoryRoot ? `  (in ${cwd})` : ""}`,
  );
  execFileSync(binary, commandArgs, { cwd, stdio: "inherit" });
}

function npmJson(commandArgs, missingIsNull = false) {
  const result = spawnSync("npm", commandArgs, { cwd: repositoryRoot, encoding: "utf8" });
  if (result.status === 0) return JSON.parse(result.stdout || "null");
  const output = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
  if (missingIsNull && /E404|404 Not Found|is not in this registry/i.test(output)) return null;
  throw new Error(`npm ${commandArgs.join(" ")} failed: ${output.trim()}`);
}

function registryState(packageName, version) {
  const integrity = npmJson(
    ["view", `${packageName}@${version}`, "dist.integrity", "--json"],
    true,
  );
  const tags = npmJson(["view", packageName, "dist-tags", "--json"], true) ?? {};
  return { exists: typeof integrity === "string", integrity, tags };
}

function commitTargetMetadata(plan) {
  command("git", ["add", "package.json", "mcp/package.json"]);
  const dirty =
    spawnSync("git", ["diff", "--cached", "--quiet"], { cwd: repositoryRoot }).status !== 0;
  if (dirty) command("git", ["commit", "-m", `chore(release): UI + MCP @${plan.targetVersion}`]);
}

function executeReleaseStep(step, plan, artifacts, progress) {
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
      const uiRegistry = registryState("@godxjp/ui", plan.targetVersion);
      const mcpRegistry = registryState("@godxjp/ui-mcp", plan.targetVersion);
      if (!plan.recovery) {
        assertFreshTargets(uiRegistry, mcpRegistry);
      } else {
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
      }
      return;
    }
    case RELEASE_STEPS.RecordPreviousLatestTags:
      progress.ui.previousLatest =
        registryState("@godxjp/ui", plan.targetVersion).tags.latest ?? null;
      progress.mcp.previousLatest =
        registryState("@godxjp/ui-mcp", plan.targetVersion).tags.latest ?? null;
      return;
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
    case RELEASE_STEPS.VerifyPublishedVersions: {
      const uiRegistry = registryState("@godxjp/ui", plan.targetVersion);
      const mcpRegistry = registryState("@godxjp/ui-mcp", plan.targetVersion);
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
    case RELEASE_STEPS.PublishUi:
    case RELEASE_STEPS.PublishMcp:
    case RELEASE_STEPS.PromoteUiLatest:
    case RELEASE_STEPS.PromoteMcpLatest:
    case RELEASE_STEPS.RemoveUiStagingTag:
    case RELEASE_STEPS.RemoveMcpStagingTag: {
      const [binary, commandArgs] = releaseCommandForStep(step, plan, artifacts);
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

function compensateUiLatest(_plan, progress) {
  if (progress.ui.previousLatest) {
    command("npm", ["dist-tag", "add", `@godxjp/ui@${progress.ui.previousLatest}`, "latest"]);
  } else {
    command("npm", ["dist-tag", "rm", "@godxjp/ui", "latest"]);
  }
}

function makePlanWorkspace() {
  const workspace = mkdtempSync(join(tmpdir(), "godxjp-release-metadata-plan-"));
  mkdirSync(join(workspace, "mcp"));
  cpSync(join(repositoryRoot, "package.json"), join(workspace, "package.json"));
  cpSync(join(repositoryRoot, "mcp/package.json"), join(workspace, "mcp/package.json"));
  return workspace;
}

let workspace = repositoryRoot;
try {
  if (recovery && !existsSync(recoveryPath))
    throw new Error(`No recovery state at ${recoveryPath}.`);
  let recoveryState = recovery ? JSON.parse(readFileSync(recoveryPath, "utf8")) : null;
  if (recoveryState) {
    recoveryState = validateRecoveryState(recoveryState, {
      sourceHead,
      rootDir: repositoryRoot,
      recoveryDirectory,
    });
  }
  buildReleasePlan({
    currentVersion: readPackage(repositoryRoot).version,
    uiBump,
    mcpBump,
    sourceHead,
    recoveryState,
  });

  if (!metadataPlan) {
    const status = execFileSync(
      "git",
      ["status", "--porcelain=v1", "-z", "--untracked-files=all"],
      {
        cwd: repositoryRoot,
        encoding: "utf8",
      },
    );
    if (recovery) assertOnlyCoordinatedManifestChanges(status);
    else if (status) throw new Error("Working tree is not clean.");
  } else {
    if (recovery) throw new Error("Recovery cannot be combined with metadata-plan mode.");
    workspace = makePlanWorkspace();
    console.log(
      "Metadata/pack plan only: auth, registry, build, test, publish, tags and commit are NOT validated.",
    );
  }

  const result = runRelease({
    rootDir: workspace,
    uiBump,
    mcpBump,
    sourceHead,
    recoveryState,
    recoveryDirectory: metadataPlan ? null : recoveryDirectory,
    dryRun: metadataPlan,
    runStep: executeReleaseStep,
    writeRecoveryState: (state) => writeJsonAtomic(recoveryPath, state),
    clearRecoveryState: () => rmSync(recoveryDirectory, { force: true, recursive: true }),
    compensateUiLatest,
    onStep: (step, mode) => console.log(`[${mode}] ${step}`),
  });

  if (metadataPlan) {
    const { ui, mcp } = result.packedManifests;
    console.log(
      JSON.stringify(
        {
          mode: "metadata-pack-plan",
          releaseValidated: false,
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
  }
} catch (error) {
  console.error(`✗ Release aborted: ${error.message}`);
  if (existsSync(recoveryPath)) console.error(`Recovery state: ${recoveryPath}`);
  process.exitCode = 1;
} finally {
  if (metadataPlan && workspace !== repositoryRoot)
    rmSync(workspace, { force: true, recursive: true });
  if (!existsSync(recoveryPath) && existsSync(recoveryDirectory))
    rmSync(recoveryDirectory, { force: true, recursive: true });
}
