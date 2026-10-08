import * as React from "react";
import { useTranslation } from "../i18n/use-translation";
import { ChevronDown, ChevronLeft, ChevronRight, GripVertical } from "lucide-react";
import { Button } from "../components/general/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../components/feedback/tooltip";
import { CONTRAST_PIVOT, relativeLuminance } from "../app/tenant-theme";
import { Text } from "../components/general/typography";
import type { DensityProp } from "../props/vocabulary";
import { cn } from "../lib/utils";

export type RangeTimelineRow = {
  id: string;
  label: React.ReactNode;
  /**
   * First and last unit of the bar. `null` (either) means the row has no dates yet: no bar, a
   * muted "no dates" hint in its track, and no resize handles (gh#1189).
   */
  start: number | null;
  end: number | null;
  startLabel: string;
  endLabel: string;
  /**
   * Nesting level, 0 for a top-level row. Rows arrive flat and depth-first (a parent, then its
   * descendants); a row is a parent when the row after it is deeper. The component draws the
   * indent (`--range-timeline-indent-width` per level) and the disclosure.
   */
  depth?: number;
  /**
   * The bar's fill, a hex colour from data (the same contract as `Badge color`), e.g. the issue
   * status colour. The grips' ink flips black or white from the colour's luminance, the same pivot
   * `tenantTheme` uses for `--primary-foreground`; a value that is not a hex keeps the default ink.
   */
  color?: string;
  /** De-emphasise a closed / done row's bar (`--range-timeline-bar-muted-alpha`), nothing else. */
  muted?: boolean;
  /**
   * Mark the bar overdue: a destructive edge on its inline end that keeps `color`, plus a localized
   * screen-reader "overdue" so the colour is never the only carrier.
   */
  overdue?: boolean;
  /**
   * Shown on hover and on keyboard focus of the bar (key, title, status, assignee, start → due).
   * The bar gains a focusable layer named by the row label; the grips stay separate buttons.
   */
  tooltip?: React.ReactNode;
  /**
   * The PLANNED range (予定), drawn as a dashed ghost bar; `start` / `end` are then the ACTUAL range
   * (実績), drawn solid. Past the planned end the actual bar carries a destructive overrun segment;
   * ending before it, a small early marker. Both are also spoken.
   */
  plan?: { start: number | null; end: number | null } | null;
  /**
   * Text after an overrun segment. Default: the overrun in axis units, localized as days
   * ("+3日" / "+3d" / "+3 ngày"), since a Gantt's unit is the day. `false` shows none.
   */
  varianceLabel?: React.ReactNode | false;
  /**
   * A muted note shown after the bar when the row has no `plan`, e.g. "baseline後に追加". Nothing
   * is drawn for a row without a plan unless this is set.
   */
  planNote?: React.ReactNode;
  /**
   * Which grips this row offers when `onRangeChange` is set. Default `true` (both). A started-but-open
   * issue whose end is "today" passes `{ end: false }`, keeping the start grip. `false` removes both.
   */
  editable?: boolean | { start?: boolean; end?: boolean };
  /**
   * What an undated row (no `start` / `end`) says in its track. Default: the localized "no dates"
   * hint. `false` says nothing: a pure context row (a phase heading, a group label).
   */
  emptyHint?: React.ReactNode | false;
  /**
   * Spoken with a FINISH-ONLY row (`start: null`, `end` set): a finish was recorded without a known
   * start, drawn as a finish tick at `end`. Default: the localized "start unknown".
   */
  startUnknownLabel?: string;
  /**
   * The row started but its completion is not recorded: the bar runs to `end` (pass the as-of
   * unit), its inline end fades out, and it has no end grip.
   */
  openEnd?: boolean;
  /** Spoken with an `openEnd` bar. Default: the localized "completion not recorded". */
  openEndLabel?: string;
  /**
   * `milestone` draws a diamond at `end` (`start` is ignored); its `plan` is a hollow diamond at
   * `plan.end`; overrun / early and their labels apply as for a bar; one grip moves it, reported
   * as `onRangeChange(id, "end", delta)`.
   */
  shape?: "bar" | "milestone";
  /**
   * What the ghost means for this row, e.g. "ベースライン" (a frozen baseline) or "予定" (the live
   * plan), used in the spoken overrun / early text. Overrides the timeline's `planLabel`.
   */
  planLabel?: string;
  /**
   * Text after the early marker. Default: how early, localized as days ("-2日" / "-2d" / "-2 ngày").
   * `false` shows none.
   */
  earlyLabel?: React.ReactNode | false;
  /** Cancelled (中止): a hatched bar, distinct from `muted`, spoken, and without grips. */
  cancelled?: boolean;
  /**
   * An accent on the row's inline start plus a spoken label, so colour is never the only cue:
   * `warning` (at risk, e.g. a late predecessor) or `critical` (on the critical path).
   */
  emphasis?: "warning" | "critical";
};

