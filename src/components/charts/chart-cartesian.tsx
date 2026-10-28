import * as React from "react";

import {
  Dot,
  Rectangle,
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

import type {
  ChartDatum,
  ChartSeriesProp,
  ChartDatumSelect,
} from "../../props/components/charts.prop";
import { cn } from "../../lib/utils";
import { EmptyState } from "../data-display/empty-state";
import { useTranslation } from "../../i18n/use-translation";
import { ChartFrame, chartColor, chartHeight, useChartNumberFormat } from "./chart-frame";
import { buildCartesianSummary } from "./chart-summary";
import { useCategoryAxisMetrics } from "./chart-category-axis";
import { useChartDatumSelection } from "./chart-datum-selection";
import { listFormat } from "../../lib/intl-cache";

/**
 * Shared cartesian renderer for Line / Bar / Area. Internal — the filename pascal
 * (`ChartCartesian`) is intentionally NOT exported, so this is not a catalog entry.
 */
type CartesianKind = "line" | "bar" | "area";

type CartesianChartProps = {
  showValues?: boolean;
  animated?: boolean;
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
  onDatumSelect?: ChartDatumSelect;
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
  showValues,
  animated,
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
  onDatumSelect,
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
  const counts = useChartNumberFormat();
  const list = React.useMemo(() => listFormat(locale, { style: "narrow", type: "unit" }), [locale]);

  const points = series.flatMap((s, seriesIndex) =>
    data.flatMap((datum, index) =>
      typeof datum[s.dataKey] === "number" && Number.isFinite(datum[s.dataKey])
        ? [{ index, series: seriesIndex }]
        : [],
    ),
  );
  const markProps = useChartDatumSelection(points);
  const mark = (seriesIndex: number, shape: "bar" | "dot", raw: unknown) => {
    const s = series[seriesIndex]!;
    const props = raw as {
      index: number;
      x?: number;
      y?: number;
      width?: number;
      height?: number;
      cx?: number;
      cy?: number;
      fill?: string;
    };
    const { x = 0, y = 0, width = 0, height = 0 } = props;
    const index = props.index;
    const datum = data[index];
    if (!datum || typeof datum[s.dataKey] !== "number" || !Number.isFinite(datum[s.dataKey]))
      return <g />;
    const action = markProps(
      index,
      seriesIndex,
      t("chart.datumLabel", {
        label: String(datum[categoryKey] ?? ""),
        series: s.label ?? s.dataKey,
        value: fmt.format(Number(datum[s.dataKey])),
      }),
      () => onDatumSelect?.(datum, { seriesKey: s.dataKey, index }),
    );
    return shape === "bar" ? (
      <g {...action}>
        <rect
          x={Math.min(x, x + width)}
          y={Math.min(y, y + height)}
          width={Math.abs(width)}
          height={Math.abs(height)}
          className="ui-chart-bar-hit"
          fill="transparent"
          style={
            {
              "--chart-mark-width": `${Math.abs(width)}px`,
              "--chart-mark-height": `${Math.abs(height)}px`,
            } as React.CSSProperties
          }
        />
        <Rectangle
          x={props.x}
          y={props.y}
          width={props.width}
          height={props.height}
          fill={props.fill}
          radius={2}
        />
      </g>
    ) : (
      <g {...action}>
        <circle cx={props.cx} cy={props.cy} className="ui-chart-point-hit" fill="transparent" />
        <Dot cx={props.cx} cy={props.cy} fill={chartColor(seriesIndex, s.color)} />
      </g>
    );
  };

  // Stable render props avoid tearing down recharts' series registration on a filter update.
  const markRef = React.useRef(mark);
  markRef.current = mark;
  const shapes = React.useMemo(
    () =>
      Array.from({ length: series.length }, (_, i) => ({
        bar: (raw: unknown) => markRef.current(i, "bar", raw),
        dot: (raw: unknown) => markRef.current(i, "dot", raw),
      })),
    [series.length],
  );

  const hasData = data.length > 0 && series.length > 0;
  const summary = buildCartesianSummary(data, series, categoryKey, fmt, list, (c) =>
    t("chart.summaryCartesian", {
      series: counts.format(c.series),
      points: counts.format(c.points),
    }),
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
        <RLineChart
          accessibilityLayer={onDatumSelect ? false : undefined}
          data={data}
          onClick={onChartClick}
        >
          {axes(true)}
          {series.map((s, i) => (
            <Line
              key={s.dataKey}
              type={curve}
              dataKey={s.dataKey}
              name={s.label ?? s.dataKey}
              stroke={chartColor(i, s.color)}
              dot={onDatumSelect ? shapes[i]!.dot : showDots}
              activeDot={onDatumSelect ? false : undefined}
              isAnimationActive={onDatumSelect ? false : animated}
            />
          ))}
        </RLineChart>
      );
    }
    if (kind === "area") {
      return (
        <RAreaChart
          accessibilityLayer={onDatumSelect ? false : undefined}
          data={data}
          onClick={onChartClick}
        >
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
              dot={onDatumSelect ? shapes[i]!.dot : showDots}
              activeDot={onDatumSelect ? false : undefined}
              isAnimationActive={onDatumSelect ? false : animated}
            />
          ))}
        </RAreaChart>
      );
    }
    return (
      <RBarChart
        accessibilityLayer={onDatumSelect ? false : undefined}
        data={data}
        layout={horizontal ? "vertical" : "horizontal"}
      >
        {axes(!horizontal)}
        {series.map((s, i) => (
          <Bar
            key={s.dataKey}
            dataKey={s.dataKey}
            name={s.label ?? s.dataKey}
            stackId={stacked ? "stack" : undefined}
            fill={chartColor(i, s.color)}
            radius={2}
            shape={onDatumSelect ? shapes[i]!.bar : undefined}
            isAnimationActive={onDatumSelect ? false : animated}
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
      interactive={!!onDatumSelect}
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
