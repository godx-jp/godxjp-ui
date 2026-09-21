#!/usr/bin/env node
/**
 * check:absorbed-names — every name a component ABSORBED must actually not exist.
 *
 * WHY THIS IS A GATE AND NOT A COMMENT. `absorbed` is the list an agent is steered AWAY from:
 * "there is no Combobox, there is `Select` with `showSearch`". That steer is only safe while the
 * name really is absent. The day someone ships a real `Combobox`, this list would be telling every
 * consumer that the component they can see in the exports does not exist — a confident, catalogued
 * lie, which is worse than the silence it replaced.
 *
 * So the check is the inverse of `check:mcp-catalog-completeness`: that one demands every
 * `subParts` name RESOLVE; this one demands every `absorbed` name resolve to NOTHING.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { rmSync } from "node:fs";
import { build } from "esbuild";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const out = join(tmpdir(), `godx-absorbed-${process.pid}.mjs`);
await build({
  entryPoints: [join(ROOT, "mcp/src/data/components.ts")],
  bundle: true,
  format: "esm",
  platform: "node",
  logLevel: "error",
  outfile: out,
});
let COMPONENTS;
try {
  ({ COMPONENTS } = await import(`file://${out}`));
} finally {
  rmSync(out, { force: true });
}

const entryNames = new Set(COMPONENTS.map((c) => c.name));
const subPartNames = new Set(COMPONENTS.flatMap((c) => c.subParts ?? []));
const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));

/* A real export is the authority, not the catalog: the catalog is what we might have forgotten to
 * update. Resolve the public surface the same way the import-path resolver does. */
const exported = new Set();
for (const [subpath, target] of Object.entries(pkg.exports)) {
  if (subpath.includes("*")) continue;
  const js = typeof target === "string" ? target : target?.import;
  if (!js?.endsWith(".js")) continue;
  const base = js.replace(/^\.\/dist\//, "src/").replace(/\.js$/, "");
  for (const candidate of [`${base}.ts`, `${base}.tsx`]) {
    try {
      const source = readFileSync(join(ROOT, candidate), "utf8");
      for (const m of source.matchAll(
        /^export\s+(?:\{([^}]*)\}|(?:const|function|class)\s+(\w+))/gm,
      )) {
        if (m[2]) exported.add(m[2]);
        for (const part of (m[1] ?? "").split(",")) {
          const name = part
            .trim()
            .split(/\s+as\s+/)
            .pop()
            ?.trim();
          if (name && /^[A-Z]/.test(name)) exported.add(name);
        }
      }
      break;
    } catch {
      /* next candidate */
    }
  }
}

const problems = [];
for (const entry of COMPONENTS) {
  for (const name of entry.absorbed ?? []) {
    if (entryNames.has(name))
      problems.push(`${entry.name}.absorbed lists "${name}", which is a catalogued component`);
    if (subPartNames.has(name))
      problems.push(
        `${entry.name}.absorbed lists "${name}", which another entry documents as a sub-part`,
      );
    if (exported.has(name))
      problems.push(
        `${entry.name}.absorbed lists "${name}", which the library EXPORTS — the catalog would be telling consumers a real component does not exist`,
      );
  }
}

if (problems.length) {
  console.error("✗ check:absorbed-names\n  " + problems.join("\n  "));
  process.exit(1);
}
const total = COMPONENTS.reduce((n, c) => n + (c.absorbed?.length ?? 0), 0);
console.log(
  `✓ check:absorbed-names — ${total} absorbed name(s) across ${COMPONENTS.filter((c) => c.absorbed).length} entries, none of them resolvable.`,
);
