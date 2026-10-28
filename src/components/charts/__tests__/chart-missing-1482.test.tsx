import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { AppProvider } from "../../../app/app-provider";
import { CompactBarTrend } from "../compact-bar-trend";
import { BarChart } from "../bar-chart";
import { PieChart } from "../pie-chart";
import { trendRatios } from "../chart-summary";

describe("missing chart observations (gh#1482)", () => {
  it.each([
    ["en", "No data"],
    ["ja", "データなし"],
    ["vi", "Không có dữ liệu"],
  ] as const)(
    "reads missing values in %s without inventing zero or currency counts",
    (locale, missing) => {
      const data = [
        { d: "A", v: 1200 },
        { d: "B", v: null },
        { d: "C", v: undefined },
        { d: "D", v: 0 },
      ];
      for (const chart of [
        <BarChart
          key="bar"
          label="Sales"
          data={data}
          categoryKey="d"
          series={[{ dataKey: "v" }]}
          numberFormat={{ style: "currency", currency: "JPY" }}
        />,
        <PieChart
          key="pie"
          label="Sales"
          data={data}
          nameKey="d"
          dataKey="v"
          numberFormat={{ style: "currency", currency: "JPY" }}
        />,
        <CompactBarTrend
          key="trend"
          label="Sales"
          data={data}
          categoryKey="d"
          valueKey="v"
          numberFormat={{ style: "currency", currency: "JPY" }}
        />,
      ]) {
        const view = render(
          <AppProvider defaultLocale={locale} persist={false}>
            {chart}
          </AppProvider>,
        );
        const rows = [...view.container.querySelectorAll("ul.sr-only li")].map(
          (x) => x.textContent,
        );
        expect(rows[1]).toContain(missing);
        expect(rows[2]).toContain(missing);
        expect(rows[3]).toContain(
          new Intl.NumberFormat(locale, { style: "currency", currency: "JPY" }).format(0),
        );
        expect(view.getByRole("img").getAttribute("aria-label")).not.toMatch(/[¥￥]/);
        view.unmount();
      }
    },
  );
  it("keeps absent ratios distinct from actual zero and ignores them in the domain", () => {
    expect(
      trendRatios(
        [{ v: null }, { v: undefined }, { v: NaN }, { v: Infinity }, { v: 0 }, { v: 5 }, { v: 10 }],
        "v",
      ),
    ).toEqual([null, null, null, null, 0, 0.5, 1]);
  });
});
