import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";

import { LineChart } from "../line-chart";

/**
 * caimono 33.30.7-caimono.1 — `textAlternative` replaces the per-point screen-reader list.
 *
 * A price history must not be handed out day by day as text (the page owner's rule: scrapers read
 * the sr-only list as easily as a screen reader does). The caller gives the few figures a reader
 * needs; the list of every plotted value is then not rendered at all — not hidden, absent.
 */
const data = [
  { day: "11/01", low: 1200 },
  { day: "11/02", low: 1100 },
  { day: "11/03", low: 1150 },
];

describe("LineChart textAlternative", () => {
  it("without it, every plotted value is listed (the WCAG 1.1.1 default stays)", () => {
    const { container } = render(
      <LineChart
        label="Price"
        data={data}
        categoryKey="day"
        series={[{ dataKey: "low", label: "Low" }]}
      />,
    );
    expect(container.querySelectorAll("figure ul.sr-only li")).toHaveLength(3);
  });

  it("with it, the per-point list is gone and the caller's text names the plot", () => {
    const { container } = render(
      <LineChart
        label="Price"
        data={data}
        categoryKey="day"
        series={[{ dataKey: "low", label: "Low" }]}
        textAlternative="Lowest ¥1,100 (11/02)"
      />,
    );
    expect(container.querySelector("figure ul")).toBeNull();
    expect(container.querySelector(".ui-chart-canvas")!.getAttribute("aria-label")).toBe(
      "Lowest ¥1,100 (11/02)",
    );
    expect(container.textContent).toContain("Lowest ¥1,100 (11/02)");
    expect(container.textContent).not.toContain("1,150");
  });
});
