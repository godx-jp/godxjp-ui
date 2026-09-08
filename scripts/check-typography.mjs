#!/usr/bin/env node
/**
 * check:typography — the framework must express EVERY font-size through a token, never a
 * hard-coded literal. A UI framework's job is to give consumers knobs: a `font-size: 12px` in
 * component CSS is invisible to a service theme, so it can never be re-tuned.
 */
import { globSync, readFileSync } from "node:fs";

const DECL = /font-size\s*:\s*([^;{}]+);/g;
const ALLOWED = /^(var\(--[a-z0-9-]+\)|inherit|initial|unset|0)$/;
/** A length literal — the thing a service theme cannot reach. Unitless factors in calc() are fine. */
const LENGTH_LITERAL = /\d*\.?\d+\s*(?:px|rem|em|pt|ch|ex|vw|vh|vmin|vmax|cm|mm|in|q|%)\b/i;
/** Comments blanked, newlines kept, so reported line numbers stay true. */
const blankComments = (css) =>
  css.replace(/\/\*[\s\S]*?\*\//g, (block) => block.replace(/[^\n]/g, " "));

const failures = [];
const files = globSync("src/styles/**/*.css");

for (const file of files) {
  // WHOLE FILE, not line by line. The old scan required the `;` on the same line as `font-size:`,
  // so every declaration prettier wraps was invisible — measured: the four
  // `font-size: min(var(--logo-font-size-*), calc(…))` rules in logo-layout.css were never once
  // read by this gate, and `font-size: clamp(\n 12px, …)` would slip through the same way.
  const source = blankComments(readFileSync(file, "utf8"));
  for (const m of source.matchAll(DECL)) {
    const value = m[1].replace(/\s+/g, " ").trim();
    const line = source.slice(0, m.index).split("\n").length;
    if (/typography-ok/.test(source.split("\n")[line - 1] ?? "")) continue;
    // Either the plain token form, or any token-DERIVED expression that bakes no length of its
    // own — `min(var(--a), calc(var(--b) * var(--c)))` is as re-tunable as a bare `var(--a)`.
    const derived = value.includes("var(--") && !LENGTH_LITERAL.test(value);
    if (!ALLOWED.test(value) && !derived) {
      failures.push(
        `${file}:${line}  font-size: ${value}  — use a --font-size-* scale or a component --…-font-size token`,
      );
    }
  }
}

if (failures.length) {
  console.error(`✗ check:typography — ${failures.length} hard-coded font-size(s):\n`);
  for (const f of failures) console.error("  " + f);
  console.error("\nEvery font-size must reference a token so a service theme can re-tune it.");
  process.exit(1);
}
console.log(
  `✓ check:typography — ${files.length} CSS files express font-size only through tokens.`,
);
