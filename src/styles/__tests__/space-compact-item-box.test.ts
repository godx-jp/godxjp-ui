import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * SpaceCompact welds its children through a box it owns — and the three facts below are the ones a
 * browser measured, so they are pinned as CSS text rather than left to jsdom (which lays nothing
 * out and would pass on any of the three being wrong).
 *
 * Measured on `/isolate/layout-space-compact`, Chromium, 1169px row:
 *
 *   rule                                 field+field   field+Button   vertical Textarea+Button
 *   as shipped in 30.4.0 (`> *`)         Select trigger took the whole row, NumberInput 54px
 *   item wrapper, no child stretch       585/585       585/585        1169 wrapper / 76px button
 *   item wrapper + child stretch         585/585       585/585        1169/1169
 *   child stretch, no per-child flex     203/73.6      223/40         1169/1169   ← row stops filling
 *
 * Each `it` below is one of those rows, and each guards a different way of breaking the others.
 */
describe("space-compact item box", () => {
  const css = readFileSync(resolve(process.cwd(), "src/styles/layout.css"), "utf8");
  /* Selector GROUPS, not lines: a comma-separated group spans several lines and only its last one
   * carries the `{`, so a line filter silently skips the others — which is exactly how the first
   * draft of this file passed while `.ui-space-compact > *:hover` was still present. */
  const spaceCompactRules = [...css.matchAll(/([^{}]+)\{/g)]
    .flatMap((m) => m[1].split(","))
    .map((s) => s.trim())
    .filter((s) => s.includes(".ui-space-compact"));

  it("keys every rule on the item box, never on the bare element child (gh#919)", () => {
    // `Select`'s root is `display: contents` and react-aria renders a `<template>` beside it, so a
    // `> *` selector matches a box that renders nothing. THIS is the assertion that fails if
    // somebody "simplifies" the wrapper away.
    // `item"] > *` is the legitimate one (the item stretching its own child, asserted below); a
    // BARE child selector is one that reaches straight from `.ui-space-compact` to `> *`.
    const bareChildSelectors = spaceCompactRules.filter((line) =>
      /\.ui-space-compact(?:\[[^\]]*\])*\s*>\s*\*(?![\w-])/.test(line),
    );
    expect(bareChildSelectors).toEqual([]);
    expect(spaceCompactRules.some((l) => l.includes('[data-slot="space-compact-item"]'))).toBe(true);
  });

  it("stretches the item's own child, or a Button in a vertical stack keeps its content width", () => {
    // The wrapper is stretched by the row; without this the wrapper is the only thing that grew —
    // 76px of button inside a 1169px wrapper, a 1093px empty tail behind a collapsed seam.
    const at = css.indexOf('.ui-space-compact > [data-slot="space-compact-item"] > * {');
    expect(at).toBeGreaterThan(-1);
    const body = css.slice(at, css.indexOf("}", at));
    // `auto` basis, not `0`: the child keeps its preferred size, so the horizontal rows do not move.
    expect(body).toMatch(/flex:\s*1\s+1\s+auto/);
  });

  it("KEEPS the per-child flex under fullWidth — removing it stops the row filling at all", () => {
    // antd's block style sets no per-child flex, and the catalog used to claim this one didn't
    // either. Measured: without it the items collapse to content (203/73.6 in a 1169px column) and
    // `fullWidth` does nothing. The even split IS this declaration, not the children's own width.
    const at = css.indexOf(
      '.ui-space-compact[data-full-width="true"] > [data-slot="space-compact-item"] {',
    );
    expect(at).toBeGreaterThan(-1);
    const body = css.slice(at, css.indexOf("}", at));
    expect(body).toMatch(/flex:\s*1\s+1\s+0%/);
    expect(body).toMatch(/min-inline-size:\s*0/);
  });
});
