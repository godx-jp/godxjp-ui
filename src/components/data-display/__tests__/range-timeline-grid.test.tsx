import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { contrast, hsl, hslToRgb, NON_TEXT, over } from "../../../tokens/__tests__/wcag-contrast";
import { RangeTimeline } from "../range-timeline";

/*
 * gh#703 — the body had no grid: no rule between rows, none under the header, no vertical line per
 * column, so a bar could not be read against a day. jsdom does no layout, so what is pinned here is
 * the structure and the stylesheet that produce the grid; the geometry (every body line within
 * 0.5px of its header column edge, top and bottom rows, LTR/RTL, light/dark) was measured in
 * Chromium when this landed.
 */
const columns = [
  { label: "Sep", units: 30 },
  { label: "Oct", units: 31, muted: true },
  { label: "Nov", units: 30 },
];
const row = (id: string, start: number, end: number) => ({
  id,
  label: id,
  start,
  end,
  startLabel: `Start ${id}`,
  endLabel: `End ${id}`,
});

const gridOf = (container: HTMLElement) =>
  container.querySelector<HTMLElement>(".ui-range-timeline-grid");

describe("RangeTimeline body grid (gh#703)", () => {
  it("rules by default: one decorative grid column per header column, with identical units", () => {
    const { container } = render(
      <RangeTimeline
        label="Schedule"
        columns={columns}
        rows={[row("a", 0, 40), row("b", 50, 80)]}
      />,
    );
    expect(container.querySelector(".ui-range-timeline")).toHaveAttribute("data-bordered", "true");
    const grid = gridOf(container)!;
    expect(grid).toHaveAttribute("aria-hidden", "true");
    const header = [...container.querySelectorAll<HTMLElement>(".ui-range-timeline-column")];
    const cells = [...grid.querySelectorAll<HTMLElement>(".ui-range-timeline-grid-column")];
    expect(cells).toHaveLength(header.length);
    expect(cells.map((cell) => cell.style.gridColumn)).toEqual(
      header.map((column) => column.style.gridColumn),
    );
    // One layer for the whole body, not one per row.
    expect(container.querySelectorAll(".ui-range-timeline-grid")).toHaveLength(1);
  });

  it("sizes bands, ticks and grid cells from one unit track, so a month edge IS a day edge", () => {
    // A day axis crossing a month, starting mid-month (partial first band). With `flex: units` the
    // Sep|Oct band edge sat 1.32px off the day-1 column edge at 1440px (LTR and RTL), and the gap
    // grew with the number of bands, because each cell's padding and rule sat outside its grow
    // share. On one grid of `units` tracks it measured 0px at 1440 and 1024, LTR and RTL.
    const days = Array.from({ length: 13 }, (_, index) => ({ label: `${index}`, units: 1 }));
    const { container } = render(
      <RangeTimeline
        label="Schedule"
        bands={[
          { label: "Sep", units: 6 },
          { label: "Oct", units: 7 },
        ]}
        columns={days}
        rows={[row("a", 3, 8)]}
      />,
    );
    const canvas = container.querySelector<HTMLElement>(".ui-range-timeline-canvas")!;
    expect(canvas.style.getPropertyValue("--range-timeline-units")).toBe("13");
    const [bandRow, tickRow] = container.querySelectorAll(".ui-range-timeline-header");
    const spans = (root: Element, selector: string) =>
      [...root.querySelectorAll<HTMLElement>(selector)].map((cell) => cell.style.gridColumn);
    expect(spans(bandRow, ".ui-range-timeline-column")).toEqual(["span 6", "span 7"]);
    expect(spans(tickRow, ".ui-range-timeline-column")).toEqual(Array(13).fill("span 1"));
    expect(spans(gridOf(container)!, ".ui-range-timeline-grid-column")).toEqual(
      Array(13).fill("span 1"),
    );
  });

  it("flags muted columns on the grid layer only", () => {
    const { container } = render(
      <RangeTimeline label="Schedule" columns={columns} rows={[row("a", 0, 40)]} />,
    );
    const flags = [...gridOf(container)!.querySelectorAll(".ui-range-timeline-grid-column")].map(
      (cell) => cell.getAttribute("data-muted"),
    );
    expect(flags).toEqual([null, "true", null]);
  });

  it("bordered={false} removes the grid, and keeps a layer only to paint muted columns", () => {
    const plain = columns.map(({ label, units }) => ({ label, units }));
    const { container, rerender } = render(
      <RangeTimeline label="Schedule" bordered={false} columns={plain} rows={[row("a", 0, 4)]} />,
    );
    expect(container.querySelector(".ui-range-timeline")).not.toHaveAttribute("data-bordered");
    expect(gridOf(container)).toBeNull();
    rerender(
      <RangeTimeline label="Schedule" bordered={false} columns={columns} rows={[row("a", 0, 4)]} />,
    );
    expect(gridOf(container)).not.toBeNull();
  });

  it("points an out-of-range interval toward its side of the axis", () => {
    const { container } = render(
      <RangeTimeline
        label="Schedule"
        columns={columns}
        rows={[row("past", -9, -2), row("future", 95, 99)]}
      />,
    );
    const outside = [...container.querySelectorAll(".ui-range-timeline-outside")];
    expect(outside.map((node) => node.getAttribute("data-direction"))).toEqual(["before", "after"]);
    // Localised through t() in every locale file; whichever locale the test runs in, each side
    // reads its own message.
    const messages = ["en", "ja", "vi"].map(
      (locale) =>
        JSON.parse(readFileSync(join(process.cwd(), `src/i18n/messages/${locale}.json`), "utf8"))
          .rangeTimeline,
    );
    expect(messages.map((m) => m.outsideBefore)).toContain(outside[0].textContent);
    expect(messages.map((m) => m.outsideAfter)).toContain(outside[1].textContent);
    expect(messages.every((m) => m.outsideBefore && m.outsideAfter)).toBe(true);
    // The chevron is decorative; the direction is carried by the text.
    for (const node of outside)
      expect(node.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });
});

describe("RangeTimeline body grid — stylesheet contract", () => {
  const strip = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, "");
  const css = strip(
    readFileSync(join(process.cwd(), "src/styles/data-display-layout.css"), "utf8"),
  );
  const tokens = strip(
    readFileSync(join(process.cwd(), "src/tokens/components/data-display.css"), "utf8"),
  );
  /*
   * gh#767 / gh#769 — Prettier re-wraps both a selector list and a long declaration value once
   * they cross the print width, so the SAME rule reads differently depending only on length.
   * Match any whitespace run where the caller wrote one, and hand back a body whose whitespace is
   * collapsed, so these assertions are about WHAT the rule says, not how it was laid out.
   */
  const rule = (selector: string) => {
    const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+");
    const match = css.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`));
    if (!match) throw new Error(`rule not found: ${selector}`);
    return match[1].replace(/\s+/g, " ");
  };
  const LINE =
    "var(--range-timeline-grid-width) solid var(--range-timeline-grid-color, hsl(var(--border)))";

  it("rules every row and the header/body seam, across label and track", () => {
    const body = rule(
      '.ui-range-timeline[data-bordered="true"] .ui-range-timeline-header + .ui-range-timeline-header, .ui-range-timeline[data-bordered="true"] .ui-range-timeline-row',
    );
    // On the row (the label+track grid), so the rule spans both; the first row's rule is the
    // header/body seam, the header+header rule separates bands from ticks.
    expect(body).toContain(`border-block-start: ${LINE};`);
  });

  it("lays every column row on the same unit tracks, so padding cannot move an edge", () => {
    const columns = rule(".ui-range-timeline-columns");
    expect(columns).toMatch(/display:\s*grid;/);
    expect(columns).toContain(
      "grid-template-columns: repeat(var(--range-timeline-units, 1), minmax(0, 1fr));",
    );
  });

  it("lays the grid behind the rows and out of the pointer's way", () => {
    expect(rule(".ui-range-timeline-body")).toMatch(/isolation:\s*isolate;/);
    const grid = rule(".ui-range-timeline-grid");
    expect(grid).toMatch(/position:\s*absolute;/);
    expect(grid).toMatch(/z-index:\s*-1;/);
    expect(grid).toMatch(/pointer-events:\s*none;/);
    // Same template as the header/row, so the track region starts at the same x.
    expect(grid).toContain(
      "grid-template-columns: var(--range-timeline-label-width) minmax(0, 1fr);",
    );
  });

  it("sizes a grid column exactly like a header column, so the lines align for unequal units", () => {
    const header = rule(".ui-range-timeline-column");
    const cell = rule(".ui-range-timeline-grid-column");
    expect(header).toMatch(/padding:\s*var\(--space-2\);/);
    expect(cell).toMatch(/padding-inline:\s*var\(--space-2\);/);
    expect(header).toMatch(/border-inline-end:\s*var\(--range-timeline-grid-width\) solid/);
    expect(cell).toMatch(
      /border-inline-end:\s*var\(--range-timeline-grid-width\) solid transparent;/,
    );
    expect(
      rule(
        '.ui-range-timeline[data-bordered="true"] .ui-range-timeline-column, .ui-range-timeline[data-bordered="true"] .ui-range-timeline-label, .ui-range-timeline[data-bordered="true"] .ui-range-timeline-grid-column',
      ),
    ).toContain("border-inline-end-color: var(--range-timeline-grid-color, hsl(var(--border)));");
  });

  it("tints muted columns from the knob with a surface-role fallback", () => {
    expect(rule('.ui-range-timeline-grid-column[data-muted="true"]')).toContain(
      "background: var(--range-timeline-muted-column-background, hsl(var(--muted)));",
    );
  });

  it("puts the inside grid and the outer frame on the SAME tier, so neither can dominate", () => {
    // The two are different knobs and the catalog documents them as such: the frame (and the
    // label-column divider) is --range-timeline-border-color, the ruling inside is
    // --range-timeline-grid-color. Both resolve to --border, which is what makes "the grid is
    // never heavier than the box around it" true rather than a coincidence of two numbers.
    expect(tokens).toMatch(/--range-timeline-border-color:\s*var\(--border\);/);
    expect(rule(".ui-range-timeline")).toContain(
      "border: 1px solid hsl(var(--range-timeline-border-color));",
    );
    expect(
      rule(
        '.ui-range-timeline[data-bordered="true"] .ui-range-timeline-column, .ui-range-timeline[data-bordered="true"] .ui-range-timeline-label, .ui-range-timeline[data-bordered="true"] .ui-range-timeline-grid-column',
      ),
    ).toContain("var(--range-timeline-grid-color, hsl(var(--border)))");
  });

  it("declares the knobs: colour knobs `initial` (freeze rule), a hairline width", () => {
    expect(tokens).toMatch(/--range-timeline-grid-color:\s*initial;/);
    expect(tokens).toMatch(/--range-timeline-muted-column-background:\s*initial;/);
    expect(tokens).toMatch(/--range-timeline-grid-width:\s*var\(--stroke-hairline\);/);
  });

  it("places the out-of-range indicator on logical sides and mirrors its chevron under RTL", () => {
    expect(rule('.ui-range-timeline-outside[data-direction="before"]')).toMatch(
      /inset-inline-start:\s*0;/,
    );
    expect(rule('.ui-range-timeline-outside[data-direction="after"]')).toMatch(
      /inset-inline-end:\s*0;/,
    );
    expect(rule('[dir="rtl"] .ui-range-timeline-outside-icon')).toMatch(
      /transform:\s*scaleX\(-1\);/,
    );
  });
});

describe.each([
  { theme: "light", selector: ":root {" },
  { theme: "dark", selector: '.dark,\n:root[data-theme="dark"] {' },
])("RangeTimeline grid colours ($theme)", ({ selector }) => {
  const foundation = readFileSync(join(process.cwd(), "src/tokens/foundation.css"), "utf8");
  const start = foundation.indexOf(selector);
  const open = foundation.indexOf("{", start);
  const body = foundation.slice(open + 1, foundation.indexOf("\n}", open));
  const rgb = (name: string) => hslToRgb(hsl(body, name));

  // THE OWNER HAS ASKED TWICE FOR A LIGHTER GRID, and these numbers are the third answer.
  //
  //   25.3.0  --input        3.463 / 3.883 on the card  — "màu border … đậm quá", too dark
  //   27.6.0  --input / 0.5  1.738 / 1.946, L* 78.67    — gh#730: STILL darker than --border
  //   gh#730  --border       1.149 / 1.270, L* 93.80    ← the tier every card and table uses
  //
  // Decorative rules have no WCAG floor, so what is pinned is not a contrast band but a RELATION:
  // the grid inside the timeline may never out-weigh the frame around it
  // (--range-timeline-border-color, which IS --border) nor a DataTable row rule (--border too).
  // Measured in Chromium, light: the line paints rgb(238,237,236), L* 93.80 on the card, where
  // --input/0.5 painted rgb(198.5,194,189.5), L* 78.67.
  it("is strictly lighter than BOTH weights the owner reported as too dark", () => {
    for (const surface of ["card", "muted"]) {
      const grid = contrast(rgb("border"), rgb(surface));
      expect(grid).toBeLessThan(contrast(over(rgb("input"), rgb(surface), 0.5), rgb(surface)));
      expect(grid).toBeLessThan(contrast(rgb("input"), rgb(surface)));
    }
  });

  it("stays far under the bar fill, so the eye follows the bars and not the grid", () => {
    expect(contrast(rgb("border"), rgb("card"))).toBeLessThan(
      contrast(rgb("primary"), rgb("card")),
    );
  });

  it("a muted column keeps row text at AA and bars at 3:1", () => {
    expect(contrast(rgb("foreground"), rgb("muted"))).toBeGreaterThanOrEqual(4.5);
    expect(contrast(rgb("muted-foreground"), rgb("muted"))).toBeGreaterThanOrEqual(4.5);
    expect(contrast(rgb("primary"), rgb("muted"))).toBeGreaterThanOrEqual(NON_TEXT);
  });
});
