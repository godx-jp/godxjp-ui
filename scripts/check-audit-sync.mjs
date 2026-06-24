#!/usr/bin/env node
/**
 * Drift guard — keep the agent-facing audit catalog (mcp/src/data/audit-rules.ts,
 * surfaced by the MCP `list_audit_rules` tool) in sync with the EXECUTABLE rules in
 * scripts/ui-audit.mjs. The script is the source of truth; every rule it runs must be
 * documented in the catalog with a matching `standard`, so an agent reading the MCP
 * sees exactly what the local audit enforces.
 *
 * Usage: node scripts/check-audit-sync.mjs
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();

// 1) Executable rules straight from the audit CLI (its own --rules introspection).
const scriptRules = JSON.parse(
  execFileSync("node", [join(ROOT, "scripts/ui-audit.mjs"), "--rules"], { encoding: "utf8" }),
);

// 2) Catalog rules from the MCP data file (parse the object literals — no TS build needed).
const catalogSrc = readFileSync(join(ROOT, "mcp/src/data/audit-rules.ts"), "utf8");
const catalog = new Map();
for (const m of catalogSrc.matchAll(
  /\{\s*id:\s*"([^"]+)",\s*severity:\s*"([^"]+)",\s*category:\s*"([^"]+)",\s*standard:\s*(null|"[^"]*"),/g,
)) {
  catalog.set(m[1], { severity: m[2], standard: m[4] === "null" ? null : m[4].slice(1, -1) });
}

const failures = [];
for (const r of scriptRules) {
  const entry = catalog.get(r.id);
  if (!entry) {
    failures.push(
      `  "${r.id}" runs in ui-audit.mjs but is NOT documented in mcp/src/data/audit-rules.ts`,
    );
    continue;
  }
  if (entry.severity !== r.severity) {
    failures.push(`  "${r.id}" severity drift: script=${r.severity} catalog=${entry.severity}`);
  }
  // The catalog may phrase the standard more concisely than the CLI, and may even ADD a standard
  // where the CLI rule has none — but if the CLI cites a standard, the catalog must document one too.
  if (r.standard && !entry.standard) {
    failures.push(`  "${r.id}" cites a standard in ui-audit.mjs but the catalog standard is null`);
  }
}

if (failures.length) {
  console.error("✗ audit-sync guard failed — update mcp/src/data/audit-rules.ts:");
  for (const f of failures) console.error(f);
  process.exit(1);
}
console.log(
  `✓ audit-sync guard passed — all ${scriptRules.length} executable rules documented (${catalog.size} catalog entries).`,
);
