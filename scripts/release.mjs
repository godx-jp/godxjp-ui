#!/usr/bin/env node
/**
 * Coordinated fail-closed release for @godxjp/ui and @godxjp/ui-mcp.
 *
 * Usage:
 *   node scripts/release.mjs --ui patch --mcp sync
 *   node scripts/release.mjs --mcp sync
 *   node scripts/release.mjs --ui patch --mcp sync --dry-run
 */
import { execFileSync, spawnSync } from "node:child_process";
import { cpSync, mkdtempSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { RELEASE_STEPS, buildReleasePlan, readPackage, runRelease } from "./release-core.mjs";

const args = process.argv.slice(2);
const flag = (name, defaultValue) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : defaultValue;
};
const uiBump = flag("--ui", "skip");
const mcpBump = flag("--mcp", "skip");
const dryRun = args.includes("--dry-run");
const repositoryRoot = process.cwd();

function command(binary, commandArgs, cwd = repositoryRoot) {
  console.log(
    `\n$ ${[binary, ...commandArgs].join(" ")}${cwd !== repositoryRoot ? `  (in ${cwd})` : ""}`,
  );
  execFileSync(binary, commandArgs, { cwd, stdio: "inherit" });
}

function commitTargetMetadata(plan) {
  command("git", ["add", "package.json", "mcp/package.json"]);
  const hasStagedChanges =
    spawnSync("git", ["diff", "--cached", "--quiet"], {
      cwd: repositoryRoot,
      stdio: "inherit",
    }).status !== 0;

  if (!hasStagedChanges) {
    console.log("\n✓ Published. Coordinated target metadata was already committed.");
    return;
  }

  const packages = [
    plan.publishesUi ? `@godxjp/ui@${plan.targetVersion}` : null,
    plan.publishesMcp ? `@godxjp/ui-mcp@${plan.targetVersion}` : null,
  ].filter(Boolean);
  command("git", ["commit", "-m", `chore(release): ${packages.join(" · ")}`]);
  console.log("\n✓ Released. Push the coordinated version commit when ready.");
}

function executeReleaseStep(step, plan) {
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
    case RELEASE_STEPS.PublishUi:
      command("npm", ["publish", "--access", "public"]);
      console.log(`✓ published @godxjp/ui@${plan.targetVersion}`);
      return;
    case RELEASE_STEPS.PublishMcp:
      command("npm", ["publish", "--access", "public"], join(repositoryRoot, "mcp"));
      console.log(`✓ published @godxjp/ui-mcp@${plan.targetVersion}`);
      return;
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
  const currentVersion = readPackage(repositoryRoot).version;
  buildReleasePlan({ currentVersion, uiBump, mcpBump });

  if (!dryRun) {
    const status = execFileSync("git", ["status", "--porcelain"], {
      cwd: repositoryRoot,
      encoding: "utf8",
    }).trim();

    if (status) {
      throw new Error("Working tree is not clean. Commit or stash changes before releasing.");
    }
  } else {
    workspace = makeDryRunWorkspace();
    console.log(
      "Dry-run: using an isolated manifest workspace; no install, build, publish, or commit runs.",
    );
  }

  const result = runRelease({
    rootDir: workspace,
    uiBump,
    mcpBump,
    dryRun,
    runStep: executeReleaseStep,
    onStep: (step, mode) => console.log(`[${mode}] ${step}`),
  });

  if (dryRun) {
    const ui = result.packedManifests.ui;
    const mcp = result.packedManifests.mcp;
    console.log(
      JSON.stringify(
        {
          targetVersion: result.plan.targetVersion,
          steps: result.plan.steps,
          packed: {
            ui: { version: ui.version, godxUiMcp: ui.godxUiMcp },
            mcp: {
              version: mcp.version,
              godxUiCompatibility: mcp.godxUiCompatibility,
            },
          },
        },
        null,
        2,
      ),
    );
    console.log("✓ Dry-run passed with coordinated packed target manifests and no publish.");
  }
} catch (error) {
  console.error(`✗ Release aborted before completion: ${error.message}`);
  process.exitCode = 1;
} finally {
  if (dryRun && workspace !== repositoryRoot) {
    rmSync(workspace, { force: true, recursive: true });
  }
}
