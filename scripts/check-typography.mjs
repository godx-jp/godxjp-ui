#!/usr/bin/env node
/**
 * check:typography — the framework must express EVERY font-size through a token,
 * never a hard-coded literal. A UI framework's job is to give consumers knobs:
 * a `font-size: 12px` in component CSS is invisible to a service theme, so it
 * can never be re-tuned. Allowed values:
 *   - var(--font-size-*)            the global modular scale (xs/sm/base/lg…)
 *   - var(--<component>-…-font-size) a per-component knob (rule #45)
 *   - inherit / initial / unset / 0
 *
 * Scope: src/styles/**.css (the shipped chrome). Escape hatch: `typography-ok`
 * in a comment on the same line for a genuinely fixed, never-themed glyph metric.
 */
import { globSync, readFileSync } from "node:fs";

const DECL = /font-size\s*:\s*([^;]+);/g;
const ALLOWED = /^(var\(--[a-z0-9-]+\)|inherit|initial|unset|0)$/;

const failures = [];
const files = globSync("src/styles/**/*.css");

for (const file of files) {
  const lines = readFileSync(file, "utf8").split("\n");
  lines.forEach((line, i) => {
    if (/typography-ok/.test(line)) return;
    for (const m of line.matchAll(DECL)) {
      const value = m[1].trim();
      if (!ALLOWED.test(value)) {
        failures.push(`${file}:${i + 1}  font-size: ${value}  — use a --font-size-* scale or a component --…-font-size token`);
      }
    }
  });
}

if (failures.length) {
  console.error(`✗ check:typography — ${failures.length} hard-coded font-size(s):\n`);
  for (const f of failures) console.error("  " + f);
  console.error("\nEvery font-size must reference a token so a service theme can re-tune it.");
  process.exit(1);
}
console.log(`✓ check:typography — ${files.length} CSS files express font-size only through tokens.`);
