import type { ComponentProps, ReactNode } from "react";
import { cn } from "../cn";

/**
 * MonthCell — one day cell of a 6×7 month grid. Render-prop friendly:
 * the `events` slot is anything the caller wants (`EventPill` /
 * `AllDayChip` / their own render). Includes a "+N more" overflow row
 * helper.
 */
export interface MonthCellProps extends Omit<ComponentProps<"div">, "children"> {
  day: number;
  /** Is this the today cell? Paints the day-number with accent. */
  today?: boolean;
  /** Is this cell from a different month? Dimmed. */
  dim?: boolean;
  /** Sat/Sun cell — slight tint. */
  weekend?: boolean;
  /** Optional small header chip next to the number (e.g. "Th. 5" when day === 1). */
  monthLabel?: ReactNode;
  /** Events to render — typically EventPill / AllDayChip components. */
  events?: ReactNode;
  /** Number of additional events beyond what's rendered. */
  overflow?: number;
  /** Localised "+N more" label builder. */
  formatOverflow?: (n: number) => ReactNode;
}

export function MonthCell({
  day,
  today = false,
  dim = false,
  weekend = false,
  monthLabel,
  events,
  overflow = 0,
  formatOverflow,
  className,
  ...rest
}: MonthCellProps) {
  return (
    <div
      className={cn("month-cell", className)}
      data-dim={dim || undefined}
      data-weekend={weekend || undefined}
      {...rest}
    >
      <div className="month-cell-head">
        <span className="month-cell-num" data-state={today ? "today" : undefined}>
          {day}
        </span>
        {monthLabel && <span className="month-cell-month-label">{monthLabel}</span>}
      </div>
      <div className="month-cell-events">
        {events}
        {overflow > 0 && (
          <span className="month-cell-more">
            {formatOverflow ? formatOverflow(overflow) : `+ ${overflow} more`}
          </span>
        )}
      </div>
    </div>
  );
}
