import { readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { chromium } from "playwright";

import { AreaChart } from "../area-chart";
import { BarChart } from "../bar-chart";
import { LineChart } from "../line-chart";

/**
 * gh#865 — the cartesian series had five constants nobody could reach.
 *
 * `chart-cartesian.tsx` wrote `strokeWidth={2}`, `fillOpacity={0.2}` and `strokeDasharray="3 3"`
 * as recharts PRESENTATION ATTRIBUTES, and an area's fill was forced to the same colour as its
 * line. Together with a value axis that could not be given a domain or a tick list, a screen that
 * needed a specific chart had exactly two ways out — raw recharts, or CSS selectors into generated
 * chart DOM — and both are what cardinal rules #44/#45 exist to stop.
 *
 * The split the fix makes, and the reason it is a split at all:
 *
 *   THEME (component tokens, src/tokens/components/chart.css) — stroke weight, fill density,
 *   grid dash. House style, set once, identical on every chart in the service.
 *
 *   SCREEN (props) — `series[].fillColor`, `valueDomain`, `valueTicks`, `showDots`. A fill colour
 *   and an axis crop carry MEANING about the one data set being plotted; a theme that set them
 *   globally would be making a claim about data it has never seen.
 *
 * WHY THE CSS HALF NEEDS A BROWSER. jsdom returns "" for every custom property and does not run
 * the cascade, so an assertion on `getComputedStyle` there passes on a stylesheet that declares
 * nothing at all. And the scope has to be a `<div>`, never `<html>`: a `:root` binding is
 * re-evaluated on `<html>` and hides the freeze the whole `initial` rule is about (gh#848).
 */

const REPO = process.cwd();
const chartTokens = readFileSync(join(REPO, "src/tokens/components/chart.css"), "utf8");
const chartLayout = readFileSync(join(REPO, "src/styles/chart-layout.css"), "utf8");
const cartesianSource = readFileSync(
  join(REPO, "src/components/charts/chart-cartesian.tsx"),
  "utf8",
);

const stripComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, "");

/** The three theme knobs, with the value the removed presentation attribute carried. */
const KNOBS = [
  ["--chart-series-stroke-width", "2"],
  ["--chart-area-fill-alpha", "0.2"],
  ["--chart-grid-line-dash", "3 3"],
] as const;

describe("chart series knobs (gh#865) — the token graph", () => {
  it.each(KNOBS)("declares %s at :root with the old attribute's value (%s)", (token, value) => {
    expect(stripComments(chartTokens)).toMatch(
      new RegExp(`${token}:\\s*${value.replace(/\s+/g, "\\s+")};`),
    );
  });

  it.each(KNOBS)("reads %s at a call site in chart-layout.css", (token) => {
    expect(stripComments(chartLayout)).toMatch(new RegExp(`var\\(\\s*${token}\\s*\\)`));
  });

  it.each([
    ["strokeWidth={2}", "--chart-series-stroke-width"],
    ["fillOpacity={0.2}", "--chart-area-fill-alpha"],
    ['strokeDasharray="3 3"', "--chart-grid-line-dash"],
  ])("no longer hard-codes %s (it is %s now)", (literal) => {
    expect(stripComments(cartesianSource)).not.toContain(literal);
  });
});

/**
 * recharts measures its own container, and jsdom reports 0x0 for everything — which is why
 * charts.test.tsx can only assert the FRAME. Feeding it a size is the whole difference between
 * "the caption rendered" and "the marks carry the props", so the stub stays local to this file.
 */
beforeAll(() => {
  class SizedResizeObserver {
    constructor(private readonly cb: ResizeObserverCallback) {}
    observe(target: Element) {
      this.cb(
        [{ target, contentRect: { width: 600, height: 300 } } as unknown as ResizeObserverEntry],
        this as unknown as ResizeObserver,
      );
    }
    unobserve() {}
    disconnect() {}
  }
  globalThis.ResizeObserver = SizedResizeObserver as unknown as typeof ResizeObserver;
  for (const prop of ["offsetWidth", "clientWidth"]) {
    Object.defineProperty(HTMLElement.prototype, prop, { value: 600, configurable: true });
  }
  for (const prop of ["offsetHeight", "clientHeight"]) {
    Object.defineProperty(HTMLElement.prototype, prop, { value: 300, configurable: true });
  }
});

const DATA = [
  { m: "a", v: 1 },
  { m: "b", v: 2 },
];

const yTickText = (container: HTMLElement) =>
  [...container.querySelectorAll(".recharts-yAxis-tick-labels text")].map((t) => t.textContent);
const xTickText = (container: HTMLElement) =>
  [...container.querySelectorAll(".recharts-xAxis-tick-labels text")].map((t) => t.textContent);

