"use client";

export type CalendarDay = {
  date?: string;
  shifts?: Array<{ id: number; name?: string; start?: string; end?: string }>;
};

export type CalendarGridProps = {
  month: string;
  days: Record<string, CalendarDay>;
};

const WEEKDAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

export function CalendarGrid({ month, days }: CalendarGridProps) {
  const [year, m] = month.split("-").map(Number);
  const first = new Date(year, m - 1, 1);
  const last = new Date(year, m, 0);
  const startPad = first.getDay();
  const total = last.getDate();
  const cells: Array<{ date: string | null; day?: CalendarDay }> = [];

  for (let i = 0; i < startPad; i++) {
    cells.push({ date: null });
  }
  for (let d = 1; d <= total; d++) {
    const dateStr = `${year}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({ date: dateStr, day: days[dateStr] });
  }

  return (
    <div data-slot="calendar-grid" className="grid grid-cols-7 gap-1 text-xs">
      {WEEKDAYS.map((w) => (
        <div key={w} className="text-muted-foreground py-1 text-center font-medium">
          {w}
        </div>
      ))}
      {cells.map((cell, i) => (
        <div
          key={i}
          className={cell.date ? "bg-background min-h-20 rounded border p-1" : "min-h-20"}
        >
          {cell.date && (
            <>
              <div className="text-muted-foreground text-right">
                {Number(cell.date.slice(8, 10))}
              </div>
              {cell.day?.shifts?.map((s) => (
                <div key={s.id} className="bg-primary/10 mt-1 truncate rounded px-1 py-0.5">
                  {s.name ?? `#${s.id}`}
                </div>
              ))}
            </>
          )}
        </div>
      ))}
    </div>
  );
}
