import * as React from "react";

import { cn } from "../../lib/utils";
import type {
  TimelineGridEventProp,
  TimelineGridProp,
} from "../../props/components/data-display.prop";

export type {
  TimelineGridColumnProp,
  TimelineGridEventProp,
  TimelineGridProp,
  TimelineGridProp as TimelineGridProps,
} from "../../props/components/data-display.prop";

const MINUTES_PER_DAY = 24 * 60;
const CLOCK = /^(\d{1,2}):(\d{2})$/;

/**
 * `"HH:MM"` → minutes past midnight, or `null` when the string is not a clock time.
 * `"24:00"` is accepted as end-of-day (ISO 8601 spells the day's upper bound that way, and a
 * shift table that ends at midnight has to be able to say so).
 */
function toMinutes(value: string): number | null {
  const match = CLOCK.exec(value.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return null;
  if (hours > 24 || minutes > 59 || (hours === 24 && minutes !== 0)) return null;
  return hours * 60 + minutes;
}

/** minutes → `"HH:MM"`, the form the axis and the block both print. */
function toClock(minutes: number): string {
  const total = ((Math.round(minutes) % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const hours = Math.floor(total / 60);
  const rest = total % 60;
  return `${String(hours).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}

type ResolvedEvent = {
  event: TimelineGridEventProp;
  /** Start, minutes past midnight. */
  startMin: number;
  /**
   * End, minutes past the SAME midnight — so a shift that runs into the next day (`end` at or
   * before `start`, the 22:00–06:00 night shift) is `end + 1440`, not a negative duration.
   */
  endMin: number;
  lane: number;
  lanes: number;
};

/** Parse one event; `null` when either clock time is malformed. */
function resolveEvent(event: TimelineGridEventProp): Omit<ResolvedEvent, "lane" | "lanes"> | null {
  const startMin = toMinutes(event.start);
  const endMin = toMinutes(event.end);
  if (startMin === null || endMin === null) return null;
  return { event, startMin, endMin: endMin > startMin ? endMin : endMin + MINUTES_PER_DAY };
}

/**
 * Side-by-side placement for events that overlap in time.
 *
 * Two shifts on the same day are the normal case, not the exception, and a grid that stacks them
 * at the same coordinates HIDES one of them — the defect the hand-rolled grids in `docs/showcase`
 * shipped. Lanes are assigned greedily per CLUSTER (a maximal run of events that transitively
 * overlap), so one long block does not halve the width of every unrelated block in the column.
 */
function placeColumn(
  events: readonly Omit<ResolvedEvent, "lane" | "lanes">[],
): readonly ResolvedEvent[] {
  const sorted = [...events].sort((a, b) => a.startMin - b.startMin || a.endMin - b.endMin);
  const placed: ResolvedEvent[] = [];
  let cluster: ResolvedEvent[] = [];
  let clusterEnd = Number.NEGATIVE_INFINITY;
  let laneEnds: number[] = [];

  const closeCluster = () => {
    const lanes = Math.max(laneEnds.length, 1);
    for (const entry of cluster) placed.push({ ...entry, lanes });
    cluster = [];
    laneEnds = [];
    clusterEnd = Number.NEGATIVE_INFINITY;
  };

  for (const entry of sorted) {
    if (entry.startMin >= clusterEnd) closeCluster();
    let lane = laneEnds.findIndex((end) => end <= entry.startMin);
    if (lane === -1) lane = laneEnds.length;
    laneEnds[lane] = entry.endMin;
    clusterEnd = Math.max(clusterEnd, entry.endMin);
    cluster.push({ ...entry, lane, lanes: 1 });
  }
  closeCluster();
  return placed;
}

/** The visible window: the consumer's `start`/`end`, else the events' own span on whole hours. */
function resolveWindow(
  start: string | undefined,
  end: string | undefined,
  events: readonly Omit<ResolvedEvent, "lane" | "lanes">[],
): { startMin: number; endMin: number } {
  const pinnedStart = start === undefined ? null : toMinutes(start);
  const pinnedEnd = end === undefined ? null : toMinutes(end);
  let windowStart = pinnedStart;
  let windowEnd = pinnedEnd;

  if (windowStart === null || windowEnd === null) {
    // Deriving the window from the events is what keeps the default safe: a block can only fall
    // outside the axis once the consumer has PINNED an axis that excludes it.
    let earliest = Number.POSITIVE_INFINITY;
    let latest = Number.NEGATIVE_INFINITY;
    for (const entry of events) {
      earliest = Math.min(earliest, entry.startMin);
      latest = Math.max(latest, Math.min(entry.endMin, MINUTES_PER_DAY));
    }
    if (Number.isFinite(earliest)) {
      windowStart ??= Math.floor(earliest / 60) * 60;
      windowEnd ??= Math.ceil(latest / 60) * 60;
    } else {
      windowStart ??= 0;
      windowEnd ??= MINUTES_PER_DAY;
    }
  }
  // An inverted or empty window would divide by zero; fall back to one hour.
  if (windowEnd <= windowStart) windowEnd = windowStart + 60;
  return { startMin: windowStart, endMin: windowEnd };
}

/**
 * TimelineGrid — the time-axis half of the Timeline family: a vertical hour axis, one column per
 * day (or room, or machine) and event blocks placed by start time and duration.
 *
 * WHAT IT IS NOT: a calendar. There is no month view, no navigation, no drag-to-create, no
 * recurrence and no timezone conversion. `start`/`end` are clock times in the column's own day;
 * which day a column stands for is the consumer's business.
 *
 * SEMANTICS: each column is a `ul` named by its own head, and each event is an `li` that PRINTS
 * its time range as text. A screen reader therefore reads "木 14, list, 3 items — 09:00–17:30
 * 早番 田中 …" in time order, which is the same information the sighted reader takes from the
 * block's position. Nothing depends on the pixel offset. The hour rail is decorative
 * (`aria-hidden`) because it repeats what every block already says.
 */
export const TimelineGrid = React.forwardRef<HTMLDivElement, TimelineGridProp>(
  function TimelineGrid(
    { label, columns, events, start, end, interval = 1, now, onEventSelect, className, id },
    ref,
  ) {
    const uid = React.useId();
    const columnIndex = React.useMemo(() => {
      const map = new Map<string, number>();
      columns.forEach((column, index) => map.set(column.id, index));
      return map;
    }, [columns]);

    const resolved = React.useMemo(() => {
      const out: (Omit<ResolvedEvent, "lane" | "lanes"> & { columnIndex: number })[] = [];
      for (const event of events) {
        const index = columnIndex.get(event.columnId);
        if (index === undefined) continue;
        const parsed = resolveEvent(event);
        if (parsed) out.push({ ...parsed, columnIndex: index });
      }
      return out;
    }, [events, columnIndex]);

    const axis = React.useMemo(() => resolveWindow(start, end, resolved), [start, end, resolved]);
    const span = axis.endMin - axis.startMin;
    const hours = span / 60;
    const step = Number.isFinite(interval) && interval > 0 ? interval : 1;

    const byColumn = React.useMemo(() => {
      const buckets = columns.map(() => [] as Omit<ResolvedEvent, "lane" | "lanes">[]);
      for (const entry of resolved) {
        // Drawn only if it actually overlaps the window — a pinned axis can exclude an event.
        if (entry.endMin <= axis.startMin || entry.startMin >= axis.endMin) continue;
        buckets[entry.columnIndex].push(entry);
      }
      return buckets.map((bucket) =>
        [...placeColumn(bucket)].sort((a, b) => a.startMin - b.startMin || a.lane - b.lane),
      );
    }, [columns, resolved, axis.startMin, axis.endMin]);

    const ticks = React.useMemo(() => {
      const out: { minutes: number; offset: number }[] = [];
      for (let minutes = axis.startMin; minutes <= axis.endMin; minutes += step * 60) {
        out.push({ minutes, offset: (minutes - axis.startMin) / 60 });
      }
      return out;
    }, [axis.startMin, axis.endMin, step]);

    const nowMin = now === undefined ? null : toMinutes(now);
    const nowOffset =
      nowMin !== null && nowMin >= axis.startMin && nowMin <= axis.endMin
        ? (nowMin - axis.startMin) / 60
        : null;

    return (
      <div
        ref={ref}
        id={id}
        data-slot="timeline-grid"
        className={cn("ui-timeline-grid ui-focus-ring", className)}
        // A scrolling region has to be a tab stop, or a keyboard-only reader can never reach the
        // columns that start off-screen. jsdom reports no overflow, so no axe run can catch this
        // — `timeline-grid-354.test.tsx` asserts the tabIndex directly instead.
        tabIndex={0}
        role="group"
        aria-label={label}
        style={
          {
            "--timeline-grid-hours": hours,
            "--timeline-grid-columns": columns.length,
            "--timeline-grid-interval": step,
          } as React.CSSProperties
        }
      >
        <div className="ui-timeline-grid-frame">
          <div className="ui-timeline-grid-corner" aria-hidden="true" />
          {columns.map((column, index) => (
            <div
              key={column.id}
              id={`${uid}-head-${index}`}
              className="ui-timeline-grid-head"
              data-current={column.current ? "true" : undefined}
            >
              <span className="ui-timeline-grid-head-label">{column.label}</span>
              {column.description === undefined ? null : (
                <span className="ui-timeline-grid-head-description">{column.description}</span>
              )}
            </div>
          ))}

          {/* The rail is a ruler for the eye; every block prints its own time range as text. */}
          <div className="ui-timeline-grid-axis" aria-hidden="true">
            {ticks.map((tick) => (
              <span
                key={tick.minutes}
                className="ui-timeline-grid-tick"
                style={{ "--timeline-grid-tick-offset": tick.offset } as React.CSSProperties}
              >
                {toClock(tick.minutes)}
              </span>
            ))}
          </div>

          {columns.map((column, index) => (
            <ul
              key={column.id}
              className="ui-timeline-grid-column"
              aria-labelledby={`${uid}-head-${index}`}
              data-current={column.current ? "true" : undefined}
            >
              {byColumn[index].map((entry) => renderEvent(entry, axis, onEventSelect))}
              {column.current && nowOffset !== null ? (
                <li
                  aria-hidden="true"
                  className="ui-timeline-grid-now"
                  style={{ "--timeline-grid-now-offset": nowOffset } as React.CSSProperties}
                />
              ) : null}
            </ul>
          ))}
        </div>
      </div>
    );
  },
);
TimelineGrid.displayName = "TimelineGrid";

/** One block: the `li` owns the geometry, the inner element owns the chrome and the hit area. */
function renderEvent(
  entry: ResolvedEvent,
  axis: { startMin: number; endMin: number },
  onEventSelect: TimelineGridProp["onEventSelect"],
): React.ReactElement {
  const { event } = entry;
  const from = Math.max(entry.startMin, axis.startMin);
  const to = Math.min(entry.endMin, axis.endMin);
  const clippedStart = entry.startMin < axis.startMin;
  const clippedEnd = entry.endMin > axis.endMin;
  const clipped = clippedStart && clippedEnd ? "both" : clippedStart ? "start" : "end";
  const range = `${toClock(entry.startMin)}–${toClock(entry.endMin)}`;

  const body = (
    <>
      <span className="ui-timeline-grid-event-time">{range}</span>
      <span className="ui-timeline-grid-event-title">{event.title}</span>
      {event.description === undefined ? null : (
        <span className="ui-timeline-grid-event-description">{event.description}</span>
      )}
    </>
  );

  return (
    <li
      key={event.id}
      data-event-id={event.id}
      data-clipped={clippedStart || clippedEnd ? clipped : undefined}
      className="ui-timeline-grid-event"
      style={
        {
          "--timeline-grid-event-offset": (from - axis.startMin) / 60,
          "--timeline-grid-event-span": (to - from) / 60,
          "--timeline-grid-event-lane": entry.lane,
          "--timeline-grid-event-lanes": entry.lanes,
          ...(event.color === undefined || event.color === ""
            ? null
            : { "--timeline-grid-event-color": event.color }),
        } as React.CSSProperties
      }
    >
      {onEventSelect ? (
        <button
          type="button"
          className="ui-timeline-grid-event-body ui-focus-ring"
          onClick={() => onEventSelect(event)}
        >
          {body}
        </button>
      ) : (
        <span className="ui-timeline-grid-event-body">{body}</span>
      )}
    </li>
  );
}
