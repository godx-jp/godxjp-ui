import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * A VERTICAL `ScrollArea` must not clip long text at narrow widths.
 *
 * Radix wraps the viewport's children in a `display: table; min-width: 100%` div so a
 * horizontally scrolling area can grow past the viewport. Mounting only the vertical ScrollBar
 * leaves the viewport at `overflow-x: hidden`, so on a vertical area that wrapper can only ever
 * do harm: the table takes its children's MAX-CONTENT width and everything past the viewport is
 * silently cut off — no scrollbar, no ellipsis, no way to reach the rest of the sentence.
 *
 * MEASURED (Chromium, 390px viewport): the wrapper computed 612px inside a 322px viewport and
 * every long message lost the end of each line. `max-inline-size: 100%` does NOT fix it — a
 * table's used width is floored by its min-content contribution; `display: block` does, because
 * the wrapper is then exactly one viewport wide and the text finally has somewhere to wrap.
 *
 * The rule must stay keyed on `data-orientation="vertical"`: a horizontal or both-axis area still
 * needs Radix's table to grow past the viewport.
 *
 * `!important` is load-bearing here and it is a statement about the DOM, not about specificity —
 * Radix writes `display: table` as an INLINE style on an element no prop of ours can reach, and
 * an inline declaration outranks every layer.
 */
const css = readFileSync(join(process.cwd(), "src/styles/data-display-layout.css"), "utf8");

describe("ScrollArea vertical viewport", () => {
  const rule =
    /\[data-slot="scroll-area-viewport"\]\[data-orientation="vertical"\]\s*>\s*\*\s*\{([^}]*)\}/;

  it("neutralises Radix's table wrapper on the vertical axis", () => {
    const match = css.match(rule);
    expect(match, "the vertical-viewport rule is missing").not.toBeNull();
    expect(match![1]).toMatch(/display:\s*block\s*!important/);
  });

  it("is not scoped to one component — every vertical ScrollArea is covered", () => {
    const match = css.match(rule);
    // A component-scoped selector in front of it would leave every other vertical ScrollArea
    // clipped, which is the bug this fixes.
    const selectorStart = css.slice(0, css.indexOf(match![0]));
    const lastNewline = selectorStart.lastIndexOf("\n");
    expect(selectorStart.slice(lastNewline + 1).trim()).toBe("");
  });

  it("does not disable the table on a horizontal area", () => {
    expect(css).not.toMatch(
      /\[data-slot="scroll-area-viewport"\](?!\[data-orientation="vertical"\])\s*>\s*\*\s*\{[^}]*display:\s*block\s*!important/,
    );
  });
});
