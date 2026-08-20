#!/usr/bin/env node
/**
 * Drift guard, reverse direction (gh#278) — every PUBLIC callable export must be discoverable
 * through the MCP catalog.
 *
 * check-mcp-sync.mjs already guards "catalog entry → must be a real export" (ghost entries).
 * 18.11.x shipped the opposite drift: ServiceRolePanel / BranchScopePicker / PermissionMatrix
 * were real, tested exports while the published MCP said they did not exist and get_component /
 * search_components could not find them — a consumer agent was actively told to hand-roll a
 * shipped component (gh#278, reported from a consumer audit).
 *
 * Two checks against component-api-manifest.json (the generated public-API ground truth):
 *   1. COVERAGE — every manifest component name must appear SOMEWHERE in mcp/src/data/*.ts
 *      (its own entry, or a mention in a related/pattern/example). A brand-new export nobody
 *      documented fails here.
 *   2. NEGATED-EXISTENCE CLAIMS — pattern/component prose must not claim "NO <Name>" /
 *      "<Name> does not exist" for a name the manifest says IS exported (the exact 18.11.x
 *      rbac-service-roles failure).
 *
 * Usage: node scripts/check-mcp-catalog-coverage.mjs [--json]
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const manifest = JSON.parse(readFileSync(join(ROOT, "component-api-manifest.json"), "utf8"));
// components is a name-keyed map: { Accordion: { group, props }, ... }
const names = Object.keys(manifest.components);

const dataDir = join(ROOT, "mcp/src/data");
const corpus = readdirSync(dataDir)
  .filter((f) => f.endsWith(".ts"))
  .map((f) => readFileSync(join(dataDir, f), "utf8"))
  .join("\n");

const uncovered = names.filter((n) => !corpus.includes(n));

const negated = [];
for (const n of names) {
  // Existence-denial prose for a shipped export — the exact 18.11.x failure read
  // "There is NO ServiceRolePanel, NO BranchScopePicker and NO PermissionMatrix component".
  // CASE-SENSITIVE capital "NO <Name>": lowercase "no badge"/"no flex" is ordinary prose
  // about a property, not an existence claim.
  // "NO Card wrapper" (design guidance about a lowercase noun) is fine; "NO ServiceRolePanel,"
  // and "NO PermissionMatrix component" (existence claims) are not.
  // "and/or/nor" continue a multi-name claim ("NO BranchScopePicker and NO PermissionMatrix").
  const deny = new RegExp(
    `(?:\\bNO\\s+${n}\\b(?!\\s+(?!components?\\b|exports?\\b|and\\b|or\\b|nor\\b)[a-z])|\\b${n}\\b[^.\\n]{0,40}does not exist)`,
  );
  if (deny.test(corpus)) negated.push(n);
}

const failed = uncovered.length > 0 || negated.length > 0;

if (process.argv.includes("--json")) {
  console.log(JSON.stringify({ uncovered, negated, total: names.length }));
} else if (failed) {
  if (uncovered.length > 0) {
    console.error(
      `✗ check:mcp-catalog-coverage — ${uncovered.length} public export(s) invisible to the MCP catalog (gh#278):`,
    );
    for (const n of uncovered) console.error(`    ${n}`);
    console.error("  Add a components.ts entry (or at least a related/pattern mention).");
  }
  if (negated.length > 0) {
    console.error(
      `✗ check:mcp-catalog-coverage — catalog prose DENIES ${negated.length} shipped export(s):`,
    );
    for (const n of negated) console.error(`    ${n}`);
    console.error("  The export ships — rewrite the pattern/component text to point at it.");
  }
} else {
  console.log(
    `✓ check:mcp-catalog-coverage — ${names.length} public exports all discoverable, no negated-existence claims.`,
  );
}

process.exit(failed ? 1 : 0);
