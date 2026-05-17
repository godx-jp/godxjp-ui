import {
  AvatarStack,
  ymd,
  type CalendarEvent,
  type CalendarRef,
  type PersonRef,
  type TimeLocale,
} from "../../data-display/calendar/index";

/**
 * AgendaView — date-grouped list of events for the next N days. Each
 * group renders a 92px date gutter (dow + day number + month + NOW
 * pill) | rail of event rows (time, title, location, avatar stack).
 */
export interface AgendaViewYMD {
  y: number;
  m: number;
  d: number;
}
export interface AgendaViewProps {
  today: AgendaViewYMD;
  selected: AgendaViewYMD;
  events: CalendarEvent[];
  calendars: CalendarRef[];
  /** People directory used to resolve attendee IDs to AvatarStack items. */
  people: PersonRef[];
  locale?: TimeLocale;
  /** Number of days to render starting from the week's Monday. Default 14. */
  days?: number;
  onPickEvent?: (event: CalendarEvent) => void;
  /** Localised "All day" label override. */
  allDayLabel?: string;
  todayBadge?: string;
  dowLabels?: readonly [string, string, string, string, string, string, string];
}

const DOW_DEFAULTS: Record<TimeLocale, readonly [string, string, string, string, string, string, string]> = {
  ja: ["月", "火", "水", "木", "金", "土", "日"],
  vi: ["T2", "T3", "T4", "T5", "T6", "T7", "CN"],
  en: ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"],
};

const ALL_DAY_DEFAULTS: Record<TimeLocale, string> = {
  ja: "終日",
  vi: "Cả ngày",
  en: "All day",
};

export function AgendaView({
  today,
  selected,
  events,
  calendars,
  people,
  locale = "en",
  days = 14,
  onPickEvent,
  allDayLabel,
  todayBadge = "NOW",
  dowLabels,
}: AgendaViewProps) {
  const dowLabel = dowLabels ?? DOW_DEFAULTS[locale];
  const allDayText = allDayLabel ?? ALL_DAY_DEFAULTS[locale];
  const sel = new Date(selected.y, selected.m - 1, selected.d);
  const dow0 = (sel.getDay() + 6) % 7;
  const monday = new Date(sel);
  monday.setDate(sel.getDate() - dow0);

  const visible = events.filter((e) =>
    calendars.find((c) => c.id === e.calId && c.shown),
  );
  const colorOf = (e: CalendarEvent) =>
    calendars.find((c) => c.id === e.calId)?.color ?? "#4c6cb3";
  const personOf = (id: string) => people.find((p) => p.id === id);

  const day = (i: number) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  };

  return (
    <div className="cal-agendaview">
      <div className="cal-agendaview-inner">
        {Array.from({ length: days }, (_, i) => day(i)).map((d) => {
          const y = d.getFullYear();
          const m = d.getMonth() + 1;
          const dd = d.getDate();
          const key = ymd(y, m, dd);
          const dayEvs = visible
            .filter((e) => e.date === key)
            .sort((a, b) =>
              (a.allDay ? "00:00" : (a.start ?? "")).localeCompare(
                b.allDay ? "00:00" : (b.start ?? ""),
              ),
            );
          if (dayEvs.length === 0) return null;
          const isToday = today.y === y && today.m === m && today.d === dd;
          const dow = (d.getDay() + 6) % 7;
          const monthShort =
            locale === "ja" ? `${m}月` : locale === "vi" ? `Th. ${m}` : String(m);
          return (
            <div key={key} className="cal-agenda-day">
              <div className="cal-agenda-gutter" data-today={isToday || undefined}>
                <span className="cal-agenda-gutter-dow">{dowLabel[dow]}</span>
                <span className="cal-agenda-gutter-num">{dd}</span>
                <span className="cal-agenda-gutter-month">{monthShort}</span>
                {isToday && <span className="cal-agenda-gutter-now">{todayBadge}</span>}
              </div>
              <div className="col" style={{ gap: 6 }}>
                {dayEvs.map((ev) => {
                  const color = colorOf(ev);
                  const attendees = ev.attendees
                    .map(personOf)
                    .filter((p): p is PersonRef => Boolean(p))
                    .map((p) => ({
                      id: p.id,
                      short: p.short,
                      color: p.color,
                      name: p.name,
                    }));
                  return (
                    <button
                      key={ev.id}
                      type="button"
                      className="cal-agenda-event"
                      style={{ color }}
                      onClick={() => onPickEvent?.(ev)}
                    >
                      <span className="cal-agenda-event-time">
                        {ev.allDay ? allDayText : `${ev.start} – ${ev.end}`}
                      </span>
                      <span className="cal-agenda-event-title">
                        {ev.title}
                        {ev.location && (
                          <span className="cal-agenda-event-location">· {ev.location}</span>
                        )}
                      </span>
                      <AvatarStack items={attendees} max={3} size={22} />
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
