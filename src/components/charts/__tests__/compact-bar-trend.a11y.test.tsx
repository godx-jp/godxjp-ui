import { describe, expect, it } from "vitest";

import { renderWithUi } from "@/test/render";
import { CompactBarTrend } from "../compact-bar-trend";
import { expectNoA11yViolations } from "@/test/a11y";

/**
 * gh#218 — a11y contract of the dependency-free compact bar trend.
 *
 * APG: a chart is a single labelled graphic (`role="img"`) inside a `<figure>` whose
 * `<figcaption>` names it and whose `aria-describedby` points at a visually-hidden
 * per-category value list (the WCAG 1.1.1 text alternative). The graphic owns NO
 * focusable element — there is nothing to operate, so there is no keyboard trap and no
 * dead tab stop; anything interactive belongs in `footer`, which renders outside the
 * graphic and keeps its natural tab order.
 */
const trend = [
  { date: "07-24", count: 4 },
  { date: "07-25", count: 7 },
  { date: "07-26", count: 2 },
  { date: "07-27", count: 9 },
  { date: "07-28", count: 5 },
  { date: "07-29", count: 12 },
  { date: "07-30", count: 8 },
];

describe("CompactBarTrend a11y (gh#218)", () => {
  it("has no axe violations across sizes, emphasis, footer and empty state", async () => {
    await expectNoA11yViolations(
      <CompactBarTrend
        label="新規組織（7日間）"
        description="日別に作成された組織数"
        data={trend}
        categoryKey="date"
        valueKey="count"
        emphasizedIndex={5}
        size="xs"
      />,
    );
    await expectNoA11yViolations(
      <CompactBarTrend
        label="Weekly signups"
        data={trend}
        categoryKey="date"
        valueKey="count"
        size="lg"
        showCategoryLabels={false}
        footer={<a href="#activity">View activity</a>}
      />,
    );
    await expectNoA11yViolations(
      <CompactBarTrend label="新規組織" data={[]} categoryKey="date" valueKey="count" />,
    );
  });

  it("names the graphic and describes it with the plotted values", () => {
    const { getByRole } = renderWithUi(
      <CompactBarTrend
        label="新規組織（7日間）"
        description="日別に作成された組織数"
        data={trend}
        categoryKey="date"
        valueKey="count"
      />,
    );
    // one labelled graphic — the marks themselves are presentational
    expect(getByRole("img")).toHaveAccessibleName(/7/);
    expect(getByRole("figure")).toHaveAccessibleName("新規組織（7日間）");
    expect(getByRole("figure")).toHaveAccessibleDescription(/日別に作成された組織数/);
  });

  it("puts NO focusable element inside the graphic (no dead tab stop, no trap)", () => {
    const { getByRole } = renderWithUi(
      <CompactBarTrend
        label="新規組織"
        data={trend}
        categoryKey="date"
        valueKey="count"
        emphasizedIndex={-1}
        footer={<a href="#activity">アクティビティ</a>}
      />,
    );
    const graphic = getByRole("img");
    expect(graphic.querySelectorAll("a, button, input, select, textarea, [tabindex]")).toHaveLength(
      0,
    );
    expect(graphic.hasAttribute("tabindex")).toBe(false);
    // the ONLY tab stop of the whole figure is the consumer's footer link
    const figure = getByRole("figure");
    const focusable = figure.querySelectorAll("a[href], button, [tabindex]");
    expect(focusable).toHaveLength(1);
    expect(focusable[0]).toHaveAttribute("href", "#activity");
  });

  it("never signals the current bar by colour alone (WCAG 1.4.1)", () => {
    const { container } = renderWithUi(
      <CompactBarTrend
        label="新規組織"
        data={trend}
        categoryKey="date"
        valueKey="count"
        emphasizedIndex={5}
      />,
    );
    const rows = [...container.querySelectorAll("ul.sr-only li")].map((li) => li.textContent ?? "");
    // the emphasized datum is annotated in the text alternative, in the active locale
    expect(rows.filter((row) => /\(.+\)$/.test(row))).toHaveLength(1);
    expect(rows[5]).toContain("07-29");
  });
});
