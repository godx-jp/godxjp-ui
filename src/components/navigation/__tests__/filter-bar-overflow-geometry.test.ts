// FilterBar WRAP geometry contract — and the removal of the horizontal-scroll strategy (33.0.0).
//
// A filter bar wraps; it never scrolls sideways. The removed `overflow="scroll"` strip was
// measured in a consumer list page at 1240px in Vietnamese: a 1945px strip inside a 921px frame,
// the first filter label clipped at the inline-start edge, and filters reachable only by scrolling
// sideways. GitHub, Linear, Gmail, Jira and Shopify Polaris IndexFilters all wrap or collapse the
// rarely used filters behind a "More filters" control instead.
//
// jsdom performs no layout, so this file pins the CSS rules that PRODUCE the wrap geometry (the
// same split used by list-row-responsive / scroll-containment).
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

// `rel` must stay a VARIABLE: Vite statically rewrites a literal `new URL("…", import.meta.url)`
// into an asset URL, which fileURLToPath then rejects (same helper shape as scroll-containment).
const read = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), "utf8");
const layoutCss = read("../../../styles/layout.css");
const navigationTokens = read("../../../tokens/components/navigation.css");

/** Declaration body of the FIRST (mobile-first base) rule matching `selector`. */
function baseRule(selector: string): string {
  const at = layoutCss.indexOf(selector + " {");
  expect(at, `missing base CSS rule for ${selector}`).toBeGreaterThan(-1);
  return layoutCss.slice(at, layoutCss.indexOf("}", at) + 1);
}

/** Declaration body of the LAST rule matching `selector` (the `min-width: 640px` variant). */
function desktopRule(selector: string): string {
  const at = layoutCss.lastIndexOf(selector + " {");
  expect(at, `missing CSS rule for ${selector}`).toBeGreaterThan(-1);
  const mediaAt = layoutCss.lastIndexOf("@media (min-width: 640px)", at);
  expect(mediaAt, `${selector} has no min-width:640px variant`).toBeGreaterThan(-1);
  return layoutCss.slice(at, layoutCss.indexOf("}", at) + 1);
}

describe("FilterBar · wrap geometry contract", () => {
  it("stacks the strip below 640px and never scrolls it", () => {
    const base = baseRule(".ui-toolbar");
    expect(base).toContain("flex-direction: column");
    expect(base).not.toContain("overflow-x");
  });

  it("wraps onto extra rows from 640px up instead of scrolling sideways", () => {
    const desktop = desktopRule(".ui-toolbar");
    expect(desktop).toContain("flex-flow: row wrap");
    expect(desktop).not.toContain("nowrap");
    expect(desktop).not.toContain("overflow-x");
  });
});

describe("FilterBar · the horizontal-scroll strategy is gone", () => {
  it("ships no `[data-overflow]` toolbar rule", () => {
    expect(layoutCss).not.toMatch(/\.ui-toolbar\[data-overflow/);
  });

  it("ships no scroll-gutter token for the removed strip", () => {
    expect(navigationTokens).not.toContain("--filter-bar-scroll-padding-y");
    expect(layoutCss).not.toContain("--filter-bar-scroll-padding-y");
  });
});
