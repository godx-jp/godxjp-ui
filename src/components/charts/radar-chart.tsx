import * as React from "react";
import type { RadarChartProp } from "../../props/components/charts.prop";
import { EmptyState } from "../data-display/empty-state";
import { useTranslation } from "../../i18n/use-translation";
import { ChartFrame, chartColor, chartHeight, useChartNumberFormat } from "./chart-frame";
export type {
  RadarChartProp,
  RadarChartProp as RadarChartProps,
} from "../../props/components/charts.prop";

/** Shared-scale profile. SVG geometry is intrinsic, never consumer CSS or inferred scores. */
export function RadarChart({
  data,
  categoryKey,
  valueKey,
  valueMax,
  valueTicks,
  label,
  showCaption = true,
  description,
  size = "md",
  numberFormat,
  emptyMessage,
  footer,
  className,
  id,
  ref,
}: RadarChartProp) {
  const { t } = useTranslation();
  const fmt = useChartNumberFormat(numberFormat);
  const uid = React.useId();
  const valid =
    data.length >= 3 &&
    data.length <= 6 &&
    Number.isFinite(valueMax) &&
    valueMax > 0 &&
    data.every(
      (d) =>
        typeof d[valueKey] === "number" &&
        Number.isFinite(d[valueKey]) &&
        Number(d[valueKey]) >= 0 &&
        Number(d[valueKey]) <= valueMax,
    );
  const point = (index: number, fraction: number, radius = 104) => {
    const angle = -Math.PI / 2 + (index * Math.PI * 2) / data.length;
    return [240 + Math.cos(angle) * radius * fraction, 160 + Math.sin(angle) * radius * fraction];
  };
  const polygon = (fraction: number) => data.map((_, i) => point(i, fraction).join(",")).join(" ");
  const rows = data.map(
    (d) => `${String(d[categoryKey] ?? "")}: ${fmt.format(Number(d[valueKey]))}`,
  );
  const summary = t("chart.summaryCartesian", {
    series: fmt.format(1),
    points: fmt.format(data.length),
  });
  const ticks = valueTicks
    ?.filter((v) => Number.isFinite(v) && v > 0 && v <= valueMax)
    .map((v) => v / valueMax) ?? [0.25, 0.5, 0.75, 1];
  const stroke = "hsl(var(--muted-foreground))";
  return (
    <ChartFrame
      ref={ref}
      label={label}
      showCaption={showCaption}
      description={description}
      summaryRows={rows}
      imgSummary={summary}
      hasData={valid}

      size={size}
      footer={footer}
      className={className}
      id={id}
    >
      {valid ? (
        <svg
          width="100%"
          style={{ maxHeight: chartHeight(size), display: "block" }}
          viewBox="0 0 480 320"
          aria-hidden="true"
          data-slot="radar-plot"
        >
          <title id={`${uid}-radar-title`}>{typeof label === "string" ? label : summary}</title>
          <desc>{rows.join("; ")}</desc>
          {ticks.map((f) => (
            <polygon
              key={f}
              points={polygon(f)}
              fill="none"
              stroke={stroke}
              opacity={f === 1 ? 0.5 : 0.18}
            />
          ))}
          {data.map((_, i) => {
            const [x, y] = point(i, 1);
            return <line key={i} x1={240} y1={160} x2={x} y2={y} stroke={stroke} opacity={0.22} />;
          })}
          {ticks.map((f) => (
            <text
              key={f}
              x={234}
              y={160 - f * 104}
              textAnchor="end"
              fill={stroke}
              fontSize="var(--font-size-xs)"
            >
              {fmt.format(valueMax * f)}
            </text>
          ))}
          <polygon
            data-slot="radar-area"
            points={data
              .map((d, i) => point(i, Number(d[valueKey]) / valueMax).join(","))
              .join(" ")}
            fill={chartColor(0)}
            fillOpacity="var(--chart-area-fill-alpha)"
            stroke={chartColor(0)}
            strokeWidth="var(--chart-series-stroke-width)"
            strokeLinejoin="round"
          />
          {data.map((d, i) => {
            const [x, y] = point(i, Number(d[valueKey]) / valueMax);
            const [lx, ly] = point(i, 1, 140);
            const fullLabel = String(d[categoryKey] ?? "");
            const side = Math.abs(lx - 240) > 2;
            const budget = side ? 6 : 22;
            let shown = "";
            let units = 0;
            for (const char of Array.from(fullLabel)) {
              const width = /[^\x00-\x7F]/.test(char) ? 2 : 1;
              if (units + width > budget) break;
              shown += char;
              units += width;
            }
            if (shown !== fullLabel) shown += "…";
            return (
              <g key={i}>
                <circle cx={x} cy={y} r={3.5} fill={chartColor(0)} />
                <text
                  x={lx}
                  y={ly}
                  textAnchor={lx > 242 ? "start" : lx < 238 ? "end" : "middle"}
                  dominantBaseline="middle"
                  fill="hsl(var(--foreground))"
                  fontSize="var(--font-size-lg)"
                  fontFamily="inherit"
                >
                  <title>
                    {fullLabel}: {fmt.format(Number(d[valueKey]))}
                  </title>
                  <tspan>{shown}</tspan>
                  <tspan fontWeight="bold"> · {fmt.format(Number(d[valueKey]))}</tspan>
                </text>
              </g>
            );
          })}
        </svg>
      ) : (
        <EmptyState title={emptyMessage ?? t("chart.empty")} />
      )}
    </ChartFrame>
  );
}
