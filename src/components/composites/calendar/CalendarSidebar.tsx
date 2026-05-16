import { ChevronDown, ChevronLeft, ChevronRight, Plus, Search } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "../../primitives/Button";
import {
  ColorSwatchCheckbox,
  MiniMonth,
  type CalendarRef,
  type MiniMonthYMD,
} from "../../primitives/calendar/index";

/**
 * CalendarSidebar — left rail for the calendar screen:
 *   1. "Create event" pill CTA
 *   2. Mini-month with prev/next nav
 *   3. People search field
 *   4. Three grouped calendar lists (mine / org / shared)
 *
 * Generic: takes a flat list of `CalendarRef` and groups by `c.group`.
 * Labels are caller-supplied so the sidebar is locale-agnostic.
 */
export interface CalendarSidebarLabels {
  createEvent: string;
  searchPeople: string;
  /** Section labels keyed by `CalendarRef.group`. */
  sections: Record<string, string>;
  /** Mini-month title (e.g. "5月 2026"). */
  monthLabel: string;
  /** Footer CTA label (e.g. "Add another calendar"). */
  addCalendar?: string;
}

export interface CalendarSidebarProps {
  today: MiniMonthYMD;
  selected: MiniMonthYMD;
  /** Year + month for the mini-month grid. */
  miniMonthYear: number;
  miniMonthMonth: number;
  calendars: CalendarRef[];
  eventDots?: Record<string, boolean>;
  labels: CalendarSidebarLabels;
  /** Order of group keys to render. */
  groupOrder?: string[];
  onSelectDate?: (ymd: MiniMonthYMD) => void;
  onToggleCalendar?: (id: string) => void;
  onCreate?: () => void;
  onPrevMonth?: () => void;
  onNextMonth?: () => void;
  onAddCalendar?: () => void;
  /** Optional dow labels passed straight through to MiniMonth. */
  miniMonthDows?: MiniMonthYMD extends infer _ ? readonly [string, string, string, string, string, string, string] : never;
}

export function CalendarSidebar({
  today,
  selected,
  miniMonthYear,
  miniMonthMonth,
  calendars,
  eventDots,
  labels,
  groupOrder,
  onSelectDate,
  onToggleCalendar,
  onCreate,
  onPrevMonth,
  onNextMonth,
  onAddCalendar,
  miniMonthDows,
}: CalendarSidebarProps) {
  const groups = groupOrder ?? Array.from(new Set(calendars.map((c) => c.group ?? "default")));
  return (
    <aside className="cal-sidebar">
      <div style={{ padding: 14 }}>
        <button type="button" className="cal-sidebar-create" onClick={onCreate}>
          <span className="cal-sidebar-create-icon">
            <Plus size={15} />
          </span>
          <span>{labels.createEvent}</span>
        </button>
      </div>

      <div style={{ padding: "0 12px 12px" }}>
        <div
          className="row gap-1"
          style={{ marginBottom: 6, padding: "0 4px" }}
        >
          <span style={{ fontSize: 12, fontWeight: 500, color: "var(--foreground)" }}>
            {labels.monthLabel}
          </span>
          <span className="ml-auto" style={{ display: "flex", gap: 2 }}>
            <Button
              variant="ghost"
              size="sm"
              style={{ width: 22, height: 22, padding: 0 }}
              onClick={onPrevMonth}
              aria-label="Previous month"
            >
              <ChevronLeft size={13} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              style={{ width: 22, height: 22, padding: 0 }}
              onClick={onNextMonth}
              aria-label="Next month"
            >
              <ChevronRight size={13} />
            </Button>
          </span>
        </div>
        <MiniMonth
          year={miniMonthYear}
          month={miniMonthMonth}
          today={today}
          selected={selected}
          eventDots={eventDots}
          onSelect={onSelectDate}
          dowLabels={miniMonthDows}
        />
      </div>

      <div style={{ padding: "4px 14px 8px" }}>
        <div className="cal-sidebar-search">
          <Search size={13} color="var(--muted-foreground)" />
          <input placeholder={labels.searchPeople} />
        </div>
      </div>

      {groups.map((group) => {
        const inGroup = calendars.filter((c) => (c.group ?? "default") === group);
        if (inGroup.length === 0) return null;
        return (
          <SidebarSection key={group} label={labels.sections[group] ?? group}>
            <div className="col" style={{ gap: 1 }}>
              {inGroup.map((cal) => (
                <ColorSwatchCheckbox
                  key={cal.id}
                  color={cal.color}
                  label={cal.name}
                  checked={cal.shown ?? false}
                  onChange={() => onToggleCalendar?.(cal.id)}
                  readonly={cal.readonly}
                />
              ))}
            </div>
          </SidebarSection>
        );
      })}

      {onAddCalendar && labels.addCalendar && (
        <div style={{ padding: "4px 14px 16px" }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={onAddCalendar}
            style={{
              padding: "0 6px",
              color: "var(--muted-foreground)",
              fontSize: 11,
            }}
          >
            <Plus size={12} /> {labels.addCalendar}
          </Button>
        </div>
      )}
    </aside>
  );
}

function SidebarSection({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="cal-sidebar-section">
      <div className="cal-sidebar-section-label">
        {label}
        <span className="ml-auto">
          <ChevronDown size={12} />
        </span>
      </div>
      {children}
    </div>
  );
}