/**
 * A dependency between two rows, drawn as an elbow connector over the body. `FS` (the default)
 * runs from the predecessor's finish to the successor's start; `SS` start to start, `FF` finish to
 * finish, `SF` start to finish. A milestone's endpoint is its diamond.
 */
export type RangeTimelineLink = {
  id: string;
  /** The predecessor row's id. */
  from: string;
  /** The successor row's id. */
  to: string;
  type?: "FS" | "SS" | "FF" | "SF";
  /**
   * The schedule breaks this dependency: the connector turns destructive and its head gets a
   * focusable marker (with `label` in a tooltip), also listed for screen readers.
   */
  violated?: boolean;
  label?: string;
};

/** Black or white ink for a hex fill; `undefined` when the value cannot be measured. */
function inkOn(color: string | undefined): string | undefined {
  if (!color) return undefined;
  const luminance = relativeLuminance(color);
  if (luminance == null) return undefined;
  return luminance > CONTRAST_PIVOT ? "black" : "white";
}

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
  /**
   * Keep the axis header (bands + ticks) on screen while the PAGE scrolls a long schedule — antd
   * Table `sticky`. `offsetHeader` is the distance in px from the top of the scrolling viewport,
   * e.g. the height of a fixed app topbar. The header then scrolls horizontally with the body.
   * Needs no clipping ancestor (e.g. `Card`, which is `overflow: hidden`) between it and the page
   * scroller. antd's `offsetScroll` / `getContainer` (a sticky horizontal scrollbar) are not ported.
   */
  sticky?: boolean | { offsetHeader?: number };
  /**
   * Let the user resize the label column by dragging a divider in the header (gh#1189): a
   * `role="separator"` with aria-valuenow/min/max, ArrowLeft/Right (Shift = a bigger step),
   * Home/End, RTL-aware. `true` uses min 160 / max 640 px. The width lands on
   * `--range-timeline-label-width`, so the token stays the default until the user drags.
   */
  resizableLabel?: boolean | { min?: number; max?: number };
  /** Controlled label-column width in px. Persist it per user from `onLabelWidthChange`. */
  labelWidth?: number;
  /** Uncontrolled initial label-column width in px. Omitted: the token's width. */
  defaultLabelWidth?: number;
  /** Fires with the next label-column width (px) while dragging and on every key step. */
  onLabelWidthChange?: (width: number) => void;
  /**
   * A new range is loading while the previous rows stay on screen: dims the body, draws an
   * indeterminate line under the header and sets `aria-busy` (gh#1189).
   */
  busy?: boolean;
  /**
   * What the plan ghost means on every row (a row's own `planLabel` wins), e.g. "ベースライン",
   * used in the spoken overrun / early text: "ベースラインより3日遅れ".
   */
  planLabel?: string;
  /**
   * Dependency connectors between rows (FS / SS / FF / SF). Only rows that are visible and dated at
   * the needed endpoint are connected; an endpoint outside the range is clamped to the edge.
   */
  links?: RangeTimelineLink[];
};

