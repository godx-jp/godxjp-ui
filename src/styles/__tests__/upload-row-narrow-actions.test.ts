import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * AN UPLOAD FILE ROW MUST WRAP ITS ACTIONS, NOT PUSH THEM OUT OF THE FRAME (gh#733).
 *
 * `.ui-upload-row` is `[leading box] [name + size] [preview] [download] [start/cancel] [remove]`.
 * Every action is a labelled `Button`: `white-space: nowrap`, so its min-content width is its own
 * text and it cannot give ground. `.ui-upload-row-main` is the only item that shrinks, and once it
 * is at zero the row was still a single un-wrapping line — so the trailing actions were laid out
 * PAST the row's end edge, outside the frame, with no scroll container anywhere between them and
 * the frame to bring them back.
 *
 * Measured on `/frame/data-entry-upload` at 27.8.0, the row 212px wide inside a 278px frame
 * (`scripts/frame-geometry.mjs`, the nightly viewport matrix):
 *
 *     width  row clientWidth  row scrollWidth  controls past the frame's end edge
 *     320         210              315          ダウンロード +24px · 削除 +70px
 *     375         239              315          削除 +41px
 *     390         254              315          削除 +26px
 *     768         700              700          none
 *
 * `listType="picture"` (gh#720) put 36px + a gap in front of the name and so widened the deficit,
 * but it did not create it: 315 − 48 = 267 still exceeds all three narrow rows, i.e. a plain
 * `listType="text"` row carrying preview + download + remove clips at exactly the same widths.
 * This is the COMPONENT's geometry, not the docs example's — any consumer listing files in a
 * phone-width drawer hits it.
 *
 * A CSS-TEXT TEST, deliberately: jsdom performs no layout, so nothing rendered here can reproduce
 * an overflow. What it CAN hold is the thing whose absence was the defect — the row's wrap and the
 * action group that wraps with it. The browser half of the evidence is the frame route above; the
 * DOM half (every action really is inside the group) is
 * `src/components/data-entry/__tests__/upload-row-actions-733.test.tsx`.
 */
describe("Upload file row — actions wrap under the name instead of leaving the frame", () => {
  const css = readFileSync(resolve(process.cwd(), "src/styles/data-entry-layout.css"), "utf8");

  const ruleBodies = (selector: string) =>
    [
      ...css.matchAll(
        new RegExp(
          `\\n\\s*${selector.replace(/[.:*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\{([^}]*)\\}`,
          "g",
        ),
      ),
    ].map((m) => m[1]);

  it("declares the row's wrap exactly once, beside the flex it already had", () => {
    const rows = ruleBodies(".ui-upload-row");
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatch(/display:\s*flex/);
    expect(rows[0]).toMatch(/flex-wrap:\s*wrap/);
  });

  it("keeps the name block as the only item that gives ground, so the line breaks only when it must", () => {
    const [main] = ruleBodies(".ui-upload-row-main");
    expect(main).toMatch(/min-inline-size:\s*0/);
    // `flex-basis: 0` is what keeps every row that already fits on ONE line: wrapping is decided
    // from the hypothetical sizes, and a zero-basis name contributes nothing to them.
    expect(main).toMatch(/flex:\s*1\s+1\s+0%/);
  });

  it("groups the actions so they travel to the next line together", () => {
    const [actions] = ruleBodies(".ui-upload-row-actions");
    expect(actions).toMatch(/display:\s*flex/);
    // The group itself wraps — at 320px even `preview + download + remove` alone exceeds the row.
    expect(actions).toMatch(/flex-wrap:\s*wrap/);
    // Logical, never `margin-left`: the row flips whole under dir="rtl".
    expect(actions).toMatch(/margin-inline-start:\s*auto/);
    expect(actions).toMatch(/gap:\s*var\(--upload-row-space-gap\)/);
  });

  it("collapses the group when a row has no actions, so that row keeps its old box", () => {
    const [empty] = ruleBodies(".ui-upload-row-actions:empty");
    expect(empty).toMatch(/display:\s*none/);
  });

  it("puts none of it behind a media or container query — that scoping would be the bug", () => {
    for (const selector of [".ui-upload-row {", ".ui-upload-row-actions {"]) {
      const index = css.indexOf(selector);
      expect(index).toBeGreaterThan(-1);
      const before = css.slice(0, index);
      const depth = (before.match(/\{/g) ?? []).length - (before.match(/\}/g) ?? []).length;
      // Depth 1 is the `@layer components` wrapper every rule in this file lives in.
      expect(depth).toBe(1);
    }
  });

  it("does not touch the listType boxes — 36×36 leading box, one row height (gh#720)", () => {
    for (const selector of [".ui-upload-list-thumb", ".ui-upload-list-glyph"]) {
      const [body] = ruleBodies(selector);
      expect(body).toMatch(/inline-size:\s*var\(--control-height-lg\)/);
      expect(body).toMatch(/block-size:\s*var\(--control-height-lg\)/);
      expect(body).toMatch(/flex-shrink:\s*0/);
    }
  });
});
