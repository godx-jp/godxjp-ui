import {
  AllDayChip,
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
} from "../../primitives/calendar";
import { DayHeaderHero } from "./DayHeaderHero";

/**
 * DayView — single-column time grid with a hero header showing the
 * date number + day-of-week + Today badge + event count. All-day
 * events render as pill chips across a strip beneath the hero.
 */
export interface DayViewYMD {
  y: number;
  m: number;
  d: number;
}
export interface DayViewProps {
  today: DayViewYMD;
  selected: DayViewYMD;
  events: CalendarEvent[];
  calendars: CalendarRef[];
  locale?: TimeLocale;
  selectedEventId?: string | null;
  onPickEvent?: (event: CalendarEvent) => void;
  resolveVariant?: (event: CalendarEvent) => EventBlockVariant;
  /** Override dow labels. */
  dowLabels?: readonly [string, string, string, string, string, string, string];
  /** "Today" badge text. */
  todayLabel?: string;
  /** Localise "(count) events" — receives count. */
  formatEventCount?: (count: number) => string;
  nowOverride?: Date;
}

const DOW_DEFAULTS: Record<TimeLocale, readonly [string, string, string, string, string, string, string]> = {
  ja: ["月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日", "日曜日"],
  vi: ["Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy", "Chủ nhật"],
  en: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
};

function defaultResolveVariant(ev: CalendarEvent): EventBlockVariant {
  if (ev.status === "tentative") return "tentative";
  if (ev.type === "focus") return "focus";
  if (ev.type === "customer") return "solid";
  return "tint";
}

export function DayView({
  today,
  selected,
  events,
  calendars,
  locale = "en",
  selectedEventId,
  onPickEvent,
  resolveVariant = defaultResolveVariant,
  dowLabels,
  todayLabel,
  formatEventCount,
  nowOverride,
}: DayViewProps) {
  const dowLabel = dowLabels ?? DOW_DEFAULTS[locale];
  const key = ymd(selected.y, selected.m, selected.d);
  const visible = events.filter((e) =>
    calendars.find((c) => c.id === e.calId && c.shown),
  );
  const dayEvs = visible.filter((e) => e.date === key);
  const allDay = dayEvs.filter((e) => e.allDay);
  const timed = layoutEvents(dayEvs.filter((e) => !e.allDay));
  const isToday =
    today.y === selected.y && today.m === selected.m && today.d === selected.d;
  const dow = (new Date(selected.y, selected.m - 1, selected.d).getDay() + 6) % 7;
  const colorOf = (e: CalendarEvent) =>
    calendars.find((c) => c.id === e.calId)?.color ?? "#4c6cb3";

  return (
    <div className="cal-dayview">
      <div className="cal-dayview-col">
        <DayHeaderHero
          day={selected.d}
          dow={dowLabel[dow]}
          monthLabel={
            locale === "ja"
              ? `${selected.y}年${selected.m}月`
              : `${selected.m}/${selected.y}`
          }
          isToday={isToday}
          todayLabel={todayLabel}
          eventCount={timed.length + allDay.length}
          formatEventCount={formatEventCount}
        />

        {allDay.length > 0 && (
          <div className="cal-dayview-allday-strip">
            {allDay.map((ev) => (
              <AllDayChip
                key={ev.id}
                color={colorOf(ev)}
                size="pill"
                onClick={() => onPickEvent?.(ev)}
              >
                {ev.title}
              </AllDayChip>
            ))}
          </div>
        )}

        <div className="cal-dayview-scroll">
          <div className="cal-dayview-grid">
            <TimeGutter
              dayStartH={DEFAULT_GRID.dayStartH}
              dayEndH={DEFAULT_GRID.dayEndH}
              pxPerMin={DEFAULT_GRID.pxPerMin}
              locale={locale}
            />
            <GridColumn isToday={isToday}>
              {timed.map((ev) => (
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
          </div>
        </div>
      </div>
    </div>
  );
}
