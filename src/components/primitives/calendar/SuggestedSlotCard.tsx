import type { ComponentProps, ReactNode } from "react";
import { cn } from "../cn";

/**
 * SuggestedSlotCard — small button-shaped card surfacing a scheduling
 * recommendation. Two visual treatments: `default` (neutral border) and
 * `best` (accent border + accent text, e.g. "all attendees free").
 */
export interface SuggestedSlotCardProps extends ComponentProps<"button"> {
  label: ReactNode;
  meta?: ReactNode;
  /** Highlight as the best/recommended option. */
  best?: boolean;
}

export function SuggestedSlotCard({
  label,
  meta,
  best = false,
  className,
  ...rest
}: SuggestedSlotCardProps) {
  return (
    <button
      type="button"
      className={cn("slot-card", className)}
      data-best={best || undefined}
      {...rest}
    >
      <span className="slot-card-label">{label}</span>
      {meta && <span className="slot-card-meta">{meta}</span>}
    </button>
  );
}
