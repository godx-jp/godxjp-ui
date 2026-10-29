import { describe, expect, it } from "vitest";
import { renderWithUi } from "@/test/render";
import { RadarChart } from "../radar-chart";
const data = Array.from({ length: 6 }, (_, i) => ({ axis: `Axis ${i + 1}`, value: (i % 3) + 1 }));
describe("RadarChart shared-scale and data-truth contract", () => {
  it("names the figure and exposes exact values outside the decorative SVG", () => {
    const { container, getByRole } = renderWithUi(
      <RadarChart
        data={data}
        categoryKey="axis"
        valueKey="value"
        valueMax={3}
        valueTicks={[1, 2, 3]}
        label="Plan"
      />,
    );
    expect(getByRole("figure", { name: "Plan" })).toBeTruthy();
    expect(container.querySelector("ul")).toHaveTextContent("Axis 6: 3");
    expect(container.querySelectorAll('[data-slot="radar-area"]')).toHaveLength(1);
  });
  it("does not turn an unanswered axis into zero or plot an out-of-domain value", () => {
    for (const value of [null, undefined, NaN, -1, 4]) {
      const { container, unmount, getByText } = renderWithUi(
        <RadarChart
          data={[...data.slice(0, 5), { axis: "Missing", value }]}
          categoryKey="axis"
          valueKey="value"
          valueMax={3}
          label="Plan"
          emptyMessage="Not ready"
        />,
      );
      expect(container.querySelector('[data-slot="radar-area"]')).toBeNull();
      expect(getByText("Not ready")).toBeTruthy();
      unmount();
    }
  });
  it("accepts verified zeroes but rejects misleading axis counts or invalid ceilings", () => {
    const { container } = renderWithUi(
      <RadarChart
        data={data.map((d) => ({ ...d, value: 0 }))}
        categoryKey="axis"
        valueKey="value"
        valueMax={3}
        label="Zero"
      />,
    );
    expect(container.querySelector('[data-slot="radar-area"]')).toBeTruthy();
    for (const length of [0, 1, 2, 7]) {
      const { container, unmount } = renderWithUi(
        <RadarChart
          data={Array.from({ length }, () => data[0])}
          categoryKey="axis"
          valueKey="value"
          valueMax={3}
          label="Bad"
        />,
      );
      expect(container.querySelector('[data-slot="radar-area"]')).toBeNull();
      unmount();
    }
  });
});

describe("Radar boundaries and localized truth", () => {
  it.each([
    ["two axes", data.slice(0, 2), 3],
    ["seven axes", [...data, data[0]], 3],
    ["above maximum", [{ ...data[0], value: 4 }, ...data.slice(1)], 3],
    ["negative", [{ ...data[0], value: -1 }, ...data.slice(1)], 3],
    ["NaN", [{ ...data[0], value: NaN }, ...data.slice(1)], 3],
    ["missing", [{ axis: "Missing" }, ...data.slice(1)], 3],
    ["zero ceiling", data, 0],
    ["negative ceiling", data, -3],
    ["infinite ceiling", data, Infinity],
  ])("shows empty state for %s", (_, rows, maximum) => {
    const { queryByRole, getByText, container } = renderWithUi(
      <RadarChart
        data={rows}
        categoryKey="axis"
        valueKey="value"
        valueMax={maximum}
        label="Plan"
        emptyMessage="Incomplete"
      />,
    );
    expect(getByText("Incomplete")).toBeVisible();
    expect(queryByRole("list")).toBeNull();
    expect(container.querySelector('[data-slot="radar-plot"]')).toBeNull();
  });
  it("keeps exact localized decimals in each summary row", () => {
    const { container, getByRole } = renderWithUi(
      <RadarChart
        data={data.slice(0, 3).map((d, i) => ({ ...d, value: 1234.56789 + i }))}
        categoryKey="axis"
        valueKey="value"
        valueMax={2000}
        label="Plan"
      />,
    );
    const rows = container.querySelectorAll("li");
    expect(rows).toHaveLength(3);
    rows.forEach((row, i) =>
      expect(row).toHaveTextContent(
        `Axis ${i + 1}: ${new Intl.NumberFormat("vi", { maximumSignificantDigits: 21 }).format(1234.56789 + i)}`,
      ),
    );
    expect(getByRole("img")).toHaveAttribute(
      "aria-label",
      expect.stringContaining(new Intl.NumberFormat("vi").format(2000)),
    );
  });
  it("drops ticks outside the positive common domain", () => {
    const { container } = renderWithUi(
      <RadarChart
        data={data}
        categoryKey="axis"
        valueKey="value"
        valueMax={3}
        valueTicks={[-1, 0, 1, 3, 4, NaN, Infinity]}
        label="Plan"
      />,
    );
    const grid = container.querySelectorAll('polygon[fill="none"]');
    expect(grid).toHaveLength(2);
    expect(
      Array.from(container.querySelectorAll('[data-slot="radar-tick"]')).map((n) => n.textContent),
    ).toEqual(["1", "3"]);
  });
});
