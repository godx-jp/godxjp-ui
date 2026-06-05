#!/usr/bin/env node
/**
 * Core-isolation guard (issue #83 — KIT + adapter rule).
 *
 * The ROOT export `@godxjp/ui` (dist/index.js) must stay domain/runtime-neutral: importing it must NOT
 * force a foreign runtime on the consumer. App/integration adapters live ONLY on dedicated subpaths
 * (`@godxjp/ui/query`, `./form`, `./app`, `./i18n`), never the root. This traces the root entry's
 * transitive dist-chunk graph and fails if it reaches a forbidden runtime import.
 *
 * Run AFTER `pnpm build`. Usage: node scripts/check-core-isolation.mjs [--json]
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";

const ROOT_ENTRY = "dist/index.js";
const FORBIDDEN = [
  "@tanstack/react-query",
  "@tanstack/react-table",
  "react-router",
  "react-router-dom",
  "i18next",
  "react-hook-form",
  "@hookform",
];

if (!existsSync(ROOT_ENTRY)) {
  console.error(`✗ ${ROOT_ENTRY} not found — run \`pnpm build\` first.`);
  process.exit(1);
}

// Follow relative imports (the split chunks) from the root entry; collect every bare specifier reached.
const seen = new Set();
const bareSpecifiers = new Set();
const importRe = /(?:import|export)\s+(?:[^"']*?\s+from\s+)?["']([^"']+)["']/g;

function walk(file) {
  const abs = resolve(file);
  if (seen.has(abs) || !existsSync(abs)) return;
  seen.add(abs);
  const src = readFileSync(abs, "utf8");
  for (const m of src.matchAll(importRe)) {
    const spec = m[1];
    if (spec.startsWith(".")) {
      walk(resolve(dirname(abs), spec));
    } else {
      bareSpecifiers.add(spec);
    }
  }
}
walk(ROOT_ENTRY);

const leaks = [...bareSpecifiers].filter((s) =>
  FORBIDDEN.some((f) => s === f || s.startsWith(f + "/")),
);

if (process.argv.includes("--json")) {
  process.stdout.write(
    JSON.stringify({ leaks, reachedSpecifiers: [...bareSpecifiers].sort() }, null, 2) + "\n",
  );
} else if (leaks.length === 0) {
  console.log(
    `✓ Core isolated — root @godxjp/ui pulls no foreign runtime (checked ${seen.size} dist chunks).`,
  );
} else {
  console.error(
    `✗ Root @godxjp/ui leaks foreign runtime(s) — these belong on a subpath, not the root barrel:`,
  );
  for (const l of leaks) console.error(`  ${l}`);
  console.error(
    `\n  Move the offending re-export out of src/index.ts (keep it on ./query / ./form / ./app).`,
  );
}
process.exit(leaks.length > 0 ? 1 : 0);
