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
const barProps: Array<{ onClick?: (entry: unknown, index: number) => void; background?: unknown }> =
  [];
vi.mock("../recharts-peer", async (importOriginal) => {
  const real = await importOriginal<typeof import("../recharts-peer")>();
  const recorder = (name: string) =>
    function Recorder(props: { onClick?: (state: unknown) => void; children?: React.ReactNode }) {
      clicks[name] = props.onClick;
      return <>{props.children}</>;
    };
  return {
    ...real,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => children,
    Bar: (props: (typeof barProps)[number]) => {
      barProps.push(props);
      return null;
    },
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

const lastBar = () => barProps[barProps.length - 1];

describe("cartesian charts · onCategoryClick", () => {
  it.each([
    ["line", LineChart],
    ["area", AreaChart],
  ] as const)("%s: a chart-level click on category i reports data[i] and i", (name, Chart) => {
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

  it("line: a click outside every category is ignored (Number(null) is 0)", () => {
    const onCategoryClick = vi.fn();
    render(
      <LineChart
        label="c"
        data={data}
        series={series}
        categoryKey="at"
        onCategoryClick={onCategoryClick}
      />,
    );
    clicks.line?.({ activeTooltipIndex: null });
    clicks.line?.(null);
    clicks.line?.({ activeTooltipIndex: 9 });
    expect(onCategoryClick).not.toHaveBeenCalled();
  });

  it("bar: the click comes from the bar with its own index, never from tooltip state", () => {
    const onCategoryClick = vi.fn();
    barProps.length = 0;
    const { container } = render(
      <BarChart
        label="c"
        data={data}
        series={[series[0], { dataKey: "n", label: "M" }]}
        categoryKey="at"
        stacked
        onCategoryClick={onCategoryClick}
      />,
    );
    expect(clicks.bar).toBeUndefined();
    // Every series draws a full-height hit column (recharts skips zero-height entries per series).
    expect(barProps.map((b) => b.background)).toEqual([
      { fill: "transparent" },
      { fill: "transparent" },
    ]);
    barProps[1].onClick?.({}, 2);
    expect(onCategoryClick).toHaveBeenCalledWith(data[2], 2);
    expect(container.querySelector(".ui-chart-clickable")).not.toBeNull();
  });

  it("without the prop the chart is not clickable", () => {
    barProps.length = 0;
    const { container } = render(
      <BarChart label="c" data={data} series={series} categoryKey="at" />,
    );
    expect(lastBar().onClick).toBeUndefined();
    expect(lastBar().background).toBeUndefined();
    expect(container.querySelector(".ui-chart-clickable")).toBeNull();
  });
});
