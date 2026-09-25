#!/usr/bin/env node
/**
 * `release-integrity.yml` packs the manifests as they sit in the repository, i.e. the PRE-bump
 * state. That never exercises the moment the bug lived in: the coordinated 18.4.0 → 18.4.1
 * transition, where `npm version` + immediate `npm publish` could ship a UI tarball still
 * declaring the previous `godxUiMcp`, with MCP build/test failures only discovered once the bytes
 * were immutable.
 */
import { rmSync } from "node:fs";
import { join } from "node:path";
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

/*
 * AND THE TREE AS IT SITS — the three transitions above cannot see it (gh#954).
 *
 * Everything before this point runs `runRelease(dryRun)` in a COPY, and that path executes
 * `ApplyTargetMetadata`, which rewrites the coordinated fields itself. So the simulation is always
 * self-consistent no matter what is on disk, and this gate printed three ✓ lines while
 * `mcp/package.json` declared `godxUiCompatibility: 30.5.x` against `version: 30.6.0`.
 *
 * That state is reachable because in this repo a HUMAN bumps the version in an ordinary PR (see
 * npm-publish.yml's header) — `ApplyTargetMetadata` never runs for that bump. `compatibilityFor`
 * is `<major>.<minor>.x`, so it only drifts on a MINOR or MAJOR bump, which is exactly why it
 * survives: measured across 25 bump commits, the two that were wrong were both minors (30.5.0 and
 * 30.6.0), and both reached `main` before the MCP suite inside `CI · release contract` caught it.
 *
 * A red `CI · release contract` then BLOCKS the release, because VerifyCommitProvenance requires
 * that check green on the tagged SHA — so a one-word omission costs a second bump commit and a
 * second full CI pass. Checked here instead, it costs 0.3s.
 */
const uiNow = readPackage(ROOT);
const mcpNow = readPackage(join(ROOT, "mcp"));
const treeChecks = [
  ["mcp/package.json::version", mcpNow.version, currentVersion],
  ["package.json::godxUiMcp", uiNow.godxUiMcp, currentVersion],
  [
    "mcp/package.json::godxUiCompatibility",
    mcpNow.godxUiCompatibility,
    compatibilityFor(currentVersion),
  ],
];
for (const [field, actual, expected] of treeChecks) {
  if (actual !== expected) {
    errors.push(
      `tree: ${field} is "${actual}", expected "${expected}" for version ${currentVersion}.`,
    );
  }
}
report.tree = Object.fromEntries(treeChecks.map(([f, actual]) => [f, actual]));

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
  console.log(
    `✓ tree @${currentVersion}: mcp ${mcpNow.version}, godxUiMcp ${uiNow.godxUiMcp}, compat ` +
      `${mcpNow.godxUiCompatibility}.`,
  );
} else {
  console.error("✗ Release command plan / post-bump packed metadata FAILED:");
  for (const error of errors) console.error(`  • ${error}`);
}

process.exit(report.ok ? 0 : 1);
