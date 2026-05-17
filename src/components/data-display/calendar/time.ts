// Time helpers shared by the calendar / scheduling primitives. These
// stay generic (no event-shape assumptions) so other surfaces — a
// rota planner, a focus-time visualiser — can reuse the same math.

/**
 * Locale used by `fmtHour`. Adds the JA suffix style (`9時`) for `ja`
 * and keeps `HH:00` for everything else.
 */
export type TimeLocale = "vi" | "ja" | "en";

/** Parse "HH:MM" into { h, m }. Tolerates missing minutes. */
export function parseHM(value: string): { h: number; m: number } {
  const [hStr, mStr] = value.split(":");
  const h = Number(hStr);
  const m = Number(mStr ?? "0");
  return { h: Number.isFinite(h) ? h : 0, m: Number.isFinite(m) ? m : 0 };
}

/** Pixel offset for a given clock time within a day-grid column. */
export function minToY(
  h: number,
  m: number,
  options: { dayStartH: number; pxPerMin: number },
): number {
  return (h - options.dayStartH) * 60 * options.pxPerMin + m * options.pxPerMin;
}

/** Format an hour cell label per locale. */
export function fmtHour(h: number, locale: TimeLocale): string {
  if (locale === "ja") return `${h}時`;
  return `${String(h).padStart(2, "0")}:00`;
}

/** Default day-grid sizing the WeekView / DayView screens use. */
export const DEFAULT_GRID = {
  dayStartH: 6,
  dayEndH: 22,
  pxPerMin: 0.9, // 1 hour = 54 px
} as const;

/**
 * Build a 6×7 Mon-first month grid for (year, monthIdx1to12). Lead-in
 * cells from the previous month and tail cells from the next month are
 * flagged `dim: true`. Shared by MiniMonth + MonthView.
 */
export interface MonthCellRef {
  y: number;
  m: number;
  d: number;
  dim: boolean;
}
export function buildMonthGrid(year: number, month: number): MonthCellRef[] {
  const first = new Date(year, month - 1, 1);
  const dow0 = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month, 0).getDate();
  const prevDays = new Date(year, month - 1, 0).getDate();
  const cells: MonthCellRef[] = [];
  for (let i = dow0 - 1; i >= 0; i--) {
    cells.push({ y: year, m: month - 1, d: prevDays - i, dim: true });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ y: year, m: month, d, dim: false });
  }
  let tail = 1;
  while (cells.length < 42) {
    cells.push({ y: year, m: month + 1, d: tail++, dim: true });
  }
  return cells;
}

/** YYYY-MM-DD key for a {y,m,d} triple. */
export function ymd(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}
