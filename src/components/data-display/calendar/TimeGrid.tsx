import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "../../cn";
import { DEFAULT_GRID, fmtHour, minToY, type TimeLocale } from "./time";

/**
 * TimeGrid primitives — `GridColumn` (a day-of-events column with
 * hour-line dividers), `TimeGutter` (the labelled hour rail next to
 * it), and `NowLine` (auto-refreshing horizontal indicator at the
 * current time). All consume `--accent-color`, `--surface-*`, `--border`
 * via the `.tg-*` classes in shell.css; no service-specific tokens.
 *
 * @example
 *   <div style={{ display: "grid", gridTemplateColumns: "60px 1fr" }}>
 *     <TimeGutter dayStartH={6} dayEndH={22} pxPerMin={0.9} locale="vi" />
 *     <GridColumn dayStartH={6} dayEndH={22} pxPerMin={0.9} isToday>
 *       <NowLine dayStartH={6} pxPerMin={0.9} />
 *       <EventBlock ... />
 *     </GridColumn>
 *   </div>
 */

export interface GridColumnProps {
  /** Day-start hour (inclusive). Default 6. */
  dayStartH?: number;
  /** Day-end hour (exclusive). Default 22. */
  dayEndH?: number;
  /** Vertical pixels per minute. Default 0.9 (1h = 54px). */
  pxPerMin?: number;
  /** Tints column subtly when true. */
  isToday?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

export function GridColumn({
  dayStartH = DEFAULT_GRID.dayStartH,
  dayEndH = DEFAULT_GRID.dayEndH,
  pxPerMin = DEFAULT_GRID.pxPerMin,
  isToday = false,
  className,
  style,
  children,
}: GridColumnProps) {
  const rows: ReactNode[] = [];
  const rowHeight = 60 * pxPerMin;
  for (let h = dayStartH; h < dayEndH; h++) {
    rows.push(<div key={h} className="tg-hour-row" style={{ height: rowHeight }} />);
  }
  return (
    <div
      className={cn("tg-col", className)}
      data-today={isToday || undefined}
      style={style}
    >
      {rows}
      {children}
    </div>
  );
}

export interface TimeGutterProps {
  dayStartH?: number;
  dayEndH?: number;
  pxPerMin?: number;
  locale?: TimeLocale;
  className?: string;
}

export function TimeGutter({
  dayStartH = DEFAULT_GRID.dayStartH,
  dayEndH = DEFAULT_GRID.dayEndH,
  pxPerMin = DEFAULT_GRID.pxPerMin,
  locale = "en",
  className,
}: TimeGutterProps) {
  const rows: ReactNode[] = [];
  const rowHeight = 60 * pxPerMin;
  for (let i = 0; i < dayEndH - dayStartH; i++) {
    rows.push(
      <div key={i} className="tg-hour-cell" style={{ height: rowHeight }}>
        <span className="tg-hour-label">
          {i === 0 ? "" : fmtHour(dayStartH + i, locale)}
        </span>
      </div>,
    );
  }
  return <div className={cn("tg-gutter", className)}>{rows}</div>;
}

export interface NowLineProps {
  /** Optional override; defaults to the live current time. */
  nowDate?: Date;
  dayStartH?: number;
  pxPerMin?: number;
  /** Auto-refresh interval in ms. Default 60_000 (1 minute). */
  refreshMs?: number;
}

export function NowLine({
  nowDate,
  dayStartH = DEFAULT_GRID.dayStartH,
  pxPerMin = DEFAULT_GRID.pxPerMin,
  refreshMs = 60_000,
}: NowLineProps) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (nowDate || refreshMs <= 0) return;
    const handle = window.setInterval(() => setTick((t) => t + 1), refreshMs);
    return () => window.clearInterval(handle);
  }, [nowDate, refreshMs]);

  const d = nowDate ?? new Date();
  void tick;
  const y = minToY(d.getHours(), d.getMinutes(), { dayStartH, pxPerMin });
  if (y < 0) return null;

  return (
    <>
      <div className="tg-now-dot" style={{ top: y - 5 }} />
      <div className="tg-now-line" style={{ top: y }} />
    </>
  );
}
