#!/usr/bin/env node
/**
 * Drift guard — keep the agent-facing audit catalogs (surfaced by the MCP
 * `list_audit_rules` + `list_visual_checks` tools) in sync with the EXECUTABLE rules
 * in the audit CLIs. Each CLI is the source of truth; every rule it runs must be
 * documented in its MCP catalog with a matching severity (+ a standard where the CLI
 * cites one), so an agent reading the MCP sees exactly what the local audits enforce.
 *
 * Usage: node scripts/check-audit-sync.mjs
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const failures = [];

/** Parse `{ id, severity, category, standard }` object literals from an MCP data file. */
function parseCatalog(relFile) {
  const src = readFileSync(join(ROOT, relFile), "utf8");
  const map = new Map();
  for (const m of src.matchAll(
    /\{\s*id:\s*"([^"]+)",\s*severity:\s*"([^"]+)",\s*category:\s*"([^"]+)",\s*standard:\s*(null|"[^"]*"),/g,
  )) {
    map.set(m[1], { severity: m[2], standard: m[4] === "null" ? null : m[4].slice(1, -1) });
  }
  return map;
}

/** Diff one CLI's `--rules` output against its MCP catalog. */
function check(label, scriptRel, catalogRel) {
  const scriptRules = JSON.parse(
    execFileSync("node", [join(ROOT, scriptRel), "--rules"], { encoding: "utf8" }),
  );
  const catalog = parseCatalog(catalogRel);
  for (const r of scriptRules) {
    const entry = catalog.get(r.id);
    if (!entry) {
      failures.push(
        `  [${label}] "${r.id}" runs in ${scriptRel} but is NOT documented in ${catalogRel}`,
      );
      continue;
    }
    if (entry.severity !== r.severity) {
      failures.push(
        `  [${label}] "${r.id}" severity drift: script=${r.severity} catalog=${entry.severity}`,
      );
    }
    // Catalog may phrase the standard more concisely (or add one where the CLI has none),
    // but if the CLI cites a standard the catalog must document one too.
    if (r.standard && !entry.standard) {
      failures.push(
        `  [${label}] "${r.id}" cites a standard in ${scriptRel} but the catalog standard is null`,
      );
    }
  }
  return { rules: scriptRules.length, entries: catalog.size };
}

const stat = {
  static: check("static", "scripts/ui-audit.mjs", "mcp/src/data/audit-rules.ts"),
  visual: check("visual", "scripts/visual-audit.mjs", "mcp/src/data/visual-rules.ts"),
};

if (failures.length) {
  console.error("✗ audit-sync guard failed — update the MCP catalog(s):");
  for (const f of failures) console.error(f);
  process.exit(1);
}
console.log(
  `✓ audit-sync guard passed — static ${stat.static.rules} rules / ${stat.static.entries} catalog, ` +
    `visual ${stat.visual.rules} checks / ${stat.visual.entries} catalog.`,
);
