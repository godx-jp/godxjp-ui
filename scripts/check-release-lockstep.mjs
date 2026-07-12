#!/usr/bin/env node
/**
 * Release-lockstep guard — @godxjp/ui and @godxjp/ui-mcp MUST ship as one release train.
 *
 * The two packages describe the SAME thing from two sides: `@godxjp/ui` is the runtime component
 * library; `@godxjp/ui-mcp` is the catalog that tells agents how to use it (props, tokens, rules,
 * patterns). If their versions drift, the MCP documents a release the consumer never installed —
 * exactly the bug in issue #140 (ui 16.9.2 / mcp 16.7.2 / server 16.7.0 all disagreeing).
 *
 * This check makes that drift a CI failure instead of a silent runtime surprise. It asserts the
 * machine-readable compatibility metadata is MUTUALLY consistent:
 *
 *   1. root package.json `version` === mcp/package.json `version`   (one shared release line)
 *   2. root package.json `godxUiMcp`  === mcp/package.json `version` (UI points at its catalog)
 *   3. mcp `godxUiCompatibility` range is satisfied by the UI version (catalog points back)
 *
 * Runs inside `verify` / `verify:release`, and again in scripts/release.mjs right before commit,
 * so a partial or mismatched bump can never be published.
 *
 * Usage: node scripts/check-release-lockstep.mjs [--json]
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const ui = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
const mcp = JSON.parse(readFileSync(join(ROOT, "mcp/package.json"), "utf8"));

const SEMVER = /^\d+\.\d+\.\d+$/;

/**
 * Does `version` satisfy a compatibility range? We keep this dependency-free and only support the
 * two forms we actually author: an exact `x.y.z` or a minor-pinned `x.y.x` wildcard (the form the
 * MCP declares, e.g. "16.10.x"). Anything else is treated as unsatisfiable so a typo fails loud.
 */
function satisfies(version, range) {
  if (!version || !range) return false;
  if (range === version) return true;
  const m = /^(\d+)\.(\d+)\.x$/.exec(range);
  if (m) {
    const v = /^(\d+)\.(\d+)\.\d+$/.exec(version);
    return !!v && v[1] === m[1] && v[2] === m[2];
  }
  return false;
}

const errors = [];

if (!SEMVER.test(ui.version)) {
  errors.push(`@godxjp/ui version "${ui.version}" is not a plain x.y.z semver.`);
}
if (!SEMVER.test(mcp.version)) {
  errors.push(`@godxjp/ui-mcp version "${mcp.version}" is not a plain x.y.z semver.`);
}
if (ui.version !== mcp.version) {
  errors.push(
    `Version line split: @godxjp/ui is ${ui.version} but @godxjp/ui-mcp is ${mcp.version}. ` +
      `They must publish from the same release train (see scripts/release.mjs --mcp sync).`,
  );
}
if (!ui.godxUiMcp) {
  errors.push(
    '@godxjp/ui package.json is missing the "godxUiMcp" field (catalog version it ships with).',
  );
} else if (ui.godxUiMcp !== mcp.version) {
  errors.push(
    `@godxjp/ui declares godxUiMcp=${ui.godxUiMcp} but the catalog is @godxjp/ui-mcp@${mcp.version}.`,
  );
}
if (!mcp.godxUiCompatibility) {
  errors.push('@godxjp/ui-mcp package.json is missing the "godxUiCompatibility" field.');
} else if (!satisfies(ui.version, mcp.godxUiCompatibility)) {
  errors.push(
    `@godxjp/ui-mcp godxUiCompatibility="${mcp.godxUiCompatibility}" is not satisfied by ` +
      `@godxjp/ui@${ui.version}.`,
  );
}

const report = {
  ui: ui.version,
  mcp: mcp.version,
  godxUiMcp: ui.godxUiMcp ?? null,
  godxUiCompatibility: mcp.godxUiCompatibility ?? null,
  inLockstep: errors.length === 0,
  errors,
};

if (process.argv.includes("--json")) {
  process.stdout.write(JSON.stringify(report, null, 2) + "\n");
} else if (errors.length === 0) {
  console.log(
    `✓ Release lockstep OK — @godxjp/ui@${ui.version} ↔ @godxjp/ui-mcp@${mcp.version} ` +
      `(compat ${mcp.godxUiCompatibility}).`,
  );
} else {
  console.error("✗ Release lockstep FAILED — @godxjp/ui and @godxjp/ui-mcp have drifted:");
  for (const e of errors) console.error(`  • ${e}`);
  console.error(
    "\nFix: release both together with `pnpm release --ui <bump> --mcp sync`, or reconcile the " +
      "version / godxUiMcp / godxUiCompatibility fields so they agree.",
  );
}

process.exit(errors.length > 0 ? 1 : 0);
