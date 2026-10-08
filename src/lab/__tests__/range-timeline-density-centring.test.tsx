import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RangeTimeline } from "../range-timeline";

/*
 * gh#730 — two defaults the owner could not work around from an app (a written rule and a test
 * forbid declaring tokens in a consumer stylesheet):
 *
 *   2. 56px per day was too wide to fit a useful number of days on one screen.
 *   3. `.ui-range-timeline-column` set no `text-align`, so the day number sat at the inline start
 *      of its cell and a month band label hugged the left edge of its band.
 *
 * jsdom does no layout, so the geometry is pinned here as structure + stylesheet; the numbers in
 * the comments were measured in Chromium on /isolate/data-display-timeline at 1167px, light and
 * dark, LTR and RTL.
 */
const days = (count: number) =>
  Array.from({ length: count }, (_, index) => ({ label: `${index + 1}`, units: 1 }));
const rows = [{ id: "a", label: "A", start: 0, end: 3, startLabel: "Start A", endLabel: "End A" }];

describe("RangeTimeline density (gh#730)", () => {
  it("defaults to the shipped step and scopes nothing, so a theme keeps the default timeline", () => {
    const { container } = render(<RangeTimeline label="Schedule" columns={days(7)} rows={rows} />);
    // No attribute at all: `.ui-range-timeline[data-density="…"]` cannot match, so a theme's own
    // `--range-timeline-unit-width` still owns a default timeline.
    expect(container.querySelector(".ui-range-timeline")).not.toHaveAttribute("data-density");
  });

  it('an explicit density="default" is also unscoped — same DOM as omitting it', () => {
    const { container } = render(
      <RangeTimeline label="Schedule" density="default" columns={days(7)} rows={rows} />,
    );
    expect(container.querySelector(".ui-range-timeline")).not.toHaveAttribute("data-density");
  });

  it.each(["compact", "comfortable"] as const)("scopes the axis for density=%s", (density) => {
    const { container } = render(
      <RangeTimeline label="Schedule" density={density} columns={days(7)} rows={rows} />,
    );
    expect(container.querySelector(".ui-range-timeline")).toHaveAttribute("data-density", density);
  });
});

describe("RangeTimeline density — token + stylesheet contract", () => {
  const strip = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, "");
  const css = strip(
    readFileSync(join(process.cwd(), "src/styles/data-display-layout.css"), "utf8"),
  );
  const tokens = strip(
    readFileSync(join(process.cwd(), "src/tokens/components/data-display.css"), "utf8"),
  );

  it("keeps the 27.8.0 width as the `default` step, so no existing Gantt moves", () => {
    // Measured in Chromium: default 56px/day, exactly what shipped before this change.
    expect(tokens).toMatch(
      /--range-timeline-unit-width-default:\s*calc\(var\(\s*--control-height-sm\) \* 2\);/,
    );
    expect(tokens).toMatch(
      /--range-timeline-unit-width:\s*var\(\s*--range-timeline-unit-width-default\);/,
    );
  });

  it("sizes every step from the control tier, never a literal, so global density still scales it", () => {
    // Chromium: compact 42px, default 56px, comfortable 70px per day; a 31-day axis needs
    // 1558px / 1992px / 2426px of canvas, i.e. compact fits ~27.8 days in 1167px where default
    // fits ~20.8.
    expect(tokens).toMatch(
      /--range-timeline-unit-width-compact:\s*calc\(var\(\s*--control-height-sm\) \* 1\.5\);/,
    );
    expect(tokens).toMatch(
      /--range-timeline-unit-width-comfortable:\s*calc\(var\(\s*--control-height-sm\) \* 2\.5\);/,
    );
  });

  it("re-points the ONE live knob per density step instead of adding a second knob", () => {
    for (const step of ["compact", "comfortable"]) {
      const rule = css.match(
        new RegExp(`\\.ui-range-timeline\\[data-density="${step}"\\]\\s*\\{([^}]*)\\}`),
      );
      expect(rule, `missing density scope for ${step}`).not.toBeNull();
      expect(rule![1]).toContain(
        `--range-timeline-unit-width: var(--range-timeline-unit-width-${step});`,
      );
      // The axis step and NOTHING else: a compact Gantt is the same schedule with more days on
      // screen, not a smaller one, so the row and bar heights must not appear in the scope.
      expect(rule![1]).not.toMatch(/--range-timeline-(?:row|bar)-height/);
      expect(rule![1]).not.toMatch(/--range-timeline-label-width/);
    }
  });
});

describe("RangeTimeline column labels are centred (gh#730)", () => {
  const strip = (cssText: string) => cssText.replace(/\/\*[\s\S]*?\*\//g, "");
  const css = strip(
    readFileSync(join(process.cwd(), "src/styles/data-display-layout.css"), "utf8"),
  );
  /* Collapsed, so the assertions below pin the DECLARATION and not Prettier's wrapping: gh#906
   * made the padding calc long enough to break across lines. */
  const column = css
    .match(/\.ui-range-timeline-column\s*\{([^}]*)\}/)![1]
    .replace(/\s+/g, " ")
    .replace(/\(\s+/g, "(")
    .replace(/\s+\)/g, ")");

  it("centres the tick and band label on its column", () => {
    // Chromium, before: the day number sat 21.074px from the centre of a 65.07px cell and the
    // month band label 172.000px from the centre of its 420.46px band. After: 0.004px and 0.000px.
    expect(column).toMatch(/text-align:\s*center;/);
  });

  it("gives the start edge the grid rule's width back, so the centre is the TRACK centre", () => {
    // The rule lives INSIDE the cell box on the end edge, so symmetric padding centres the label
    // in a content box one rule narrower than the track — measured exactly -0.500px on every
    // column, at the very edge of the 0.5px tolerance. With the compensation: 0.004px worst case
    // over 5 timelines x 4 viewports, light/dark, LTR/RTL.
    expect(column).toMatch(/padding:\s*var\(\s*--space-2\);/);
    expect(column).toMatch(
      /padding-inline-start:\s*calc\(var\(\s*--space-2\) \+ var\(--range-timeline-grid-width, var\(--stroke-hairline\)\)\);/,
    );
  });

  it("does not disturb the 27.6.0 band/tick/grid alignment", () => {
    // Tracks are sized by the grid alone, so padding can never move an edge — re-measured in
    // Chromium after centring: every band edge and every decorative grid-column edge still lands
    // 0px from its tick-column edge (13-, 14- and 31-column axes, LTR and RTL).
    expect(css).toContain(
      "grid-template-columns: repeat(var(--range-timeline-units, 1), minmax(0, 1fr));",
    );
  });

  it("a band clipped by the range centres on its VISIBLE part", () => {
    // A month the axis starts inside (Sep 25-30 = 6 of 30 days) spans 6 tracks, and that cell IS
    // the band as far as the DOM is concerned — the component is given `units`, never the length
    // of the notional full month. Centring on a full month would put the label outside the box it
    // labels and under its neighbour's, which is also why MS Project / Jira Timeline centre on the
    // visible part. Pinned as the element contract: the band cell spans only its own units.
    const { container } = render(
      <RangeTimeline
        label="Schedule"
        bands={[
          { label: "Sep", units: 6 },
          { label: "Oct", units: 7 },
        ]}
        columns={days(13)}
        rows={rows}
      />,
    );
    const [bandRow] = container.querySelectorAll(".ui-range-timeline-header");
    expect(
      [...bandRow.querySelectorAll<HTMLElement>(".ui-range-timeline-column")].map(
        (cell) => cell.style.gridColumn,
      ),
    ).toEqual(["span 6", "span 7"]);
  });
});
