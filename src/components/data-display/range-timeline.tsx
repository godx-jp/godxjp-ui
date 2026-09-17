import * as React from "react";
import { useTranslation } from "../../i18n/use-translation";
import { ChevronDown, ChevronLeft, ChevronRight, GripVertical } from "lucide-react";
import { Button } from "../general/button";
import { Text } from "../general/typography";
import type { DensityProp } from "../../props/vocabulary";
import { cn } from "../../lib/utils";

export type RangeTimelineRow = {
  id: string;
  label: React.ReactNode;
  start: number;
  end: number;
  startLabel: string;
  endLabel: string;
  /**
   * Nesting level, 0 for a top-level row. Rows arrive flat and depth-first (a parent, then its
   * descendants); a row is a parent when the row after it is deeper. The component draws the
   * indent (`--range-timeline-indent-width` per level) and the disclosure.
   */
  depth?: number;
};

export type RangeTimelineProps = React.HTMLAttributes<HTMLElement> & {
  label: string;
  /** `muted` tints that column down the whole body — a non-working day, a closed period. */
  columns: { label: string; units: number; muted?: boolean }[];
  bands?: { label: string; units: number }[];
  rows: RangeTimelineRow[];
  today?: number | null;
  onRangeChange?: (id: string, edge: "start" | "end", delta: number) => void;
  /**
   * Rule the body as a grid: a line between rows, a line under the header, and a vertical line for
   * every column down the whole body. Default `true`, like `Calendar bordered`; `false` restores
   * the header-only ruling. Colour `--range-timeline-grid-color`, weight `--range-timeline-grid-width`.
   */
  bordered?: boolean;
  /**
   * How wide ONE axis unit is — the canonical density vocabulary, the same three steps
   * `DataTable density` uses. `default` (56px/day) is the shipped width, so an existing Gantt
   * does not move; `compact` (42px/day) fits a third more days on the same screen; `comfortable`
   * (70px/day) spreads them out. It moves the column width ONLY — row height, bar height and the
   * label column are identical at every step. Retune a step with
   * `--range-timeline-unit-width-{compact,default,comfortable}`.
   */
  density?: DensityProp;
  /**
   * Controlled ids of the EXPANDED parent rows (same spelling as `Tree expandedValues`). A folded
   * parent hides every descendant row — label and bar.
   */
  expandedValues?: readonly string[];
  /** Uncontrolled initial expanded parents. Omitted: every parent starts expanded. */
  defaultExpandedValues?: readonly string[];
  /** Fires with the next expanded parent ids, for controlled and uncontrolled timelines alike. */
  onExpandedValuesChange?: (values: string[]) => void;
};

