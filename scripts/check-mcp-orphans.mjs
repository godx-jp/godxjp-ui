#!/usr/bin/env node
/**
 * Reverse drift guard — the COMPLEMENT of check-mcp-sync.mjs.
 *
 * check-mcp-sync: every MCP entry must be a real library export (no stale entries).
 * check-mcp-orphans (this): every PUBLIC PRIMARY component must HAVE an MCP entry
 * (no uncatalogued components). Without this, the catalog silently rots — a new
 * component ships, no entry is added, and agents (told to "check the MCP first, never
 * hand-roll") search the MCP, find nothing, and re-implement what already exists.
 *
 * "Primary component" = the export whose name is the PascalCase of its file name
 * (repo rule 27: one primitive per `src/components/<group>/<Name>.tsx`). Sub-parts
 * (CardHeader, SelectTrigger…) and the internal `ui/` styling layer are NOT catalog
 * entries and are excluded. Genuine non-catalog exports go in ALLOWLIST below.
 *
 * Usage: node scripts/check-mcp-orphans.mjs [--json]
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, basename } from "node:path";

const ROOT = process.cwd();
const COMPONENTS_DIR = join(ROOT, "src/components");
const MCP_DATA = join(ROOT, "mcp/src/data/components.ts");

// Public exports that are intentionally NOT standalone catalog entries (helpers,
// context values, sub-parts whose filename is PascalCase, primitives covered by a
// sibling entry). Keep this list short and justified.
const ALLOWLIST = new Set([
  // (empty) — every public primary component is expected to have a catalog entry.
  // Add a name here only with a one-line justification if it is intentionally uncatalogued.
]);

// The internal styling-primitive layer is never catalogued directly (the public
// component is its wrapper in the group folder).
const EXCLUDE_DIRS = new Set(["ui", "__tests__"]);

const pascal = (kebab) => kebab.replace(/(^|-)([a-z0-9])/g, (_, _d, c) => c.toUpperCase());

/** All PascalCase names exported anywhere in a file. */
function exportsOf(src) {
  const names = new Set();
  for (const m of src.matchAll(/export\s+(?:function|const)\s+([A-Z][A-Za-z0-9]*)/g)) {
    names.add(m[1]);
  }
  for (const m of src.matchAll(/export\s+\{([^}]+)\}/g)) {
    for (const part of m[1].split(",")) {
      const name = part
        .trim()
        .replace(/^type\s+/, "")
        .split(/\s+as\s+/)
        .pop()
        ?.trim();
      if (name && /^[A-Z][A-Za-z0-9]*$/.test(name)) names.add(name);
    }
  }
  return names;
}

/** Primary public components = PascalCase(filename) that the file actually exports. */
function primaryComponents() {
  const found = []; // {name, rel}
  const walk = (dir) => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) {
        if (!EXCLUDE_DIRS.has(entry)) walk(full);
      } else if (
        (entry.endsWith(".tsx") || entry.endsWith(".ts")) &&
        !entry.endsWith(".test.tsx") &&
        entry !== "index.tsx" &&
        entry !== "index.ts"
      ) {
        const name = pascal(basename(entry).replace(/\.(tsx|ts)$/, ""));
        const exported = exportsOf(readFileSync(full, "utf8"));
        if (exported.has(name)) {
          found.push({ name, rel: full.slice(ROOT.length + 1) });
        }
      }
    }
  };
  walk(COMPONENTS_DIR);
  return found;
}

// Anchor on the entry-level `name:` field (4-space indent) so sample data inside
// examples/props (e.g. `{ name: "Vietnam" }`) is not mistaken for a catalog entry.
const mcpNames = new Set(
  [...readFileSync(MCP_DATA, "utf8").matchAll(/^    name: "([A-Z][A-Za-z0-9]*)"/gm)].map(
    (m) => m[1],
  ),
);

const orphans = primaryComponents().filter((c) => !mcpNames.has(c.name) && !ALLOWLIST.has(c.name));

if (process.argv.includes("--json")) {
  process.stdout.write(JSON.stringify({ orphans }, null, 2) + "\n");
} else if (orphans.length === 0) {
  console.log("✓ No orphan components — every public primary component has an MCP catalog entry.");
} else {
  console.error(
    `✗ ${orphans.length} public component(s) have NO @godxjp/ui-mcp entry (agents will hand-roll them):`,
  );
  for (const o of orphans) {
    console.error(`  ${o.name}  (${o.rel}) — add an entry to mcp/src/data/components.ts`);
  }
  console.error(
    "\n  (If a component is intentionally not catalogued, add it to ALLOWLIST in this script.)",
  );
}

process.exit(orphans.length > 0 ? 1 : 0);
