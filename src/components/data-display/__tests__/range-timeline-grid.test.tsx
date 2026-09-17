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
  const rule = (selector: string) => {
    const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const match = css.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`));
    if (!match) throw new Error(`rule not found: ${selector}`);
    return match[1];
  };
  const LINE =
    "var(--range-timeline-grid-width) solid\n      var(--range-timeline-grid-color, hsl(var(--input) / 0.5))";

  it("rules every row and the header/body seam, across label and track", () => {
    const body = rule(
      '.ui-range-timeline[data-bordered="true"] .ui-range-timeline-header + .ui-range-timeline-header,\n  .ui-range-timeline[data-bordered="true"] .ui-range-timeline-row',
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
        '.ui-range-timeline[data-bordered="true"] .ui-range-timeline-column,\n  .ui-range-timeline[data-bordered="true"] .ui-range-timeline-label,\n  .ui-range-timeline[data-bordered="true"] .ui-range-timeline-grid-column',
      ),
    ).toContain(
      "border-inline-end-color: var(--range-timeline-grid-color, hsl(var(--input) / 0.5));",
    );
  });

  it("tints muted columns from the knob with a surface-role fallback", () => {
    expect(rule('.ui-range-timeline-grid-column[data-muted="true"]')).toContain(
      "background: var(--range-timeline-muted-column-background, hsl(var(--muted)));",
    );
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

  // The owner found the full --input grid (3.47:1 on the card) too dark on a real Gantt: "màu
  // border của gantt và date picker đang bị đậm quá cho mờ đi". Decorative lines have no WCAG
  // floor, so the band is legibility: measured in Chromium, --input / 0.5 paints 1.74 light /
  // 1.95 dark on the card and 1.68 / 1.80 on the --muted header and muted columns — the same
  // weight as the Calendar grid.
  it("the grid line reads on the body and on a muted column without dominating (1.5–2.0:1)", () => {
    for (const surface of ["card", "muted"]) {
      const ratio = contrast(over(rgb("input"), rgb(surface), 0.5), rgb(surface));
      expect(ratio).toBeGreaterThanOrEqual(1.5);
      expect(ratio).toBeLessThanOrEqual(2);
      expect(ratio).toBeGreaterThan(contrast(rgb("border"), rgb(surface)));
    }
  });

  it("a muted column keeps row text at AA and bars at 3:1", () => {
    expect(contrast(rgb("foreground"), rgb("muted"))).toBeGreaterThanOrEqual(4.5);
    expect(contrast(rgb("muted-foreground"), rgb("muted"))).toBeGreaterThanOrEqual(4.5);
    expect(contrast(rgb("primary"), rgb("muted"))).toBeGreaterThanOrEqual(NON_TEXT);
  });
});