const LABEL_WIDTH_STEP = 8;
const LABEL_WIDTH_BIG_STEP = 32;

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
      sticky = false,
      resizableLabel = false,
      labelWidth,
      defaultLabelWidth,
      onLabelWidthChange,
      busy = false,
      planLabel: timelinePlanLabel,
      links,
      className,
      ...props
    },
    ref,
  ) {
    const { t } = useTranslation();
    const resize = resizableLabel
      ? {
          min: (typeof resizableLabel === "object" && resizableLabel.min) || 160,
          max: (typeof resizableLabel === "object" && resizableLabel.max) || 640,
        }
      : null;
    const [ownLabelWidth, setOwnLabelWidth] = React.useState<number | undefined>(defaultLabelWidth);
    const currentLabelWidth = labelWidth ?? ownLabelWidth;
    const labelCell = React.useRef<HTMLDivElement>(null);
    const labelDrag = React.useRef<{ x: number; width: number; direction: number } | null>(null);
    const setLabelWidth = (next: number) => {
      if (!resize) return;
      const bounded = Math.round(Math.min(resize.max, Math.max(resize.min, next)));
      if (labelWidth === undefined) setOwnLabelWidth(bounded);
      onLabelWidthChange?.(bounded);
    };
    // Before the first drag the column is whatever the token resolves to, so read it from layout.
    const measuredLabelWidth = () =>
      currentLabelWidth ?? Math.round(labelCell.current?.getBoundingClientRect().width ?? 0);
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
    const stickyHeader = React.useRef<HTMLDivElement>(null);
    const bodyScroller = React.useRef<HTMLDivElement>(null);
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
      if (row?.shape === "milestone") {
        if (row.end !== null && delta) onRangeChange?.(row.id, "end", delta);
        return;
      }
      if (!row || row.start === null || row.end === null) return;
      const bounded =
        current.edge === "start"
          ? Math.min(delta, row.end - row.start)
          : Math.max(delta, row.start - row.end);
      if (bounded) onRangeChange?.(row.id, current.edge, bounded);
    };
    // Dependency links need each visible row's vertical centre, measured after layout (a wrapped
    // label makes a row taller), and the direction, since SVG coordinates are physical.
    const rowElements = React.useRef(new Map<string, HTMLDivElement>());
    const bodyRef = React.useRef<HTMLDivElement>(null);
    const [rowCentres, setRowCentres] = React.useState<{
      rtl: boolean;
      y: Record<string, number>;
    } | null>(null);
    const hasLinks = Boolean(links && links.length > 0);
    const measureRows = React.useCallback(() => {
      const body = bodyRef.current;
      if (!body) return;
      const y: Record<string, number> = {};
      rowElements.current.forEach((element, id) => {
        y[id] = element.offsetTop + element.offsetHeight / 2;
      });
      const rtl = getComputedStyle(body).direction === "rtl";
      setRowCentres((previous) => {
        if (
          previous &&
          previous.rtl === rtl &&
          Object.keys(previous.y).length === Object.keys(y).length &&
          Object.keys(y).every((id) => previous.y[id] === y[id])
        )
          return previous;
        return { rtl, y };
      });
    }, []);
    React.useLayoutEffect(() => {
      if (hasLinks) measureRows();
    });
    React.useEffect(() => {
      const body = bodyRef.current;
      if (!hasLinks || !body || typeof ResizeObserver === "undefined") return;
      const observer = new ResizeObserver(() => measureRows());
      observer.observe(body);
      return () => observer.disconnect();
    }, [hasLinks, measureRows]);
    const canvasStyle = {
      "--range-timeline-columns": Math.max(1, columns.length),
      "--range-timeline-units": units,
    } as React.CSSProperties;
    const header = (
      <>
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
          <div className="ui-range-timeline-label" ref={labelCell}>
            <Text weight="bold">{label}</Text>
            {resize && (
              <div
                role="separator"
                tabIndex={0}
                className="ui-range-timeline-label-resizer"
                aria-orientation="vertical"
                aria-label={t("rangeTimeline.resizeLabel")}
                aria-valuemin={resize.min}
                aria-valuemax={resize.max}
                aria-valuenow={currentLabelWidth ?? undefined}
                onPointerDown={(event) => {
                  if (event.button !== 0) return;
                  event.preventDefault();
                  event.currentTarget.setPointerCapture(event.pointerId);
                  labelDrag.current = {
                    x: event.clientX,
                    width: measuredLabelWidth(),
                    direction: getComputedStyle(event.currentTarget).direction === "rtl" ? -1 : 1,
                  };
                }}
                onPointerMove={(event) => {
                  const current = labelDrag.current;
                  if (current)
                    setLabelWidth(current.width + (event.clientX - current.x) * current.direction);
                }}
                onPointerUp={() => (labelDrag.current = null)}
                onPointerCancel={() => (labelDrag.current = null)}
                onLostPointerCapture={() => (labelDrag.current = null)}
                onKeyDown={(event) => {
                  const step = event.shiftKey ? LABEL_WIDTH_BIG_STEP : LABEL_WIDTH_STEP;
                  const direction =
                    getComputedStyle(event.currentTarget).direction === "rtl" ? -1 : 1;
                  let next: number | null = null;
                  if (event.key === "ArrowRight") next = measuredLabelWidth() + step * direction;
                  else if (event.key === "ArrowLeft")
                    next = measuredLabelWidth() - step * direction;
                  else if (event.key === "Home") next = resize.min;
                  else if (event.key === "End") next = resize.max;
                  if (next === null) return;
                  event.preventDefault();
                  setLabelWidth(next);
                }}
              />
            )}
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
        {busy && <div className="ui-range-timeline-busy" aria-hidden="true" />}
      </>
    );
    // A unit offset as a fraction of the track, clamped to it; a milestone's endpoint is its diamond.
    const fractionOf = (row: RangeTimelineRow, edge: "start" | "end") => {
      if (row.end === null) return null;
      if (row.shape === "milestone") return Math.min(1, Math.max(0, (row.end + 0.5) / units));
      if (edge === "start")
        return row.start === null ? null : Math.min(1, Math.max(0, row.start / units));
      return Math.min(1, Math.max(0, (row.end + 1) / units));
    };
    const visibleIds = new Set(visibleRows.map((row) => row.id));
    const drawnLinks = hasLinks
      ? links!.flatMap((link) => {
          const from = rows.find((row) => row.id === link.from);
          const to = rows.find((row) => row.id === link.to);
          if (!from || !to || !visibleIds.has(from.id) || !visibleIds.has(to.id)) return [];
          const type = link.type ?? "FS";
          const x1 = fractionOf(from, type[0] === "F" ? "end" : "start");
          const x2 = fractionOf(to, type[1] === "F" ? "end" : "start");
          const y1 = rowCentres?.y[from.id];
          const y2 = rowCentres?.y[to.id];
          if (x1 === null || x2 === null || y1 === undefined || y2 === undefined) return [];
          return [{ link, from, to, type, x1, x2, y1, y2 }];
        })
      : [];
    const markerBase = `${reactId.replace(/[^a-zA-Z0-9_-]/g, "")}-link-head`;
    const physical = (fraction: number) => `${(rowCentres?.rtl ? 1 - fraction : fraction) * 100}%`;
    const violatedLinks = drawnLinks.filter((drawn) => drawn.link.violated);
    const linkLayer = hasLinks ? (
      <div className="ui-range-timeline-links">
        <div />
        <div className="ui-range-timeline-links-track">
          <svg className="ui-range-timeline-links-svg" aria-hidden="true" focusable="false">
            <defs>
              {(["normal", "violated"] as const).map((kind) => (
                <marker
                  key={kind}
                  id={`${markerBase}-${kind}`}
                  className="ui-range-timeline-link-head"
                  data-violated={kind === "violated" ? "true" : undefined}
                  markerWidth="8"
                  markerHeight="8"
                  refX="8"
                  refY="4"
                  orient="auto"
                  markerUnits="userSpaceOnUse"
                >
                  <path d="M0,0 L8,4 L0,8 z" />
                </marker>
              ))}
            </defs>
            {drawnLinks.map((drawn) => {
              const middle = (drawn.x1 + drawn.x2) / 2;
              const head = `url(#${markerBase}-${drawn.link.violated ? "violated" : "normal"})`;
              return (
                <g
                  key={drawn.link.id}
                  className="ui-range-timeline-link"
                  data-link-id={drawn.link.id}
                  data-violated={drawn.link.violated ? "true" : undefined}
                >
                  <line x1={physical(drawn.x1)} y1={drawn.y1} x2={physical(middle)} y2={drawn.y1} />
                  <line x1={physical(middle)} y1={drawn.y1} x2={physical(middle)} y2={drawn.y2} />
                  <line
                    x1={physical(middle)}
                    y1={drawn.y2}
                    x2={physical(drawn.x2)}
                    y2={drawn.y2}
                    markerEnd={head}
                  />
                </g>
              );
            })}
          </svg>
          {violatedLinks.map((drawn) => {
            const name = drawn.link.label
              ? t("rangeTimeline.dependencyViolatedWith", { label: drawn.link.label })
              : t("rangeTimeline.dependencyViolated");
            return (
              <Tooltip key={drawn.link.id}>
                <TooltipTrigger asChild>
                  <span
                    className="ui-range-timeline-link-violation ui-focus-ring"
                    tabIndex={0}
                    aria-label={name}
                    style={{
                      insetInlineStart: `${drawn.x2 * 100}%`,
                      insetBlockStart: `${drawn.y2}px`,
                    }}
                  />
                </TooltipTrigger>
                <TooltipContent>{name}</TooltipContent>
              </Tooltip>
            );
          })}
        </div>
        {violatedLinks.length > 0 && (
          <ul className="sr-only">
            {violatedLinks.map((drawn) => (
              <li key={drawn.link.id}>
                {t("rangeTimeline.dependencyViolated")} <span>{drawn.from.label}</span> →{" "}
                <span>{drawn.to.label}</span> ({drawn.type})
              </li>
            ))}
          </ul>
        )}
      </div>
    ) : null;
    const body = (
      <div ref={bodyRef} className="ui-range-timeline-body" role={nested ? "list" : undefined}>
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
          const milestone = row.shape === "milestone";
          // A finish recorded without a start: a tick at `end`, no bar.
          const finishOnly = !milestone && row.start === null && row.end !== null;
          const dated = milestone ? row.end !== null : row.start !== null && row.end !== null;
          const point = milestone || finishOnly;
          const rowEnd = row.end ?? 0;
          const rowStart = point ? rowEnd : (row.start ?? 0);
          const delta = preview?.id === row.id ? preview.delta : 0;
          const start = point
            ? rowEnd + (preview?.edge === "end" ? delta : 0)
            : Math.min(rowEnd, rowStart + (preview?.edge === "start" ? delta : 0));
          const end = point
            ? start
            : Math.max(rowStart, rowEnd + (preview?.edge === "end" ? delta : 0));
          const left = Math.max(0, start),
            right = Math.min(units, end + 1);
          const planStart = row.plan?.start ?? null,
            planEndKnown = row.plan?.end ?? null;
          // A bar's full plan is a ghost bar; a bar's one-sided plan is a due tick; a milestone's
          // plan is a hollow diamond.
          const plan =
            dated && !milestone && planStart !== null && planEndKnown !== null
              ? { start: planStart, end: planEndKnown }
              : null;
          const planEnd = dated ? (milestone ? (planEndKnown ?? planStart) : planEndKnown) : null;
          const planTick =
            dated && !milestone && !plan && (planStart !== null || planEndKnown !== null)
              ? planEndKnown !== null
                ? planEndKnown + 1
                : planStart!
              : null;
          const planLeft = plan ? Math.max(0, plan.start) : 0,
            planRight = plan ? Math.min(units, plan.end + 1) : 0;
          const overrun = planEnd !== null && end > planEnd;
          const early = planEnd !== null && end < planEnd;
          const clampUnit = (value: number) => Math.min(units, Math.max(0, value));
          // A bar's overrun runs from the planned end to its own end; a milestone's runs between
          // the two diamonds' centres.
          const overrunLeft = !overrun
            ? 0
            : milestone
              ? clampUnit(planEnd! + 0.5)
              : Math.max(left, Math.min(units, planEnd! + 1));
          const overrunRight = milestone ? clampUnit(end + 0.5) : right;
          const earlyAt = milestone ? end + 0.5 : right;
          const rowPlanLabel = row.planLabel ?? timelinePlanLabel;
          const overrunText = rowPlanLabel
            ? t("rangeTimeline.overrunVs", { plan: rowPlanLabel, n: String(end - (planEnd ?? 0)) })
            : t("rangeTimeline.overrun");
          const earlyText = rowPlanLabel
            ? t("rangeTimeline.earlyVs", { plan: rowPlanLabel, n: String((planEnd ?? 0) - end) })
            : t("rangeTimeline.early");
          const barStyle = (inset: React.CSSProperties) =>
            ({
              ...inset,
              ...(row.color && {
                "--range-timeline-bar-color": row.color,
                "--range-timeline-bar-ink": inkOn(row.color),
              }),
            }) as React.CSSProperties;
          const allowsEdge = (edge: "start" | "end") =>
            !row.cancelled &&
            !(row.openEnd && edge === "end") &&
            (row.editable === undefined || row.editable === true
              ? true
              : row.editable === false
                ? false
                : row.editable[edge] !== false);
          const grip = (edge: "start" | "end") => (
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
                  direction: getComputedStyle(event.currentTarget).direction === "rtl" ? -1 : 1,
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
                const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
                if (!step) return;
                event.preventDefault();
                const direction =
                  getComputedStyle(event.currentTarget).direction === "rtl" ? -1 : 1;
                const delta = step * direction;
                if (
                  milestone ||
                  (edge === "start" ? rowStart + delta <= rowEnd : rowEnd + delta >= rowStart)
                )
                  onRangeChange?.(row.id, edge, delta);
              }}
            >
              <GripVertical aria-hidden="true" />
            </Button>
          );
          const tooltipHit =
            row.tooltip != null ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    className="ui-range-timeline-bar-hit ui-focus-ring"
                    tabIndex={0}
                    aria-labelledby={`${idBase}-label`}
                  />
                </TooltipTrigger>
                <TooltipContent>{row.tooltip}</TooltipContent>
              </Tooltip>
            ) : null;
          const stateTexts = (
            <>
              {row.overdue && <span className="sr-only">{t("rangeTimeline.overdue")}</span>}
              {row.cancelled && <span className="sr-only">{t("rangeTimeline.cancelled")}</span>}
              {row.openEnd && !milestone && (
                <span className="sr-only">{row.openEndLabel ?? t("rangeTimeline.openEnd")}</span>
              )}
            </>
          );
          const emphasisText = row.emphasis ? (
            <span className="sr-only">
              {t(
                row.emphasis === "critical"
                  ? "rangeTimeline.emphasisCritical"
                  : "rangeTimeline.emphasisWarning",
              )}
            </span>
          ) : null;
          return (
            <div
              className="ui-range-timeline-row"
              key={row.id}
              data-emphasis={row.emphasis}
              ref={
                links && links.length > 0
                  ? (element: HTMLDivElement | null) => {
                      if (element) rowElements.current.set(row.id, element);
                      else rowElements.current.delete(row.id);
                    }
                  : undefined
              }
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
                  {emphasisText}
                </div>
              ) : (
                <div
                  className="ui-range-timeline-label"
                  // Only a tooltip needs the label as a name, so the markup is unchanged otherwise.
                  id={row.tooltip != null ? `${idBase}-label` : undefined}
                >
                  {row.label}
                  {emphasisText}
                </div>
              )}
              <div className="ui-range-timeline-track">
                {today != null && today >= 0 && today < units && (
                  <span
                    aria-hidden="true"
                    className="ui-range-timeline-today"
                    style={{ insetInlineStart: `${((today + 0.5) / units) * 100}%` }}
                  />
                )}
                {!dated && !finishOnly && row.emptyHint !== false && (
                  <span className="ui-range-timeline-outside" data-direction="none">
                    <Text size="xs" tone="muted">
                      {row.emptyHint ?? t("rangeTimeline.noDates")}
                    </Text>
                  </span>
                )}
                {(dated || finishOnly) &&
                  right <= left &&
                  (end < 0 ? (
                    <span className="ui-range-timeline-outside" data-direction="before">
                      <ChevronLeft aria-hidden="true" className="ui-range-timeline-outside-icon" />
                      <Text size="xs" tone="muted">
                        {t("rangeTimeline.outsideBefore")}
                      </Text>
                    </span>
                  ) : (
                    <span className="ui-range-timeline-outside" data-direction="after">
                      <Text size="xs" tone="muted">
                        {t("rangeTimeline.outsideAfter")}
                      </Text>
                      <ChevronRight aria-hidden="true" className="ui-range-timeline-outside-icon" />
                    </span>
                  ))}
                {finishOnly && right > left && (
                  <span
                    className="ui-range-timeline-finish"
                    style={barStyle({ insetInlineStart: `${(right / units) * 100}%` })}
                  >
                    <span className="sr-only">
                      {row.startUnknownLabel ?? t("rangeTimeline.startUnknown")}
                    </span>
                  </span>
                )}
                {plan && planRight > planLeft && (
                  <span
                    aria-hidden="true"
                    className="ui-range-timeline-plan"
                    style={{
                      insetInlineStart: `${(planLeft / units) * 100}%`,
                      inlineSize: `${((planRight - planLeft) / units) * 100}%`,
                    }}
                  />
                )}
                {planTick !== null && planTick >= 0 && planTick <= units && (
                  <span
                    aria-hidden="true"
                    className="ui-range-timeline-plan-tick"
                    style={{ insetInlineStart: `${(planTick / units) * 100}%` }}
                  />
                )}
                {milestone && planEnd !== null && planEnd >= 0 && planEnd < units && (
                  <span
                    aria-hidden="true"
                    className="ui-range-timeline-plan-diamond"
                    style={{ insetInlineStart: `${((planEnd + 0.5) / units) * 100}%` }}
                  />
                )}
                {overrun && overrunRight > overrunLeft && (
                  <span
                    className="ui-range-timeline-overrun"
                    style={{
                      insetInlineStart: `${(overrunLeft / units) * 100}%`,
                      inlineSize: `${((overrunRight - overrunLeft) / units) * 100}%`,
                    }}
                  >
                    <span className="sr-only">{overrunText}</span>
                    {row.varianceLabel !== false && (
                      <span className="ui-range-timeline-variance">
                        {row.varianceLabel ??
                          t("rangeTimeline.lateBy", { n: String(end - planEnd!) })}
                      </span>
                    )}
                  </span>
                )}
                {dated &&
                  planStart === null &&
                  planEndKnown === null &&
                  row.planNote != null &&
                  right > left && (
                    <span
                      className="ui-range-timeline-plan-note"
                      style={{ insetInlineStart: `${(right / units) * 100}%` }}
                    >
                      {row.planNote}
                    </span>
                  )}
                {early && right > left && earlyAt <= units && (
                  <span
                    className="ui-range-timeline-early"
                    style={{ insetInlineStart: `${(earlyAt / units) * 100}%` }}
                  >
                    <span className="sr-only">{earlyText}</span>
                  </span>
                )}
                {/* A sibling, not a child, of the 2px marker: the label needs a box of its own. */}
                {early && right > left && earlyAt <= units && row.earlyLabel !== false && (
                  <span
                    className="ui-range-timeline-early-label"
                    style={{ insetInlineStart: `${(earlyAt / units) * 100}%` }}
                  >
                    {row.earlyLabel ?? t("rangeTimeline.earlyBy", { n: String(planEnd! - end) })}
                  </span>
                )}
                {milestone && dated && right > left && (
                  <span
                    className="ui-range-timeline-milestone"
                    data-muted={row.muted ? "true" : undefined}
                    data-overdue={row.overdue ? "true" : undefined}
                    data-cancelled={row.cancelled ? "true" : undefined}
                    style={barStyle({ insetInlineStart: `${((end + 0.5) / units) * 100}%` })}
                  >
                    {tooltipHit}
                    {stateTexts}
                    {onRangeChange && allowsEdge("end") && grip("end")}
                  </span>
                )}
                {!milestone && dated && right > left && (
                  <div
                    className="ui-range-timeline-bar"
                    data-muted={row.muted ? "true" : undefined}
                    data-overdue={row.overdue ? "true" : undefined}
                    data-cancelled={row.cancelled ? "true" : undefined}
                    data-open-end={row.openEnd ? "true" : undefined}
                    style={barStyle({
                      insetInlineStart: `${(left / units) * 100}%`,
                      inlineSize: `${((right - left) / units) * 100}%`,
                    })}
                  >
                    {tooltipHit}
                    {stateTexts}
                    {onRangeChange &&
                      (right - left) * Math.max(1, columns.length) >= units &&
                      (["start", "end"] as const)
                        .filter((edge) =>
                          edge === "start" ? start >= 0 && start < units : end >= 0 && end < units,
                        )
                        .filter(allowsEdge)
                        .map(grip)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {linkLayer}
      </div>
    );
    const sectionProps = {
      ...props,
      ref,
      className: cn("ui-range-timeline", className),
      "data-bordered": bordered ? "true" : undefined,
      // Only a NON-default step scopes the unit-width knob, so a theme that narrows
      // --range-timeline-unit-width globally still owns the default timeline (gh#730).
      "data-density": density === "default" ? undefined : density,
      "data-busy": busy ? "true" : undefined,
      "aria-busy": busy || undefined,
      "aria-label": label,
      // Only once a width exists does it override the token, so a theme's width stays the default.
      style:
        currentLabelWidth !== undefined
          ? ({
              ...props.style,
              "--range-timeline-label-width": `${currentLabelWidth}px`,
            } as React.CSSProperties)
          : props.style,
    };
    if (!sticky) {
      return (
        <section {...sectionProps} tabIndex={0}>
          <div className="ui-range-timeline-canvas" style={canvasStyle}>
            {header}
            {body}
          </div>
        </section>
      );
    }
    // STICKY (antd Table `sticky`). A sticky header cannot live inside the element that scrolls
    // sideways: that element is its scroll container, so it would stick to a box that never
    // scrolls vertically and ride away with the page. The header therefore sits OUTSIDE the
    // horizontal scroller (the section is `overflow: clip`, which is not a scroll container), sticks
    // to the page's scroller at `offsetHeader`, and follows the body's scrollLeft. The keyboard stop
    // moves with the scrolling: it is the body scroller, since the section no longer scrolls.
    const offsetHeader = typeof sticky === "object" ? (sticky.offsetHeader ?? 0) : 0;
    return (
      <section {...sectionProps} data-sticky="true">
        <div
          ref={stickyHeader}
          className="ui-range-timeline-sticky-header"
          style={{ "--range-timeline-sticky-offset": `${offsetHeader}px` } as React.CSSProperties}
          onWheel={(event) => {
            if (bodyScroller.current && event.deltaX)
              bodyScroller.current.scrollLeft += event.deltaX;
          }}
        >
          <div className="ui-range-timeline-canvas" style={canvasStyle}>
            {header}
          </div>
        </div>
        <div
          ref={bodyScroller}
          className="ui-range-timeline-scroller"
          role="group"
          aria-label={label}
          tabIndex={0}
          onScroll={(event) => {
            if (stickyHeader.current)
              stickyHeader.current.scrollLeft = event.currentTarget.scrollLeft;
          }}
        >
          <div className="ui-range-timeline-canvas" style={canvasStyle}>
            {body}
          </div>
        </div>
      </section>
    );
  },
);
