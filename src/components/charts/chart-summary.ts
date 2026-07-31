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

/**
 * Build the "category: value" rows for a SINGLE-series chart (pie slices, a
 * compact bar trend…). `annotate` decorates the row of a highlighted datum —
 * a text alternative for an emphasis that is otherwise colour-only (WCAG 1.4.1).
 */
export function buildSeriesRows(
  data: ChartDatum[],
  categoryKey: string,
  valueKey: string,
  fmt: Formatter,
  annotate?: (index: number) => string | undefined,
): string[] {
  return data.map((datum, index) => {
    const row = `${String(datum[categoryKey] ?? "")}: ${fmt.format(numeric(datum[valueKey]))}`;
    const note = annotate?.(index);
    return note ? `${row} (${note})` : row;
  });
}

/** Build the per-slice rows + a one-line summary for a pie chart. */
export function buildPieSummary(
  data: ChartDatum[],
  dataKey: string,
  nameKey: string,
  fmt: Formatter,
  summaryLine: (counts: { slices: number }) => string,
): ChartSummary {
  return {
    rows: buildSeriesRows(data, nameKey, dataKey, fmt),
    img: summaryLine({ slices: data.length }),
  };
}

/** Build the per-category rows + a one-line summary for a single-series trend. */
export function buildTrendSummary(
  data: ChartDatum[],
  categoryKey: string,
  valueKey: string,
  fmt: Formatter,
  summaryLine: (counts: { points: number }) => string,
  annotate?: (index: number) => string | undefined,
): ChartSummary {
  return {
    rows: buildSeriesRows(data, categoryKey, valueKey, fmt, annotate),
    img: summaryLine({ points: data.length }),
  };
}

/**
 * Normalize raw values to 0..1 bar ratios against the largest magnitude.
 * Negative values plot at the baseline (a compact trend has no negative axis) but
 * still read their true figure in the text alternative.
 */
export function trendRatios(data: ChartDatum[], valueKey: string): number[] {
  const values = data.map((datum) => Math.max(0, numeric(datum[valueKey])));
  const max = values.reduce((acc, value) => (value > acc ? value : acc), 0);
  return values.map((value) => (max > 0 ? value / max : 0));
}

/**
 * Resolve `emphasizedIndex` against a row count. Negative counts from the end
 * (`-1` = the latest datum). Out-of-range → no emphasis.
 */
export function resolveEmphasizedIndex(index: number | undefined, length: number): number {
  if (index === undefined || !Number.isInteger(index) || length === 0) return -1;
  const resolved = index < 0 ? length + index : index;
  return resolved >= 0 && resolved < length ? resolved : -1;
}
