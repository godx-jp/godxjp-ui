import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * A PAGE HEADER'S ACTION GROUP MUST WRAP AT EVERY WIDTH, NOT ONLY BELOW 720px.
 *
 * `.ui-page-header-extra` is allowed to shrink below its content at ≥640px — that rule exists
 * because when it could NOT shrink, the whole deficit was charged to `.ui-page-header-heading` and
 * the `<h1>` wrapped one CJK character per line. But shrinking the BOX is only half the fix: an
 * action group that cannot WRAP does not get narrower when its box does. It overflows, and because
 * the box is `justify-content: flex-end` the overflow runs BACKWARDS, over the title.
 *
 * The wrap was scoped to `@media (max-width: 720px)`, so 721–859px had a shrinkable box wrapped
 * around unshrinkable content. Measured on `/isolate/layout-app-shell` (four Japanese buttons)
 * before the fix:
 *
 *     width  title   extra box  inner flex  overflow-left  title lines
 *     720    151.6     520.4      520.4          0            2        (the media query applied)
 *     760    157.5     538.5      609.8       71.3            2        OVERLAPPED the <h1>
 *     800    166.5     569.5      609.8       40.3            2        OVERLAPPED the <h1>
 *     900    178.3     609.8      609.8          0            1        (fits; nothing to charge)
 *
 * After: overflow-left is 0 at 640 / 700 / 720 / 740 / 760 / 780 / 800 / 830 / 860 / 900 / 1024 /
 * 1280 / 1440, and no width overlaps the title.
 *
 * A CSS-TEXT TEST, deliberately: jsdom performs no layout, so it cannot reproduce an overflow at
 * all. What it CAN hold is the thing that regressed — the wrap being conditional. The browser half
 * of the evidence is the isolate route above.
 */
describe("PageContainer header — the action group wraps instead of covering the title", () => {
  const css = readFileSync(resolve(process.cwd(), "src/styles/layout.css"), "utf8");

  /** Rule bodies for `.ui-page-header-extra > .ui-flex[data-direction="row"]`, in source order. */
  const wrapRules = [
    ...css.matchAll(/\.ui-page-header-extra\s*>\s*\.ui-flex\[data-direction="row"\]\s*\{([^}]*)\}/g),
  ].map((m) => m[1]);

  it("declares the wrap exactly once", () => {
    expect(wrapRules).toHaveLength(1);
  });

  it("lets the action group wrap and stay inside its box", () => {
    const [body] = wrapRules;
    expect(body).toMatch(/flex-wrap:\s*wrap/);
    // Logical, not `max-width` — the header flips under dir="rtl" like everything else.
    expect(body).toMatch(/max-inline-size:\s*100%/);
  });

  it("is NOT nested in a media query — that scoping is the bug", () => {
    // Everything from the start of file to the rule must have balanced braces; an unclosed `{`
    // means the rule sits inside an `@media` (or any other) block.
    const index = css.indexOf('.ui-page-header-extra > .ui-flex[data-direction="row"]');
    expect(index).toBeGreaterThan(-1);
    const before = css.slice(0, index);
    const depth = (before.match(/\{/g) ?? []).length - (before.match(/\}/g) ?? []).length;
    // Depth 1 is the `@layer components` wrapper every rule in this file lives in.
    expect(depth).toBe(1);
  });

  it("keeps the box shrinkable, which is the half of the fix that already shipped", () => {
    const extra = /@media \(min-width: 640px\)[\s\S]*?\.ui-page-header-extra\s*\{([^}]*)\}/.exec(
      css,
    );
    expect(extra?.[1]).toMatch(/flex-shrink:\s*1/);
    expect(extra?.[1]).toMatch(/min-inline-size:\s*0/);
  });
});
