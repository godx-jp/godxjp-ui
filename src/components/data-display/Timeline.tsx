import { type ReactNode } from "react";
import {
  type CalendarDate,
  type CalendarDateTime,
  type ZonedDateTime,
} from "@internationalized/date";
import { cn } from "../cn";
import { useFormatters } from "../../hooks/useFormatters";
import type { ColorProp } from "../../props";

/**
 * Timeline — chronological event rail.
 *
 * Data-driven API (cardinal rule 23 + rule 31 — no parallel
 * sub-component primitives). Consumers pass an `items` array; the
 * primitive renders the rail end-to-end. Per-item customisation
 * flows through optional `renderItem` for advanced cases.
 *
 * Three visual variants, each backed by an existing CSS atom shipped
 * with the dxs-kintai card canon (`src/styles/shell/80-card-sections.css`):
 *
 *   - `"list"` (default) — vertical rail with markers, `.tl-list` + `.tl-item`.
 *   - `"branching"` — approval pipeline with left timestamp, dot, body.
 *     `.tl-br` + `.row`.
 *   - `"feed"` — social-style avatar feed. `.tl-feed` + `.item`.
 *
 * Vocabulary (cardinal rule 23 §B):
 *   - `variant` — visual treatment ("list" | "branching" | "feed").
 *   - `color` per item — semantic role of the marker.
 *   - `current` per item — boolean, marks the active item.
 *   - `animate` per item — pulsing ring around the marker.
 *   - NEVER `mode` / `position` / `type` / `dot` / `pending` synonyms
 *     (cardinal rule 32 — a separate `pending` prop is redundant when
 *     a regular item with `animate: true` covers the same need).
 *
 * @example Data-driven (preferred)
 *   <Timeline
 *     items={[
 *       { color: "success", title: "申請", time: "09:30" },
 *       { color: "primary", current: true, animate: true, title: "承認待ち" },
 *     ]}
 *   />
 *
 * @example With renderItem (full custom)
 *   <Timeline
 *     items={events}
 *     renderItem={(it) => <RichRow data={it} />}
 *   />
 */

export type TimelineVariant = "list" | "branching" | "feed";

/** Identical to `TagPresetColor` — the framework's semantic palette
 *  minus `"secondary"` (which is Typography's text-dimming slot).
 *  Aliased so any colour added to `ColorProp` lights up here too. */
export type TimelineColor = Exclude<ColorProp, "secondary">;

export interface TimelineItem {
  /** Stable key for React reconciliation. Defaults to the item index
   * but consumers should pass a real id for lists that re-order. */
  key?: string | number;
  /** Semantic role of the marker. Default "default". */
  color?: TimelineColor;
  /** Heavier outline on the marker — typically the active step. */
  current?: boolean;
  /** Pulsing ring around the marker — typically paired with
   * `current: true` on an in-progress item. Honours
   * `prefers-reduced-motion` (rule 6 a11y baseline). */
  animate?: boolean;
  /** Time / timestamp slot — right-side label in `branching`, inline
   * `.ts` in `list`, inline `.ts` in `feed`. Accepts a temporal value
   * (`Date`, ISO string, or any `@internationalized/date` value) — in
   * that case the active provider's locale + timezone format it via
   * `useFormatters` (`format` or `relative` controlled by the
   * Timeline `timeFormat` prop). Pass `ReactNode` to opt out. */
  time?:
    | ReactNode
    | Date
    | CalendarDate
    | CalendarDateTime
    | ZonedDateTime;
  /** Avatar slot — `feed` variant only. */
  avatar?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  /** Extra content rendered after `title` + `description`. */
  children?: ReactNode;
  /** Per-item class merged onto the row. */
  className?: string;
}

export interface TimelineProps {
  /** Items to render. Each row is a single object — no sub-component
   * ceremony. */
  items: TimelineItem[];
  /** Custom row renderer. When set, takes priority over the default
   * variant rendering — receives the item + the active variant +
   * index, returns the full row JSX. */
  renderItem?: (item: TimelineItem, variant: TimelineVariant, index: number) => ReactNode;
  /** Visual variant. Default `list`. */
  variant?: TimelineVariant;
  /** Render items last-first. */
  reverse?: boolean;
  /** Show the vertical connector line that joins markers. Default
   * `true` for `list` + `branching`; ignored by `feed` (feed has no
   * connector by design). */
  connector?: boolean;
  /** How to render temporal `time` values. `"relative"` (default for
   * `feed`) renders "2 時間前" / "2 hours ago" via `useFormatters`.
   * `"datetime"` renders an absolute "MMM d, HH:mm" style. `"time"`
   * renders the time-of-day portion only. Ignored when `time` is a
   * `ReactNode` (string / JSX). */
  timeFormat?: "relative" | "datetime" | "date" | "time";
  className?: string;
}

