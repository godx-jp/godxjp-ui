import * as React from "react";
import {
  Cell,
  Sector,
  Legend,
  Pie,
  PieChart as RPieChart,
  ResponsiveContainer,
  Tooltip,
  assertRechartsPeer,
} from "./recharts-peer";

import type { PieChartProp } from "../../props/components/charts.prop";
import { EmptyState } from "../data-display/empty-state";
import { useTranslation } from "../../i18n/use-translation";
import { ChartFrame, chartColor, chartHeight, useChartNumberFormat } from "./chart-frame";
import { useChartDatumSelection } from "./chart-datum-selection";
import { buildPieSummary } from "./chart-summary";

export type {
  PieChartProp,
  PieChartProp as PieChartProps,
} from "../../props/components/charts.prop";

/**
 * Pie / donut chart — part-to-whole composition across a small set of slices.
 * Import from the tree-shaken `@godxjp/ui/charts` entry; requires the `recharts`
 * optional peer dependency.
 */
export function PieChart({
  onDatumSelect,
  data,
  dataKey,
  nameKey,
  colors,
  label,
  showCaption = true,
  description,
  size = "md",
  height,
  showLegend = true,
  numberFormat,
  donut = false,
  emptyMessage,
  className,
  id,
}: PieChartProp) {
  assertRechartsPeer();
  const { t } = useTranslation();
  const fmt = useChartNumberFormat(numberFormat);
  const points = data.flatMap((datum, index) =>
    typeof datum[dataKey] === "number" &&
    Number.isFinite(datum[dataKey]) &&
    Number(datum[dataKey]) > 0
      ? [{ index, series: 0 }]
      : [],
  );
  const markProps = useChartDatumSelection(points);
  const shape = (raw: unknown) => {
    const props = raw as React.ComponentProps<typeof Sector> & { index: number };
    const datum = data[props.index];
    if (!datum || !points.some((p) => p.index === props.index)) return <g />;
    return (
      <Sector
        {...props}
        {...markProps(
          props.index,
          0,
          t("chart.datumLabel", {
            label: String(datum[nameKey] ?? ""),
            series: dataKey,
            value: fmt.format(Number(datum[dataKey])),
          }),
          () => onDatumSelect?.(datum, { seriesKey: dataKey, index: props.index }),
        )}
      />
    );
  };
  const shapeRef = React.useRef(shape);
  shapeRef.current = shape;
  const stableShape = React.useCallback((raw: unknown) => shapeRef.current(raw), []);
  const hasData = data.length > 0;
  const summary = buildPieSummary(data, dataKey, nameKey, fmt, (c) =>
    t("chart.summaryPie", { slices: fmt.format(c.slices) }),
  );
  const resolvedHeight = chartHeight(size, height);

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
      className={className}
      id={id}
    >
      {hasData ? (
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <RPieChart accessibilityLayer={onDatumSelect ? false : undefined}>
            <Pie
              shape={onDatumSelect ? stableShape : undefined}
              isAnimationActive={onDatumSelect ? false : undefined}
              data={data}
              dataKey={dataKey}
              nameKey={nameKey}
              innerRadius={donut ? "55%" : 0}
              outerRadius="80%"
              paddingAngle={donut ? 2 : 0}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={chartColor(i, colors?.[i])} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => fmt.format(Number(value))} />
            {showLegend ? <Legend /> : null}
          </RPieChart>
        </ResponsiveContainer>
      ) : (
        <EmptyState title={emptyMessage ?? t("chart.empty")} />
      )}
    </ChartFrame>
  );
}
