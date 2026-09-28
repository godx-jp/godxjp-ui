import * as React from "react";

import {
  Area,
  AreaChart as RAreaChart,
  Bar,
  BarChart as RBarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart as RLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  assertRechartsPeer,
} from "./recharts-peer";

import type { ChartDatum, ChartSeriesProp } from "../../props/components/charts.prop";
import { cn } from "../../lib/utils";
import { EmptyState } from "../data-display/empty-state";
import { useTranslation } from "../../i18n/use-translation";
import { ChartFrame, chartColor, chartHeight, useChartNumberFormat } from "./chart-frame";
import { buildCartesianSummary } from "./chart-summary";
import { useCategoryAxisMetrics } from "./chart-category-axis";
import { listFormat } from "../../lib/intl-cache";

/**
 * Shared cartesian renderer for Line / Bar / Area. Internal — the filename pascal
 * (`ChartCartesian`) is intentionally NOT exported, so this is not a catalog entry.
 */
type CartesianKind = "line" | "bar" | "area";

type CartesianChartProps = {
  kind: CartesianKind;
  data: ChartDatum[];
  series: ChartSeriesProp[];
  categoryKey: string;
  label: React.ReactNode;
  showCaption?: boolean;
  description?: React.ReactNode;
  size?: "xs" | "sm" | "md" | "lg";
  height?: number;
  showLegend?: boolean;
  showGrid?: boolean;
  valueDomain?: [number, number];
  valueTicks?: number[];
  numberFormat?: Intl.NumberFormatOptions;
  emptyMessage?: string;
  onCategoryClick?: (datum: ChartDatum, index: number) => void;
  className?: string;
  id?: string;
  /** line/area */
  curved?: boolean;
  /** line/area */
  showDots?: boolean;
  /** bar/area */
  stacked?: boolean;
  /** bar */
  horizontal?: boolean;
};

