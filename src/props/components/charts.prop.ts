/** Charts component prop types — @see docs/COMPONENTS.md#charts (tree-shaken `@godxjp/ui/charts`). */
import type * as React from "react";

import type {
  ClassNameProp,
  DescriptionProp,
  EmptyMessageProp,
  FooterProp,
  IdProp,
  LabelProp,
  SizeProp,
} from "../vocabulary";

/** A single row of chart data — category accessor + one numeric value per series. */
export type ChartDatum = Record<string, string | number | null | undefined>;

/** One plotted series — `dataKey` accesses the value, `label` is the already-translated legend text. */
export type ChartSeriesProp = {
  /** Key into each datum holding this series' numeric value. */
  dataKey: string;
  /** Already-translated display label (legend + tooltip). Defaults to `dataKey`. */
  label?: string;
  /** CSS colour or token var. Defaults to the `--chart-1..6` palette by index. */
  color?: string;
  /**
   * AreaChart only — the filled band's colour, independent of the line's `color`. Defaults to
   * `color`, which is the single-hue shape every other chart draws. A line has no fill and a bar's
   * fill IS its `color`, so this is ignored there.
   *
   * The band's OPACITY is the `--chart-area-fill-alpha` theme knob, not a prop: density is a
   * house style, while the hue carries meaning and belongs to the screen.
   */
  fillColor?: string;
};

/** Selection is an action: the dashboard owns filter state. Index refers to the original data array. */
export type ChartDatumSelect<T = ChartDatum> = (
  datum: T,
  context: { seriesKey: string; index: number },
) => void;

/** Shared base for the cartesian charts (Line / Bar / Area). */
type ChartCartesianBase = {
  /** Override built-in chart animation; false lets the consumer own reduced-motion-safe feedback. */
  animated?: boolean;
  /** Row data. Each row is one category with a value per series. */
  data: ChartDatum[];
  /** One or more plotted series. */
  series: ChartSeriesProp[];
  /** Key into each datum holding the x-axis category label. */
  categoryKey: string;
  /** Accessible name + visible caption for the chart. REQUIRED (role="img" needs a name). */
  label: LabelProp;
  /**
   * Paint `label` as a visible caption above the plot. Set `false` when the chart already sits
   * under a heading that says the same thing (a `CardTitle`, a section `<h2>`): the caption stays
   * in the DOM as `sr-only`, so `role="img"` keeps its accessible name and only the duplicated
   * visible title goes away.
   */
  showCaption?: boolean;
  /** Extra context appended to the screen-reader description. */
  description?: DescriptionProp;
  /** Canvas height preset — `xs|sm|md|lg`. Ignored when `height` is set. */
  size?: SizeProp;
  /** Explicit canvas height in px (overrides `size`). */
  height?: number;
  /** Show the series legend. */
  showLegend?: boolean;
  /** Show the cartesian background grid. */
  showGrid?: boolean;
  /**
   * Explicit `[min, max]` for the VALUE axis — y on a vertical chart, x on a horizontal bar.
   * Omitted, the data sets it (recharts' default, which is zero-based for bars).
   *
   * A NON-ZERO BASELINE IS A CHARTING-ETHICS DECISION, not a layout one. Cropping the axis to the
   * data's own range magnifies every wobble, and the reader has no way to tell a 2% drift from a
   * collapse. It is legitimate where the SHAPE is the message and zero is not a meaningful
   * reference — a price, a temperature, an index, a latency percentile — and it is misleading
   * wherever the reader will compare MAGNITUDES, which is every bar chart and every "is this big"
   * question. If you crop, say the range on the axis and keep `showGrid`.
   */
  valueDomain?: [number, number];
  /**
   * Explicit tick positions on the value axis, in data units. Values outside `valueDomain` are not
   * drawn. Omitted, the axis picks its own.
   */
  valueTicks?: number[];
  /** `Intl.NumberFormat` options for axis ticks + tooltip values (locale is automatic). */
  numberFormat?: Intl.NumberFormatOptions;
  /** Message shown when `data` is empty. Defaults to a localized "no data". */
  emptyMessage?: EmptyMessageProp;
  /** Select a finite datum by pointer or Enter/Space. Arrows navigate categories and series. */
  onDatumSelect?: ChartDatumSelect;
  /**
   * Called with the clicked category's datum and its index — drill-down, zoom-to-bucket. The whole
   * category column is the target, not only the mark, so a zero-height bar is still clickable.
   *
   * A POINTER SHORTCUT, not the only way in: the plot is `role="img"`, which has no keyboard
   * interaction, so the screen must offer the same action through a real control as well.
   */
  onCategoryClick?: (datum: ChartDatum, index: number) => void;
  className?: ClassNameProp;
  id?: IdProp;
};

