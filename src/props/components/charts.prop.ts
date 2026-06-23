/** Charts component prop types — @see docs/COMPONENTS.md#charts (tree-shaken `@godxjp/ui/charts`). */
import type {
  ClassNameProp,
  DescriptionProp,
  EmptyMessageProp,
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
};

/** Shared base for the cartesian charts (Line / Bar / Area). */
type ChartCartesianBase = {
  /** Row data. Each row is one category with a value per series. */
  data: ChartDatum[];
  /** One or more plotted series. */
  series: ChartSeriesProp[];
  /** Key into each datum holding the x-axis category label. */
  categoryKey: string;
  /** Accessible name + visible caption for the chart. REQUIRED (role="img" needs a name). */
  label: LabelProp;
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
  /** `Intl.NumberFormat` options for axis ticks + tooltip values (locale is automatic). */
  numberFormat?: Intl.NumberFormatOptions;
  /** Message shown when `data` is empty. Defaults to a localized "no data". */
  emptyMessage?: EmptyMessageProp;
  className?: ClassNameProp;
  id?: IdProp;
};

/** @see LineChart */
export type LineChartProp = ChartCartesianBase & {
  /** Render smooth (monotone) lines instead of straight segments. */
  curved?: boolean;
};

/** @see BarChart */
export type BarChartProp = ChartCartesianBase & {
  /** Stack series into one bar instead of grouping side by side. */
  stacked?: boolean;
  /** Lay bars out horizontally (category on the y-axis). */
  horizontal?: boolean;
};

/** @see AreaChart */
export type AreaChartProp = ChartCartesianBase & {
  /** Stack series areas instead of overlaying them. */
  stacked?: boolean;
  /** Render smooth (monotone) areas instead of straight segments. */
  curved?: boolean;
};

/** @see PieChart */
export type PieChartProp = {
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