export function CartesianChart({
  kind,
  data,
  series,
  categoryKey,
  label,
  showCaption = true,
  description,
  size = "md",
  height,
  showLegend = true,
  showGrid = true,
  valueDomain,
  valueTicks,
  numberFormat,
  emptyMessage,
  onCategoryClick,
  className,
  id,
  curved = false,
  showDots = false,
  stacked = false,
  horizontal = false,
}: CartesianChartProps) {
  assertRechartsPeer();
  const { t, locale } = useTranslation();
  const fmt = useChartNumberFormat(numberFormat);
  const list = React.useMemo(() => listFormat(locale, { style: "narrow", type: "unit" }), [locale]);

  const hasData = data.length > 0 && series.length > 0;
  const summary = buildCartesianSummary(data, series, categoryKey, fmt, list, (c) =>
    t("chart.summaryCartesian", { series: fmt.format(c.series), points: fmt.format(c.points) }),
  );

  const resolvedHeight = chartHeight(size, height);
  const tickFormatter = (value: number) => fmt.format(value);
  const curve = curved ? "monotone" : "linear";

  /**
   * The VALUE axis is y on a vertical chart and x on a horizontal bar, which is why these knobs
   * are spread onto whichever axis is the numeric one instead of being named `yDomain` (gh#865).
   * Each key is omitted entirely when unset, so recharts' own auto-scaling is untouched by default.
   */
  const valueAxisScale = {
    ...(valueDomain ? { domain: valueDomain } : null),
    ...(valueTicks ? { ticks: valueTicks } : null),
  };

  /**
   * The category axis of a horizontal bar chart is the only axis whose ticks are free text, so it
   * is the only one that has to be sized from what it actually holds (gh#409 · 1).
   */
  const measuresCategoryAxis = kind === "bar" && horizontal;
  const canvasRef = React.useRef<HTMLDivElement>(null);
  const probeRef = React.useRef<HTMLSpanElement>(null);
  const categoryLabels = React.useMemo(
    () => (measuresCategoryAxis ? data.map((datum) => String(datum[categoryKey] ?? "")) : []),
    [measuresCategoryAxis, data, categoryKey],
  );
  const categoryAxis = useCategoryAxisMetrics(
    canvasRef,
    probeRef,
    categoryLabels,
    measuresCategoryAxis && hasData,
  );

  const categoryTick = (tickProps: {
    x?: number | string;
    y?: number | string;
    className?: string;
    textAnchor?: "start" | "middle" | "end" | "inherit";
    payload?: { value?: unknown };
  }) => {
    const full = String(tickProps.payload?.value ?? "");
    const shown = categoryAxis.display(full);
    return (
      // `recharts-text` is what chart-layout.css styles the tick typography through; the rest of
      // the class list is recharts' own (it hands `recharts-cartesian-axis-tick-value` in).
      <text
        className={cn("recharts-text", tickProps.className)}
        x={tickProps.x}
        y={tickProps.y}
        textAnchor={tickProps.textAnchor}
        dominantBaseline="central"
      >
        {/* Truncation never hides the name: the tooltip and the figure's sr-only list keep it. */}
        {shown === full ? null : <title>{full}</title>}
        {shown}
      </text>
    );
  };

  const axes = (numberAxisVertical: boolean) => (
    <>
      {/* No `strokeDasharray` here: `--chart-grid-line-dash` owns the dash from
          chart-layout.css, where a service theme can reach it (gh#865). */}
      {showGrid ? <CartesianGrid stroke="hsl(var(--border))" /> : null}
      {numberAxisVertical ? (
        <>
          <XAxis
            dataKey={categoryKey}
            tickLine={false}
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <YAxis
            tickFormatter={tickFormatter}
            tickLine={false}
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            {...valueAxisScale}
          />
        </>
      ) : (
        <>
          <XAxis
            type="number"
            tickFormatter={tickFormatter}
            tickLine={false}
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            {...valueAxisScale}
          />
          <YAxis
            type="category"
            dataKey={categoryKey}
            tickLine={false}
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            width={categoryAxis.width}
            tick={categoryTick}
          />
        </>
      )}
      <Tooltip formatter={(value) => fmt.format(Number(value))} />
      {showLegend ? <Legend /> : null}
    </>
  );

  const pickCategory = (raw: unknown) => {
    // `Number(null)` is 0 — a miss must not read as the first category.
    const index = raw === null || raw === undefined || raw === "" ? NaN : Number(raw);
    if (onCategoryClick && Number.isInteger(index) && data[index])
      onCategoryClick(data[index], index);
  };
  /**
   * Line / area: recharts' chart-level click reports `activeTooltipIndex` — the category the
   * TOOLTIP last settled on, which is updated from `mousemove` on an animation frame. A miss gives
   * no index and is ignored.
   */
  const onChartClick = onCategoryClick
    ? (state: { activeTooltipIndex?: number | string | null } | null) =>
        pickCategory(state?.activeTooltipIndex)
    : undefined;
  /**
   * Bar: the click comes from the bar itself, and from a transparent full-height background column
   * behind it, with recharts' own data index. It does not read
   * tooltip state, which is stale when no `mousemove` frame ran before the click — a tap, a
   * scripted click, a background tab (measured in godx-logger: the chart-level index lagged the
   * pointer by the whole previous hover).
   */
  const onBarClick = onCategoryClick
    ? (_entry: unknown, index: number) => pickCategory(index)
    : undefined;

  const chart = () => {
    if (kind === "line") {
      return (
        <RLineChart data={data} onClick={onChartClick}>
          {axes(true)}
          {series.map((s, i) => (
            <Line
              key={s.dataKey}
              type={curve}
              dataKey={s.dataKey}
              name={s.label ?? s.dataKey}
              stroke={chartColor(i, s.color)}
              dot={showDots}
            />
          ))}
        </RLineChart>
      );
    }
    if (kind === "area") {
      return (
        <RAreaChart data={data} onClick={onChartClick}>
          {axes(true)}
          {series.map((s, i) => (
            <Area
              key={s.dataKey}
              type={curve}
              dataKey={s.dataKey}
              name={s.label ?? s.dataKey}
              stackId={stacked ? "stack" : undefined}
              stroke={chartColor(i, s.color)}
              fill={s.fillColor ?? chartColor(i, s.color)}
              dot={showDots}
            />
          ))}
        </RAreaChart>
      );
    }
    return (
      <RBarChart data={data} layout={horizontal ? "vertical" : "horizontal"}>
        {axes(!horizontal)}
        {series.map((s, i) => (
          <Bar
            key={s.dataKey}
            dataKey={s.dataKey}
            name={s.label ?? s.dataKey}
            stackId={stacked ? "stack" : undefined}
            fill={chartColor(i, s.color)}
            radius={2}
            onClick={onBarClick}
            // A full-height hit column behind the mark, so a 1px bar is as easy to hit as a tall
            // one. recharts drops zero-height entries before drawing backgrounds, so each series
            // brings its own: a category is a target when ANY series has a value there. A fully
            // empty category is not clickable (there is nothing in it to drill into).
            background={onCategoryClick ? { fill: "transparent" } : undefined}
          />
        ))}
      </RBarChart>
    );
  };

  return (
    <ChartFrame
      label={label}
      showCaption={showCaption}
      description={description}
      summaryRows={summary.rows}
      imgSummary={summary.img}
      hasData={hasData}
      height={resolvedHeight}
      className={cn(onCategoryClick && "ui-chart-clickable", className)}
      id={id}
      canvasRef={canvasRef}
      canvasExtra={
        measuresCategoryAxis ? (
          // Out-of-flow, hidden, and inside `.ui-chart` — so it inherits exactly the typography
          // the axis ticks are painted in, including the `[lang="ja"]` face.
          <span ref={probeRef} className="ui-chart-axis-probe" aria-hidden="true" />
        ) : null
      }
    >
      {hasData ? (
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          {chart()}
        </ResponsiveContainer>
      ) : (
        <EmptyState title={emptyMessage ?? t("chart.empty")} />
      )}
    </ChartFrame>
  );
}
