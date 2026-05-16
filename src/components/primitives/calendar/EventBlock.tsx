import type { CSSProperties, ReactNode } from "react";
import { cn } from "../cn";
import { DEFAULT_GRID, minToY, parseHM } from "./time";
import type { CalendarEvent, EventBlockVariant } from "./types";

/**
 * EventBlock — absolutely-positioned timed-event chip inside a
 * `GridColumn`. Supports four visual treatments:
 *
 *   - `solid`     — saturated brand color (customer / external meets)
 *   - `tint`      — soft-mixed background (organizer / accepted)
 *   - `tentative` — diagonal hatch over a soft tint
 *   - `focus`     — repeating subtle stripes (deep-work blocks)
 *
 * Multi-event overlap is handled by `lane` / `lanes` props (horizontal
 * slicing of the column). The selected state paints a 2px accent ring
 * via `--accent-color`.
 *
 * Service-agnostic: pass any `CalendarEvent`-shaped object + a `color`.
 */
export interface EventBlockProps {
  event: CalendarEvent;
  /** Event color (typically from the event's calendar). */
  color: string;
  variant?: EventBlockVariant;
  /** Whether the chip renders as the selected event (accent ring). */
  selected?: boolean;
  /** Horizontal lane index (0-based) for overlap layout. */
  lane?: number;
  /** Total lane count in the day. */
  lanes?: number;
  /** Day-grid configuration — must match the parent GridColumn. */
  dayStartH?: number;
  pxPerMin?: number;
  onClick?: (event: CalendarEvent) => void;
  /** Optional render-prop slot for trailing line (e.g. "cá nhân"). */
  footer?: ReactNode;
  className?: string;
}

export function EventBlock({
  event,
  color,
  variant = "tint",
  selected = false,
  lane = 0,
  lanes = 1,
  dayStartH = DEFAULT_GRID.dayStartH,
  pxPerMin = DEFAULT_GRID.pxPerMin,
  onClick,
  footer,
  className,
}: EventBlockProps) {
  const startVal = event.start ?? "00:00";
  const endVal = event.end ?? "23:59";
  const { h: sh, m: sm } = parseHM(startVal);
  const { h: eh, m: em } = parseHM(endVal);
  const top = minToY(sh, sm, { dayStartH, pxPerMin });
  const height = Math.max(20, minToY(eh, em, { dayStartH, pxPerMin }) - top - 1);
  const durationMin = eh * 60 + em - (sh * 60 + sm);
  const isShort = durationMin < 45;

  const bg =
    variant === "focus"
      ? `repeating-linear-gradient(135deg, ${color}24 0 6px, ${color}10 6px 12px)`
      : variant === "tentative"
        ? `repeating-linear-gradient(135deg, ${color}38 0 5px, transparent 5px 10px), color-mix(in oklch, ${color} 16%, var(--background))`
        : variant === "solid"
          ? color
          : `color-mix(in oklch, ${color} 18%, var(--background))`;

  const textColor = variant === "solid" ? "white" : color;

  const widthPct = `calc(${100 / Math.max(1, lanes)}% - 4px)`;
  const leftPct = `calc(${(100 * lane) / Math.max(1, lanes)}% + 2px)`;

  const style: CSSProperties = {
    top,
    height,
    left: leftPct,
    width: widthPct,
    background: bg,
    color: textColor,
  };

  return (
    <button
      type="button"
      className={cn("event-block", className)}
      data-short={isShort || undefined}
      data-selected={selected || undefined}
      data-variant={variant}
      style={style}
      onClick={() => onClick?.(event)}
    >
      <div style={{ display: "flex", gap: 4, alignItems: "baseline", minWidth: 0 }}>
        <span className="event-block-title">{event.title}</span>
      </div>
      {!isShort && (
        <div className="event-block-meta">
          {event.start}–{event.end}
          {event.location && (
            <span style={{ marginLeft: 6, opacity: 0.75 }}>· {event.location}</span>
          )}
        </div>
      )}
      {!isShort && footer && <div className="event-block-foot">{footer}</div>}
    </button>
  );
}

/**
 * Naïve lane allocator for overlapping timed events on a single day.
 * Mutates / annotates input objects with `_lane` and `_lanes`; returns
 * the sorted array. Reused by Week + Day screens.
 */
export interface LanedEvent extends CalendarEvent {
  _lane: number;
  _lanes: number;
}

export function layoutEvents(dayEvents: CalendarEvent[]): LanedEvent[] {
  const evs = [...dayEvents]
    .filter((e): e is CalendarEvent & { start: string; end: string } =>
      typeof e.start === "string" && typeof e.end === "string",
    )
    .sort((a, b) => a.start.localeCompare(b.start));
  const lanes: (CalendarEvent & { end: string })[][] = [];
  const annotated: LanedEvent[] = [];
  for (const e of evs) {
    let placed = false;
    for (let i = 0; i < lanes.length; i++) {
      const last = lanes[i][lanes[i].length - 1];
      if (last.end <= e.start) {
        lanes[i].push(e);
        annotated.push({ ...e, _lane: i, _lanes: 0 });
        placed = true;
        break;
      }
    }
    if (!placed) {
      lanes.push([e]);
      annotated.push({ ...e, _lane: lanes.length - 1, _lanes: 0 });
    }
  }
  const laneCount = Math.max(1, lanes.length);
  for (const a of annotated) a._lanes = laneCount;
  return annotated;
}
