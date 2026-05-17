import type { ComponentProps } from "react";
import { cn } from "../../cn";

/**
 * CalendarOption — color-swatch + name label used inside calendar
 * pickers (e.g. "Save to which calendar" select). Stays presentational;
 * the consuming select / dropdown handles state.
 */
export interface CalendarOptionProps extends ComponentProps<"span"> {
  color: string;
  name: string;
  /** Suffix label (e.g. "(read-only)"). */
  meta?: string;
}

export function CalendarOption({
  color,
  name,
  meta,
  className,
  ...rest
}: CalendarOptionProps) {
  return (
    <span className={cn("cal-opt", className)} {...rest}>
      <span className="cal-opt-swatch" style={{ background: color }} />
      <span className="cal-opt-name">{name}</span>
      {meta && <span className="cal-opt-meta">· {meta}</span>}
    </span>
  );
}
