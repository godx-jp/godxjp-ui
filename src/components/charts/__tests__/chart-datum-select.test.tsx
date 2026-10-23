import userEvent from "@testing-library/user-event";
import { useChartDatumSelection } from "../chart-datum-selection";
import { AppProvider } from "../../../app/app-provider";
import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HeatmapChart } from "../heatmap-chart";

// Regression #1398: keyboard navigation alone did not let a heatmap filter a dashboard.
describe("chart datum selection", () => {
  it("selects a present heatmap cell with Enter, Space and pointer, never an empty cell", () => {
    const onDatumSelect = vi.fn();
    const datum = { row: "mon", column: "am", value: 1000 };
    const { getAllByRole } = render(
      <AppProvider defaultLocale="en" persist={false}>
        <HeatmapChart
          label="Revenue"
          rows={[{ key: "mon", label: "Monday" }]}
          columns={[
            { key: "am", label: "Morning" },
            { key: "pm", label: "Evening" },
          ]}
          data={[datum]}
          onDatumSelect={onDatumSelect}
        />
      </AppProvider>,
    );
    const [cell, empty] = getAllByRole("gridcell");
    fireEvent.keyDown(cell!, { key: "Enter" });
    expect(onDatumSelect).toHaveBeenLastCalledWith(datum, { seriesKey: "am", index: 0 });
    fireEvent.keyDown(cell!, { key: " " });
    fireEvent.click(cell!);
    expect(onDatumSelect).toHaveBeenCalledTimes(3);
    fireEvent.click(empty!);
    fireEvent.keyDown(empty!, { key: "Enter" });
    expect(onDatumSelect).toHaveBeenCalledTimes(3);
  });
});

// SVG marks use the same navigation helper as the real recharts shapes, with no layout mock.

function Marks({
  onSelect,
  count = 3,
}: {
  onSelect: (index: number, series: number) => void;
  count?: number;
}) {
  const points = Array.from({ length: 2 }, (_, series) =>
    Array.from({ length: count }, (_, index) => ({ index, series })),
  ).flat();
  const props = useChartDatumSelection(points);
  return (
    <div className="ui-chart-canvas">
      <svg>
        {points.map(({ index, series }) => (
          <g
            key={`${series}:${index}`}
            {...props(index, series, `${series}:${index}`, () => onSelect(index, series))}
          >
            <circle r={5} />
          </g>
        ))}
      </svg>
    </div>
  );
}

it("moves by category/series, supports Home/End, keeps one tab stop and leaves with Tab", async () => {
  const user = userEvent.setup();
  const select = vi.fn();
  const { getByRole, getAllByRole, rerender } = render(<Marks onSelect={select} />);
  await user.tab();
  expect(getByRole("button", { name: "0:0" })).toHaveFocus();
  await user.keyboard("{ArrowRight}{ArrowDown}{Enter}");
  expect(select).toHaveBeenLastCalledWith(1, 1);
  await user.keyboard("{End} ");
  expect(select).toHaveBeenLastCalledWith(2, 1);
  await user.keyboard("{Home}{ArrowUp}");
  expect(getByRole("button", { name: "0:0" })).toHaveFocus();
  expect(getAllByRole("button").filter((mark) => mark.tabIndex === 0)).toHaveLength(1);
  await user.tab();
  expect(document.activeElement).toBe(document.body);
  rerender(<Marks count={1} onSelect={select} />);
  expect(getAllByRole("button").filter((mark) => mark.tabIndex === 0)).toHaveLength(1);
});

it("leaves heatmap cells non-selectable without a callback and skips non-finite data", async () => {
  const select = vi.fn();
  const props = {
    label: "Heat",
    rows: [{ key: "r", label: "Row" }],
    columns: [{ key: "c", label: "Column" }],
    data: [{ row: "r", column: "c", value: 0 }],
  };
  const { getByRole, rerender } = render(
    <AppProvider defaultLocale="en" persist={false}>
      <HeatmapChart {...props} />
    </AppProvider>,
  );
  expect(getByRole("gridcell")).not.toHaveAttribute("data-interactive");
  rerender(
    <AppProvider defaultLocale="en" persist={false}>
      <HeatmapChart
        {...props}
        data={[{ row: "r", column: "c", value: NaN }, ...props.data]}
        onDatumSelect={select}
      />
    </AppProvider>,
  );
  await userEvent.click(getByRole("gridcell"));
  expect(select).toHaveBeenLastCalledWith(props.data[0], { seriesKey: "c", index: 1 });
});
