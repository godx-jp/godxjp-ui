import {
  AllDayChip,
  EventPill,
  MonthCell,
  buildMonthGrid,
  ymd,
  type CalendarEvent,
  type CalendarRef,
  type TimeLocale,
} from "../../primitives/calendar/index";

/**
 * MonthView — 6×7 month grid (Mon-first). Each cell shows up to 4
 * events (overflow indicator below). All-day events render as solid
 * color bars (`AllDayChip` size=month); timed events render as one-line
 * `EventPill`s.
 */
export interface MonthViewYMD {
  y: number;
  m: number;
  d: number;
}
export interface MonthViewProps {
  today: MonthViewYMD;
  selected: MonthViewYMD;
  events: CalendarEvent[];
  calendars: CalendarRef[];
  locale?: TimeLocale;
  onPickEvent?: (event: CalendarEvent) => void;
  /** Max events shown per cell before overflow row. Default 4. */
  maxEventsPerCell?: number;
  /** Override day-of-week labels. */
  dowLabels?: readonly [string, string, string, string, string, string, string];
  /** Localise the "+N more" suffix. */
  formatOverflow?: (n: number) => string;
}

const DOW_DEFAULTS: Record<TimeLocale, readonly [string, string, string, string, string, string, string]> = {
  ja: ["月", "火", "水", "木", "金", "土", "日"],
  vi: ["THỨ HAI", "THỨ BA", "THỨ TƯ", "THỨ NĂM", "THỨ SÁU", "THỨ BẢY", "CHỦ NHẬT"],
  en: ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"],
};

function defaultOverflow(locale: TimeLocale, n: number): string {
  if (locale === "ja") return `+ ${n} 件`;
  if (locale === "vi") return `+ ${n} khác`;
  return `+ ${n} more`;
}

export function MonthView({
  today,
  selected,
  events,
  calendars,
  locale = "en",
  onPickEvent,
  maxEventsPerCell = 4,
  dowLabels,
  formatOverflow,
}: MonthViewProps) {
  const cells = buildMonthGrid(selected.y, selected.m);
  const dowLabel = dowLabels ?? DOW_DEFAULTS[locale];
  const overflowFmt = formatOverflow ?? ((n: number) => defaultOverflow(locale, n));

  const visible = events.filter((e) =>
    calendars.find((c) => c.id === e.calId && c.shown),
  );
  const colorOf = (e: CalendarEvent) =>
    calendars.find((c) => c.id === e.calId)?.color ?? "#4c6cb3";
  const byDay = (key: string) => visible.filter((e) => e.date === key);

  return (
    <div className="cal-monthview">
      <div className="cal-monthview-dows">
        {dowLabel.map((w, i) => (
          <div key={i} className="cal-monthview-dow">
            {w}
          </div>
        ))}
      </div>
      <div className="cal-monthview-grid">
        {cells.map((c, i) => {
          const key = ymd(c.y, c.m, c.d);
          const dayEvents = byDay(key);
          const slice = dayEvents.slice(0, maxEventsPerCell);
          const more = dayEvents.length - slice.length;
          const isToday =
            !c.dim && today.y === c.y && today.m === c.m && today.d === c.d;
          const isWeekend = i % 7 >= 5;
          return (
            <MonthCell
              key={i}
              day={c.d}
              today={isToday}
              dim={c.dim}
              weekend={isWeekend}
              monthLabel={
                c.d === 1 && !c.dim
                  ? locale === "ja"
                    ? `${c.m}月`
                    : locale === "vi"
                      ? `Th. ${c.m}`
                      : String(c.m)
                  : undefined
              }
              overflow={more}
              formatOverflow={() => overflowFmt(more)}
              events={slice.map((ev) =>
                ev.allDay ? (
                  <AllDayChip
                    key={ev.id}
                    color={colorOf(ev)}
                    size="month"
                    onClick={() => onPickEvent?.(ev)}
                  >
                    {ev.title}
                  </AllDayChip>
                ) : (
                  <EventPill
                    key={ev.id}
                    color={colorOf(ev)}
                    time={ev.start}
                    title={ev.title}
                    dim={c.dim}
                    onClick={() => onPickEvent?.(ev)}
                  />
                ),
              )}
            />
          );
        })}
      </div>
    </div>
  );
}