/** @see LineChart */
export type LineChartProp = ChartCartesianBase & {
  /** Render smooth (monotone) lines instead of straight segments. */
  curved?: boolean;
  /** Draw a marker at every data point. Off by default — markers crowd a dense series. */
  showDots?: boolean;
};

/** @see BarChart */
export type BarChartProp = ChartCartesianBase & {
  /** Paint exact values at the end of each bar. */
  showValues?: boolean;
  /** Stack series into one bar instead of grouping side by side. */
  stacked?: boolean;
  /** Lay bars out horizontally (category on the y-axis). */
  horizontal?: boolean;
};

/**
 * @see CompactBarTrend
 *
 * Dependency-free (no `recharts`) compact vertical bar trend: N category/value
 * pairs, muted marks plus ONE emphasized "current" mark. Every dimension resolves
 * from `--chart-trend-*` tokens, so a screen never writes CSS or an inline height.
 */
export type CompactBarTrendProp = {
  /** Row data — one bar per row. Not limited to seven points. */
  data: ChartDatum[];
  /** Key into each datum holding the category (tick) label. */
  categoryKey: string;
  /** Key into each datum holding the plotted numeric value. */
  valueKey: string;
  /** Accessible name + visible caption for the chart. REQUIRED (role="img" needs a name). */
  label: LabelProp;
  /**
   * Paint `label` as a visible caption above the plot. Set `false` when the chart already sits
   * under a heading that says the same thing (a `CardTitle`, a section `<h2>`): the caption stays
   * in the DOM as `sr-only`, so `role="img"` keeps its accessible name and only the duplicated
   * visible title goes away.
   */
  showCaption?: boolean;
  /** Extra context appended to the screen-reader description. */
  description?: DescriptionProp;
  /** Plot-height tier — `xs|sm|md|lg`. Defaults to `xs` (dashboard summary-card density). */
  size?: SizeProp;
  /**
   * Index of the emphasized ("current") bar. Negative counts from the end (`-1` = the latest
   * datum); out of range = no emphasis.
   */
  emphasizedIndex?: number;
  /** Render the category tick labels under the plot. */
  showCategoryLabels?: boolean;
  /** `Intl.NumberFormat` options for the values in the text alternative (locale is automatic). */
  numberFormat?: Intl.NumberFormatOptions;
  /** Activity footer slot rendered below the plot, outside the `role="img"` graphic. */
  footer?: FooterProp;
  /** Message shown when `data` is empty. Defaults to a localized "no data". */
  emptyMessage?: EmptyMessageProp;
  className?: ClassNameProp;
  id?: IdProp;
  ref?: React.Ref<HTMLElement>;
};

/** One category on a HeatmapChart axis — a row (weekday) or a column (hour). */
export type HeatmapCategory = {
  /** Stable key the `data` cells refer to (`row` / `column`). */
  key: string | number;
  /** Already-translated display label — the axis tick and the table header. */
  label: string;
};

/** One HeatmapChart cell. A cell absent from `data`, or with a non-finite `value`, is EMPTY. */
export type HeatmapDatum = {
  /** `key` of the row this cell belongs to. */
  row: string | number;
  /** `key` of the column this cell belongs to. */
  column: string | number;
  /** The measured value. `null`/`undefined`/`NaN` mean "no data" — not zero. */
  value: number | null | undefined;
};

/**
 * @see HeatmapChart
 *
 * Dependency-free (no `recharts`) rows × columns matrix — a weekday × hour heatmap. Cell intensity
 * steps through the `--chart-heat-1..5` ramp; an empty cell is outlined, a zero cell is filled.
 */