/** A horizontal range axis. Units and labels are data; the design system owns all geometry. */
export const RangeTimeline = React.forwardRef<HTMLElement, RangeTimelineProps>(
  function RangeTimeline(
    {
      label,
      columns,
      bands,
      rows,
      today,
      onRangeChange,
      bordered = true,
      density = "default",
      expandedValues,
      defaultExpandedValues,
      onExpandedValuesChange,
      className,
      ...props
    },
    ref,
  ) {
    const { t } = useTranslation();
    const reactId = React.useId();
    const depthOf = (row: RangeTimelineRow) => Math.max(0, Math.floor(row.depth ?? 0));
    // Without any depth the timeline is flat and renders exactly as it did before nesting existed.
    const nested = rows.some((row) => depthOf(row) > 0);
    const parents = rows
      .filter((row, index) => index + 1 < rows.length && depthOf(rows[index + 1]) > depthOf(row))
      .map((row) => row.id);
    // Uncontrolled state is the COLLAPSED set, so a parent that arrives later starts expanded.
    const [collapsed, setCollapsed] = React.useState<ReadonlySet<string>>(
      () =>
        new Set(
          defaultExpandedValues ? parents.filter((id) => !defaultExpandedValues.includes(id)) : [],
        ),
    );
    const isExpanded = (id: string) =>
      expandedValues ? expandedValues.includes(id) : !collapsed.has(id);
    const toggleRow = (id: string) => {
      const open = !isExpanded(id);
      if (!expandedValues) {
        const next = new Set(collapsed);
        if (open) next.delete(id);
        else next.add(id);
        setCollapsed(next);
      }
      onExpandedValuesChange?.(
        parents.filter((parent) => (parent === id ? open : isExpanded(parent))),
      );
    };
    // Depth-first walk: a folded parent hides every following deeper row — label AND bar.
    let foldedAt: number | null = null;
    const visibleRows = rows.filter((row) => {
      const depth = depthOf(row);
      if (foldedAt !== null && depth > foldedAt) return false;
      foldedAt = parents.includes(row.id) && !isExpanded(row.id) ? depth : null;
      return true;
    });
    // Position among siblings (same parent), for aria-setsize / aria-posinset on a flat list.
    const siblingsOf = (index: number) => {
      const depth = depthOf(visibleRows[index]);
      let first = index;
      while (first > 0 && depthOf(visibleRows[first - 1]) >= depth) first -= 1;
      let size = 0,
        position = 0;
      for (let i = first; i < visibleRows.length && depthOf(visibleRows[i]) >= depth; i += 1) {
        if (depthOf(visibleRows[i]) !== depth) continue;
        size += 1;
        if (i === index) position = size;
      }
      return { size, position };
    };
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
        data-bordered={bordered ? "true" : undefined}
        // Only a NON-default step scopes the unit-width knob, so a theme that narrows
        // --range-timeline-unit-width globally still owns the default timeline (gh#730).
        data-density={density === "default" ? undefined : density}
        aria-label={label}
        tabIndex={0}
      >
        <div
          className="ui-range-timeline-canvas"
          style={
            {
              "--range-timeline-columns": Math.max(1, columns.length),
              "--range-timeline-units": units,
            } as React.CSSProperties
          }
        >
          {bands && bands.length > 0 && (
            <div className="ui-range-timeline-header">
              <div className="ui-range-timeline-label" aria-hidden="true" />
              <div className="ui-range-timeline-columns">
                {bands.map((band, index) => (
                  <div
                    key={index}
                    className="ui-range-timeline-column"
                    style={{ gridColumn: `span ${band.units}` }}
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
                  style={{ gridColumn: `span ${column.units}` }}
                >
                  <Text size="xs">{column.label}</Text>
                </div>
              ))}
            </div>
          </div>
          <div className="ui-range-timeline-body" role={nested ? "list" : undefined}>
            {(bordered || columns.some((column) => column.muted)) && (
              // Decorative: the same unit tracks as the header columns, laid once behind every row so
              // each vertical rule runs the full body height exactly under its header column.
              <div className="ui-range-timeline-grid" aria-hidden="true">
                <div />
                <div className="ui-range-timeline-columns">
                  {columns.map((column, index) => (
                    <div
                      key={index}
                      className="ui-range-timeline-grid-column"
                      data-muted={column.muted ? "true" : undefined}
                      style={{ gridColumn: `span ${column.units}` }}
                    />
                  ))}
                </div>
              </div>
            )}
            {visibleRows.map((row, index) => {
              // Ids from the row's position, never from `row.id` (which may hold spaces).
              const idBase = `${reactId}-row-${rows.indexOf(row)}`;
              const delta = preview?.id === row.id ? preview.delta : 0;
              const start = Math.min(row.end, row.start + (preview?.edge === "start" ? delta : 0));
              const end = Math.max(row.start, row.end + (preview?.edge === "end" ? delta : 0));
              const left = Math.max(0, start),
                right = Math.min(units, end + 1);
              return (
                <div
                  className="ui-range-timeline-row"
                  key={row.id}
                  {...(nested && {
                    role: "listitem",
                    "aria-level": depthOf(row) + 1,
                    "aria-setsize": siblingsOf(index).size,
                    "aria-posinset": siblingsOf(index).position,
                  })}
                >
                  {nested ? (
                    <div
                      className="ui-range-timeline-label"
                      data-nested="true"
                      style={{ "--range-timeline-depth": depthOf(row) } as React.CSSProperties}
                    >
                      {parents.includes(row.id) ? (
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          className="ui-range-timeline-disclosure"
                          aria-expanded={isExpanded(row.id)}
                          aria-labelledby={`${idBase}-toggle ${idBase}-label`}
                          onClick={() => toggleRow(row.id)}
                        >
                          <span id={`${idBase}-toggle`} hidden>
                            {t("rangeTimeline.childRows")}
                          </span>
                          {isExpanded(row.id) ? (
                            <ChevronDown aria-hidden="true" />
                          ) : (
                            <ChevronRight
                              aria-hidden="true"
                              className="ui-range-timeline-disclosure-collapsed"
                            />
                          )}
                        </Button>
                      ) : (
                        <span aria-hidden="true" className="ui-range-timeline-disclosure-spacer" />
                      )}
                      <div id={`${idBase}-label`} className="ui-range-timeline-label-content">
                        {row.label}
                      </div>
                    </div>
                  ) : (
                    <div className="ui-range-timeline-label">{row.label}</div>
                  )}
                  <div className="ui-range-timeline-track">
                    {today != null && today >= 0 && today < units && (
                      <span
                        aria-hidden="true"
                        className="ui-range-timeline-today"
                        style={{ insetInlineStart: `${((today + 0.5) / units) * 100}%` }}
                      />
                    )}
                    {right <= left &&
                      (end < 0 ? (
                        <span className="ui-range-timeline-outside" data-direction="before">
                          <ChevronLeft
                            aria-hidden="true"
                            className="ui-range-timeline-outside-icon"
                          />
                          <Text size="xs" tone="muted">
                            {t("rangeTimeline.outsideBefore")}
                          </Text>
                        </span>
                      ) : (
                        <span className="ui-range-timeline-outside" data-direction="after">
                          <Text size="xs" tone="muted">
                            {t("rangeTimeline.outsideAfter")}
                          </Text>
                          <ChevronRight
                            aria-hidden="true"
                            className="ui-range-timeline-outside-icon"
                          />
                        </span>
                      ))}
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
        </div>
      </section>
    );
  },
);
