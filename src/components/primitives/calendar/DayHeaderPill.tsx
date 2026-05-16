import type { ComponentProps } from "react";
import { cn } from "../cn";

/**
 * DayHeaderPill — small day-of-week label + 32px circular day-of-month
 * pill rendered above each Week-view column.
 *
 *   default  — neutral
 *   today    — filled accent + white number
 *   selected — soft accent tint + accent number
 */
export type DayHeaderPillState = "default" | "today" | "selected";

export interface DayHeaderPillProps extends ComponentProps<"div"> {
  dow: string;
  day: number;
  state?: DayHeaderPillState;
}

export function DayHeaderPill({
  dow,
  day,
  state = "default",
  className,
  ...rest
}: DayHeaderPillProps) {
  return (
    <div className={cn("day-pill", className)} data-state={state} {...rest}>
      <span className="day-pill-dow">{dow}</span>
      <span className="day-pill-num">{day}</span>
    </div>
  );
}
