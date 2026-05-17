import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "../../data-display/Badge";
import { Button } from "../../general/Button";
import {
  AvailabilityRow,
  SuggestedSlotCard,
  type PersonRef,
} from "../../data-display/calendar/index";

/**
 * FindATimePanel — 1100×720 scheduling assistant. People rows on the
 * left, time grid on the right with busy / tentative / free shading;
 * "chosen-time" overlay tracks `selectedRange`. Footer: suggested-slot
 * cards. Legend at the bottom.
 *
 * Generic: caller supplies the people directory + their per-slot
 * availability arrays. Labels are caller-supplied for locale fit.
 */
export interface FindATimeLabels {
  title: string;
  subtitle: ReactNode;
  peopleCol: string;
  peopleCount: (n: number) => string;
  durationLabel: string;
  expandHours: string;
  apply: string;
  /** "Suggestions — slots all attendees free". */
  suggestionsLabel: string;
  /** Legend texts. */
  legendBusy: string;
  legendTentative: string;
  legendFree: string;
  workingHours: string;
}

export interface FindATimeSlotSuggestion {
  id: string;
  label: ReactNode;
  meta: ReactNode;
  best?: boolean;
  /** Optional click → set selectedRange to this slot. */
  range?: [number, number];
}

export interface FindATimePanelProps {
  people: PersonRef[];
  /** Per-person availability: 0 = free, 1 = tentative, 2 = busy. */
  availability: Record<string, ReadonlyArray<0 | 1 | 2>>;
  /** Working-hour range (e.g. 9..18) — header label only; slot count comes from availability arrays. */
  hours: number[];
  selectedRange: [number, number] | null;
  onChangeRange?: (range: [number, number] | null) => void;
  suggestions: FindATimeSlotSuggestion[];
  labels: FindATimeLabels;
  onPrev?: () => void;
  onNext?: () => void;
  selfLabel?: string;
}

export function FindATimePanel({
  people,
  availability,
  hours,
  selectedRange,
  onChangeRange,
  suggestions,
  labels,
  onPrev,
  onNext,
  selfLabel = "(you)",
}: FindATimePanelProps) {
  const firstAvail = Object.values(availability)[0];
  const slotCount = firstAvail?.length ?? hours.length * 2;

  return (
    <div className="cal-find">
      <header className="cal-find-head">
        <div>
          <h2 className="cal-find-title">{labels.title}</h2>
          <div className="cal-find-sub">{labels.subtitle}</div>
        </div>
        <div className="row gap-1" style={{ marginLeft: 6 }}>
          <Button
            variant="ghost"
            size="small"
            style={{ width: 26, padding: 0 }}
            onClick={onPrev}
            aria-label="Previous"
          >
            <ChevronLeft size={14} />
          </Button>
          <Button
            variant="ghost"
            size="small"
            style={{ width: 26, padding: 0 }}
            onClick={onNext}
            aria-label="Next"
          >
            <ChevronRight size={14} />
          </Button>
        </div>
        <Badge variant="info" style={{ marginLeft: 4 }}>
          <span className="dot" />
          {labels.peopleCount(people.length)}
        </Badge>
        <Badge variant="neutral">
          <span className="dot" />
          {labels.durationLabel}
        </Badge>
        <div className="ml-auto row gap-2">
          <Button variant="secondary" size="small">
            {labels.expandHours}
          </Button>
          <Button variant="primary" size="small">
            {labels.apply}
          </Button>
        </div>
      </header>

      <div className="cal-find-body">
        <div className="cal-find-grid">
          <div className="cal-find-people-head">{labels.peopleCol}</div>
          <div
            className="cal-find-hours"
            style={{ gridTemplateColumns: `repeat(${slotCount}, 1fr)` }}
          >
            {hours.map((h, i) => (
              <div
                key={h}
                className="cal-find-hour"
                style={{
                  gridColumn: "span 2",
                  borderRight: i === hours.length - 1 ? "none" : undefined,
                }}
              >
                {String(h).padStart(2, "0")}:00
              </div>
            ))}
          </div>

          {people.map((p) => {
            const slots = availability[p.id] ?? Array.from({ length: slotCount }, () => 0 as const);
            return (
              <AvailabilityRow
                key={p.id}
                slots={slots}
                selectedRange={selectedRange ?? null}
                person={
                  <>
                    <span
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: 999,
                        background: p.color,
                        color: "white",
                        display: "grid",
                        placeItems: "center",
                        fontSize: 10,
                        fontWeight: 600,
                      }}
                    >
                      {p.short}
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 12.5,
                          fontWeight: 500,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {p.name}
                        {p.self && (
                          <span
                            style={{
                              marginLeft: 4,
                              color: "var(--muted-foreground)",
                              fontSize: 10,
                            }}
                          >
                            {selfLabel}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 10, color: "var(--muted-foreground)" }}>
                        {p.org}
                        {p.role && <> · {p.role}</>}
                      </div>
                    </div>
                  </>
                }
              />
            );
          })}
        </div>

        <div className="cal-find-suggestions">
          <div className="cal-find-suggestions-label">{labels.suggestionsLabel}</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {suggestions.map((s) => (
              <SuggestedSlotCard
                key={s.id}
                label={s.label}
                meta={s.meta}
                best={s.best}
                onClick={() => s.range && onChangeRange?.(s.range)}
              />
            ))}
          </div>
        </div>
      </div>

      <footer className="cal-find-legend">
        <div className="row gap-2">
          <span className="cal-find-legend-swatch" data-state="2" /> {labels.legendBusy}
        </div>
        <div className="row gap-2">
          <span className="cal-find-legend-swatch" data-state="1" /> {labels.legendTentative}
        </div>
        <div className="row gap-2">
          <span className="cal-find-legend-swatch" data-state="0" /> {labels.legendFree}
        </div>
        <span className="ml-auto">{labels.workingHours}</span>
      </footer>
    </div>
  );
}
