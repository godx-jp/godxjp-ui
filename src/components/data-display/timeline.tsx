import type { ReactNode } from "react";

import { useTranslation } from "../../i18n/use-translation";
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
  /** Explicit 3-state. Resolves as `status ?? */
  status?: TimelineStatus;
  /** Per-item glyph override; wins over the variant/status auto-glyph. */
  icon?: LucideIcon;
};

export type TimelineProps = {
  items: TimelineItem[];
  /**
   * Rail glyph strategy. `icon` (default) keeps the legacy look (Plane for the current step,
   * CheckCircle2 otherwise).
   */
  variant?: TimelineVariant;
};

/**
 * Screen-reader prefix key for each resolved status.
 *
 * These were three HARDCODED ENGLISH strings — "Completed: " / "Current: " / "Upcoming: " — going
 * straight into a `sr-only` span with no prop and no route through i18n (gh#627). On a Japanese
 * screen a screen-reader user heard 「Completed: 入国前講習」: half English, half Japanese, and the
 * ENGLISH half is the one carrying the status. It also leaks into `innerText` for some extraction
 * paths, so a manual review reported it as visible copy.
 *
 * The reporter proposed a `statusLabels` prop. `t()` is the better answer and it is this library's
 * own rule — every user-facing string AND every sr-only text goes through it — so a consumer who
 * has already initialised i18n gets Japanese with no call-site change at all.
 */
const SR_PREFIX_KEY: Record<TimelineStatus, string> = {
  done: "dataDisplay.timeline.statusDone",
  current: "dataDisplay.timeline.statusCurrent",
  pending: "dataDisplay.timeline.statusPending",
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
  const { t } = useTranslation();
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
                  <span className="sr-only">{t(SR_PREFIX_KEY[status])}</span>
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
