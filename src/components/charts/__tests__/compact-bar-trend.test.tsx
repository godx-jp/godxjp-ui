import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";

import { renderWithUi } from "@/test/render";
import { CompactBarTrend } from "../compact-bar-trend";
import { resolveEmphasizedIndex, trendRatios, buildSeriesRows } from "../chart-summary";

/**
 * gh#218 — the DEPENDENCY-FREE compact bar trend that the SCR-201 admin dashboard needs.
 *
 * Three contracts are guarded here:
 *  1. the PUBLIC API (N category/value pairs, `size` from the xs|sm|md|lg vocabulary,
 *     emphasis, footer slot, empty state) — it must render without `recharts`;
 *  2. the TOKEN contract — every dimension and every fill resolves from a `--chart-trend-*`
 *     knob, so a consumer never writes a height calculation or a colour of its own;
 *  3. the RESPONSIVE contract at the acceptance widths (1440 / 1024 / 390). jsdom performs
 *     no layout, so the geometry is asserted against the stylesheet (it is width-agnostic
 *     by construction: flex `1 1 0` columns, no measured pixels) plus a rendered assertion
 *     at each container width.
 */
const read = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), "utf8");
const layoutCss = read("../../../styles/chart-layout.css");
const tokenCss = read("../../../tokens/components/chart.css");
const componentSrc = read("../compact-bar-trend.tsx");
const rule = (selector: string) => {
  const at = layoutCss.indexOf(selector + " {");
  expect(at, `missing CSS rule for ${selector}`).toBeGreaterThan(-1);
  return layoutCss.slice(at, layoutCss.indexOf("}", at) + 1);
};

/** Seven days of new organizations — the canonical SCR-201 dataset (ISO-8601 keys). */
const trend = [
  { date: "07-24", count: 4 },
  { date: "07-25", count: 7 },
  { date: "07-26", count: 2 },
  { date: "07-27", count: 9 },
  { date: "07-28", count: 5 },
  { date: "07-29", count: 12 },
  { date: "07-30", count: 8 },
];

