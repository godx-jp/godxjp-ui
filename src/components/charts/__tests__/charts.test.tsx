import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";

import { LineChart } from "../line-chart";
import { PieChart } from "../pie-chart";
import { CHART_COLORS, chartColor, chartHeight } from "../chart-frame";
import { buildCartesianSummary, buildPieSummary } from "../chart-summary";

describe("chart helpers", () => {
  it("chartColor cycles the palette and respects explicit overrides", () => {
    expect(chartColor(0)).toBe(CHART_COLORS[0]);
    expect(chartColor(CHART_COLORS.length)).toBe(CHART_COLORS[0]); // wraps
    expect(chartColor(1, "var(--primary)")).toBe("var(--primary)");
  });

  it("chartHeight prefers explicit px over the size tier", () => {
    expect(chartHeight("sm")).toBe(220);
    expect(chartHeight("md", 333)).toBe(333);
  });

  it("buildCartesianSummary emits one localized row per datum", () => {
    const fmt = new Intl.NumberFormat("en");
    const list = new Intl.ListFormat("en", { style: "narrow", type: "unit" });
    const { rows, img } = buildCartesianSummary(
      [
        { month: "Jan", a: 10, b: 20 },
        { month: "Feb", a: 30, b: 40 },
      ],
      [
        { dataKey: "a", label: "A" },
        { dataKey: "b", label: "B" },
      ],
      "month",
      fmt,
      list,
      ({ series, points }) => `${series}/${points}`,
    );
    expect(rows).toHaveLength(2);
    expect(rows[0]).toContain("Jan");
    expect(rows[0]).toContain("A: 10");
    expect(rows[0]).toContain("B: 20");
    expect(img).toBe("2/2");
  });

  it("buildPieSummary formats each slice value", () => {
    const fmt = new Intl.NumberFormat("en");
    const { rows, img } = buildPieSummary(
      [{ name: "x", v: 1000 }],
      "v",
      "name",
      fmt,
      ({ slices }) => `${slices}`,
    );
    expect(rows[0]).toBe("x: 1,000");
    expect(img).toBe("1");
  });
});

describe("chart rendering", () => {
  it("LineChart renders the visible caption", () => {
    const { getByText } = render(
      <LineChart
        label="My Trend"
        data={[{ m: "Jan", v: 1 }]}
        categoryKey="m"
        series={[{ dataKey: "v", label: "V" }]}
      />,
    );
    expect(getByText("My Trend")).toBeInTheDocument();
  });

  it("PieChart shows the empty message when there is no data", () => {
    const { getByText } = render(
      <PieChart label="Split" data={[]} dataKey="v" nameKey="n" emptyMessage="Nothing here" />,
    );
    expect(getByText("Nothing here")).toBeInTheDocument();
  });
});
