#!/usr/bin/env node
/**
 * Guard for gh#128: every client module in dist/ ships a leading `"use client"` directive, and the
 * pure server-usable modules do NOT (so they stay importable from a Server Component). Re-derives
 * the client set from the same source-of-truth detector the build uses (`add-use-client.mjs`), so a
 * newly-added component that uses a hook is caught automatically. Wired into `verify:release`
 * (after `build`, so dist exists).
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { clientDistModules } from "./add-use-client.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const hasDirective = (rel) => /^\s*["']use client["'];/.test(readFileSync(join(root, rel), "utf8"));

const errors = [];

// 1. Every detected client dist module must lead with the directive.
let checked = 0;
for (const abs of clientDistModules()) {
  const rel = abs.slice(root.length + 1);
  let code;
  try {
    code = readFileSync(abs, "utf8");
  } catch {
    continue; // type-only src with no dist twin
  }
  checked++;
  if (!/^\s*["']use client["'];/.test(code)) {
    errors.push(`[MISSING] ${rel} is a client module but has no leading "use client" directive — run \`node scripts/add-use-client.mjs\` (it runs in \`build\`).`);
  }
}

// 2. Pure server-usable modules must STAY server (importable from an RSC).
const MUST_BE_SERVER = [
  "dist/lib/utils.js", // cn()
  "dist/lib/datetime/index.js",
  "dist/props/index.js",
  "dist/components/general/index.js", // re-export barrel
  "dist/index.js", // root admin surface barrel
];
for (const rel of MUST_BE_SERVER) {
  try {
    if (hasDirective(rel)) {
      errors.push(`[OVER-MARKED] ${rel} must stay a SERVER module (pure exports usable from an RSC) but carries "use client".`);
    }
  } catch {
    errors.push(`[ABSENT] ${rel} not found — run \`pnpm build\` first.`);
  }
}

if (errors.length) {
  console.error("✗ check:use-client failed:\n" + errors.map((e) => "  " + e).join("\n"));
  process.exit(1);
}
console.log(`✓ check:use-client — ${checked} client module(s) carry "use client"; pure server modules are clean.`);
