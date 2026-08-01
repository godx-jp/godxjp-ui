#!/usr/bin/env node
/**
 * Coordinated, staged and recoverable release for @godxjp/ui + @godxjp/ui-mcp.
 *
 * This file is deliberately THIN: it parses flags, resolves paths, and wires two effect primitives
 * (`run` / `capture`) into the pure planner + executor in scripts/release-core.mjs. Every command
 * that actually runs — and the order it runs in — is decided by `buildReleasePlan` /
 * `planReleaseCommands`, so `src/test/__tests__/release-workflow.test.ts` can prove offline that
 * the coordinated target metadata and every preflight gate precede the first `npm publish`
 * (issue #230).
 */
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { isAbsolute, join, resolve } from "node:path";
import {
  assertOnlyCoordinatedManifestChanges,
  buildReleasePlan,
  createManifestPlanWorkspace,
  createReleaseRuntime,
  planReleaseCommands,
  readPackage,
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
const adoptStagedVersion = flag("--adopt-staged", null);
const uiBump = recovery || adoptStagedVersion ? "skip" : flag("--ui", "skip");
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

const runtime = createReleaseRuntime({
  repositoryRoot,
  run: (binary, commandArgs, cwd) => {
    console.log(
      `\n$ ${[binary, ...commandArgs].join(" ")}${cwd !== repositoryRoot ? `  (in ${cwd})` : ""}`,
    );
    execFileSync(binary, commandArgs, { cwd, stdio: "inherit" });
  },
  capture: (binary, commandArgs, cwd) => spawnSync(binary, commandArgs, { cwd, encoding: "utf8" }),
});

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
    adoptStagedVersion,
  });

  if (!metadataPlan) {
    const status = runtime.gitStatus();
    if (recovery) assertOnlyCoordinatedManifestChanges(status);
    else if (status) throw new Error("Working tree is not clean.");
  } else {
    if (recovery) throw new Error("Recovery cannot be combined with metadata-plan mode.");
    workspace = createManifestPlanWorkspace(repositoryRoot);
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
    adoptStagedVersion,
    recoveryDirectory: metadataPlan ? null : recoveryDirectory,
    dryRun: metadataPlan,
    runStep: runtime.runStep,
    writeRecoveryState: (state) => writeJsonAtomic(recoveryPath, state),
    clearRecoveryState: () => rmSync(recoveryDirectory, { force: true, recursive: true }),
    compensateLatest: runtime.compensateLatest,
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
          commands: planReleaseCommands(result.plan, result.packedManifests).map((entry) => ({
            step: entry.step,
            command: [entry.binary, ...entry.args].join(" "),
            cwd: entry.cwd,
          })),
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
