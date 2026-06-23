/**
 * Pure helpers that turn chart data into a localized screen-reader text
 * alternative (WCAG 1.1.1). No JSX — filename pascal is intentionally NOT
 * exported, so this is not a catalog primitive.
 */
import type { ChartDatum, ChartSeriesProp } from "../../props/components/charts.prop";

type Formatter = Intl.NumberFormat;

function numeric(value: ChartDatum[string]): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export type ChartSummary = { rows: string[]; img: string };

/** Build the per-category rows + a one-line summary for a cartesian chart. */
export function buildCartesianSummary(
  data: ChartDatum[],
  series: ChartSeriesProp[],
  categoryKey: string,
  fmt: Formatter,
  list: Intl.ListFormat,
  summaryLine: (counts: { series: number; points: number }) => string,
): ChartSummary {
  const rows = data.map((datum) => {
    const category = String(datum[categoryKey] ?? "");
    const parts = series.map(
      (s) => `${s.label ?? s.dataKey}: ${fmt.format(numeric(datum[s.dataKey]))}`,
    );
    return `${category} — ${list.format(parts)}`;
  });
  return { rows, img: summaryLine({ series: series.length, points: data.length }) };
}

/** Build the per-slice rows + a one-line summary for a pie chart. */
export function buildPieSummary(
  data: ChartDatum[],
  dataKey: string,
  nameKey: string,
  fmt: Formatter,
  summaryLine: (counts: { slices: number }) => string,
): ChartSummary {
  const rows = data.map(
    (datum) => `${String(datum[nameKey] ?? "")}: ${fmt.format(numeric(datum[dataKey]))}`,
  );
  return { rows, img: summaryLine({ slices: data.length }) };
}
