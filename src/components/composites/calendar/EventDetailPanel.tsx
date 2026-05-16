import {
  Bell,
  Check,
  FileText,
  Globe,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  Users,
  X,
} from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "../../primitives/Badge";
import { Button } from "../../primitives/Button";
import {
  AttendeeListItem,
  IconRow,
  type CalendarEvent,
  type CalendarRef,
  type PersonRef,
} from "../../primitives/calendar";

/**
 * EventDetailPanel — 360px right-rail panel for an opened event.
 *   Header  — color-dot + title + cal name + status + edit/delete/close
 *   Body    — when / where / attendees / description / notifications rows
 *   Footer  — RSVP 3-button row (Yes / Maybe / No)
 *
 * Generic: status labels + RSVP labels + "(you)" + section labels all
 * caller-supplied so the panel stays locale-agnostic.
 */
export interface EventDetailLabels {
  joinMeeting?: string;
  attendeesSummary: (count: number, accepted: number) => string;
  addPerson: string;
  rsvpQuestion: string;
  rsvpYes: string;
  rsvpMaybe: string;
  rsvpNo: string;
  selfLabel: string;
  organizerLabel: string;
  /** Date/time line for the When row, e.g. "Wed, May 20 · GMT+09". */
  whenSubtitle: ReactNode;
  /** "All day" / "Cả ngày" / "終日". */
  allDay: string;
  /** Status label per `event.status`. */
  statusLabels: Record<string, string>;
}

export interface EventDetailPanelProps {
  event: CalendarEvent;
  calendar?: CalendarRef;
  people: PersonRef[];
  labels: EventDetailLabels;
  /** Description body content — JSX so callers can use markdown / lists. */
  description?: ReactNode;
  /** Notifications list. */
  notifications?: ReactNode;
  onClose?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onRSVP?: (rsvp: "yes" | "maybe" | "no") => void;
}

export function EventDetailPanel({
  event,
  calendar,
  people,
  labels,
  description,
  notifications,
  onClose,
  onEdit,
  onDelete,
  onRSVP,
}: EventDetailPanelProps) {
  const color = calendar?.color ?? "#4c6cb3";
  const organizerId = event.attendees[0];
  const statusLabel = event.status ? labels.statusLabels[event.status] ?? event.status : "";

  return (
    <aside className="cal-detail-aside">
      <div className="cal-detail-head">
        <span className="cal-detail-dot" style={{ background: color }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 className="cal-detail-title">{event.title}</h2>
          <div className="cal-detail-sub">
            {calendar?.name ?? "—"}
            {statusLabel && <> · {statusLabel}</>}
          </div>
        </div>
        <div className="row gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            style={{ width: 26, padding: 0 }}
            aria-label="Edit"
          >
            <Pencil size={13} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            style={{ width: 26, padding: 0 }}
            aria-label="Delete"
          >
            <Trash2 size={13} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            style={{ width: 26, padding: 0 }}
            aria-label="Close"
          >
            <X size={13} />
          </Button>
        </div>
      </div>

      <div className="cal-detail-body">
        <IconRow icon={<RefreshCw size={15} />}>
          <div style={{ fontSize: 13, fontWeight: 500 }}>
            {event.allDay
              ? labels.allDay
              : `${event.start ?? ""} – ${event.end ?? ""}`}
          </div>
          <div style={{ fontSize: 11.5, color: "var(--muted-foreground)" }}>
            {labels.whenSubtitle}
          </div>
        </IconRow>

        {event.location && (
          <IconRow icon={<Globe size={15} />}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{event.location}</div>
            {labels.joinMeeting && (
              <a
                style={{
                  fontSize: 11.5,
                  color: "var(--accent-color)",
                  textDecoration: "none",
                }}
              >
                {labels.joinMeeting}
              </a>
            )}
          </IconRow>
        )}

        <IconRow icon={<Users size={15} />}>
          <div
            style={{
              fontSize: 12,
              color: "var(--muted-foreground)",
              marginBottom: 6,
            }}
          >
            {labels.attendeesSummary(event.attendees.length, event.attendees.length)}
          </div>
          <div className="col" style={{ gap: 4 }}>
            {event.attendees.map((pid) => {
              const p = people.find((x) => x.id === pid);
              if (!p) return null;
              return (
                <AttendeeListItem
                  key={pid}
                  name={p.name}
                  short={p.short}
                  color={p.color}
                  isSelf={p.self}
                  isOrganizer={organizerId === pid}
                  org={p.org}
                  selfLabel={labels.selfLabel}
                  organizerLabel={labels.organizerLabel}
                  status={
                    <Badge variant="success" style={{ fontSize: 10 }}>
                      <span className="dot" />
                      OK
                    </Badge>
                  }
                />
              );
            })}
          </div>
          <Button
            variant="ghost"
            size="sm"
            style={{
              marginTop: 6,
              padding: "0 6px",
              color: "var(--muted-foreground)",
              fontSize: 11,
            }}
          >
            <Plus size={12} /> {labels.addPerson}
          </Button>
        </IconRow>

        {description && (
          <IconRow icon={<FileText size={15} />}>{description}</IconRow>
        )}

        {notifications && (
          <IconRow icon={<Bell size={15} />}>{notifications}</IconRow>
        )}
      </div>

      <div className="cal-detail-foot">
        <div className="cal-detail-rsvp-label">{labels.rsvpQuestion}</div>
        <div className="row" style={{ gap: 6 }}>
          <Button
            variant="primary"
            tone="accent"
            size="sm"
            style={{ flex: 1 }}
            onClick={() => onRSVP?.("yes")}
          >
            <Check size={13} /> {labels.rsvpYes}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            style={{ flex: 1 }}
            onClick={() => onRSVP?.("maybe")}
          >
            {labels.rsvpMaybe}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            style={{ flex: 1 }}
            onClick={() => onRSVP?.("no")}
          >
            {labels.rsvpNo}
          </Button>
        </div>
      </div>
    </aside>
  );
}
