import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";

/**
 * `onCategoryClick` — drill-down / zoom-to-bucket on a cartesian chart.
 *
 * jsdom lays nothing out, so recharts never draws a surface to click. What this pins is the part
 * the library owns: the chart-level click recharts reports (`activeTooltipIndex` = the category
 * under the pointer) is turned into the consumer's datum + index, and a click outside every
 * category is ignored. The recharts chart roots are replaced by recorders for that reason only.
 */
const clicks: Record<string, ((state: unknown) => void) | undefined> = {};
vi.mock("../recharts-peer", async (importOriginal) => {
  const real = await importOriginal<typeof import("../recharts-peer")>();
  const recorder = (name: string) =>
    function Recorder(props: { onClick?: (state: unknown) => void }) {
      clicks[name] = props.onClick;
      return null;
    };
  return {
    ...real,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => children,
    BarChart: recorder("bar"),
    LineChart: recorder("line"),
    AreaChart: recorder("area"),
  };
});

const { BarChart } = await import("../bar-chart");
const { LineChart } = await import("../line-chart");
const { AreaChart } = await import("../area-chart");

const data = [
  { at: "10:00", n: 1 },
  { at: "10:05", n: 0 },
  { at: "10:10", n: 7 },
];
const series = [{ dataKey: "n", label: "N" }];

describe("cartesian charts · onCategoryClick", () => {
  it.each([
    ["bar", BarChart],
    ["line", LineChart],
    ["area", AreaChart],
  ] as const)("%s: a click on category i reports data[i] and i", (name, Chart) => {
    const onCategoryClick = vi.fn();
    const { container } = render(
      <Chart
        label="c"
        data={data}
        series={series}
        categoryKey="at"
        onCategoryClick={onCategoryClick}
      />,
    );
    clicks[name]?.({ activeTooltipIndex: "1" });
    expect(onCategoryClick).toHaveBeenCalledWith(data[1], 1);
    expect(container.querySelector(".ui-chart-clickable")).not.toBeNull();
  });

  it("ignores a click outside every category", () => {
    const onCategoryClick = vi.fn();
    render(
      <BarChart
        label="c"
        data={data}
        series={series}
        categoryKey="at"
        onCategoryClick={onCategoryClick}
      />,
    );
    clicks.bar?.({ activeTooltipIndex: null });
    clicks.bar?.(null);
    clicks.bar?.({ activeTooltipIndex: 9 });
    expect(onCategoryClick).not.toHaveBeenCalled();
  });

  it("without the prop the chart is not clickable", () => {
    const { container } = render(
      <BarChart label="c" data={data} series={series} categoryKey="at" />,
    );
    expect(clicks.bar).toBeUndefined();
    expect(container.querySelector(".ui-chart-clickable")).toBeNull();
  });
});
