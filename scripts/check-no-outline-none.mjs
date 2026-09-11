#!/usr/bin/env node
/**
 * check:no-outline-none — a component may not print the `outline-none` utility on an element that
 * `styles/focus-ring.css` draws a ring for.
 *
 * WHY THIS EXISTS. `outline-none` is a UTILITY, and utilities are layered after components, so it
 * outranks every rule in focus-ring.css. Inside this repo's own preview the cascade still resolved
 * in the ring's favour and the mark drew at 2–3px — which is exactly why nobody noticed. In a
 * CONSUMER's app, whose Tailwind build orders the layers itself, the utility won: `.ui-input` at
 * keyboard focus measured `outline-width: 0px` and a ring drawn only as a box-shadow at **1.09:1**
 * against the surface, failing WCAG 2.2 SC 2.4.7 and 2.4.13 (godx-jp/id#500).
 *
 * The control experiment was in the package all along: four components printed the utility, and
 * those four were exactly the four selectors focus-ring.css could not draw. `Segmented`, which
 * never printed it, drew 4.86:1 from the very same stylesheet.
 *
 * So the rule is not "the ring looks fine here". It is: the ring's outcome must not depend on a
 * consumer's layer order. A component that wants no outline says so in its own CSS file, in the
 * components layer, where focus-ring.css can still answer it.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const RING_CSS = readFileSync(join(ROOT, "src/styles/focus-ring.css"), "utf8");

/** Every `.ui-*` class the ring stylesheet claims. */
const RING_CLASSES = new Set([...RING_CSS.matchAll(/\.(ui-[a-z0-9-]+)/g)].map((m) => m[1]));

function walk(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry.startsWith(".")) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, acc);
    else if (/\.tsx?$/.test(full) && !full.includes("__tests__")) acc.push(full);
  }
  return acc;
}

const offenders = [];
for (const file of walk(join(ROOT, "src/components"))) {
  const source = readFileSync(file, "utf8");
  if (!/\boutline-none\b/.test(source)) continue;
  // Only a class list that ALSO names a ring-drawn class is a conflict: `outline-none` on a
  // wrapper the ring never draws (a dialog surface, a tab panel) is nobody's business.
  for (const line of source.split("\n")) {
    if (!/\boutline-none\b/.test(line)) continue;
    const claimed = [...line.matchAll(/\b(ui-[a-z0-9-]+)\b/g)].map((m) => m[1]).filter((c) => RING_CLASSES.has(c));
    if (claimed.length) offenders.push(`${file.replace(`${ROOT}/`, "")}: ${claimed.join(", ")}`);
  }
}

if (offenders.length) {
  console.error("✗ check:no-outline-none — a ring-drawn element prints the outline-none utility:\n");
  for (const o of offenders) console.error(`    ${o}`);
  console.error(
    "\n  Utilities are layered after components, so this decides the focus ring in every consumer\n" +
      "  whose Tailwind build orders the layers differently. Drop the utility; focus-ring.css owns\n" +
      "  the outline for these classes.",
  );
  process.exit(1);
}

console.log(`✓ check:no-outline-none — no ring-drawn element prints it (${RING_CLASSES.size} ring classes).`);
