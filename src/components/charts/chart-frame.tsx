import * as React from "react";

import { cn } from "../../lib/utils";
import { useTranslation } from "../../i18n/use-translation";

/**
 * Shared chart chrome — owns the cross-cutting concerns every chart needs so the
 * individual chart wrappers stay tiny:
 *   - a11y: a `<figure>` with a visible `<figcaption>` title and a screen-reader
 *     text alternative (WCAG 1.1.1) describing the plotted data, with the SVG
 *     itself marked `role="img"` so AT announces one labelled graphic.
 *   - i18n: a locale-aware `Intl.NumberFormat` shared by axis ticks + tooltips.
 *   - tokens: the `--chart-1..6` palette + size→height tiers.
 *
 * Internal — NOT a public catalog primitive (re-exported only through the chart
 * wrappers). See check-mcp-orphans ALLOWLIST.
 */

/** Canonical decorative chart palette (foundation tokens). */
export const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
] as const;

/** Resolve a series/slice colour: explicit wins, else cycle the palette by index. */
export function chartColor(index: number, explicit?: string): string {
  return explicit ?? CHART_COLORS[index % CHART_COLORS.length];
}

const SIZE_HEIGHT: Record<"xs" | "sm" | "md" | "lg", number> = {
  xs: 160,
  sm: 220,
  md: 300,
  lg: 400,
};

/** Resolve the canvas height: explicit px overrides the `size` tier. */
export function chartHeight(size: "xs" | "sm" | "md" | "lg" = "md", height?: number): number {
  return height ?? SIZE_HEIGHT[size];
}

/** A locale-bound number formatter for the active app locale. */
export function useChartNumberFormat(options?: Intl.NumberFormatOptions): Intl.NumberFormat {
  const { locale } = useTranslation();
  return React.useMemo(() => new Intl.NumberFormat(locale, options), [locale, options]);
}

type ChartFrameProps = {
  /** Visible caption; also the accessible name via `aria-labelledby` → `<figcaption>`. */
  label: React.ReactNode;
  /** Extra context appended to the screen-reader description. */
  description?: React.ReactNode;
  /** Pre-formatted "category: value" rows for the screen-reader text alternative. */
  summaryRows: string[];
  /** Concise summary read on the `role="img"` SVG wrapper. */
  imgSummary: string;
  /** True when there is data to plot (otherwise children render an empty state). */
  hasData: boolean;
  height: number;
  className?: string;
  id?: string;
  children: React.ReactNode;
};

/**
 * The accessible figure wrapper. The recharts SVG passed as `children` is wrapped
 * in a `role="img"` element with a short `aria-label`; the full data is exposed as
 * a sibling visually-hidden list referenced by the figure's `aria-describedby`.
 */
export function ChartFrame({
  label,
  description,
  summaryRows,
  imgSummary,
  hasData,
  height,
  className,
  id,
  children,
}: ChartFrameProps) {
  const reactId = React.useId();
  const titleId = `${id ?? reactId}-title`;
  const descId = `${id ?? reactId}-desc`;

  return (
    <figure
      id={id}
      data-slot="chart"
      className={cn("ui-chart", className)}
      aria-labelledby={titleId}
      aria-describedby={descId}
    >
      <figcaption id={titleId} className="ui-chart-title">
        {label}
      </figcaption>
      <div className="ui-chart-canvas" style={{ height }} role="img" aria-label={imgSummary}>
        {children}
      </div>
      {/* Screen-reader text alternative — the plotted data as a readable list. */}
      <p id={descId} className="sr-only">
        {description ? <>{description} </> : null}
        {hasData ? imgSummary : null}
      </p>
      {hasData ? (
        <ul className="sr-only">
          {summaryRows.map((row, i) => (
            <li key={i}>{row}</li>
          ))}
        </ul>
      ) : null}
    </figure>
  );
}
