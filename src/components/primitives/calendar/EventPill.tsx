import type { ComponentProps } from "react";
import { cn } from "../cn";

/**
 * EventPill — single-line clickable row for month-cell event lists.
 * Layout: `dot · HH:MM · title`. For all-day variants, callers should
 * use `AllDayChip` instead (different visual).
 */
export interface EventPillProps extends ComponentProps<"button"> {
  color: string;
  time?: string;
  title: string;
  dim?: boolean;
}

export function EventPill({
  color,
  time,
  title,
  dim = false,
  className,
  ...rest
}: EventPillProps) {
  return (
    <button
      type="button"
      className={cn("event-pill", className)}
      data-dim={dim || undefined}
      {...rest}
    >
      <span className="event-pill-dot" style={{ background: color }} />
      {time && <span className="event-pill-time">{time}</span>}
      <span className="event-pill-title">{title}</span>
    </button>
  );
}
