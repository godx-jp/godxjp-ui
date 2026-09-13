// PageContainer `extra` WRAP contract at >=640px.
//
// jsdom performs no layout, so the sibling `page-container.test.tsx` can only assert the DOM. The
// pixel behaviour was measured in headless Chromium against THIS stylesheet, on a real
// `.ui-page-container` header (long JA title + N plain 56px action buttons in `extra`), with the
// pre-patch declaration (`flex-shrink: 0`) injected back for the BEFORE column:
//
//   viewport │ buttons │ BEFORE h1 / extra / off-screen │ AFTER h1 / extra / off-screen
//   ─────────┼─────────┼────────────────────────────────┼──────────────────────────────
//     768    │   13    │   0px · 21 lines / 842px 1 row / 2  │ 233px · 2 lines / 471px 2 rows / 0
//     768    │   10    │  96px ·  5 lines / 608px 1 row / 0  │ 286px · 2 lines / 418px 2 rows / 0
//     768    │    8    │ 304px ·  2 lines / 400px 1 row / 0  │ 359px · 2 lines / 345px 2 rows / 0
//    1024    │   13    │ 118px ·  4 lines / 842px 1 row / 0  │ 318px · 2 lines / 642px 2 rows / 0
//    1024    │   10    │ 352px ·  2 lines / 608px 1 row / 0  │ 390px · 2 lines / 570px 2 rows / 0
//    1280    │   13    │ 374px ·  2 lines / 842px 1 row / 0  │ 402px · 2 lines / 814px 2 rows / 0
//   768…1456 │  1 / 4  │ IDENTICAL before and after (416px · 1 line, extra 56 / 164px, 1 row)
//     390    │  1…13   │ IDENTICAL before and after (the rule is scoped to >=640px)
//
// The failure mode the fix removes: `flex-shrink: 0` froze `extra` at the action group's
// max-content width, so its own `flex-wrap: wrap` never had a narrower width to wrap into and the
// whole overflow was charged to `.ui-page-header-heading` (`min-w-0`) — the `<h1>` collapsed to
// 0px and wrapped one CJK character per line while action buttons still left the viewport. The
// same shape was reported downstream on an exseli list screen at 1456×829: `<h1>` 0px / 9 lines,
// `extra` 1594px, 15 elements outside the viewport → 107px / 2 lines, 1034px, 0 outside.
//
// This file pins the CSS rules that PRODUCE those numbers, so the behaviour cannot be silently
// deleted without a browser (the same split used by filter-bar-overflow-geometry / list-row-responsive).
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

// `rel` must stay a VARIABLE: Vite statically rewrites a literal `new URL("…", import.meta.url)`
// into an asset URL, which fileURLToPath then rejects (same helper shape as filter-bar-overflow).
const read = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), "utf8");
const layoutCss = read("../../../styles/layout.css");

/*
 * Offsets of the rules whose selector is EXACTLY `selector` — a leading boundary is required so a
 * COMPOUND selector that merely ends in the same class is not mistaken for the bare rule. That is
 * not hypothetical: `.ui-page-container[data-header-scale="chrome"] .ui-page-header-extra` lives in
 * the same 640px block and would otherwise be read as the last `.ui-page-header-extra` rule, so
 * this file would report the chrome exception's declarations as the document row's geometry.
 */
const ruleOffsets = (selector: string): number[] => {
  const offsets: number[] = [];
  for (let at = layoutCss.indexOf(selector + " {"); at > -1;) {
    // Only whitespace may sit between the preceding newline and the selector: a rule the file
    // opens a line with, not the tail of a longer, more specific one.
    if (/^[^\S\n]*$/.test(layoutCss.slice(layoutCss.lastIndexOf("\n", at) + 1, at))) {
      offsets.push(at);
    }
    at = layoutCss.indexOf(selector + " {", at + 1);
  }
  return offsets;
};

/** Declaration body of the FIRST (mobile-first base) rule matching `selector`. */
function baseRule(selector: string): string {
  const [at] = ruleOffsets(selector);
  expect(at, `missing base CSS rule for ${selector}`).toBeGreaterThan(-1);
  return layoutCss.slice(at, layoutCss.indexOf("}", at) + 1);
}

