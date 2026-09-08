import * as React from "react";
import { useTranslation } from "../../i18n/use-translation";
import { GripVertical } from "lucide-react";
import { Button } from "../general/button";
import { Text } from "../general/typography";
import { cn } from "../../lib/utils";

export type RangeTimelineRow = {
  id: string;
  label: React.ReactNode;
  start: number;
  end: number;
  startLabel: string;
  endLabel: string;
};

export type RangeTimelineProps = React.HTMLAttributes<HTMLElement> & {
  label: string;
  columns: { label: string; units: number }[];
  bands?: { label: string; units: number }[];
  rows: RangeTimelineRow[];
  today?: number | null;
  onRangeChange?: (id: string, edge: "start" | "end", delta: number) => void;
};

/** A horizontal range axis. Units and labels are data; the design system owns all geometry. */
export const RangeTimeline = React.forwardRef<HTMLElement, RangeTimelineProps>(
  function RangeTimeline(
    { label, columns, bands, rows, today, onRangeChange, className, ...props },
    ref,
  ) {
    const { t } = useTranslation();
    const units = Math.max(
      1,
      columns.reduce((sum, column) => sum + column.units, 0),
    );
    const track = React.useRef<HTMLDivElement>(null);
    const drag = React.useRef<{
      id: string;
      edge: "start" | "end";
      x: number;
      width: number;
      direction: number;
    } | null>(null);
    const [preview, setPreview] = React.useState<{
      id: string;
      edge: "start" | "end";
      delta: number;
    } | null>(null);
    const deltaAt = (x: number) =>
      drag.current
        ? Math.round(((x - drag.current.x) * units * drag.current.direction) / drag.current.width)
        : 0;
    const cancel = () => {
      drag.current = null;
      setPreview(null);
    };
    const complete = (event: React.PointerEvent<HTMLButtonElement>) => {
      const current = drag.current;
      if (!current) return;
      const row = rows.find((row) => row.id === current.id);
      const delta = deltaAt(event.clientX);
      cancel();
      if (!row) return;
      const bounded =
        current.edge === "start"
          ? Math.min(delta, row.end - row.start)
          : Math.max(delta, row.start - row.end);
      if (bounded) onRangeChange?.(row.id, current.edge, bounded);
    };
    return (
      <section
        {...props}
        ref={ref}
        className={cn("ui-range-timeline", className)}
        aria-label={label}
        tabIndex={0}
      >
        <div
          className="ui-range-timeline-canvas"
          style={{ "--range-timeline-columns": Math.max(1, columns.length) } as React.CSSProperties}
        >
          {bands && bands.length > 0 && (
            <div className="ui-range-timeline-header">
              <div className="ui-range-timeline-label" aria-hidden="true" />
              <div className="ui-range-timeline-columns">
                {bands.map((band, index) => (
                  <div
                    key={index}
                    className="ui-range-timeline-column"
                    style={{ flex: band.units }}
                  >
                    <Text size="xs" weight="medium">
                      {band.label}
                    </Text>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="ui-range-timeline-header">
            <div className="ui-range-timeline-label">
              <Text weight="bold">{label}</Text>
            </div>
            <div className="ui-range-timeline-columns" ref={track}>
              {columns.map((column, index) => (
                <div
                  key={index}
                  className="ui-range-timeline-column"
                  style={{ flex: column.units }}
                >
                  <Text size="xs">{column.label}</Text>
                </div>
              ))}
            </div>
          </div>
          {rows.map((row) => {
            const delta = preview?.id === row.id ? preview.delta : 0;
            const start = Math.min(row.end, row.start + (preview?.edge === "start" ? delta : 0));
            const end = Math.max(row.start, row.end + (preview?.edge === "end" ? delta : 0));
            const left = Math.max(0, start),
              right = Math.min(units, end + 1);
            return (
              <div className="ui-range-timeline-row" key={row.id}>
                <div className="ui-range-timeline-label">{row.label}</div>
                <div className="ui-range-timeline-track">
                  {today != null && today >= 0 && today < units && (
                    <span
                      aria-hidden="true"
                      className="ui-range-timeline-today"
                      style={{ insetInlineStart: `${((today + 0.5) / units) * 100}%` }}
                    />
                  )}
                  {right <= left && <Text tone="muted">{t("rangeTimeline.outsideRange")}</Text>}
                  {right > left && (
                    <div
                      className="ui-range-timeline-bar"
                      style={{
                        insetInlineStart: `${(left / units) * 100}%`,
                        inlineSize: `${((right - left) / units) * 100}%`,
                      }}
                    >
                      {onRangeChange &&
                        (right - left) * Math.max(1, columns.length) >= units &&
                        (["start", "end"] as const)
                          .filter((edge) =>
                            edge === "start"
                              ? start >= 0 && start < units
                              : end >= 0 && end < units,
                          )
                          .map((edge) => (
                            <Button
                              key={edge}
                              variant="ghost"
                              size="icon-xs"
                              className="ui-range-timeline-handle"
                              data-edge={edge}
                              aria-label={edge === "start" ? row.startLabel : row.endLabel}
                              onPointerDown={(event) => {
                                const width = track.current?.getBoundingClientRect().width ?? 0;
                                if (!width || event.button !== 0) return;
                                event.currentTarget.setPointerCapture(event.pointerId);
                                drag.current = {
                                  id: row.id,
                                  edge,
                                  x: event.clientX,
                                  width,
                                  direction:
                                    getComputedStyle(event.currentTarget).direction === "rtl"
                                      ? -1
                                      : 1,
                                };
                              }}
                              onPointerMove={(event) => {
                                if (drag.current)
                                  setPreview({
                                    id: drag.current.id,
                                    edge: drag.current.edge,
                                    delta: deltaAt(event.clientX),
                                  });
                              }}
                              onPointerUp={complete}
                              onPointerCancel={cancel}
                              onLostPointerCapture={cancel}
                              onKeyDown={(event) => {
                                if (event.key === "Escape") {
                                  cancel();
                                  return;
                                }
                                const step =
                                  event.key === "ArrowRight"
                                    ? 1
                                    : event.key === "ArrowLeft"
                                      ? -1
                                      : 0;
                                if (!step) return;
                                event.preventDefault();
                                const direction =
                                  getComputedStyle(event.currentTarget).direction === "rtl"
                                    ? -1
                                    : 1;
                                const delta = step * direction;
                                if (
                                  edge === "start"
                                    ? row.start + delta <= row.end
                                    : row.end + delta >= row.start
                                )
                                  onRangeChange(row.id, edge, delta);
                              }}
                            >
                              <GripVertical aria-hidden="true" />
                            </Button>
                          ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  },
);
