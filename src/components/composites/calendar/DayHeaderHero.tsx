import { cn } from "../../primitives/cn";

/**
 * DayHeaderHero — page-header strip rendered above `DayView`: large
 * day number + day-of-week + month/year + optional Today badge + event
 * count summary. Visually distinct from the `DayHeaderPill` atom (which
 * sits inside a week's column header).
 */
export interface DayHeaderHeroProps {
  day: number;
  dow: string;
  monthLabel: string;
  isToday?: boolean;
  todayLabel?: string;
  eventCount?: number;
  formatEventCount?: (n: number) => string;
  className?: string;
}

export function DayHeaderHero({
  day,
  dow,
  monthLabel,
  isToday = false,
  todayLabel = "Today",
  eventCount,
  formatEventCount,
  className,
}: DayHeaderHeroProps) {
  const countLabel =
    eventCount === undefined
      ? null
      : formatEventCount
        ? formatEventCount(eventCount)
        : `${eventCount} events`;
  return (
    <div className={cn("day-hero", className)} data-today={isToday || undefined}>
      <span className="day-hero-num">{day}</span>
      <div className="col" style={{ gap: 0 }}>
        <span className="day-hero-dow">{dow}</span>
        <span className="day-hero-month">{monthLabel}</span>
      </div>
      {isToday && <span className="day-hero-today-badge">{todayLabel}</span>}
      {countLabel && (
        <span className="ml-auto day-hero-count">{countLabel}</span>
      )}
    </div>
  );
}
