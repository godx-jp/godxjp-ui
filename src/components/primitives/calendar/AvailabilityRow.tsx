import type { ReactNode } from "react";
import { cn } from "../cn";

/**
 * AvailabilityRow — one person × N time-slot row used in scheduling /
 * find-a-time grids. Generic over the slot dimension: `slots[i] = 0`
 * (free), `1` (tentative — hatched), `2` (busy — solid tint). An
 * optional `selectedRange` paints the picked-time overlay in accent.
 *
 * Two-cell grid: `personSlot | cellsSlot`, sized externally.
 */
export interface AvailabilityRowProps {
  /** Person slot — typically `<AttendeeListItem>` or a name + avatar. */
  person: ReactNode;
  /** 0 = free, 1 = tentative, 2 = busy — one per slot index. */
  slots: ReadonlyArray<0 | 1 | 2>;
  /** [startSlotInclusive, endSlotExclusive] — paints the accent overlay. */
  selectedRange?: [number, number] | null;
  className?: string;
}

export function AvailabilityRow({
  person,
  slots,
  selectedRange,
  className,
}: AvailabilityRowProps) {
  const slotCount = slots.length || 1;
  return (
    <div className={cn("avail-row", className)}>
      <div className="avail-row-person">{person}</div>
      <div
        className="avail-row-cells"
        style={{ gridTemplateColumns: `repeat(${slotCount}, 1fr)` }}
      >
        {slots.map((v, i) => (
          <div key={i} className="avail-cell" data-state={v} />
        ))}
        {selectedRange && (
          <div
            className="avail-row-overlay"
            style={{
              left: `${(selectedRange[0] / slotCount) * 100}%`,
              width: `${((selectedRange[1] - selectedRange[0]) / slotCount) * 100}%`,
            }}
          />
        )}
      </div>
    </div>
  );
}
