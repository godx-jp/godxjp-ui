import * as React from "react";
import type { RadarChartProp } from "../../props/components/charts.prop";
import { EmptyState } from "../data-display/empty-state";
import { useTranslation } from "../../i18n/use-translation";
import { ChartFrame, chartColor, chartHeight, useChartNumberFormat } from "./chart-frame";
export type {
  RadarChartProp,
  RadarChartProp as RadarChartProps,
} from "../../props/components/charts.prop";

/** Wrap words where possible; long words and Japanese text split only at grapheme boundaries. */
function wrapLabel(
  text: string,
  locale: string,
  width: number,
  measure: (text: string) => number,
): string[] {
  const words = new Intl.Segmenter(locale, { granularity: "word" });
  const graphemes = new Intl.Segmenter(locale, { granularity: "grapheme" });
  const lines: string[] = [];
  let line = "";
  for (const { segment } of words.segment(text)) {
    if (measure(line + segment) <= width) {
      line += segment;
      continue;
    }
    if (line.trim()) {
      lines.push(line.trim());
      line = "";
    }
    for (const { segment: char } of graphemes.segment(segment.trimStart())) {
      if (line && measure(line + char) > width) {
        lines.push(line);
        line = "";
      }
      line += char;
    }
  }
  if (line.trim()) lines.push(line.trim());
  if (lines.length <= 2) return lines;
  const last = Array.from(graphemes.segment(lines[1]), (part) => part.segment);
  while (last.length && measure(last.join("") + "…") > width) last.pop();
  return [lines[0], last.join("") + "…"];
}

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
  const { t, locale } = useTranslation();
  const fmt = useChartNumberFormat(numberFormat ?? { maximumSignificantDigits: 21 });
  const uid = React.useId();
  const svgRef = React.useRef<SVGSVGElement>(null);
  const [measuredLabels, setMeasuredLabels] = React.useState<
    { lines: string[]; lineHeight: number }[]
  >([]);
  React.useEffect(() => {
    const svg = svgRef.current;
    // SSR/jsdom retain the conservative text fallback; the browser uses actual font metrics.
    if (!svg || typeof svg.getBBox !== "function") return;
    let disposed = false;
    const context = document.createElement("canvas").getContext("2d");
    if (!context) return;
    const update = () => {
      if (disposed) return;
      const lines = Array.from(
        svg.querySelectorAll<SVGTextElement>('[data-slot="radar-label"]'),
        (node, index) => {
          const style = getComputedStyle(node);
          context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
          const transform = new DOMMatrix(style.transform);
          const inset = parseFloat(style.getPropertyValue("--radar-chart-label-inset")) || 0;
          const width =
            Math.abs(transform.e) > 1 ? 240 - Math.abs(transform.e) - inset : 480 - inset * 2;
          return {
            lines: wrapLabel(
              String(data[index][categoryKey] ?? ""),
              locale,
              Math.max(1, width),
              (text) => context.measureText(text).width,
            ),
            lineHeight:
              parseFloat(style.getPropertyValue("--radar-chart-label-line-height")) || 1.25,
          };
        },
      );
      setMeasuredLabels((previous) =>
        JSON.stringify(previous) === JSON.stringify(lines) ? previous : lines,
      );
    };
    update();
    const resize = new ResizeObserver(update);
    resize.observe(svg);
    const theme = new MutationObserver(update);
    for (let node: Element | null = svg; node; node = node.parentElement) {
      theme.observe(node, {
        attributes: true,
        attributeFilter: ["class", "style", "data-theme", "data-tenant"],
      });
    }
    void document.fonts?.ready.then(update);
    return () => {
      disposed = true;
      resize.disconnect();
      theme.disconnect();
    };
  }, [data, categoryKey, locale, size, valueMax]);
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
  const point = (index: number, fraction: number, radius = 1) => {
    const angle = -Math.PI / 2 + (index * Math.PI * 2) / data.length;
    return [Math.cos(angle) * radius * fraction, Math.sin(angle) * radius * fraction];
  };
  const polygon = (fraction: number) => data.map((_, i) => point(i, fraction).join(",")).join(" ");
  const rows = data.map(
    (d) => `${String(d[categoryKey] ?? "")}: ${fmt.format(Number(d[valueKey]))}`,
  );
  const summary = t("chart.summaryRadar", {
    maximum: fmt.format(valueMax),
    points: fmt.format(data.length),
  });
  const ticks = valueTicks
    ?.filter((v) => Number.isFinite(v) && v > 0 && v <= valueMax)
    .map((v) => v / valueMax) ?? [0.25, 0.5, 0.75, 1];
  const stroke = "hsl(var(--radar-chart-grid-color, var(--muted-foreground)))";
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
          ref={svgRef}
          width="100%"
          style={{ maxHeight: chartHeight(size), display: "block" }}
          viewBox="0 0 480 320"
          aria-hidden="true"
          data-slot="radar-plot"
        >
          <title id={`${uid}-radar-title`}>{typeof label === "string" ? label : summary}</title>
          <desc>{rows.join("; ")}</desc>
          <g transform="translate(240 160)">
            {ticks.map((f) => (
              <polygon
                key={f}
                points={polygon(f)}
                fill="none"
                style={{ transform: "scale(var(--radar-chart-plot-radius))" }}
                vectorEffect="non-scaling-stroke"
                strokeWidth="var(--radar-chart-grid-stroke-width)"
                stroke={stroke}
                opacity={
                  f === 1 ? "var(--radar-chart-boundary-alpha)" : "var(--radar-chart-grid-alpha)"
                }
              />
            ))}
            {data.map((_, i) => {
              const [x, y] = point(i, 1);
              return (
                <line
                  key={i}
                  strokeWidth="var(--radar-chart-grid-stroke-width)"
                  x1={0}
                  y1={0}
                  x2={x}
                  y2={y}
                  stroke={stroke}
                  opacity="var(--radar-chart-axis-alpha)"
                  vectorEffect="non-scaling-stroke"
                  style={{ transform: "scale(var(--radar-chart-plot-radius))" }}
                />
              );
            })}
            {ticks.map((f) => (
              <text
                key={f}
                data-slot="radar-tick"
                style={{
                  transform: `translate(calc(-1 * var(--radar-chart-tick-offset)), calc(-${f} * var(--radar-chart-plot-radius) * 1px))`,
                }}
                textAnchor="end"
                fill={stroke}
                fontSize="var(--radar-chart-tick-font-size)"
              >
                {fmt.format(valueMax * f)}
              </text>
            ))}
            <polygon
              data-slot="radar-area"
              style={{ transform: "scale(var(--radar-chart-plot-radius))" }}
              vectorEffect="non-scaling-stroke"
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
              const [lx, ly] = point(i, 1);
              const fullLabel = String(d[categoryKey] ?? "");
              const shown =
                measuredLabels[i]?.lines ??
                wrapLabel(fullLabel, locale, Math.abs(lx) > 0.1 ? 104 : 400, (text) =>
                  Array.from(text).reduce(
                    (width, char) => width + (char.codePointAt(0)! > 255 ? 16 : 9),
                    0,
                  ),
                );
              return (
                <g key={i}>
                  <circle
                    r="var(--radar-chart-point-radius)"
                    style={{
                      transform: `translate(calc(${x} * var(--radar-chart-plot-radius) * 1px), calc(${y} * var(--radar-chart-plot-radius) * 1px))`,
                    }}
                    fill={chartColor(0)}
                  />
                  <text
                    data-slot="radar-label"
                    style={{
                      transform: `translate(calc(${lx} * var(--radar-chart-label-radius)), calc(${ly} * var(--radar-chart-label-radius)))`,
                    }}
                    textAnchor={lx > 0.1 ? "start" : lx < -0.1 ? "end" : "middle"}
                    dominantBaseline="middle"
                    fill="hsl(var(--radar-chart-label-color, var(--foreground)))"
                    fontSize="var(--radar-chart-label-font-size)"
                    fontFamily="inherit"
                  >
                    <title>
                      {fullLabel}: {fmt.format(Number(d[valueKey]))}
                    </title>
                    {shown.map((line, index) => (
                      <tspan
                        key={index}
                        x={0}
                        dy={index ? `${measuredLabels[i]?.lineHeight ?? 1.25}em` : 0}
                      >
                        {line}
                      </tspan>
                    ))}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      ) : (
        <EmptyState title={emptyMessage ?? t("chart.empty")} />
      )}
    </ChartFrame>
  );
}
