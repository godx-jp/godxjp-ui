import { FileText, Globe, RefreshCw, Repeat, Users, Zap, Plus } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "../../general/Button";
import { Tabs } from "../../navigation/Tabs";
import {
  AttendeeChip,
  CalendarOption,
  IconRow,
  type CalendarRef,
  type PersonRef,
} from "../../data-display/calendar/index";

/**
 * CreateEventDialog — 880×640 modal-shaped create form. Two-column
 * layout: form on the left, options rail on the right (calendar
 * picker, free/busy, notifications, guest permissions, helper card).
 *
 * Does NOT manage open/close — the consumer wraps the JSX in a Radix
 * `Dialog` (or any portal). The visual shell + the form scaffolding is
 * what this component owns.
 */
export interface CreateEventTab {
  id: string;
  label: ReactNode;
}

export interface CreateEventLabels {
  /** Repeat-rule option list — caller-supplied so locale stays out of the SDK. */
  repeatOptions: { value: string; label: string }[];
  whenFromLabel: string;
  whenToLabel: string;
  allDay: string;
  locationPlaceholder: string;
  createMeet: string;
  attendeesPlaceholder: string;
  findATime: string;
  attendeesSummary: ReactNode;
  detailsButton: string;
  cancel: string;
  save: string;
  /** Right-rail section labels. */
  rail: {
    saveTo: string;
    showAs: string;
    showAsBusy: string;
    showAsFree: string;
    notifications: string;
    addNotification: string;
    guestPermissions: string;
    permissionEdit: string;
    permissionInvite: string;
    permissionGuestList: string;
    helpTitle: string;
    helpBody: (calendarName: string) => ReactNode;
  };
}

export interface CreateEventDialogProps {
  /** Default form values. */
  initialTitle?: string;
  initialCalendarId: string;
  /** Tab ids (e.g. event / task / focus / ooo). */
  tabs: CreateEventTab[];
  initialTab?: string;
  /** Visible calendars to choose from (read-only ones filtered out). */
  calendars: CalendarRef[];
  /** Selected attendee list (chip array). */
  attendees: PersonRef[];
  /** When summary line (e.g. "Wed, May 20"). */
  whenDate: ReactNode;
  /** Start / end time strings. */
  whenStart: string;
  whenEnd: string;
  labels: CreateEventLabels;
  /** Notifications list — caller renders pills. */
  notificationsList?: ReactNode;
  /** Description default value. */
  descriptionDefault?: string;
  onRemoveAttendee?: (id: string) => void;
  onChangeCalendar?: (id: string) => void;
  onChangeTitle?: (next: string) => void;
  onCancel?: () => void;
  onSave?: () => void;
}

