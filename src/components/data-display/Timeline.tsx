import {
  Children,
  createContext,
  isValidElement,
  useContext,
  type ReactNode,
} from "react";
import { cn } from "../cn";

/**
 * Timeline — chronological event rail.
 *
 * Three visual variants, each backed by an existing CSS atom shipped
 * with the dxs-kintai card canon (`src/styles/shell/80-card-sections.css`):
 *
 *   - `"list"` (default) — vertical rail with markers, `.tl-list` + `.tl-item`.
 *   - `"branching"` — approval-pipeline shape with left-aligned timestamp,
 *     dot, and body. `.tl-br` + `.row`.
 *   - `"feed"` — social-style avatar feed. `.tl-feed` + `.item`.
 *
 * Vocabulary (cardinal rule 23 §B):
 *   - `variant` — visual treatment ("list" | "branching" | "feed").
 *   - `color` (TimelineItem) — semantic role of the marker.
 *   - `current` — boolean, marks the active item.
 *   - NEVER `mode` / `position` / `type` / `dot` synonyms.
 *
 * @example
 *   <Timeline>
 *     <TimelineItem color="success" title="申請" time="09:30" />
 *     <TimelineItem color="primary" current title="承認待ち" />
 *   </Timeline>
 */

export type TimelineVariant = "list" | "branching" | "feed";

export type TimelineColor =
  | "default"
  | "primary"
  | "success"
  | "warning"
  | "destructive"
  | "info"
  | "attention";

interface TimelineCtx {
  variant: TimelineVariant;
}

const TimelineContext = createContext<TimelineCtx | null>(null);

function useTimelineCtx(): TimelineCtx {
  return useContext(TimelineContext) ?? { variant: "list" };
}

export interface TimelineProps {
  /** Visual variant — list (default), branching, or feed. */
  variant?: TimelineVariant;
  /** Render items last-first. */
  reverse?: boolean;
  /** "Ongoing" item rendered after the last child. */
  pending?: ReactNode;
  className?: string;
  children?: ReactNode;
}

export function Timeline({
  variant = "list",
  reverse = false,
  pending,
  className,
  children,
}: TimelineProps) {
  const items = Children.toArray(children).filter(isValidElement);
  const ordered = reverse ? items.slice().reverse() : items;
  const trailing =
    pending !== undefined ? (
      <TimelineItem
        key="__pending"
        color="default"
        current
        title={pending}
      />
    ) : null;

  const className_ = cn(
    variant === "list" && "tl-list",
    variant === "branching" && "tl-br",
    variant === "feed" && "tl-feed",
    className,
  );

  const inner = (
    <>
      {ordered}
      {trailing}
    </>
  );

  return (
    <TimelineContext.Provider value={{ variant }}>
      {variant === "list" ? (
        <ul className={className_}>{inner}</ul>
      ) : (
        <div className={className_}>{inner}</div>
      )}
    </TimelineContext.Provider>
  );
}

export interface TimelineItemProps {
  /** Semantic role of the marker. Default "default". */
  color?: TimelineColor;
  /** Pulsing "current" marker. */
  current?: boolean;
  /** Time / timestamp slot — right-side label in `branching`,
   *  inline `.ts` in `list`, inline `.ts` in `feed`. */
  time?: ReactNode;
  /** Avatar slot — feed variant only. */
  avatar?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  className?: string;
  children?: ReactNode;
}

// Map our framework color vocabulary onto the existing tl-* atom
// classes shipped with the card canon. Atoms cover the canonical
// subset; the rest fall through to the neutral marker.
function colorClass(color: TimelineColor): string {
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

export function TimelineItem({
  color = "default",
  current = false,
  time,
  avatar,
  title,
  description,
  className,
  children,
}: TimelineItemProps) {
  const { variant } = useTimelineCtx();
  const hue = colorClass(color);

  if (variant === "branching") {
    return (
      <div
        className={cn("row", hue, current && "current", className)}
      >
        <span className="when">{time}</span>
        <div className="node" aria-hidden />
        <div className="body">
          {title !== undefined && <div className="t">{title}</div>}
          {description !== undefined && (
            <div className="d">{description}</div>
          )}
          {children}
        </div>
      </div>
    );
  }

  if (variant === "feed") {
    return (
      <div className={cn("item", className)}>
        {avatar}
        <div className="body">
          <div className="h">
            {title !== undefined && <b>{title}</b>}
            {time !== undefined && <span className="ts">{time}</span>}
          </div>
          {description !== undefined && (
            <div className="d">{description}</div>
          )}
          {children}
        </div>
      </div>
    );
  }

  // Default — list variant.
  return (
    <li className={cn("tl-item", hue, current && "current", className)}>
      {(title !== undefined || time !== undefined) && (
        <div className="t-h">
          {title !== undefined && <span>{title}</span>}
          {time !== undefined && <span className="ts">{time}</span>}
        </div>
      )}
      {description !== undefined && <div className="t-d">{description}</div>}
      {children}
    </li>
  );
}
