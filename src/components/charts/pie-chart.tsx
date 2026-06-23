import {
  Cell,
  Legend,
  Pie,
  PieChart as RPieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import type { PieChartProp } from "../../props/components/charts.prop";
import { EmptyState } from "../data-display/empty-state";
import { useTranslation } from "../../i18n/use-translation";
import { ChartFrame, chartColor, chartHeight, useChartNumberFormat } from "./chart-frame";
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
  data,
  dataKey,
  nameKey,
  colors,
  label,
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
  const { t } = useTranslation();
  const fmt = useChartNumberFormat(numberFormat);
  const hasData = data.length > 0;
  const summary = buildPieSummary(data, dataKey, nameKey, fmt, (c) =>
    t("chart.summaryPie", { slices: fmt.format(c.slices) }),
  );
  const resolvedHeight = chartHeight(size, height);

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
          <RPieChart>
            <Pie
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
