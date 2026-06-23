import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";

import { AreaChart } from "../area-chart";
import { BarChart } from "../bar-chart";
import { LineChart } from "../line-chart";
import { PieChart } from "../pie-chart";
import { expectNoA11yViolations } from "@/test/a11y";

const cartesianData = [
  { month: "1月", plan: 1200, actual: 980 },
  { month: "2月", plan: 1500, actual: 1610 },
  { month: "3月", plan: 1800, actual: 1750 },
];
const series = [
  { dataKey: "plan", label: "計画" },
  { dataKey: "actual", label: "実績" },
];
const pieData = [
  { category: "給与", amount: 4200 },
  { category: "家賃", amount: 1800 },
  { category: "光熱費", amount: 600 },
];

describe("charts a11y", () => {
  it("LineChart exposes a labelled figure + role=img and has no axe violations", async () => {
    const { getByRole } = render(
      <LineChart label="月次売上" data={cartesianData} categoryKey="month" series={series} />,
    );
    expect(getByRole("figure")).toBeInTheDocument();
    // role=img carries the localized one-line summary as its accessible name.
    expect(getByRole("img", { name: /chuỗi|điểm/ })).toBeInTheDocument();
    await expectNoA11yViolations(
      <LineChart label="月次売上" data={cartesianData} categoryKey="month" series={series} curved />,
    );
  });

  it("BarChart has no axe violations (grouped, stacked, horizontal)", async () => {
    await expectNoA11yViolations(
      <BarChart label="地域別売上" data={cartesianData} categoryKey="month" series={series} />,
    );
    await expectNoA11yViolations(
      <BarChart label="構成" data={cartesianData} categoryKey="month" series={series} stacked horizontal />,
    );
  });

  it("AreaChart has no axe violations (stacked)", async () => {
    await expectNoA11yViolations(
      <AreaChart label="累積" data={cartesianData} categoryKey="month" series={series} stacked />,
    );
  });

  it("PieChart has no axe violations (pie + donut)", async () => {
    await expectNoA11yViolations(
      <PieChart label="支出内訳" data={pieData} dataKey="amount" nameKey="category" />,
    );
    await expectNoA11yViolations(
      <PieChart label="支出内訳" data={pieData} dataKey="amount" nameKey="category" donut />,
    );
  });

  it("renders an accessible empty state when data is missing", async () => {
    const { getByRole } = render(
      <LineChart label="月次売上" data={[]} categoryKey="month" series={series} />,
    );
    expect(getByRole("status")).toBeInTheDocument();
    await expectNoA11yViolations(
      <PieChart label="支出内訳" data={[]} dataKey="amount" nameKey="category" />,
    );
  });
});
