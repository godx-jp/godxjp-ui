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
} from "recharts";

import type { ChartDatum, ChartSeriesProp } from "../../props/components/charts.prop";
import { EmptyState } from "../data-display/empty-state";
import { useTranslation } from "../../i18n/use-translation";
import {
  ChartFrame,
  chartColor,
  chartHeight,
  useChartNumberFormat,
} from "./chart-frame";
import { buildCartesianSummary } from "./chart-summary";

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
  description?: React.ReactNode;
  size?: "xs" | "sm" | "md" | "lg";
  height?: number;
  showLegend?: boolean;
  showGrid?: boolean;
  numberFormat?: Intl.NumberFormatOptions;
  emptyMessage?: string;
  className?: string;
  id?: string;
  /** line/area */
  curved?: boolean;
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
  description,
  size = "md",
  height,
  showLegend = true,
  showGrid = true,
  numberFormat,
  emptyMessage,
  className,
  id,
  curved = false,
  stacked = false,
  horizontal = false,
}: CartesianChartProps) {
  const { t, locale } = useTranslation();
  const fmt = useChartNumberFormat(numberFormat);
  const list = React.useMemo(
    () => new Intl.ListFormat(locale, { style: "narrow", type: "unit" }),
    [locale],
  );

  const hasData = data.length > 0 && series.length > 0;
  const summary = buildCartesianSummary(data, series, categoryKey, fmt, list, (c) =>
    t("chart.summaryCartesian", { series: fmt.format(c.series), points: fmt.format(c.points) }),
  );

  const resolvedHeight = chartHeight(size, height);
  const tickFormatter = (value: number) => fmt.format(value);
  const curve = curved ? "monotone" : "linear";

  const axes = (numberAxisVertical: boolean) => (
    <>
      {showGrid ? <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /> : null}
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
          />
          <YAxis
            type="category"
            dataKey={categoryKey}
            tickLine={false}
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
        </>
      )}
      <Tooltip formatter={(value) => fmt.format(Number(value))} />
      {showLegend ? <Legend /> : null}
    </>
  );

  const chart = () => {
    if (kind === "line") {
      return (
        <RLineChart data={data}>
          {axes(true)}
          {series.map((s, i) => (
            <Line
              key={s.dataKey}
              type={curve}
              dataKey={s.dataKey}
              name={s.label ?? s.dataKey}
              stroke={chartColor(i, s.color)}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </RLineChart>
      );
    }
    if (kind === "area") {
      return (
        <RAreaChart data={data}>
          {axes(true)}
          {series.map((s, i) => (
            <Area
              key={s.dataKey}
              type={curve}
              dataKey={s.dataKey}
              name={s.label ?? s.dataKey}
              stackId={stacked ? "stack" : undefined}
              stroke={chartColor(i, s.color)}
              fill={chartColor(i, s.color)}
              fillOpacity={0.2}
              strokeWidth={2}
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
          />
        ))}
      </RBarChart>
    );
  };

  return (
    <ChartFrame
      label={label}
      description={description}
      summaryRows={summary.rows}
      imgSummary={summary.img}
      hasData={hasData}
      height={resolvedHeight}
      className={className}
      id={id}
    >
      {hasData ? (
        <ResponsiveContainer width="100%" height="100%">
          {chart()}
        </ResponsiveContainer>
      ) : (
        <EmptyState title={emptyMessage ?? t("chart.empty")} />
      )}
    </ChartFrame>
  );
}
