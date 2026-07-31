// FilterBar `overflow="scroll"` GEOMETRY contract (gh#216).
//
// jsdom performs no layout, so the sibling `filter-bar-overflow.test.tsx` can only assert the
// `data-overflow` attribute and the a11y wiring. The pixel behaviour was measured in a real
// browser (headless Chromium, /isolate/navigation-filter-bar, three JA/EN/VI filter groups whose
// captions are 162 / 266 / 316 px wide, so the strip's scrollWidth is 946 px):
//
//   width │ toolbar clientWidth │ scrollWidth │ scrollable │ group tops │ clear position
//   ──────┼─────────────────────┼─────────────┼────────────┼────────────┼────────────────
//    390  │  358                │  358        │ no         │ 379/449/518│ static (stacked)
//    640  │  608                │  946        │ yes (338)  │ equal      │ sticky, right 624
//    768  │  720                │  946        │ yes (226)  │ equal      │ sticky, right 744
//    900  │  852                │  946        │ yes ( 94)  │ equal      │ sticky, right 876
//   1024  │  976                │  976        │ no (fits)  │ equal      │ sticky
//   1440  │ 1392                │ 1392        │ no (fits)  │ equal      │ sticky
//
// After scrolling to the inline end, the clear button's right edge stayed exactly on the toolbar's
// right edge at every scrollable width, and document.scrollWidth never exceeded clientWidth.
//
// This file pins the CSS rules that PRODUCE those numbers, so the behaviour cannot be silently
// deleted without a browser (the same split used by list-row-responsive / scroll-containment).
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

// `rel` must stay a VARIABLE: Vite statically rewrites a literal `new URL("…", import.meta.url)`
// into an asset URL, which fileURLToPath then rejects (same helper shape as scroll-containment).
const read = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), "utf8");
const layoutCss = read("../../../styles/layout.css");

/** Declaration body of the LAST rule matching `selector` (the `min-width: 640px` variant). */
function rule(selector: string): string {
  const at = layoutCss.lastIndexOf(selector + " {");
  expect(at, `missing CSS rule for ${selector}`).toBeGreaterThan(-1);
  return layoutCss.slice(at, layoutCss.indexOf("}", at) + 1);
}

/** Declaration body of the FIRST (mobile-first base) rule matching `selector`. */
function baseRule(selector: string): string {
  const at = layoutCss.indexOf(selector + " {");
  expect(at, `missing base CSS rule for ${selector}`).toBeGreaterThan(-1);
  return layoutCss.slice(at, layoutCss.indexOf("}", at) + 1);
}

/** The `@media (min-width: 640px)` block that contains `needle`. */
function desktopBlock(needle: string): string {
  const at = layoutCss.indexOf(needle);
  expect(at, `missing ${needle}`).toBeGreaterThan(-1);
  const mediaAt = layoutCss.lastIndexOf("@media (min-width: 640px)", at);
  expect(mediaAt, `${needle} is not inside a min-width:640px block`).toBeGreaterThan(-1);
  return layoutCss.slice(mediaAt, at);
}

describe("FilterBar overflow=scroll · CSS geometry contract", () => {
  it("stacks the strip by default so 390px never hides a filter behind a scroll", () => {
    // Browser: at 390 the scroll strip reported flex-direction column and overflow-x visible, with
    // the three group tops at 379/449/518 — one filter per line, all reachable without scrolling.
    const base = baseRule(".ui-toolbar");
    expect(base).toContain("flex-direction: column");
    expect(base).not.toContain("overflow-x");

    // The row/scroll behaviour is opted into from 640px up, never in the base rule.
    expect(desktopBlock('.ui-toolbar[data-overflow="scroll"]')).toContain(
      "@media (min-width: 640px)",
    );
  });

  it("becomes ONE bounded inline-scrolling row only from 640px up", () => {
    const scroll = '.ui-toolbar[data-overflow="scroll"]';
    expect(desktopBlock(scroll)).toContain("@media (min-width: 640px)");

    const body = rule(scroll);
    // nowrap is what keeps every group on a single row (browser: equal group tops at 640..1440).
    expect(body).toContain("flex-wrap: nowrap");
    // ...and overflow-x is what makes that row scroll instead of overflowing the page
    // (browser: scrollWidth 946 vs clientWidth 608 at 640px, documentElement never overflowed).
    expect(body).toContain("overflow-x: auto");
    // The gesture stays inside the strip instead of chaining to the page/history.
    expect(body).toContain("overscroll-behavior-x: contain");
  });

  it("keeps the groups at their natural width instead of squeezing them", () => {
    // Browser: group widths stayed 162 / 266 / 316 px at EVERY width from 640 to 1440 — the long
    // JA/VI captions are never compressed into an unreadable column.
    const body = rule('.ui-toolbar[data-overflow="scroll"] > .ui-toolbar-group');
    expect(body).toContain("flex: 0 0 auto");
  });

  it("parks clear-all at the inline end of the VIEWPORT, not the end of the scroll width", () => {
    // Browser: position sticky, and after scrollLeft = max the button's right edge was still flush
    // with the toolbar's right edge (624/684/744/876 at 640/700/768/900). Without `sticky` the
    // `margin-inline-start: auto` would push it past the fold and make it unreachable.
    const body = rule('.ui-toolbar[data-overflow="scroll"] > .ui-toolbar-clear');
    expect(body).toContain("position: sticky");
    expect(body).toContain("inset-inline-end: 0");
    expect(body).toContain("margin-inline-start: auto");
    // Opaque and above the strip, so a filter never slides visibly underneath it while scrolling.
    expect(body).toContain("z-index: 1");
    expect(body).toContain("background:");
    // Logical inset only — the browser mirrors the scroll origin under dir="rtl" on its own.
    expect(body).not.toContain("right: 0");
  });

  it("reserves the scrollbar gutter so the row does not jump when it becomes scrollable", () => {
    const body = rule('.ui-toolbar[data-overflow="scroll"]');
    expect(body).toContain("scrollbar-gutter: stable");
    // The gutter padding is a service-tunable knob, never a hard-coded pixel value (rule #45).
    expect(body).toContain("var(--filter-bar-scroll-padding-y)");
  });
});
