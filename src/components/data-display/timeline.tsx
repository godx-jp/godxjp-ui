import type { ReactNode } from "react";
import { Check, CheckCircle2, type LucideIcon, Plane } from "lucide-react";

export type TimelineStatus = "done" | "current" | "pending";

export type TimelineVariant = "icon" | "ordinal" | "status";

export type TimelineItem = {
  title: ReactNode;
  location?: ReactNode;
  time?: ReactNode;
  note?: ReactNode;
  /** Shorthand for `status: "current"`. `status` wins when both are set. */
  current?: boolean;
  /** Explicit 3-state. Resolves as `status ?? (current ? "current" : <legacy>)`. */
  status?: TimelineStatus;
  /** Per-item glyph override; wins over the variant/status auto-glyph. */
  icon?: LucideIcon;
};

export type TimelineProps = {
  items: TimelineItem[];
  /**
   * Rail glyph strategy. `icon` (default) keeps the legacy look (Plane for the
   * current step, CheckCircle2 otherwise). `ordinal` numbers every step
   * (1,2,3…) and lets status drive colour only. `status` picks the glyph by
   * status: done → check, current → filled dot, pending → the step number.
   */
  variant?: TimelineVariant;
};

/** Screen-reader prefix for each resolved status (localize-agnostic English). */
const SR_PREFIX: Record<TimelineStatus, string> = {
  done: "Completed: ",
  current: "Current: ",
  pending: "Upcoming: ",
};

function resolveStatus(item: TimelineItem): TimelineStatus {
  if (item.status) {
    return item.status;
  }
  if (item.current) {
    return "current";
  }
  // Legacy default: a non-current item reads as completed (preserves today's look).
  return "done";
}

export function Timeline({ items, variant = "icon" }: TimelineProps) {
  return (
    <ol className="ui-timeline" data-variant={variant}>
      {items.map((item, index) => {
        const status = resolveStatus(item);
        const isCurrent = status === "current";
        const ordinal = index + 1;

        // A connector segment that sits BELOW this dot is "completed" when the
        // step it descends from is already done/current — this colours Pattern
        // B's upper segments and leaves an all-pending route neutral.
        const lineCompleted = status === "done" || status === "current";

        // Glyph: per-item override wins, then variant, then status.
        let glyph: ReactNode;
        if (item.icon) {
          const Icon = item.icon;
          glyph = <Icon aria-hidden="true" />;
        } else if (variant === "ordinal") {
          glyph = <span className="ui-timeline-ordinal">{ordinal}</span>;
        } else if (variant === "status") {
          if (status === "done") {
            glyph = <Check aria-hidden="true" />;
          } else if (status === "current") {
            glyph = <span className="ui-timeline-pip" aria-hidden="true" />;
          } else {
            glyph = <span className="ui-timeline-ordinal">{ordinal}</span>;
          }
        } else {
          // Legacy `icon` variant.
          const Icon = isCurrent ? Plane : CheckCircle2;
          glyph = <Icon aria-hidden="true" />;
        }

        return (
          <li
            className="ui-timeline-item"
            key={index}
            data-status={status}
            aria-current={isCurrent ? "step" : undefined}
          >
            <div className="ui-timeline-rail">
              <span
                className="ui-timeline-dot"
                data-status={status}
                data-current={isCurrent ? "true" : undefined}
              >
                {glyph}
              </span>
              {index !== items.length - 1 ? (
                <span
                  className="ui-timeline-line"
                  data-completed={lineCompleted ? "true" : undefined}
                />
              ) : null}
            </div>
            <div className="ui-timeline-body">
              <div className="ui-timeline-head">
                <span className="ui-timeline-title" data-current={isCurrent ? "true" : undefined}>
                  <span className="sr-only">{SR_PREFIX[status]}</span>
                  {item.title}
                </span>
                {item.time ? <span className="ui-timeline-time">{item.time}</span> : null}
              </div>
              {item.location ? <div className="ui-timeline-location">{item.location}</div> : null}
              {item.note ? <p className="ui-timeline-note">{item.note}</p> : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
