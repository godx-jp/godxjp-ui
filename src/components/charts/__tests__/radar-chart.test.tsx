import { describe, expect, it } from "vitest";
import { renderWithUi } from "@/test/render";
import { RadarChart } from "../radar-chart";
const data = Array.from({ length: 6 }, (_, i) => ({ axis: `Axis ${i + 1}`, value: (i % 3) + 1 }));
describe("RadarChart shared-scale and data-truth contract", () => {
  it("names the figure and exposes exact values outside the decorative SVG", () => {
    const { container, getByRole, getByText } = renderWithUi(
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
    expect(getByText("Axis 6: 3")).toBeTruthy();
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
