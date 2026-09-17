import { describe, expect, it } from "vitest";
import { renderWithUi } from "@/test/render";

import { Calendar } from "../calendar";
import { DatePicker } from "../date-picker";

/**
 * The day grid is RULED BY DEFAULT — Calendar and every picker that renders one.
 *
 * Reported by the owner from a real screen: "the date picker and calendar should have borders
 * between the days — right now there are no borders and it is very hard to read". Two defects:
 * `bordered` defaulted to `false`, and `DatePicker` never forwarded it, so no popup calendar could
 * show the ruling at all. `bordered={false}` stays the opt-out on both.
 *
 * The ruling itself is a stylesheet rule keyed on `[data-bordered="true"]`; jsdom paints nothing,
 * so what is asserted here is the attribute the rule matches (the colour is pinned by
 * calendar-grid-line-contrast.test.ts, the geometry was measured in Chromium).
 */
const JAN = new Date(2026, 0, 15);
const grids = () => Array.from(document.querySelectorAll<HTMLElement>(".ui-calendar"));

describe("Calendar bordered default", () => {
  it("rules the grid with no prop passed", () => {
    renderWithUi(<Calendar mode="single" defaultMonth={JAN} />);
    expect(grids()).toHaveLength(1);
    expect(grids()[0].getAttribute("data-bordered")).toBe("true");
  });

  it("bordered={false} opts out and emits no attribute", () => {
    renderWithUi(<Calendar mode="single" defaultMonth={JAN} bordered={false} />);
    expect(grids()[0].hasAttribute("data-bordered")).toBe(false);
  });

  it("a read-only calendar (no mode) is ruled too", () => {
    renderWithUi(<Calendar defaultMonth={JAN} />);
    expect(grids()[0].getAttribute("data-bordered")).toBe("true");
  });
});

describe("DatePicker forwards bordered to its Calendar", () => {
  const cases = [
    ["single", {}],
    ["week", { picker: "week" }],
    ["multiple", { multiple: true }],
    ["range", { range: true }],
  ] as const;

  it.each(cases)("%s: the popup grid is ruled by default", (_label, extra) => {
    renderWithUi(<DatePicker defaultOpen pickerValue={JAN} {...(extra as object)} />);
    const open = grids();
    expect(open.length).toBeGreaterThan(0);
    for (const grid of open) expect(grid.getAttribute("data-bordered")).toBe("true");
  });

  it.each(cases)("%s: bordered={false} reaches the popup grid", (_label, extra) => {
    renderWithUi(
      <DatePicker defaultOpen pickerValue={JAN} bordered={false} {...(extra as object)} />,
    );
    const open = grids();
    expect(open.length).toBeGreaterThan(0);
    for (const grid of open) expect(grid.hasAttribute("data-bordered")).toBe(false);
  });

  it("the period grid (month picker) renders no Calendar, so there is nothing to rule", () => {
    renderWithUi(<DatePicker defaultOpen picker="month" pickerValue={JAN} />);
    expect(grids()).toHaveLength(0);
  });
});
