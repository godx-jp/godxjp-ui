import type { ComponentProps, ReactNode } from "react";
import { cn } from "../cn";

/**
 * AttendeeListItem — row used in event-detail attendee lists. Avatar,
 * name, optional "(you)" marker, optional org line, optional trailing
 * status badge slot.
 */
export interface AttendeeListItemProps extends ComponentProps<"div"> {
  name: string;
  short: string;
  color: string;
  /** Display "(you)" suffix. */
  isSelf?: boolean;
  /** Show "Organizer · " prefix in the org line. */
  isOrganizer?: boolean;
  org?: string;
  /** Trailing slot — typically a small Badge. */
  status?: ReactNode;
  /** i18n override for "(you)" — defaults to en. */
  selfLabel?: string;
  organizerLabel?: string;
}

export function AttendeeListItem({
  name,
  short,
  color,
  isSelf = false,
  isOrganizer = false,
  org,
  status,
  selfLabel = "(you)",
  organizerLabel = "Organizer",
  className,
  ...rest
}: AttendeeListItemProps) {
  return (
    <div className={cn("attendee-row", className)} {...rest}>
      <span className="attendee-row-avatar" style={{ background: color }}>
        {short}
      </span>
      <div className="attendee-row-body">
        <div className="attendee-row-name">
          {name}
          {isSelf && <span className="attendee-row-me">{selfLabel}</span>}
        </div>
        {(org || isOrganizer) && (
          <div className="attendee-row-org">
            {isOrganizer ? `${organizerLabel} · ` : ""}
            {org}
          </div>
        )}
      </div>
      {status}
    </div>
  );
}
