/**
 * Pure helpers that turn chart data into a localized screen-reader text
 * alternative (WCAG 1.1.1). No JSX — filename pascal is intentionally NOT
 * exported, so this is not a catalog primitive.
 */
import type {
  ChartDatum,
  ChartSeriesProp,
  HeatmapCategory,
  HeatmapDatum,
} from "../../props/components/charts.prop";

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
 * Resolve `emphasizedIndex` against a row count. Negative counts from the end (`-1` = the latest
 * datum).
 */
export function resolveEmphasizedIndex(index: number | undefined, length: number): number {
  if (index === undefined || !Number.isInteger(index) || length === 0) return -1;
  const resolved = index < 0 ? length + index : index;
  return resolved >= 0 && resolved < length ? resolved : -1;
}

/** Number of steps in the `--chart-heat-1..N` ramp. */
export const HEAT_STEPS = 5;

/** The lookup key of one heatmap cell. */
export function heatmapCellKey(row: string | number, column: string | number): string {
  return `${String(row)}\u0000${String(column)}`;
}

export type HeatmapModel = {
  /** Finite values by cell key. A key that is absent is an EMPTY cell, never a zero. */
  values: Map<string, number>;
  /** Ramp step 1..HEAT_STEPS by cell key. */
  steps: Map<string, number>;
  /** 1-based rank of the top-N cells by cell key. */
  ranks: Map<string, number>;
  /** Scale domain: `min(0, smallest)` .. largest. */
  min: number;
  max: number;
  /** Count of cells with a value inside the rows × columns matrix. */
  present: number;
  /** Count of matrix cells with no value. */
  empty: number;
  /** The highest cell, for the one-line summary. */
  highest: { row: HeatmapCategory; column: HeatmapCategory; value: number } | null;
};

/**
 * Bin a heatmap's cells onto the sequential ramp. The domain starts at zero (or the smallest value,
 * when that is negative) so the fill encodes MAGNITUDE — a heatmap of 900..1000 whose 900 painted
 * as "empty-light" would read as a quiet hour. Cells outside `rows` × `columns` are ignored.
 */
export function buildHeatmapModel(
  rows: HeatmapCategory[],
  columns: HeatmapCategory[],
  data: HeatmapDatum[],
  topN?: number,
): HeatmapModel {
  const rowByKey = new Map(rows.map((row) => [String(row.key), row] as const));
  const columnByKey = new Map(columns.map((column) => [String(column.key), column] as const));
  const values = new Map<string, number>();
  const order: { key: string; value: number; row: HeatmapCategory; column: HeatmapCategory }[] = [];
  for (const datum of data) {
    const row = rowByKey.get(String(datum.row));
    const column = columnByKey.get(String(datum.column));
    if (!row || !column) continue;
    if (typeof datum.value !== "number" || !Number.isFinite(datum.value)) continue;
    const key = heatmapCellKey(row.key, column.key);
    if (values.has(key)) continue;
    values.set(key, datum.value);
    order.push({ key, value: datum.value, row, column });
  }

  let min = 0;
  let max = 0;
  for (const { value } of order) {
    if (value < min) min = value;
    if (value > max) max = value;
  }
  const steps = new Map<string, number>();
  for (const { key, value } of order) {
    const ratio = max > min ? (value - min) / (max - min) : max > 0 ? 1 : 0;
    steps.set(key, Math.min(HEAT_STEPS, Math.floor(ratio * HEAT_STEPS) + 1));
  }

  // Stable sort: equal values keep `data` order, so a tie is decided by the caller, not by chance.
  const ranked = [...order].sort((a, b) => b.value - a.value);
  const ranks = new Map<string, number>();
  const n = topN !== undefined && Number.isInteger(topN) && topN > 0 ? topN : 0;
  ranked.slice(0, n).forEach((cell, index) => ranks.set(cell.key, index + 1));

  const top = ranked[0];
  return {
    values,
    steps,
    ranks,
    min,
    max,
    present: order.length,
    empty: rows.length * columns.length - order.length,
    highest: top ? { row: top.row, column: top.column, value: top.value } : null,
  };
}