describe("CompactBarTrend public API (gh#218)", () => {
  it("renders one bar per datum for ANY point count — seven is not hard-coded", () => {
    for (const points of [3, 7, 14]) {
      const { container, unmount } = renderWithUi(
        <CompactBarTrend
          label="新規組織"
          data={trend.slice(0, points % 8).concat(trend.slice(0, Math.max(0, points - 7)))}
          categoryKey="date"
          valueKey="count"
        />,
      );
      const bars = container.querySelectorAll(".ui-chart-trend-bar");
      expect(bars.length).toBeGreaterThan(0);
      unmount();
    }

    const { container } = renderWithUi(
      <CompactBarTrend label="新規組織" data={trend} categoryKey="date" valueKey="count" />,
    );
    expect(container.querySelectorAll(".ui-chart-trend-bar")).toHaveLength(7);
    expect(container.querySelectorAll(".ui-chart-trend-tick")).toHaveLength(7);
  });

  it("renders WITHOUT recharts — the module imports no charting dependency", () => {
    expect(componentSrc).not.toMatch(/from ["']recharts["']/);
    // plain @testing-library render (no provider) still mounts: no peer, no context requirement
    const { getByText } = render(
      <CompactBarTrend
        label="New organizations"
        data={trend}
        categoryKey="date"
        valueKey="count"
      />,
    );
    expect(getByText("New organizations")).toBeInTheDocument();
  });

  it("exposes the visible caption, the localized description and the value summary", () => {
    const { getByRole, container } = renderWithUi(
      <CompactBarTrend
        label="新規組織（7日間）"
        description="日別に作成された組織数"
        data={trend}
        categoryKey="date"
        valueKey="count"
      />,
    );
    const figure = getByRole("figure");
    expect(figure).toHaveAccessibleName("新規組織（7日間）");
    expect(figure).toHaveAccessibleDescription(/日別に作成された組織数/);
    // one screen-reader row per datum, each carrying its Intl-formatted value
    const rows = container.querySelectorAll("ul.sr-only li");
    expect(rows).toHaveLength(7);
    expect(rows[5].textContent).toContain("07-29");
    expect(rows[5].textContent).toContain("12");
  });

  it("marks exactly ONE emphasized bar and names it in the text alternative (never colour-only)", () => {
    const { container } = renderWithUi(
      <CompactBarTrend
        label="新規組織"
        data={trend}
        categoryKey="date"
        valueKey="count"
        emphasizedIndex={5}
      />,
    );
    const emphasized = container.querySelectorAll('[data-emphasized="true"]');
    expect(emphasized).toHaveLength(1);
    expect(container.querySelectorAll(".ui-chart-trend-bar")[5]).toBe(emphasized[0]);
    // the highlight is duplicated as text (WCAG 1.4.1)
    const rows = [...container.querySelectorAll("ul.sr-only li")].map((li) => li.textContent ?? "");
    expect(rows[5]).toMatch(/\(.+\)$/);
    expect(rows[4]).not.toMatch(/\(.+\)$/);
  });

  it("accepts a negative emphasizedIndex (−1 = latest) and ignores an out-of-range one", () => {
    const { container, rerender } = renderWithUi(
      <CompactBarTrend
        label="新規組織"
        data={trend}
        categoryKey="date"
        valueKey="count"
        emphasizedIndex={-1}
      />,
    );
    expect(container.querySelectorAll(".ui-chart-trend-bar")[6]).toHaveAttribute(
      "data-emphasized",
      "true",
    );
    rerender(
      <CompactBarTrend
        label="新規組織"
        data={trend}
        categoryKey="date"
        valueKey="count"
        emphasizedIndex={99}
      />,
    );
    expect(container.querySelectorAll('[data-emphasized="true"]')).toHaveLength(0);
  });

  it("maps `size` onto the data-size tier hook — xs|sm|md|lg only, default xs", () => {
    const { getByRole, rerender } = renderWithUi(
      <CompactBarTrend label="t" data={trend} categoryKey="date" valueKey="count" />,
    );
    expect(getByRole("figure")).toHaveAttribute("data-size", "xs");
    for (const size of ["xs", "sm", "md", "lg"] as const) {
      rerender(
        <CompactBarTrend label="t" data={trend} categoryKey="date" valueKey="count" size={size} />,
      );
      expect(getByRole("figure")).toHaveAttribute("data-size", size);
    }
  });

  it("renders the activity footer OUTSIDE the role=img graphic so its links stay reachable", () => {
    const { getByRole, container } = renderWithUi(
      <CompactBarTrend
        label="新規組織"
        data={trend}
        categoryKey="date"
        valueKey="count"
        footer={<a href="#activity">アクティビティ</a>}
      />,
    );
    const footer = container.querySelector(".ui-chart-footer");
    expect(footer).not.toBeNull();
    expect(getByRole("img").contains(footer)).toBe(false);
    expect(getByRole("link", { name: "アクティビティ" })).toBeInTheDocument();
  });

  it("shows an empty state (default localized, or the emptyMessage override)", () => {
    const { getByRole, getByText, container } = renderWithUi(
      <CompactBarTrend
        label="新規組織"
        data={[]}
        categoryKey="date"
        valueKey="count"
        emptyMessage="データがありません"
      />,
    );
    expect(getByText("データがありません")).toBeInTheDocument();
    expect(getByRole("status")).toBeInTheDocument();
    expect(container.querySelectorAll(".ui-chart-trend-bar")).toHaveLength(0);
    expect(container.querySelectorAll("ul.sr-only")).toHaveLength(0);
  });

  it("forwards a ref to the <figure> and honours className + id", () => {
    let node: HTMLElement | null = null;
    const { getByRole } = renderWithUi(
      <CompactBarTrend
        ref={(el) => {
          node = el;
        }}
        id="new-orgs-trend"
        className="shrink-0"
        label="新規組織"
        data={trend}
        categoryKey="date"
        valueKey="count"
      />,
    );
    const figure = getByRole("figure");
    expect(node).toBe(figure);
    expect(figure).toHaveAttribute("id", "new-orgs-trend");
    expect(figure.className).toContain("ui-chart-trend");
    expect(figure.className).toContain("shrink-0");
  });

  it("hides the category ticks when showCategoryLabels is false", () => {
    const { container } = renderWithUi(
      <CompactBarTrend
        label="新規組織"
        data={trend}
        categoryKey="date"
        valueKey="count"
        showCategoryLabels={false}
      />,
    );
    expect(container.querySelectorAll(".ui-chart-trend-tick")).toHaveLength(0);
    // the data is still fully available to assistive tech
    expect(container.querySelectorAll("ul.sr-only li")).toHaveLength(7);
  });

  it("formats values with the active locale via Intl.NumberFormat options", () => {
    const { container } = renderWithUi(
      <CompactBarTrend
        label="売上"
        data={[{ date: "07-30", count: 1234567 }]}
        categoryKey="date"
        valueKey="count"
        numberFormat={{ notation: "compact" }}
      />,
    );
    const row = container.querySelector("ul.sr-only li")?.textContent ?? "";
    expect(row).not.toContain("1234567");
    expect(row).toMatch(/1[.,]2/);
  });
});

describe("CompactBarTrend geometry helpers", () => {
  it("trendRatios normalizes against the largest bar and floors negatives at the baseline", () => {
    expect(trendRatios([{ v: 5 }, { v: 10 }, { v: 0 }], "v")).toEqual([0.5, 1, 0]);
    expect(trendRatios([{ v: -4 }, { v: 8 }], "v")).toEqual([0, 1]);
    // all-zero data must not divide by zero
    expect(trendRatios([{ v: 0 }, { v: 0 }], "v")).toEqual([0, 0]);
  });

  it("resolveEmphasizedIndex supports negative-from-end and rejects out-of-range", () => {
    expect(resolveEmphasizedIndex(5, 7)).toBe(5);
    expect(resolveEmphasizedIndex(-1, 7)).toBe(6);
    expect(resolveEmphasizedIndex(-9, 7)).toBe(-1);
    expect(resolveEmphasizedIndex(7, 7)).toBe(-1);
    expect(resolveEmphasizedIndex(undefined, 7)).toBe(-1);
    expect(resolveEmphasizedIndex(1.5, 7)).toBe(-1);
    expect(resolveEmphasizedIndex(0, 0)).toBe(-1);
  });

  it("buildSeriesRows annotates only the highlighted row", () => {
    const fmt = new Intl.NumberFormat("en");
    const rows = buildSeriesRows(
      [
        { d: "Mon", v: 1000 },
        { d: "Tue", v: 2000 },
      ],
      "d",
      "v",
      fmt,
      (i) => (i === 1 ? "current" : undefined),
    );
    expect(rows[0]).toBe("Mon: 1,000");
    expect(rows[1]).toBe("Tue: 2,000 (current)");
  });
});

describe("CompactBarTrend token contract (gh#218)", () => {
  it("declares every geometry knob in the component token tier", () => {
    for (const token of [
      "--chart-trend-plot-height-xs",
      "--chart-trend-plot-height-sm",
      "--chart-trend-plot-height-md",
      "--chart-trend-plot-height-lg",
      "--chart-trend-plot-height",
      "--chart-trend-bar-gap",
      "--chart-trend-bar-radius",
      "--chart-trend-bar-max-width",
      "--chart-trend-bar-min-height",
      "--chart-trend-bar-background-alpha",
      "--chart-trend-tick-gap",
      "--chart-trend-tick-font-size",
      "--chart-trend-footer-gap",
    ]) {
      expect(tokenCss, `missing token ${token}`).toMatch(
        new RegExp(`${token}:\\s*[^;]+;`.replace(/-/g, "-")),
      );
    }
  });

  it("declares every role-mirror colour knob as `initial` (no :root freeze)", () => {
    for (const token of [
      "--chart-trend-bar-background",
      "--chart-trend-bar-emphasis-background",
      "--chart-trend-baseline-border",
    ]) {
      expect(tokenCss).toMatch(new RegExp(`${token}:\\s*initial;`));
    }
    // …and the role default lives at the CALL SITE so a scoped/.dark override reaches it
    expect(rule(".ui-chart-trend-bar")).toMatch(
      /var\(\s*--chart-trend-bar-background,\s*hsl\(var\(--muted-foreground\)/,
    );
    expect(rule('.ui-chart-trend-bar[data-emphasized="true"]')).toMatch(
      /var\(--chart-trend-bar-emphasis-background,\s*hsl\(var\(--primary\)\)\)/,
    );
  });

  it("keeps the baseline chrome QUIET by default (cardinal rule #44)", () => {
    expect(rule(".ui-chart-trend-plot")).toMatch(
      /border-block-end:\s*var\(--chart-trend-baseline-border,\s*none\)/,
    );
  });

  it("resolves the plot height from the size tier — never an inline pixel height", () => {
    expect(rule(".ui-chart-trend-plot")).toMatch(/block-size:\s*var\(--chart-trend-plot-height\)/);
    for (const size of ["xs", "sm", "md", "lg"]) {
      expect(rule(`.ui-chart-trend[data-size="${size}"]`)).toMatch(
        new RegExp(`--chart-trend-plot-height:\\s*var\\(--chart-trend-plot-height-${size}\\)`),
      );
    }
    // the component passes NO `height` to the frame (that is the recharts-only escape hatch)
    expect(componentSrc).not.toMatch(/height=\{/);
  });

  it("carries only the DATUM inline — never a computed height or a colour", () => {
    const { container } = renderWithUi(
      <CompactBarTrend label="t" data={trend} categoryKey="date" valueKey="count" />,
    );
    const bars = [...container.querySelectorAll<HTMLElement>(".ui-chart-trend-bar")];
    for (const bar of bars) {
      const style = bar.getAttribute("style") ?? "";
      expect(style).toMatch(/--chart-trend-bar-value:/);
      expect(style).not.toMatch(/(?:^|[;\s])height:/);
      expect(style).not.toMatch(/background|color/);
    }
    // 12 is the max → its ratio is 1; 4 is a third of it
    expect(bars[5].style.getPropertyValue("--chart-trend-bar-value")).toBe("1");
    expect(Number(bars[0].style.getPropertyValue("--chart-trend-bar-value"))).toBeCloseTo(4 / 12);
  });

  it("sizes the bar height from the datum ratio plus the min-height floor", () => {
    const bar = rule(".ui-chart-trend-bar");
    expect(bar).toMatch(/var\(--chart-trend-bar-min-height\)/);
    expect(bar).toMatch(/calc\(var\(--chart-trend-bar-value,\s*0\)\s*\*\s*100%\)/);
    expect(bar).toMatch(/max-inline-size:\s*var\(--chart-trend-bar-max-width\)/);
    // rounded data-end anchored to the baseline, expressed logically (RTL-safe)
    expect(bar).toMatch(/border-start-start-radius:\s*var\(--chart-trend-bar-radius\)/);
    expect(bar).toMatch(/border-start-end-radius:\s*var\(--chart-trend-bar-radius\)/);
    expect(layoutCss).not.toMatch(/\.ui-chart-trend[^{]*\{[^}]*(?:margin|padding)-(?:left|right):/);
  });
});

describe("CompactBarTrend responsive contract — 1440 / 1024 / 390", () => {
  it("plots on fluid flex columns, so the same markup fits every container width", () => {
    // no measured pixels anywhere in the plot: columns share the row via `flex: 1 1 0`
    expect(rule(".ui-chart-trend-column")).toMatch(/flex:\s*1 1 0/);
    expect(rule(".ui-chart-trend-column")).toMatch(/min-inline-size:\s*0/);
    expect(rule(".ui-chart-trend-plot")).toMatch(/inline-size:\s*100%/);
    expect(rule(".ui-chart-trend-plot")).toMatch(/min-inline-size:\s*0/);
    // a long tick label truncates instead of widening the card
    expect(rule(".ui-chart-trend-tick")).toMatch(/text-overflow:\s*ellipsis/);
    expect(rule(".ui-chart-trend-tick")).toMatch(/min-inline-size:\s*0/);
  });

  it.each([1440, 1024, 390])(
    "renders the full seven-bar trend + text alternative in a %ipx container",
    (width) => {
      const { container } = renderWithUi(
        <div style={{ width }}>
          <CompactBarTrend
            label="新規組織（7日間）"
            description="日別に作成された組織数"
            data={trend}
            categoryKey="date"
            valueKey="count"
            emphasizedIndex={5}
            size="xs"
            footer={<span>直近のアクティビティ</span>}
          />
        </div>,
      );
      expect(container.querySelectorAll(".ui-chart-trend-bar")).toHaveLength(7);
      expect(container.querySelectorAll(".ui-chart-trend-tick")).toHaveLength(7);
      expect(container.querySelectorAll('[data-emphasized="true"]')).toHaveLength(1);
      expect(container.querySelectorAll("ul.sr-only li")).toHaveLength(7);
      expect(container.querySelector(".ui-chart-footer")?.textContent).toBe("直近のアクティビティ");
      // the plot never carries a hardcoded width/height of its own
      expect(container.querySelector<HTMLElement>(".ui-chart-trend-plot")?.style.length).toBe(0);
    },
  );
});