type TimeFormat = NonNullable<TimelineProps["timeFormat"]>;
type TemporalValue =
  | Date
  | CalendarDate
  | CalendarDateTime
  | ZonedDateTime;

function isTemporal(value: unknown): value is TemporalValue {
  if (value instanceof Date) return true;
  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (value as { toDate: unknown }).toDate === "function"
  ) {
    return true;
  }
  return false;
}

// Pure helper — given the formatter surface (resolved once in Timeline)
// + a TimelineItem.time value + the active `timeFormat` mode, return
// the renderable node. ReactNode values pass through untouched.
function formatTimeNode(
  value: TimelineItem["time"],
  format: TimeFormat,
  fmt: ReturnType<typeof useFormatters>,
): ReactNode {
  if (!isTemporal(value)) return value as ReactNode;
  switch (format) {
    case "relative":
      return fmt.formatRelative(value);
    case "date":
      return fmt.formatDate(value);
    case "time":
      return fmt.formatTime(value);
    case "datetime":
    default:
      return fmt.formatDateTime(value);
  }
}

// Map the semantic color vocabulary onto the canonical .tl-* atom
// hues shipped with the card design system. Atoms cover a subset;
// the rest fall back to the neutral marker.
function colorClass(color: TimelineColor = "default"): string {
  switch (color) {
    case "success":
      return "success";
    case "primary":
      return "primary";
    case "attention":
      return "attention";
    case "warning":
      return "warning";
    case "destructive":
    case "info":
    case "default":
    default:
      return "";
  }
}

function defaultRender(
  item: TimelineItem,
  variant: TimelineVariant,
  timeFormat: TimeFormat,
  fmt: ReturnType<typeof useFormatters>,
): ReactNode {
  const hue = colorClass(item.color);
  const time = formatTimeNode(item.time, timeFormat, fmt);

  if (variant === "branching") {
    return (
      <div
        className={cn(
          "row",
          hue,
          item.current && "current",
          item.animate && "animate",
          item.className,
        )}
      >
        <span className="when">{time}</span>
        <div className="node" aria-hidden />
        <div className="body">
          {item.title !== undefined && <div className="t">{item.title}</div>}
          {item.description !== undefined && (
            <div className="d">{item.description}</div>
          )}
          {item.children}
        </div>
      </div>
    );
  }

  if (variant === "feed") {
    return (
      <div className={cn("item", item.className)}>
        {item.avatar}
        <div className="body">
          <div className="h">
            {item.title !== undefined && <b>{item.title}</b>}
            {time !== undefined && <span className="ts">{time}</span>}
          </div>
          {item.description !== undefined && (
            <div className="d">{item.description}</div>
          )}
          {item.children}
        </div>
      </div>
    );
  }

  // Default — list variant.
  return (
    <li
      className={cn(
        "tl-item",
        hue,
        item.current && "current",
        item.animate && "animate",
        item.className,
      )}
    >
      {(item.title !== undefined || time !== undefined) && (
        <div className="t-h">
          {item.title !== undefined && <span>{item.title}</span>}
          {time !== undefined && <span className="ts">{time}</span>}
        </div>
      )}
      {item.description !== undefined && <div className="t-d">{item.description}</div>}
      {item.children}
    </li>
  );
}

export function Timeline({
  items,
  renderItem,
  variant = "list",
  reverse = false,
  connector = true,
  timeFormat,
  className,
}: TimelineProps) {
  const ordered = reverse ? items.slice().reverse() : items;
  const fmt = useFormatters();
  // Feed reads as a social timeline so default to "X時間前" relative
  // time; list + branching default to absolute "datetime" output.
  const effectiveFormat: TimeFormat =
    timeFormat ?? (variant === "feed" ? "relative" : "datetime");

  const rows = ordered.map((item, i) => {
    const key = item.key ?? i;
    const node = renderItem
      ? renderItem(item, variant, i)
      : defaultRender(item, variant, effectiveFormat, fmt);
    // Wrap to attach the key in a generic way regardless of returned tag.
    return <RowKey key={key}>{node}</RowKey>;
  });

  const className_ = cn(
    variant === "list" && "tl-list",
    variant === "branching" && "tl-br",
    variant === "feed" && "tl-feed",
    // Connector toggle — `feed` variant has no connector by design,
    // so the prop is meaningful only for `list` + `branching`.
    !connector && variant !== "feed" && "tl-no-connector",
    className,
  );

  return variant === "list" ? (
    <ul className={className_}>{rows}</ul>
  ) : (
    <div className={className_}>{rows}</div>
  );
}

/** Internal helper — React needs the key on the element returned by
 * `.map()`. `RowKey` is a transparent wrapper that lets us assign the
 * key without forcing the renderer to do so. Returns the child verbatim
 * via Fragment so it doesn't alter the DOM. */
function RowKey({ children }: { children: ReactNode }): ReactNode {
  return <>{children}</>;
}
