import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * A column-header SORT BUTTON must reach the WCAG 2.2 SC 2.5.8 floor without the PAINT growing.
 *
 * Reported from a consumer and measured in Chromium on a real table — `/find/PKG` in godx-task,
 * 1409 elements — the button painted **56.3 × 17.8**, and `elementFromPoint` at its centre ±11px,
 * the box SC 2.5.8 asks for, returned the `<th>` rather than the button. Under 24px tall on every
 * sortable column of every `DataTable` this library ships.
 *
 * The paint must not grow. A header cell's height IS the table's row rhythm, and `font: inherit`
 * with `padding: 0` is what keeps a sortable header typographically identical to a plain one — so
 * the hit area is carried by a centred pseudo-element, which is exactly the answer
 * `.ui-control-inline-affix-action` already ships (see control-affix-touch-target.test.ts). That
 * precedent is asserted here too: if the affix's approach is ever replaced, these two should move
 * together rather than one quietly diverging.
 *
 * After the fix, measured on three columns of `/isolate/data-display-data-table-index`: paint
 * still 17.8px tall, `::after` box 24px, and the centre/±11px probes all HIT.
 *
 * A CSS-TEXT TEST, deliberately. jsdom has no layout, so it cannot measure a hit area at all; and
 * the browser gate that would own this scans PAINTED boxes, which this fix leaves alone on
 * purpose — a gate looking at paint would call the fix a no-op. The browser half of the evidence
 * is the isolate route above, measured by hand.
 */
describe("DataTable sort button — hit area", () => {
  const css = readFileSync(resolve(process.cwd(), "src/styles/table-layout.css"), "utf8");
  const pseudo = css.match(/\.ui-data-table-sort-button::after\s*\{[^}]*\}/)?.[0] ?? "";
  const paint = css.match(/\.ui-data-table-sort-button\s*\{[^}]*\}/)?.[0] ?? "";

  it("carries a centred pseudo-element at the touch floor", () => {
    expect(pseudo, "no ::after rule on .ui-data-table-sort-button").not.toBe("");
    expect(pseudo).toContain("min-inline-size: var(--touch-target-min)");
    expect(pseudo).toContain("min-block-size: var(--touch-target-min)");
    expect(pseudo).toContain("translate: -50% -50%");
    expect(pseudo).toContain("position: absolute");
  });

  it("needs the button to be a positioning context, or the overlay escapes the cell", () => {
    expect(paint).toContain("position: relative");
  });

  it("does not grow the painted button — the header's row rhythm must not move", () => {
    expect(paint).toContain("padding: 0");
    expect(paint).toContain("font: inherit");
    expect(paint).not.toContain("min-block-size: var(--touch-target-min)");
    expect(paint).not.toMatch(/\bheight:|block-size:\s*(?!100%)/);
  });

  it("keeps a WIDE button's own width rather than shrinking it to the floor", () => {
    // `min-*` may only ever raise a small target; a 56px-wide header must not become 24px.
    expect(pseudo).toContain("inline-size: 100%");
    expect(pseudo).toContain("block-size: 100%");
  });

  it("the affix precedent it copies is still there", () => {
    // If the affix ever stops using a pseudo-element, this rule's justification changes with it.
    const control = readFileSync(resolve(process.cwd(), "src/styles/control.css"), "utf8");
    expect(control).toMatch(/\.ui-control-inline-affix-action::after\s*\{[^}]*min-block-size/);
  });
});