export function CreateEventDialog({
  initialTitle = "",
  initialCalendarId,
  tabs,
  initialTab,
  calendars,
  attendees,
  whenDate,
  whenStart,
  whenEnd,
  labels,
  notificationsList,
  descriptionDefault,
  onRemoveAttendee,
  onChangeCalendar,
  onChangeTitle,
  onCancel,
  onSave,
}: CreateEventDialogProps) {
  const [tab, setTab] = useState(initialTab ?? tabs[0]?.id ?? "event");
  const [title, setTitle] = useState(initialTitle);
  const [calId, setCalId] = useState(initialCalendarId);
  const [allDay, setAllDay] = useState(false);
  const [showAs, setShowAs] = useState<"busy" | "free">("busy");
  const cal = calendars.find((c) => c.id === calId);
  const editableCalendars = calendars.filter((c) => !c.readonly);

  return (
    <div className="cal-create-dialog">
      <div className="cal-create-main">
        <div className="cal-create-head">
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: 3,
              background: cal?.color ?? "#1e50a2",
              flexShrink: 0,
            }}
          />
          <input
            className="cal-create-title-input"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              onChangeTitle?.(e.target.value);
            }}
          />
        </div>

        <Tabs
          value={tab}
          onValueChange={setTab}
          listClassName="cal-create-tabs"
          items={tabs.map((t) => ({ value: t.id, label: t.label }))}
        />

        <div className="cal-create-body">
          <IconRow icon={<RefreshCw size={15} />} align="center">
            <div className="row gap-2" style={{ flexWrap: "wrap" }}>
              <div className="input" style={{ width: 152, display: "inline-flex", alignItems: "center" }}>
                {whenDate}
              </div>
              <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
                {labels.whenFromLabel}
              </span>
              <div className="input" style={{ width: 92, display: "inline-flex", alignItems: "center" }}>
                {whenStart}
              </div>
              <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
                {labels.whenToLabel}
              </span>
              <div className="input" style={{ width: 92, display: "inline-flex", alignItems: "center" }}>
                {whenEnd}
              </div>
              <label
                className="row gap-1"
                style={{
                  fontSize: 12,
                  marginLeft: 6,
                  color: "var(--muted-foreground)",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={allDay}
                  onChange={(e) => setAllDay(e.target.checked)}
                />
                {labels.allDay}
              </label>
            </div>
          </IconRow>

          <IconRow icon={<Repeat size={14} />} align="center">
            <select className="input" style={{ width: 260 }} defaultValue={labels.repeatOptions[0]?.value}>
              {labels.repeatOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </IconRow>

          <IconRow icon={<Globe size={15} />} align="center">
            <div className="row gap-2" style={{ width: "100%" }}>
              <input className="input" placeholder={labels.locationPlaceholder} style={{ flex: 1 }} />
              <Button variant="secondary" size="small">
                <Zap size={13} /> {labels.createMeet}
              </Button>
            </div>
          </IconRow>

          <IconRow icon={<Users size={15} />}>
            <div className="row gap-1" style={{ flexWrap: "wrap" }}>
              {attendees.map((p) => (
                <AttendeeChip
                  key={p.id}
                  name={p.name}
                  short={p.short}
                  color={p.color}
                  onRemove={() => onRemoveAttendee?.(p.id)}
                />
              ))}
              <input
                className="input"
                style={{ flex: 1, minWidth: 200, border: 0, background: "transparent" }}
                placeholder={labels.attendeesPlaceholder}
              />
            </div>
            <div
              className="row gap-2"
              style={{ marginTop: 6, fontSize: 11.5, color: "var(--muted-foreground)" }}
            >
              <Button
                variant="ghost"
                size="small"

                style={{ padding: 0, height: "auto" }}
              >
                {labels.findATime}
              </Button>
              <span>·</span>
              <span>{labels.attendeesSummary}</span>
            </div>
          </IconRow>

          <IconRow icon={<FileText size={15} />}>
            <textarea
              className="input"
              defaultValue={descriptionDefault}
              style={{
                height: 92,
                padding: 10,
                resize: "none",
                fontFamily: "var(--font-sans-jp)",
              }}
            />
          </IconRow>
        </div>

        <div className="cal-create-foot">
          <Button variant="ghost" size="small">
            {labels.detailsButton}
          </Button>
          <div className="ml-auto row gap-2">
            <Button variant="secondary" size="small" onClick={onCancel}>
              {labels.cancel}
            </Button>
            <Button variant="primary" size="small" onClick={onSave}>
              {labels.save}
            </Button>
          </div>
        </div>
      </div>

      <div className="cal-create-rail">
        <div>
          <div className="cal-create-rail-section-label">{labels.rail.saveTo}</div>
          <select
            className="input"
            style={{ width: "100%" }}
            value={calId}
            onChange={(e) => {
              setCalId(e.target.value);
              onChangeCalendar?.(e.target.value);
            }}
          >
            {editableCalendars.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="cal-create-rail-section-label">{labels.rail.showAs}</div>
          <div className="row gap-1">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              data-active={showAs === "busy"}
              style={{
                flex: 1,
                background:
                  showAs === "busy"
                    ? "color-mix(in oklch, var(--accent-color) 14%, transparent)"
                    : "var(--surface-3)",
                borderColor: showAs === "busy" ? "var(--accent-color)" : "var(--border)",
                color: showAs === "busy" ? "var(--accent-color)" : "var(--foreground)",
              }}
              onClick={() => setShowAs("busy")}
            >
              {labels.rail.showAsBusy}
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              data-active={showAs === "free"}
              style={{
                flex: 1,
                background: showAs === "free" ? "var(--surface-3)" : "transparent",
              }}
              onClick={() => setShowAs("free")}
            >
              {labels.rail.showAsFree}
            </button>
          </div>
        </div>

        <div>
          <div className="cal-create-rail-section-label">{labels.rail.notifications}</div>
          <div className="col" style={{ gap: 4, fontSize: 12 }}>
            {notificationsList}
            <Button
              variant="ghost"
              size="small"

              style={{ padding: 0, height: 22, fontSize: 11, justifyContent: "flex-start" }}
            >
              <Plus size={11} /> {labels.rail.addNotification}
            </Button>
          </div>
        </div>

        <div>
          <div className="cal-create-rail-section-label">{labels.rail.guestPermissions}</div>
          <div className="col" style={{ gap: 6, fontSize: 12 }}>
            <label className="row gap-2">
              <input type="checkbox" defaultChecked /> {labels.rail.permissionEdit}
            </label>
            <label className="row gap-2">
              <input type="checkbox" defaultChecked /> {labels.rail.permissionInvite}
            </label>
            <label className="row gap-2">
              <input type="checkbox" defaultChecked /> {labels.rail.permissionGuestList}
            </label>
          </div>
        </div>

        <div className="cal-create-rail-info">
          <div className="row gap-2" style={{ marginBottom: 4 }}>
            <CalendarOption color={cal?.color ?? "#1e50a2"} name={cal?.name ?? "—"} />
          </div>
          <p
            style={{
              margin: 0,
              fontSize: 10.5,
              color: "var(--muted-foreground)",
              lineHeight: 1.5,
            }}
          >
            {labels.rail.helpBody(cal?.name ?? "")}
          </p>
        </div>
      </div>
    </div>
  );
}
