import type { ComponentProps } from "react";
import { cn } from "../cn";
import { buildMonthGrid, ymd } from "./time";

/**
 * MiniMonth — compact 6×7 month grid for sidebars and date pickers.
 * Mon-first, 22px-cell. Renders an event dot when `eventDots[ymd]` is
 * truthy and `--accent-color` for today/selected states.
 */
export interface MiniMonthYMD {
  y: number;
  m: number;
  d: number;
}

export interface MiniMonthProps extends Omit<ComponentProps<"div">, "onSelect"> {
  /** Year of the grid. */
  year: number;
  /** Month (1–12) of the grid. */
  month: number;
  today: MiniMonthYMD;
  selected?: MiniMonthYMD;
  /** Map of YYYY-MM-DD → has-event boolean. */
  eventDots?: Record<string, boolean>;
  onSelect?: (ymd: MiniMonthYMD) => void;
  /** Day-of-week labels — Mon-first. Default JA single chars. */
  dowLabels?: readonly [string, string, string, string, string, string, string];
}

const DEFAULT_DOWS = ["月", "火", "水", "木", "金", "土", "日"] as const;

export function MiniMonth({
  year,
  month,
  today,
  selected,
  eventDots,
  onSelect,
  dowLabels = DEFAULT_DOWS,
  className,
  ...rest
}: MiniMonthProps) {
  const cells = buildMonthGrid(year, month);
  return (
    <div className={cn("mini-month", className)} {...rest}>
      {dowLabels.map((w, i) => (
        <div key={i} className="mini-month-dow">
          {w}
        </div>
      ))}
      {cells.map((c, i) => {
        const isWeekend = i % 7 >= 5;
        const isToday = !c.dim && today.y === c.y && today.m === c.m && today.d === c.d;
        const isSel =
          !c.dim &&
          selected &&
          selected.y === c.y &&
          selected.m === c.m &&
          selected.d === c.d;
        const state = isToday ? "today" : isSel ? "selected" : undefined;
        const hasDot = !c.dim && eventDots ? Boolean(eventDots[ymd(c.y, c.m, c.d)]) : false;
        return (
          <button
            key={i}
            type="button"
            className="mini-month-cell"
            data-state={state}
            data-dim={c.dim || undefined}
            data-weekend={isWeekend || undefined}
            onClick={() => !c.dim && onSelect?.({ y: c.y, m: c.m, d: c.d })}
            disabled={c.dim}
          >
            <span>{c.d}</span>
            {hasDot && !isToday && <span className="mini-month-dot" />}
          </button>
        );
      })}
    </div>
  );
}
