import type { ComponentProps, CSSProperties, ReactNode } from "react";
import { cn } from "../cn";

/**
 * Statistic — Ant-Design KPI tile.
 *
 *   <Statistic title="Active users" value={1024} />
 *   <Statistic title="Revenue" value={1234.56} precision={2} prefix="¥" />
 *   <Statistic title="Uptime" value={99.95} suffix="%" />
 *   <Statistic title="MRR" value={5800000} bordered />
 *
 * The `bordered` prop renders the tile with its own card-style frame
 * (border + radius + padding + background) so consumers don't need to
 * wrap with `<Card>` just to get a surface. Default `false` keeps the
 * tile transparent for use inside grids / dashboards where the parent
 * surface already provides the chrome.
 */

export interface StatisticProps extends Omit<ComponentProps<"div">, "title" | "prefix"> {
  title?: ReactNode;
  value: number | string;
  /** Decimal places when value is a number. */
  precision?: number;
  /** Prepended to value (e.g. "¥", icon). */
  prefix?: ReactNode;
  /** Appended to value (e.g. "%", "/mo"). */
  suffix?: ReactNode;
  /** Locale-aware grouping (default `true` — uses Intl.NumberFormat). */
  groupSeparator?: boolean;
  /** Custom format function. Overrides precision + groupSeparator. */
  formatter?: (value: number | string) => ReactNode;
  /** Text alignment for the tile (default `left`). */
  align?: "left" | "right" | "center";
  /** Font size of the value (px). */
  valueSize?: number;
  /** Render the tile as a standalone card surface (border + radius +
   * padding + bg). Default `false` — the tile is transparent so it
   * composes inside grids that supply their own chrome. */
  bordered?: boolean;
}

const ALIGN_CLASS: Record<NonNullable<StatisticProps["align"]>, string> = {
  left: "items-start text-left",
  right: "items-end text-right",
  center: "items-center text-center",
};

function formatValue(
  value: number | string,
  precision?: number,
  groupSeparator = true,
): string {
  if (typeof value !== "number") return String(value);
  const fixed = precision === undefined ? String(value) : value.toFixed(precision);
  if (!groupSeparator) return fixed;
  try {
    return new Intl.NumberFormat(undefined, {
      minimumFractionDigits: precision ?? 0,
      maximumFractionDigits: precision ?? 20,
    }).format(value);
  } catch {
    return fixed;
  }
}

export function Statistic({
  title,
  value,
  precision,
  prefix,
  suffix,
  groupSeparator = true,
  formatter,
  align = "left",
  valueSize,
  bordered = false,
  className,
  style,
  ...rest
}: StatisticProps) {
  const formatted = formatter
    ? formatter(value)
    : formatValue(value, precision, groupSeparator);
  const valueStyle: CSSProperties = valueSize
    ? { fontSize: `${valueSize}px` }
    : {};
  return (
    <div
      className={cn(
        "statistic",
        ALIGN_CLASS[align],
        bordered && "statistic-bordered",
        className,
      )}
      style={style}
      {...rest}
    >
      {title !== undefined && <div className="statistic-title">{title}</div>}
      <div className="statistic-value" style={valueStyle}>
        {prefix !== undefined && (
          <span className="statistic-prefix">{prefix}</span>
        )}
        <span className="statistic-number">{formatted}</span>
        {suffix !== undefined && (
          <span className="statistic-suffix">{suffix}</span>
        )}
      </div>
    </div>
  );
}
