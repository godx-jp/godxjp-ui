import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * gh#730, the two Calendar geometry defaults a consumer cannot reach (a written rule and a test
 * forbid declaring tokens in an app stylesheet):
 *
 *   4. ~32px of dead space between the month caption and the weekday row — `--calendar-month-space-gap`
 *      (16px, on `.ui-calendar-month`) STACKED with `--calendar-grid-space-block-start` (16px, on
 *      `.ui-calendar-grid`). A month column has exactly two in-flow children, caption and grid, so
 *      the column gap could only ever draw the same step the grid's margin already drew.
 *   5. The caption's nav chevrons and the day grid did not share an inset — 「lề của button và
 *      calendar ko bằng nhau」. `.ui-calendar-nav` is `position: absolute; inset-inline: 0`, and an
 *      absolutely positioned box resolves its insets against the containing block's PADDING box,
 *      so the nav escapes `--calendar-space-inset` entirely and its own padding is the whole inset.
 *
 * Measured in Chromium on the open DatePicker popover (249px content box) and on the embedded
 * calendars of /isolate/data-entry-calendar, light and dark, LTR and RTL. Insets from the popover
 * content edge:
 *
 *                    before          after
 *   `‹` button       4px             12px
 *   `›` button       4px             12px
 *   caption row      12px            12px
 *   weekday row      12px            12px
 *   day grid         12px            12px
 *   button vs grid   8px apart       0.00px
 *   caption→weekday  32px            12px
 *
 * jsdom does no layout, so what is pinned here is the wiring that produces those numbers.
 */
const tokens = readFileSync(join(process.cwd(), "src/tokens/components/control.css"), "utf8");
const css = readFileSync(join(process.cwd(), "src/styles/control.css"), "utf8").replace(
  /\/\*[\s\S]*?\*\//g,
  "",
);

// Anchored at the start of a line: `.ui-calendar-grid` is also the TAIL of
// `.ui-calendar[data-bordered="true"] .ui-calendar-grid`, and an unanchored match read that one.
const rule = (selector: string) => {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = css.match(new RegExp(`(?:^|\\n)[ \\t]*${escaped}\\s*\\{([^}]*)\\}`));
  if (!match) throw new Error(`rule not found: ${selector}`);
  return match[1];
};

describe("Calendar caption→weekday step is ONE token (gh#730 item 4)", () => {
  it("the month column no longer sets a gap, so nothing can stack with the grid margin", () => {
    expect(rule(".ui-calendar-month")).not.toMatch(/(^|[^-])gap:/);
    // The months-level gap — between the two panels of a range picker — keeps its own token.
    expect(rule(".ui-calendar-months")).toContain("gap: var(--calendar-month-space-gap);");
  });

  it("the whole caption→grid step is --calendar-grid-space-block-start, ruled and unruled", () => {
    expect(rule(".ui-calendar-grid")).toContain(
      "margin-block-start: var(--calendar-grid-space-block-start);",
    );
    // The bordered grid is declared in two blocks (the closing rule, then the margin); either may
    // come first, so assert across both rather than on whichever the regex reaches.
    const bordered = [
      ...css.matchAll(/\.ui-calendar\[data-bordered="true"\] \.ui-calendar-grid\s*\{([^}]*)\}/g),
    ].map((m) => m[1]);
    expect(
      bordered.some((b) =>
        b.includes("margin-block-start: var(--calendar-grid-space-block-start);"),
      ),
    ).toBe(true);
  });

  it("is space-3, not space-2: a group boundary has to out-measure the week rhythm", () => {
    // Unruled, rows sit --calendar-week-space-block-start (space-2, 8px) apart. At space-2 the
    // caption would read as one more week row; at space-3 (measured 12px) it reads as a boundary.
    expect(tokens).toMatch(/--calendar-grid-space-block-start:\s*var\(--space-3\);/);
    expect(tokens).toMatch(/--calendar-week-space-block-start:\s*var\(--space-2\);/);
  });
});

describe("Calendar nav and grid share ONE inset (gh#730 item 5)", () => {
  it("the nav's inset IS the calendar's inset, by construction and not by coincidence", () => {
    // One value, not two steps that happen to be equal: retuning --calendar-space-inset moves the
    // chevrons and the grid together, which is what stops them drifting apart again.
    expect(tokens).toMatch(/--calendar-nav-space-inline:\s*var\(--calendar-space-inset\);/);
    expect(tokens).toMatch(/--calendar-space-inset:\s*var\(--space-3\);/);
  });

  it("the root pads by that inset and the nav pads by the knob that mirrors it", () => {
    expect(rule(".ui-calendar")).toContain("padding: var(--calendar-space-inset);");
    const nav = rule(".ui-calendar-nav");
    // `inset-inline: 0` is against the PADDING box, so the padding below is the entire inset.
    expect(nav).toMatch(/inset-inline:\s*0;/);
    expect(nav).toContain("padding-inline: var(--calendar-nav-space-inline);");
  });

  it("uses logical properties throughout, so the mirror holds under dir=rtl", () => {
    // Measured RTL on the embedded calendars: button vs grid 0.00px at both the inline start and
    // the inline end, bordered and unbordered.
    const nav = rule(".ui-calendar-nav");
    expect(nav).not.toMatch(/\b(?:left|right|padding-left|padding-right)\s*:/);
  });
});
