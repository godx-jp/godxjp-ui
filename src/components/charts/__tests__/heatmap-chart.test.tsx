import * as React from "react";
import { describe, expect, it } from "vitest";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AppProvider } from "@/app/app-provider";
import type { AppLocale } from "@/app/types";
import { HeatmapChart } from "../heatmap-chart";
import { buildHeatmapModel } from "../chart-summary";
import type { HeatmapDatum } from "../../../props/components/charts.prop";

/**
 * HeatmapChart (gh#1330) — a weekday × hour matrix for restaurant HQ dashboards. The browser-only
 * contract (no page overflow at 390) lives in heatmap-chart-browser-390.test.ts.
 */
const rows = [
  { key: "mon", label: "Mon" },
  { key: "tue", label: "Tue" },
  { key: "wed", label: "Wed" },
];
const columns = [
  { key: 11, label: "11" },
  { key: 12, label: "12" },
  { key: 13, label: "13" },
  { key: 14, label: "14" },
];
const data: HeatmapDatum[] = [
  { row: "mon", column: 11, value: 12000 },
  { row: "mon", column: 12, value: 48000 },
  { row: "mon", column: 13, value: 0 }, // a ZERO — a real measurement
  // mon 14 is ABSENT — no data
  { row: "tue", column: 11, value: 8000 },
  { row: "tue", column: 12, value: 36000 },
  { row: "tue", column: 13, value: null }, // explicit null — also no data
  { row: "tue", column: 14, value: 4000 },
  { row: "wed", column: 11, value: 16000 },
  { row: "wed", column: 12, value: 52000 },
  { row: "wed", column: 13, value: 20000 },
  { row: "wed", column: 14, value: Number.NaN }, // NaN — no data
];
const jpy = { style: "currency", currency: "JPY" } as const;

function renderIn(locale: AppLocale, ui: React.ReactElement) {
  return render(
    <AppProvider persist={false} defaultLocale={locale} fallbackLocale="en">
      {ui}
    </AppProvider>,
  );
}

const chart = (props: Partial<React.ComponentProps<typeof HeatmapChart>> = {}) => (
  <HeatmapChart
    label="Revenue by weekday and hour"
    rows={rows}
    columns={columns}
    data={data}
    numberFormat={jpy}
    {...props}
  />
);

/** The cell at (row label, column label), found through the table's own header semantics. */
function cell(rowLabel: string, columnIndex: number) {
  const row = screen.getByRole("rowheader", { name: rowLabel }).closest("tr")!;
  return within(row).getAllByRole("gridcell")[columnIndex]!;
}

describe("HeatmapChart: structure", () => {
  it("is a named figure holding ONE grid with column and row headers and a cell per slot", () => {
    renderIn("en", chart());
    const figure = screen.getByRole("figure", { name: "Revenue by weekday and hour" });
    const grid = within(figure).getByRole("grid", { name: "Revenue by weekday and hour" });
    // No role="img" wrapper: its descendants would be presentational and the cells unreachable.
    expect(within(figure).queryByRole("img")).toBeNull();
    expect(
      within(grid)
        .getAllByRole("columnheader")
        .map((h) => h.textContent),
    ).toEqual(["11", "12", "13", "14"]);
    expect(
      within(grid)
        .getAllByRole("rowheader")
        .map((h) => h.textContent),
    ).toEqual(["Mon", "Tue", "Wed"]);
    // 3 body rows × 4 columns, plus the header row's corner cell.
    const bodyCells = grid.querySelectorAll("tbody td");
    expect(bodyCells).toHaveLength(12);
    expect(grid.querySelectorAll("th[scope='col']")).toHaveLength(4);
    expect(grid.querySelectorAll("th[scope='row']")).toHaveLength(3);
  });

  it("steps cells through the 5-step ramp from zero to the maximum", () => {
    renderIn("en", chart());
    expect(cell("Wed", 1).dataset.step).toBe("5"); // 52,000 = max
    expect(cell("Mon", 2).dataset.step).toBe("1"); // 0 = bottom of the domain
    expect(cell("Tue", 3).dataset.step).toBe("1"); // 4,000 → 0.077 of the range
    expect(cell("Mon", 0).dataset.step).toBe("2"); // 12,000 → 0.23
  });

  it("forwards ref to the <figure>, keeps the caption as the name when it is hidden, and sizes by tier", () => {
    const ref = React.createRef<HTMLElement>();
    renderIn("en", chart({ ref, showCaption: false, size: "xs", id: "heat" }));
    expect(ref.current?.tagName).toBe("FIGURE");
    expect(ref.current?.dataset.size).toBe("xs");
    expect(ref.current?.id).toBe("heat");
    const caption = document.getElementById("heat-title")!;
    expect(caption.className).toBe("sr-only");
    expect(screen.getByRole("grid", { name: "Revenue by weekday and hour" })).toBeTruthy();
  });

  it("renders the localized empty state when there is nothing to plot", () => {
    renderIn("en", chart({ data: [] }));
    expect(screen.queryByRole("grid")).toBeNull();
    expect(screen.getByText("No data to display")).toBeTruthy();
    renderIn("en", chart({ rows: [], emptyMessage: "Nothing this week" }));
    expect(screen.getByText("Nothing this week")).toBeTruthy();
  });
});

