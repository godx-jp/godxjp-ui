#!/usr/bin/env node
/**
 * Drift guard — keep the @godxjp/ui-mcp component registry in sync with the library it documents.
 *
 * The MCP catalogs the PRIMARY components (not every sub-part), so we check the tractable, real
 * drift direction: EVERY component named in mcp/src/data/components.ts must still be a real export
 * of the library. A rename/removal that forgets to update the MCP (→ stale agent guidance) fails
 * CI instead of drifting silently. Run it in `verify`.
 *
 * Usage: node scripts/check-mcp-sync.mjs [--json]
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const SCAN_DIRS = ["src/components", "src/app"].map((d) => join(ROOT, d));
const MCP_DATA = join(ROOT, "mcp/src/data/components.ts");

/** Every PascalCase value exported anywhere under src/components (components + sub-parts). */
function libExports() {
  const names = new Set();
  const walk = (dir) => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) {
        if (entry !== "__tests__") walk(full);
      } else if (entry.endsWith(".tsx") || entry.endsWith(".ts")) {
        const src = readFileSync(full, "utf8");
        // `export function Foo` / `export const Foo =` / `export { Foo, Bar as Baz }`
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
      }
    }
  };
  for (const dir of SCAN_DIRS) walk(dir);
  return names;
}

const exported = libExports();
// Anchor on the entry-level `name:` field (4-space indent) so sample data inside
// examples/props (e.g. `{ name: "Vietnam" }`) is not mistaken for a catalog entry.
const mcpNames = [
  ...readFileSync(MCP_DATA, "utf8").matchAll(/^ {4}name: "([A-Z][A-Za-z0-9]*)"/gm),
].map((m) => m[1]);

const stale = [...new Set(mcpNames)].filter((name) => !exported.has(name));

if (process.argv.includes("--json")) {
  process.stdout.write(JSON.stringify({ stale }, null, 2) + "\n");
} else if (stale.length === 0) {
  console.log(
    `✓ MCP registry in sync — all ${new Set(mcpNames).size} catalogued components exist in the library.`,
  );
} else {
  console.error(
    `✗ ${stale.length} @godxjp/ui-mcp entr(ies) name a component the library no longer exports (drift):`,
  );
  for (const name of stale) {
    console.error(`  "${name}" — renamed/removed? update mcp/src/data/components.ts`);
  }
}

process.exit(stale.length > 0 ? 1 : 0);
