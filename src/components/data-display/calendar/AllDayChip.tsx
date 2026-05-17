import type { ComponentProps } from "react";
import { cn } from "../../cn";

/**
 * AllDayChip — solid-color rounded chip used for all-day events across
 * week-band, day-header strip, and month-cell rows.
 *
 * Sizes:
 *   - `compact` — week-band / detail rows
 *   - `month`   — month-cell rows (slightly smaller radius + font)
 *   - `pill`    — day-view header (full pill radius, larger font)
 */
export type AllDayChipSize = "compact" | "month" | "pill";

export interface AllDayChipProps extends ComponentProps<"button"> {
  color: string;
  size?: AllDayChipSize;
  children: ComponentProps<"button">["children"];
}

export function AllDayChip({
  color,
  size = "compact",
  className,
  style,
  children,
  ...rest
}: AllDayChipProps) {
  return (
    <button
      type="button"
      className={cn("allday-chip", className)}
      data-size={size}
      style={{ background: color, ...style }}
      {...rest}
    >
      {children}
    </button>
  );
}
