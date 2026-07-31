#!/usr/bin/env node
/**
 * Release-transition guard (issue #230) — NO network, NO publish, NO repo mutation.
 *
 * `release-integrity.yml` packs the manifests as they sit in the repository, i.e. the PRE-bump
 * state. That never exercises the moment the bug lived in: the coordinated 18.4.0 → 18.4.1
 * transition, where `npm version` + immediate `npm publish` could ship a UI tarball still
 * declaring the previous `godxUiMcp`, with MCP build/test failures only discovered once the
 * bytes were immutable.
 *
 * This check runs that transition offline for every bump kind:
 *   1. plan it — assert the ordered command sequence never bumps with `npm version` and never
 *      publishes before verify:release / MCP install+build+test / lockstep / npm auth;
 *   2. pack it — apply the coordinated target metadata in a throwaway manifest workspace and
 *      assert BOTH packed tarballs carry the target version, `godxUiMcp` and `godxUiCompatibility`.
 *
 * Usage: node scripts/check-release-command-plan.mjs [--json]
 */
import { rmSync } from "node:fs";
import {
  RELEASE_STEPS,
  assertReleaseCommandPlan,
  assertTargetMetadata,
  buildReleasePlan,
  compatibilityFor,
  createManifestPlanWorkspace,
  planReleaseCommands,
  readPackage,
  runRelease,
  targetVersionFor,
} from "./release-core.mjs";

const ROOT = process.cwd();
const BUMPS = ["patch", "minor", "major"];
const currentVersion = readPackage(ROOT).version;
const errors = [];
const report = { currentVersion, transitions: [] };

for (const uiBump of BUMPS) {
  const targetVersion = targetVersionFor(currentVersion, uiBump);
  const transition = {
    uiBump,
    from: currentVersion,
    to: targetVersion,
    commands: [],
    packed: null,
  };
  try {
    const plan = buildReleasePlan({ currentVersion, uiBump, mcpBump: "sync" });
    const commands = assertReleaseCommandPlan(planReleaseCommands(plan));
    transition.commands = commands.map((entry) => [entry.binary, ...entry.args].join(" "));

    const firstPublish = plan.steps.indexOf(RELEASE_STEPS.PublishUi);
    for (const step of [RELEASE_STEPS.ApplyTargetMetadata, RELEASE_STEPS.PackTargetManifests]) {
      if (plan.steps.indexOf(step) > firstPublish) {
        errors.push(`${uiBump}: "${step}" is planned after the first publish.`);
      }
    }

    const workspace = createManifestPlanWorkspace(ROOT);
    try {
      const result = runRelease({ rootDir: workspace, uiBump, mcpBump: "sync", dryRun: true });
      const { ui, mcp } = result.packedManifests;
      assertTargetMetadata(ui, mcp, targetVersion, `packed ${uiBump}`);
      transition.packed = {
        ui: { version: ui.version, godxUiMcp: ui.godxUiMcp },
        mcp: { version: mcp.version, godxUiCompatibility: mcp.godxUiCompatibility },
      };
      if (mcp.godxUiCompatibility !== compatibilityFor(targetVersion)) {
        errors.push(`${uiBump}: packed compatibility is not ${compatibilityFor(targetVersion)}.`);
      }
    } finally {
      rmSync(workspace, { force: true, recursive: true });
    }
  } catch (error) {
    errors.push(`${uiBump}: ${error.message}`);
  }
  report.transitions.push(transition);
}

report.ok = errors.length === 0;
report.errors = errors;

if (process.argv.includes("--json")) {
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
} else if (report.ok) {
  for (const transition of report.transitions) {
    console.log(
      `✓ ${transition.uiBump}: ${transition.from} → ${transition.to} — packed ui ` +
        `${transition.packed.ui.version}/godxUiMcp ${transition.packed.ui.godxUiMcp}, mcp ` +
        `${transition.packed.mcp.version}/compat ${transition.packed.mcp.godxUiCompatibility}; ` +
        `${transition.commands.length} commands, all gates before publish.`,
    );
  }
} else {
  console.error("✗ Release command plan / post-bump packed metadata FAILED:");
  for (const error of errors) console.error(`  • ${error}`);
}

process.exit(report.ok ? 0 : 1);
