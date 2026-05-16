import {
  AllDayChip,
  DayHeaderPill,
  DEFAULT_GRID,
  EventBlock,
  GridColumn,
  NowLine,
  TimeGutter,
  layoutEvents,
  ymd,
  type CalendarEvent,
  type CalendarRef,
  type EventBlockVariant,
  type TimeLocale,
} from "../../primitives/calendar/index";

/**
 * WeekView — 7-column scrolling time grid with all-day band on top.
 * Computes the Mon-Sun window around `selected` automatically; takes a
 * flat list of `CalendarEvent` and filters them by visibility (`shown`)
 * of their owning calendar.
 *
 * Service-agnostic: the consumer maps `event.type` + `event.status` to
 * the EventBlock visual variant via `resolveVariant`.
 */
export interface WeekViewYMD {
  y: number;
  m: number;
  d: number;
}
export interface WeekViewProps {
  today: WeekViewYMD;
  selected: WeekViewYMD;
  events: CalendarEvent[];
  calendars: CalendarRef[];
  locale?: TimeLocale;
  /** Currently selected event id (paints the accent ring). */
  selectedEventId?: string | null;
  onPickEvent?: (event: CalendarEvent) => void;
  /** Override day-of-week labels. Defaults per locale. */
  dowLabels?: readonly [string, string, string, string, string, string, string];
  /** Map an event → EventBlock variant. Defaults: customer→solid, focus→focus, tentative→tentative, else tint. */
  resolveVariant?: (event: CalendarEvent) => EventBlockVariant;
  /** All-day label (defaults: locale-specific). */
  allDayLabel?: string;
  /** Timezone label (top-left corner). */
  tzLabel?: string;
  /** Now-line override (mostly for storybook determinism). */
  nowOverride?: Date;
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

function defaultResolveVariant(ev: CalendarEvent): EventBlockVariant {
  if (ev.status === "tentative") return "tentative";
  if (ev.type === "focus") return "focus";
  if (ev.type === "customer") return "solid";
  return "tint";
}

export function WeekView({
  today,
  selected,
  events,
  calendars,
  locale = "en",
  selectedEventId,
  onPickEvent,
  dowLabels,
  resolveVariant = defaultResolveVariant,
  allDayLabel,
  tzLabel,
  nowOverride,
}: WeekViewProps) {
  const dowLabel = dowLabels ?? DOW_DEFAULTS[locale];
  const sel = new Date(selected.y, selected.m - 1, selected.d);
  const dow0 = (sel.getDay() + 6) % 7;
  const monday = new Date(sel);
  monday.setDate(sel.getDate() - dow0);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return { y: d.getFullYear(), m: d.getMonth() + 1, d: d.getDate() };
  });

  const visible = events.filter((e) =>
    calendars.find((c) => c.id === e.calId && c.shown),
  );
  const colorOf = (e: CalendarEvent) =>
    calendars.find((c) => c.id === e.calId)?.color ?? "#4c6cb3";
  const allDayByDay = days.map((d) =>
    visible.filter((e) => e.allDay && e.date === ymd(d.y, d.m, d.d)),
  );
  const timedByDay = days.map((d) =>
    layoutEvents(visible.filter((e) => !e.allDay && e.date === ymd(d.y, d.m, d.d))),
  );

  return (
    <div className="cal-weekview">
      <div className="cal-weekview-head">
        <div className="cal-weekview-tz">{tzLabel ?? "GMT+09"}</div>
        {days.map((d, i) => {
          const isToday =
            today.y === d.y && today.m === d.m && today.d === d.d;
          const isSelected =
            selected.y === d.y && selected.m === d.m && selected.d === d.d;
          return (
            <DayHeaderPill
              key={i}
              dow={dowLabel[i]}
              day={d.d}
              state={isToday ? "today" : isSelected ? "selected" : "default"}
            />
          );
        })}
      </div>

      <div className="cal-weekview-allday">
        <div className="cal-weekview-allday-label">
          {allDayLabel ?? ALL_DAY_DEFAULTS[locale]}
        </div>
        {days.map((d, i) => (
          <div key={i} className="cal-weekview-allday-cell">
            {allDayByDay[i].map((ev) => (
              <AllDayChip
                key={ev.id}
                color={colorOf(ev)}
                size="compact"
                onClick={() => onPickEvent?.(ev)}
              >
                {ev.title}
              </AllDayChip>
            ))}
          </div>
        ))}
      </div>

      <div className="cal-weekview-scroll">
        <div className="cal-weekview-grid">
          <TimeGutter
            dayStartH={DEFAULT_GRID.dayStartH}
            dayEndH={DEFAULT_GRID.dayEndH}
            pxPerMin={DEFAULT_GRID.pxPerMin}
            locale={locale}
          />
          {days.map((d, i) => {
            const isToday =
              today.y === d.y && today.m === d.m && today.d === d.d;
            return (
              <GridColumn key={i} isToday={isToday}>
                {timedByDay[i].map((ev) => (
                  <EventBlock
                    key={ev.id}
                    event={ev}
                    color={colorOf(ev)}
                    variant={resolveVariant(ev)}
                    selected={selectedEventId === ev.id}
                    lane={ev._lane}
                    lanes={ev._lanes}
                    onClick={onPickEvent}
                  />
                ))}
                {isToday && <NowLine nowDate={nowOverride} />}
              </GridColumn>
            );
          })}
        </div>
      </div>
    </div>
  );
}
