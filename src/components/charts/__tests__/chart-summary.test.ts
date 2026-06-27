import { describe, expect, it } from "vitest";

import { buildCartesianSummary, buildPieSummary } from "../chart-summary";
import type { ChartDatum, ChartSeriesProp } from "../../../props/components/charts.prop";

const fmt = new Intl.NumberFormat("en-US");
const list = new Intl.ListFormat("en-US", { style: "long", type: "conjunction" });

describe("buildCartesianSummary", () => {
  it("formats numeric values and uses series.label when present", () => {
    const data: ChartDatum[] = [{ month: "Jan", revenue: 1000 }];
    const series: ChartSeriesProp[] = [{ dataKey: "revenue", label: "Revenue" }];
    const out = buildCartesianSummary(
      data,
      series,
      "month",
      fmt,
      list,
      (c) => `${c.series} series, ${c.points} points`,
    );
    expect(out.rows[0]).toBe("Jan — Revenue: 1,000");
    expect(out.img).toBe("1 series, 1 points");
  });

  it("falls back to dataKey when series.label is missing", () => {
    const data: ChartDatum[] = [{ month: "Feb", revenue: 5 }];
    const series: ChartSeriesProp[] = [{ dataKey: "revenue" }];
    const out = buildCartesianSummary(data, series, "month", fmt, list, () => "");
    expect(out.rows[0]).toBe("Feb — revenue: 5");
  });

  it("coerces non-finite, non-number, null and missing values to 0", () => {
    const data: ChartDatum[] = [
      { month: "A", v: Number.NaN },
      { month: "B", v: null },
      { month: "C", v: undefined },
      // category key itself missing → empty string via ?? ""
      { v: 3 },
    ];
    const series: ChartSeriesProp[] = [{ dataKey: "v", label: "V" }];
    const out = buildCartesianSummary(data, series, "month", fmt, list, () => "x");
    expect(out.rows[0]).toBe("A — V: 0");
    expect(out.rows[1]).toBe("B — V: 0");
    expect(out.rows[2]).toBe("C — V: 0");
    expect(out.rows[3]).toBe(" — V: 3");
  });

  it("returns empty rows for empty data", () => {
    const out = buildCartesianSummary([], [], "month", fmt, list, (c) => `${c.points}`);
    expect(out.rows).toEqual([]);
    expect(out.img).toBe("0");
  });
});

describe("buildPieSummary", () => {
  it("formats slice values keyed by name", () => {
    const data: ChartDatum[] = [{ name: "Apple", count: 12 }];
    const out = buildPieSummary(data, "count", "name", fmt, (c) => `${c.slices} slices`);
    expect(out.rows[0]).toBe("Apple: 12");
    expect(out.img).toBe("1 slices");
  });

  it("coerces null/missing value to 0 and missing name to empty string", () => {
    const data: ChartDatum[] = [{ count: null }];
    const out = buildPieSummary(data, "count", "name", fmt, () => "");
    expect(out.rows[0]).toBe(": 0");
  });
});
