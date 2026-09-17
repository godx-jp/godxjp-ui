import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { contrast, hsl, hslToRgb, NON_TEXT } from "../../../tokens/__tests__/wcag-contrast";
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
    expect(cells.map((cell) => cell.style.flex)).toEqual(header.map((column) => column.style.flex));
    // One layer for the whole body, not one per row.
    expect(container.querySelectorAll(".ui-range-timeline-grid")).toHaveLength(1);
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
    "var(--range-timeline-grid-width) solid\n      var(--range-timeline-grid-color, hsl(var(--input)))";

  it("rules every row and the header/body seam, across label and track", () => {
    const body = rule(
      '.ui-range-timeline[data-bordered="true"] .ui-range-timeline-header + .ui-range-timeline-header,\n  .ui-range-timeline[data-bordered="true"] .ui-range-timeline-row',
    );
    // On the row (the label+track grid), so the rule spans both; the first row's rule is the
    // header/body seam, the header+header rule separates bands from ticks.
    expect(body).toContain(`border-block-start: ${LINE};`);
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
    ).toContain("border-inline-end-color: var(--range-timeline-grid-color, hsl(var(--input)));");
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

  it("the grid line is visible on the body and on a muted column (decorative, measured ≥3:1)", () => {
    expect(contrast(rgb("input"), rgb("card"))).toBeGreaterThanOrEqual(NON_TEXT);
    expect(contrast(rgb("input"), rgb("muted"))).toBeGreaterThanOrEqual(NON_TEXT);
  });

  it("a muted column keeps row text at AA and bars at 3:1", () => {
    expect(contrast(rgb("foreground"), rgb("muted"))).toBeGreaterThanOrEqual(4.5);
    expect(contrast(rgb("muted-foreground"), rgb("muted"))).toBeGreaterThanOrEqual(4.5);
    expect(contrast(rgb("primary"), rgb("muted"))).toBeGreaterThanOrEqual(NON_TEXT);
  });
});