export type HeatmapChartProp = {
  /** Select a present cell. seriesKey is String(column); index is the original data index. */
  onDatumSelect?: ChartDatumSelect<HeatmapDatum>;
  /** Row categories, top to bottom (the y axis — weekdays). */
  rows: HeatmapCategory[];
  /** Column categories, start to end (the x axis — hours). */
  columns: HeatmapCategory[];
  /** Cell values, keyed by `row` + `column`. Order does not matter; a missing cell is empty. */
  data: HeatmapDatum[];
  /** Accessible name + visible caption for the chart. REQUIRED (the grid needs a name). */
  label: LabelProp;
  /**
   * Paint `label` as a visible caption above the plot. `false` keeps it in the DOM as `sr-only`,
   * so the figure and its grid keep their accessible name.
   */
  showCaption?: boolean;
  /** Extra context appended to the screen-reader description. */
  description?: DescriptionProp;
  /**
   * CELL size tier — `xs|sm|md|lg` (`--chart-heatmap-cell-size-*`). Not a canvas height: the matrix
   * is as tall as its rows, and when the columns do not fit it scrolls inside its own box.
   */
  size?: SizeProp;
  /** `Intl.NumberFormat` options for cell values, the tooltip and the legend (locale is automatic). */
  numberFormat?: Intl.NumberFormatOptions;
  /**
   * Emphasize the N highest cells with an outline ring and a "top N" note in the tooltip and the
   * text alternative — never colour alone. Ties keep `data` order. Omitted or 0 = no emphasis.
   */
  topN?: number;
  /** Show the colour-scale legend under the matrix. */
  showLegend?: boolean;
  /** Message shown when there are no rows, no columns or no cells. Defaults to a localized "no data". */
  emptyMessage?: EmptyMessageProp;
  className?: ClassNameProp;
  id?: IdProp;
  ref?: React.Ref<HTMLElement>;
};

/** @see AreaChart */
export type AreaChartProp = ChartCartesianBase & {
  /** Stack series areas instead of overlaying them. */
  stacked?: boolean;
  /** Render smooth (monotone) areas instead of straight segments. */
  curved?: boolean;
  /** Draw a marker at every data point. Off by default — markers crowd a dense series. */
  showDots?: boolean;
};

/** @see PieChart */
export type PieChartProp = {
  /** Override built-in pie animation; false leaves the full static meaning visible. */
  animated?: boolean;
  /** Select a slice by pointer or Enter/Space; seriesKey is dataKey. Arrows navigate slices. */
  onDatumSelect?: ChartDatumSelect;
  /** Row data — one slice per row. */
  data: ChartDatum[];
  /** Key into each datum holding the slice's numeric value. */
  dataKey: string;
  /** Key into each datum holding the slice's category label. */
  nameKey: string;
  /** Per-slice colours, applied by index. Defaults to the `--chart-1..6` palette. */
  colors?: string[];
  /** Accessible name + visible caption for the chart. REQUIRED. */
  label: LabelProp;
  /**
   * Paint `label` as a visible caption above the plot. Set `false` when the chart already sits
   * under a heading that says the same thing (a `CardTitle`, a section `<h2>`): the caption stays
   * in the DOM as `sr-only`, so `role="img"` keeps its accessible name and only the duplicated
   * visible title goes away.
   */
  showCaption?: boolean;
  /** Extra context appended to the screen-reader description. */
  description?: DescriptionProp;
  /** Canvas height preset — `xs|sm|md|lg`. Ignored when `height` is set. */
  size?: SizeProp;
  /** Explicit canvas height in px (overrides `size`). */
  height?: number;
  /** Show the slice legend. */
  showLegend?: boolean;
  /** `Intl.NumberFormat` options for tooltip values (locale is automatic). */
  numberFormat?: Intl.NumberFormatOptions;
  /** Render a donut (hollow centre) instead of a full pie. */
  donut?: boolean;
  /** Message shown when `data` is empty. Defaults to a localized "no data". */
  emptyMessage?: EmptyMessageProp;
  className?: ClassNameProp;
  id?: IdProp;
};

/** Single quantitative profile on a shared zero-based scale; incomplete data is never zero-filled. */
export type RadarChartProp = {
  data: ChartDatum[];
  categoryKey: string;
  valueKey: string;
  /** Required common ceiling, strictly positive; values outside [0,valueMax] are invalid. */
  valueMax: number;
  valueTicks?: number[];
  label: LabelProp;
  showCaption?: boolean;
  description?: DescriptionProp;
  size?: SizeProp;
  numberFormat?: Intl.NumberFormatOptions;
  emptyMessage?: EmptyMessageProp;
  footer?: FooterProp;
  className?: ClassNameProp;
  id?: IdProp;
  ref?: React.Ref<HTMLElement>;
};