describe("HeatmapChart: empty is not zero", () => {
  it("marks absent, null and NaN cells empty and reads them as 'No data'; a zero is filled and reads 0", () => {
    renderIn("en", chart());
    const zero = cell("Mon", 2);
    expect(zero.hasAttribute("data-empty")).toBe(false);
    expect(zero.dataset.step).toBe("1");
    expect(zero.textContent).toBe("¥0");

    for (const empty of [cell("Mon", 3), cell("Tue", 2), cell("Wed", 3)]) {
      expect(empty.hasAttribute("data-empty")).toBe(true);
      expect(empty.dataset.step).toBeUndefined();
      expect(empty.textContent).toBe("No data");
    }
  });

  it("names the no-data outline in the legend only when an empty cell exists", () => {
    const { unmount } = renderIn("en", chart());
    const legendEmpty = document.querySelector(".ui-chart-heatmap-legend-swatch[data-empty]");
    expect(legendEmpty?.parentElement?.textContent).toBe("No data");
    unmount();
    const full: HeatmapDatum[] = rows.flatMap((r) =>
      columns.map((c) => ({ row: r.key, column: c.key, value: 1 })),
    );
    renderIn("en", chart({ data: full }));
    expect(document.querySelector(".ui-chart-heatmap-legend-swatch[data-empty]")).toBeNull();
  });

  it("counts empty cells in the model and never bins them", () => {
    const model = buildHeatmapModel(rows, columns, data, 0);
    expect(model.present).toBe(9);
    expect(model.empty).toBe(3);
    expect(model.steps.size).toBe(9);
    expect(model.min).toBe(0);
    expect(model.max).toBe(52000);
  });
});

describe("HeatmapChart: Intl formatting", () => {
  it("formats cell values, the summary and the legend with the active locale (en vs ja)", () => {
    const en = renderIn("en", chart());
    expect(cell("Mon", 1).textContent).toBe(
      new Intl.NumberFormat("en", jpy).format(48000), // ¥48,000
    );
    expect(cell("Mon", 3).textContent).toBe("No data");
    const enSummary = document.querySelector("figure > p.sr-only")!.textContent;
    expect(enSummary).toContain("Heatmap, 3 × 4");
    expect(enSummary).toContain(
      `Highest: ${new Intl.NumberFormat("en", jpy).format(52000)} at Wed, 12`,
    );
    expect(screen.getByRole("list", { name: "Color scale" })).toBeTruthy();
    en.unmount();

    renderIn("ja", chart());
    const jaValue = new Intl.NumberFormat("ja", jpy).format(48000); // ￥48,000 (full-width yen)
    expect(cell("Mon", 1).textContent).toBe(jaValue);
    expect(jaValue).not.toBe(new Intl.NumberFormat("en", jpy).format(48000));
    expect(cell("Mon", 3).textContent).toBe("データなし");
    const jaSummary = document.querySelector("figure > p.sr-only")!.textContent;
    expect(jaSummary).toContain("ヒートマップ（3行×4列）");
    const ramp = screen.getByRole("list", { name: "色の濃さの凡例" });
    // Each swatch reads its own range, formatted by Intl.NumberFormat#formatRange.
    expect(within(ramp).getAllByRole("listitem")[0]!.textContent).toBe(
      new Intl.NumberFormat("ja", jpy).formatRange(0, 10400),
    );
  });
});