describe("chart series knobs (gh#865) — the props", () => {
  it("AreaChart paints series[].fillColor on the band and series[].color on the line", () => {
    const { container } = render(
      <AreaChart
        label="price"
        data={DATA}
        categoryKey="m"
        series={[{ dataKey: "v", color: "#B84000", fillColor: "#FF6B1A" }]}
      />,
    );
    expect(container.querySelector(".recharts-area-area")?.getAttribute("fill")).toBe("#FF6B1A");
    expect(container.querySelector(".recharts-area-curve")?.getAttribute("stroke")).toBe("#B84000");
  });

  it("without fillColor the band keeps the line's colour — the default is unchanged", () => {
    const { container } = render(
      <AreaChart
        label="price"
        data={DATA}
        categoryKey="m"
        series={[{ dataKey: "v", color: "#B84000" }]}
      />,
    );
    expect(container.querySelector(".recharts-area-area")?.getAttribute("fill")).toBe("#B84000");
    expect(container.querySelector(".recharts-area-curve")?.getAttribute("stroke")).toBe("#B84000");
  });

  it("valueDomain + valueTicks crop and label the VALUE axis of a vertical chart", () => {
    const { container } = render(
      <LineChart
        label="price"
        data={DATA}
        categoryKey="m"
        series={[{ dataKey: "v" }]}
        valueDomain={[0, 5]}
        valueTicks={[0, 2, 5]}
      />,
    );
    expect(yTickText(container)).toEqual(["0", "2", "5"]);
  });

  it("…and the VALUE axis of a horizontal bar chart is x, so the same props land there", () => {
    const { container } = render(
      <BarChart
        label="price"
        data={DATA}
        categoryKey="m"
        series={[{ dataKey: "v" }]}
        horizontal
        valueDomain={[0, 5]}
        valueTicks={[0, 2, 5]}
      />,
    );
    expect(xTickText(container)).toEqual(["0", "2", "5"]);
  });

  it("omitting them leaves recharts' own scaling alone (2 and 5 are not its choice)", () => {
    const { container } = render(
      <LineChart label="price" data={DATA} categoryKey="m" series={[{ dataKey: "v" }]} />,
    );
    expect(yTickText(container)).not.toEqual(["0", "2", "5"]);
  });

  it("showDots draws one marker per point; the default draws none", () => {
    const withDots = render(
      <LineChart label="p" data={DATA} categoryKey="m" series={[{ dataKey: "v" }]} showDots />,
    );
    expect(withDots.container.querySelectorAll(".recharts-line-dot")).toHaveLength(2);

    const bare = render(
      <LineChart label="p" data={DATA} categoryKey="m" series={[{ dataKey: "v" }]} />,
    );
    expect(bare.container.querySelectorAll(".recharts-line-dot")).toHaveLength(0);
  });
});

/** Exactly the stylesheets the preview loads for a chart, in load order. */
function browserStylesheet(): string {
  return [
    "src/tokens/foundation.css",
    "src/tokens/derived.css",
    "src/tokens/axes.css",
    "src/tokens/components/chart.css",
    "src/styles/chart-layout.css",
  ]
    .map((p) => readFileSync(join(REPO, p), "utf8"))
    .join("\n");
}

/**
 * The shape recharts actually emits, copied from a rendered AreaChart: the fill path and the top
 * line are SIBLINGS with different classes, which is the only reason a fill can be tuned without
 * touching the stroke.
 */
const CHART = (id: string) => `
  <figure class="ui-chart" id="${id}">
    <div class="ui-chart-canvas">
      <svg class="recharts-surface" width="600" height="300">
        <g class="recharts-cartesian-grid">
          <g class="recharts-cartesian-grid-horizontal">
            <line x1="0" y1="10" x2="600" y2="10" stroke="#000" />
          </g>
        </g>
        <g class="recharts-layer recharts-area">
          <path class="recharts-curve recharts-area-area" stroke="none" fill="#FF6B1A" d="M0,0" />
          <path class="recharts-curve recharts-area-curve" fill="none" stroke="#B84000" d="M0,0" />
        </g>
      </svg>
    </div>
  </figure>`;

describe("chart series knobs (gh#865) — Chromium, under a SCOPED theme", () => {
  it("defaults match the removed attributes, and a scoped override reaches only its own subtree", async () => {
    const css = browserStylesheet();
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    // The override is on a `<div>`, NOT on `<html>`. A knob that only works at the root is the
    // gh#848 defect, and this is the arrangement that tells the two apart.
    await page.setContent(
      `<!doctype html><html><head><style>${css}</style></head><body>
         ${CHART("plain")}
         <div data-tenant="acme" style="--chart-series-stroke-width: 4; --chart-area-fill-alpha: 0.07; --chart-grid-line-dash: none;">
           ${CHART("scoped")}
         </div>
       </body></html>`,
    );

    const read = (id: string) =>
      page.evaluate((id: string) => {
        const fig = document.getElementById(id)!;
        const get = (sel: string, prop: string) =>
          getComputedStyle(fig.querySelector(sel)!).getPropertyValue(prop);
        return {
          strokeWidth: get(".recharts-area-curve", "stroke-width"),
          fillOpacity: get(".recharts-area-area", "fill-opacity"),
          gridDash: get(".recharts-cartesian-grid line", "stroke-dasharray"),
        };
      }, id);

    const plain = await read("plain");
    const scoped = await read("scoped");
    await browser.close();

    // Byte-for-byte what `strokeWidth={2}` / `fillOpacity={0.2}` / `strokeDasharray="3 3"` painted.
    expect(plain).toEqual({ strokeWidth: "2px", fillOpacity: "0.2", gridDash: "3px, 3px" });

    // The scope moves all three — and nothing leaked back up to the chart beside it.
    expect(scoped).toEqual({ strokeWidth: "4px", fillOpacity: "0.07", gridDash: "none" });
  });
});
