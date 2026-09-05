import * as React from "react";

import type { CompactBarTrendProp } from "../../props/components/charts.prop";
import { cn } from "../../lib/utils";
import { EmptyState } from "../data-display/empty-state";
import { useTranslation } from "../../i18n/use-translation";
import { ChartFrame, useChartNumberFormat } from "./chart-frame";
import { buildTrendSummary, resolveEmphasizedIndex, trendRatios } from "./chart-summary";

export type {
  CompactBarTrendProp,
  CompactBarTrendProp as CompactBarTrendProps,
} from "../../props/components/charts.prop";

/**
 * CompactBarTrend — a **dependency-free** compact vertical bar trend for dashboard summary cards
 * (a seven-day "new organizations" strip, a weekly activity pulse…). The only inline value is the
 * datum itself (`--chart-trend-bar-value`, a 0..1 ratio of the largest bar). - **Colour is
 * token-owned** — muted marks read `--chart-trend-bar-background` (default
 * `hsl(var(--muted-foreground) / .75)`), the emphasized mark reads
 * `--chart-trend-bar-emphasis-background` (default `hsl(var(--primary))`). - **a11y** — reuses
 * `ChartFrame`: a `<figure>` with a visible `<figcaption>`, a `role="img"` plot named by a
 * localized one-line summary, and a visually-hidden per-category value list referenced through
 * `aria-describedby` (WCAG 1.1.1).
 */
export function CompactBarTrend({
  data,
  categoryKey,
  valueKey,
  label,
  description,
  size = "xs",
  emphasizedIndex,
  showCategoryLabels = true,
  numberFormat,
  footer,
  emptyMessage,
  className,
  id,
  ref,
}: CompactBarTrendProp) {
  const { t } = useTranslation();
  const fmt = useChartNumberFormat(numberFormat);

  const hasData = data.length > 0;
  const emphasized = resolveEmphasizedIndex(emphasizedIndex, data.length);
  const ratios = React.useMemo(() => trendRatios(data, valueKey), [data, valueKey]);

  const summary = buildTrendSummary(
    data,
    categoryKey,
    valueKey,
    fmt,
    (counts) => t("chart.summaryTrend", { points: fmt.format(counts.points) }),
    (index) => (index === emphasized ? t("chart.trendCurrent") : undefined),
  );

  return (
    <ChartFrame
      ref={ref}
      label={label}
      description={description}
      summaryRows={summary.rows}
      imgSummary={summary.img}
      hasData={hasData}
      size={size}
      footer={footer}
      className={cn("ui-chart-trend", className)}
      id={id}
    >
      {hasData ? (
        <div className="ui-chart-trend-body">
          {/* Presentational marks: the figure's text alternative carries the data. */}
          <div className="ui-chart-trend-plot" aria-hidden="true">
            {data.map((datum, index) => (
              <div className="ui-chart-trend-column" key={`${String(datum[categoryKey])}-${index}`}>
                <div
                  className="ui-chart-trend-bar"
                  data-emphasized={index === emphasized ? "true" : undefined}
                  style={{ "--chart-trend-bar-value": ratios[index] } as React.CSSProperties}
                />
              </div>
            ))}
          </div>
          {showCategoryLabels ? (
            <div className="ui-chart-trend-ticks" aria-hidden="true">
              {data.map((datum, index) => (
                <span
                  className="ui-chart-trend-tick"
                  key={`${String(datum[categoryKey])}-${index}`}
                >
                  {String(datum[categoryKey] ?? "")}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      ) : (
        <EmptyState title={emptyMessage ?? t("chart.empty")} />
      )}
    </ChartFrame>
  );
}