describe("HeatmapChart: keyboard (APG grid)", () => {
  it("has ONE tab stop and moves with arrows, Home/End and Ctrl+Home/End", async () => {
    const user = userEvent.setup();
    renderIn("en", chart());
    const grid = screen.getByRole("grid");
    const focusable = grid.querySelectorAll("[tabindex='0']");
    expect(focusable).toHaveLength(1);

    await user.tab();
    expect(document.activeElement).toBe(cell("Mon", 0));
    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(cell("Mon", 1));
    await user.keyboard("{ArrowDown}{ArrowDown}");
    expect(document.activeElement).toBe(cell("Wed", 1));
    await user.keyboard("{ArrowDown}"); // clamped at the last row
    expect(document.activeElement).toBe(cell("Wed", 1));
    await user.keyboard("{End}");
    expect(document.activeElement).toBe(cell("Wed", 3));
    await user.keyboard("{Home}");
    expect(document.activeElement).toBe(cell("Wed", 0));
    await user.keyboard("{ArrowLeft}"); // clamped at the first column
    expect(document.activeElement).toBe(cell("Wed", 0));
    await user.keyboard("{Control>}{Home}{/Control}");
    expect(document.activeElement).toBe(cell("Mon", 0));
    await user.keyboard("{Control>}{End}{/Control}");
    expect(document.activeElement).toBe(cell("Wed", 3));

    // The roving tab stop follows focus: still exactly one, on the active cell.
    expect(grid.querySelectorAll("[tabindex='0']")).toHaveLength(1);
    expect(cell("Wed", 3).tabIndex).toBe(0);
    // Tab leaves the grid in one press.
    await user.tab();
    expect(grid.contains(document.activeElement)).toBe(false);
  });

  it("mirrors the horizontal arrows under RTL", async () => {
    const user = userEvent.setup();
    renderIn("en", <div dir="rtl">{chart()}</div>);
    const grid = screen.getByRole("grid");
    // jsdom does not compute `direction` from `dir`, so state it the way a stylesheet would.
    grid.style.direction = "rtl";
    await user.tab();
    await user.keyboard("{ArrowLeft}");
    expect(document.activeElement).toBe(cell("Mon", 1));
    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(cell("Mon", 0));
  });

  it("opens the cell tooltip on keyboard focus and closes it with Escape", async () => {
    const user = userEvent.setup();
    renderIn("en", chart());
    await user.tab();
    await user.keyboard("{ArrowRight}");
    const tooltip = await screen.findByRole("tooltip");
    expect(tooltip.textContent).toContain("Mon, 12: ¥48,000");
    await user.keyboard("{Escape}");
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 250));
    });
    expect(screen.queryByRole("tooltip")).toBeNull();
    // Escape dismissed the tooltip without moving focus out of the grid.
    expect(document.activeElement).toBe(cell("Mon", 1));
  });
});

describe("HeatmapChart: top-N emphasis", () => {
  it("rings the N highest cells and says so in text, not colour alone", async () => {
    const user = userEvent.setup();
    renderIn("en", chart({ topN: 2 }));
    const emphasized = [...document.querySelectorAll("td[data-emphasized]")];
    expect(emphasized).toEqual([cell("Mon", 1), cell("Wed", 1)]);
    expect(cell("Wed", 1).textContent).toBe("¥52,000, Top 1");
    expect(cell("Mon", 1).textContent).toBe("¥48,000, Top 2");
    expect(cell("Tue", 1).textContent).toBe("¥36,000");
    // The legend names the ring.
    const legendTop = document.querySelector(".ui-chart-heatmap-legend-swatch[data-emphasized]");
    expect(legendTop?.parentElement?.textContent).toBe("Top 2");
    // …and the tooltip repeats the rank.
    await user.tab();
    await user.keyboard("{ArrowRight}");
    expect((await screen.findByRole("tooltip")).textContent).toContain("Top 2");
  });

  it("emphasizes nothing without topN, and ignores a non-positive or fractional topN", () => {
    for (const topN of [undefined, 0, -1, 1.5]) {
      const { unmount } = renderIn("en", chart({ topN }));
      expect(document.querySelectorAll("[data-emphasized]")).toHaveLength(0);
      unmount();
    }
  });

  it("breaks ties by data order", () => {
    const tied: HeatmapDatum[] = [
      { row: "mon", column: 11, value: 5 },
      { row: "tue", column: 11, value: 9 },
      { row: "wed", column: 11, value: 9 },
    ];
    const model = buildHeatmapModel(rows, columns, tied, 1);
    expect([...model.ranks.keys()]).toEqual(["tue\u000011"]);
  });
});

describe("HeatmapChart: text alternative", () => {
  it("describes the figure with a one-line summary plus the caller's description", () => {
    renderIn("en", chart({ description: "Last 4 weeks, tax included." }));
    const figure = screen.getByRole("figure");
    const desc = document.getElementById(figure.getAttribute("aria-describedby")!)!;
    expect(desc.textContent).toBe(
      "Last 4 weeks, tax included. Heatmap, 3 × 4 Highest: ¥52,000 at Wed, 12",
    );
  });

  it("gives every body cell its value as text, read with its row and column headers", () => {
    renderIn("en", chart());
    const grid = screen.getByRole("grid");
    const texts = [...grid.querySelectorAll("tbody tr")].map((tr) =>
      [
        tr.querySelector("th")!.textContent,
        ...[...tr.querySelectorAll("td")].map((td) => td.textContent),
      ].join(" | "),
    );
    expect(texts).toEqual([
      "Mon | ¥12,000 | ¥48,000 | ¥0 | No data",
      "Tue | ¥8,000 | ¥36,000 | No data | ¥4,000",
      "Wed | ¥16,000 | ¥52,000 | ¥20,000 | No data",
    ]);
  });

  it("gives the legend ramp one readable range per swatch", () => {
    renderIn("en", chart());
    const ramp = screen.getByRole("list", { name: "Color scale" });
    const items = within(ramp)
      .getAllByRole("listitem")
      .map((li) => li.textContent);
    const f = new Intl.NumberFormat("en", jpy);
    expect(items).toEqual([
      f.formatRange(0, 10400),
      f.formatRange(10400, 20800),
      f.formatRange(20800, 31200),
      f.formatRange(31200, 41600),
      f.formatRange(41600, 52000),
    ]);
  });
});