/** Declaration body of the LAST rule matching `selector` (the `min-width: 640px` variant). */
function desktopRule(selector: string): string {
  const offsets = ruleOffsets(selector);
  const at = offsets[offsets.length - 1];
  expect(at, `missing CSS rule for ${selector}`).toBeGreaterThan(-1);
  const mediaAt = layoutCss.lastIndexOf("@media (min-width: 640px)", at);
  expect(mediaAt, `${selector} is not inside a min-width:640px block`).toBeGreaterThan(-1);
  return layoutCss.slice(at, layoutCss.indexOf("}", at) + 1);
}

describe("PageContainer header extra · desktop wrap geometry (gh#300)", () => {
  it("lets the action group shrink at >=640px, so its own wrap can engage", () => {
    // Browser: at 768/13 buttons the frozen box reported 842px on one row with 2 buttons past the
    // viewport edge; shrinkable it reported 471px on two rows with nothing outside.
    const desktop = desktopRule(".ui-page-header-extra");
    expect(desktop).toMatch(/flex-shrink:\s*1;/);
    // The exact regression: a non-shrinkable box has no narrower width to wrap into.
    expect(desktop).not.toMatch(/flex-shrink:\s*0;/);
    expect(desktop).toMatch(/min-inline-size:\s*0;/);
  });

  it("still sizes to its content, so a header that already fits does not move", () => {
    // `width: auto` releases the base full-width stretch — measured identical before/after for a
    // 1 or 4 button header at every desktop width (416px title on one line, extra 56 / 164px).
    const desktop = desktopRule(".ui-page-header-extra");
    expect(desktop).toMatch(/width:\s*auto;/);
    expect(desktop).toMatch(/justify-content:\s*flex-end;/);
  });

  it("keeps the wrap declaration that the shrink finally activates", () => {
    // The box always declared `flex-wrap: wrap`; it was dead code while the width was frozen.
    const base = baseRule(".ui-page-header-extra");
    expect(base).toMatch(/flex-wrap:\s*wrap;/);
    expect(base).toMatch(/width:\s*100%;/);
  });

  it("does not buy the title's measure by pinning the heading instead", () => {
    // The rejected alternative: `.ui-page-header-heading { flex: 0 0 auto }`. It would fix the CJK
    // one-character wrap by making a LONG title unable to yield space — trading this bug for its
    // mirror image. The heading must stay shrinkable (`min-w-0` in page-container.tsx).
    expect(layoutCss).not.toMatch(/\.ui-page-header-heading\s*\{[^}]*flex:\s*0\s+0/);
  });

  it("wraps the inner action group at EVERY width, not only below 720px", () => {
    // THIS ASSERTION USED TO REQUIRE THE BUG. It read:
    //
    //     @media (max-width: 720px) { .ui-page-header-extra > .ui-flex[…] { flex-wrap: wrap; …
    //
    // i.e. it pinned the wrap INSIDE the compact media query and called that "leaving the compact
    // arrangement untouched" — so any fix that let the group wrap on a desktop turned it red. The
    // gate was guarding the half of the geometry that was broken.
    //
    // Letting the BOX shrink (the rule above) without letting its CONTENT wrap does not make the
    // group narrower; it makes it OVERFLOW, and since the box is `justify-content: flex-end`, the
    // overflow runs backwards over the <h1>. Measured on `/isolate/layout-app-shell`, four JA
    // buttons, before the fix:
    //
    //     width  extra box  inner flex  overflow-left
    //     720      520.4      520.4          0        (the media query applied)
    //     760      538.5      609.8       71.3        OVERLAPPED the title
    //     800      569.5      609.8       40.3        OVERLAPPED the title
    //     900      609.8      609.8          0        (fits)
    //
    // After: overflow-left is 0 at every width from 640 to 1440, and nothing overlaps the title.
    // The compact arrangement IS still untouched — where the row fits, `wrap` changes nothing —
    // which is why the rule belongs at the top level rather than under a breakpoint.
    const rules = [
      ...layoutCss.matchAll(
        /\.ui-page-header-extra\s*>\s*\.ui-flex\[data-direction="row"\]\s*\{([^}]*)\}/g,
      ),
    ];
    expect(rules).toHaveLength(1);
    expect(rules[0][1]).toMatch(/flex-wrap:\s*wrap/);
    expect(layoutCss).not.toMatch(
      /@media \(max-width: 720px\) \{[\s\S]*?\.ui-page-header-extra > \.ui-flex\[data-direction="row"\]/,
    );
  });
});
