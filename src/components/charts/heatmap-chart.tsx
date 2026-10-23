import * as React from "react";

import type { HeatmapChartProp } from "../../props/components/charts.prop";
import { cn } from "../../lib/utils";
import { EmptyState } from "../data-display/empty-state";
import { Tooltip, TooltipAnchorContext, TooltipContent } from "../feedback/tooltip";
import { useTranslation } from "../../i18n/use-translation";
import { useChartNumberFormat } from "./chart-frame";
import { HEAT_STEPS, buildHeatmapModel, heatmapCellKey } from "./chart-summary";

export type {
  HeatmapChartProp,
  HeatmapChartProp as HeatmapChartProps,
  HeatmapCategory,
  HeatmapDatum,
} from "../../props/components/charts.prop";

/** Hover-open delay, the library tooltip default; a short grace on the way out (WCAG 1.4.13). */
const OPEN_DELAY = 200;
const CLOSE_GRACE = 100;

const RAMP = Array.from({ length: HEAT_STEPS }, (_, index) => index + 1);

/**
 * HeatmapChart — a **dependency-free** rows × columns matrix (weekday × hour revenue, order counts
 * per slot). Cell fill steps through the sequential `--chart-heat-1..5` ramp.
 *
 * - **One structure for sight and for AT.** The matrix IS a native data table (`<th scope>` headers,
 *   one cell per slot) with `role="grid"`, so the screen-reader text alternative is the same element
 *   the eye reads — no second, drifting copy. Each cell carries its formatted value as text.
 * - **Keyboard** — WAI-ARIA APG data grid: one tab stop (roving tabindex), arrows move between
 *   cells (mirrored under RTL), Home/End go to the row's ends, Ctrl+Home/End to the first/last
 *   cell. A focused or hovered cell shows ONE shared tooltip; Escape dismisses it.
 * - **Never colour alone** — an empty cell is outlined (dashed) and reads "no data"; a zero is a
 *   filled step-1 cell that reads "0"; a top-N cell wears a ring and reads "top N".
 * - **Narrow screens** — the matrix never shrinks a cell below its `size` tier; it scrolls inside
 *   its own box with the row header pinned, so the page never scrolls sideways.
 */
export function HeatmapChart({
  onDatumSelect,
  rows,
  columns,
  data,
  label,
  showCaption = true,
  description,
  size = "md",
  numberFormat,
  topN,
  showLegend = true,
  emptyMessage,
  className,
  id,
  ref,
}: HeatmapChartProp) {
  const { t } = useTranslation();
  const fmt = useChartNumberFormat(numberFormat);
  const countFmt = useChartNumberFormat();
  const model = React.useMemo(
    () => buildHeatmapModel(rows, columns, data, topN),
    [rows, columns, data, topN],
  );
  const hasData = rows.length > 0 && columns.length > 0 && model.present > 0;

  const reactId = React.useId();
  const baseId = id ?? reactId;
  const titleId = `${baseId}-title`;
  const descId = `${baseId}-desc`;

  // Roving tabindex — clamped so a shrinking matrix never leaves the tab stop on a missing cell.
  const [active, setActive] = React.useState<[number, number]>([0, 0]);
  const activeRow = Math.min(active[0], Math.max(0, rows.length - 1));
  const activeColumn = Math.min(active[1], Math.max(0, columns.length - 1));

  const scrollRef = React.useRef<HTMLDivElement>(null);
  const cellRefs = React.useRef(new Map<string, HTMLTableCellElement>());
  const anchorRef = React.useRef<HTMLElement | null>(null);
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [tip, setTip] = React.useState<[number, number] | null>(null);

  React.useEffect(() => () => clearTimeout(timer.current), []);

  const showTip = (r: number, c: number, node: HTMLElement, delay: number) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      anchorRef.current = node;
      setTip([r, c]);
    }, delay);
  };
  const hideTip = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setTip(null), CLOSE_GRACE);
  };

  // Escape dismisses a hover tooltip too, wherever focus is (WCAG 1.4.13). Listened for only while open.
  React.useEffect(() => {
    if (!tip) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        clearTimeout(timer.current);
        setTip(null);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [tip]);

  /** Scroll a focused cell out from under the pinned row header (the browser only scrolls it into the scrollport). */
  const reveal = (cell: HTMLElement) => {
    const scroller = scrollRef.current;
    const header = cell.parentElement?.querySelector("th");
    if (!scroller || !header) return;
    const cellBox = cell.getBoundingClientRect();
    const headerBox = header.getBoundingClientRect();
    if (getComputedStyle(scroller).direction === "rtl") {
      if (cellBox.right > headerBox.left) scroller.scrollLeft += cellBox.right - headerBox.left;
    } else if (cellBox.left < headerBox.right) {
      scroller.scrollLeft -= headerBox.right - cellBox.left;
    }
  };

  const moveTo = (r: number, c: number) => {
    const row = Math.max(0, Math.min(rows.length - 1, r));
    const column = Math.max(0, Math.min(columns.length - 1, c));
    setActive([row, column]);
    const cell = cellRefs.current.get(`${row}:${column}`);
    if (cell) {
      cell.focus();
      reveal(cell);
    }
  };

  const selectCell = (r: number, c: number) => {
    const index = data.findIndex(
      (datum) =>
        String(datum.row) === String(rows[r]?.key) &&
        String(datum.column) === String(columns[c]?.key) &&
        typeof datum.value === "number" &&
        Number.isFinite(datum.value),
    );
    if (index >= 0) onDatumSelect?.(data[index]!, { seriesKey: String(columns[c]!.key), index });
  };

  const onGridKeyDown = (event: React.KeyboardEvent<HTMLTableElement>) => {
    const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
    const lastRow = rows.length - 1;
    const lastColumn = columns.length - 1;
    const ctrl = event.ctrlKey || event.metaKey;
    switch (event.key) {
      case "ArrowRight":
        moveTo(activeRow, activeColumn + (rtl ? -1 : 1));
        break;
      case "ArrowLeft":
        moveTo(activeRow, activeColumn + (rtl ? 1 : -1));
        break;
      case "ArrowDown":
        moveTo(activeRow + 1, activeColumn);
        break;
      case "ArrowUp":
        moveTo(activeRow - 1, activeColumn);
        break;
      case "Home":
        moveTo(ctrl ? 0 : activeRow, 0);
        break;
      case "End":
        moveTo(ctrl ? lastRow : activeRow, lastColumn);
        break;
      case "Escape":
        clearTimeout(timer.current);
        setTip(null);
        return;
      default:
        return;
    }
    event.preventDefault();
  };

  const cellText = (r: number, c: number) => {
    const key = heatmapCellKey(rows[r]!.key, columns[c]!.key);
    const value = model.values.get(key);
    const rank = model.ranks.get(key);
    return {
      value: value === undefined ? t("chart.heatmapNoData") : fmt.format(value),
      top: rank === undefined ? undefined : t("chart.heatmapTop", { rank: countFmt.format(rank) }),
    };
  };

  const summary = model.highest
    ? `${t("chart.heatmapSummary", {
        rows: countFmt.format(rows.length),
        columns: countFmt.format(columns.length),
      })} ${t("chart.heatmapHighest", {
        value: fmt.format(model.highest.value),
        row: model.highest.row.label,
        column: model.highest.column.label,
      })}`
    : "";

  const tipText =
    tip && tip[0] < rows.length && tip[1] < columns.length ? cellText(tip[0], tip[1]) : null;
  const span = model.max - model.min;
  const bound = (step: number) => model.min + (span * step) / HEAT_STEPS;

  return (
    <figure
      ref={ref}
      id={id}
      data-slot="chart"
      data-size={size}
      className={cn("ui-chart ui-chart-heatmap", className)}
      aria-labelledby={titleId}
      aria-describedby={descId}
    >
      <figcaption id={titleId} className={showCaption ? "ui-chart-title" : "sr-only"}>
        {label}
      </figcaption>
      {hasData ? (
        <>
          <div ref={scrollRef} className="ui-chart-heatmap-scroll">
            {/* ui-audit-disable-next-line no-raw-table — this IS the chart primitive: the matrix is a native data table (the screen-reader text alternative) with the APG grid role. */}
            <table
              role="grid"
              aria-labelledby={titleId}
              className="ui-chart-heatmap-grid"
              onKeyDown={onGridKeyDown}
            >
              <thead>
                <tr>
                  <td className="ui-chart-heatmap-corner" />
                  {columns.map((column) => (
                    <th
                      key={String(column.key)}
                      scope="col"
                      className="ui-chart-heatmap-column-header"
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, r) => (
                  <tr key={String(row.key)}>
                    <th scope="row" className="ui-chart-heatmap-row-header">
                      {row.label}
                    </th>
                    {columns.map((column, c) => {
                      const key = heatmapCellKey(row.key, column.key);
                      const empty = !model.values.has(key);
                      const text = cellText(r, c);
                      return (
                        <td
                          key={String(column.key)}
                          role="gridcell"
                          ref={(node) => {
                            if (node) cellRefs.current.set(`${r}:${c}`, node);
                            else cellRefs.current.delete(`${r}:${c}`);
                          }}
                          tabIndex={r === activeRow && c === activeColumn ? 0 : -1}
                          className="ui-chart-heatmap-cell ui-focus-ring"
                          data-interactive={onDatumSelect && !empty ? "" : undefined}
                          aria-label={
                            onDatumSelect
                              ? t("chart.heatmapCell", {
                                  row: row.label,
                                  column: column.label,
                                  value: text.value,
                                })
                              : undefined
                          }
                          onKeyDown={
                            onDatumSelect
                              ? (event) => {
                                  if (event.key !== "Enter" && event.key !== " ") return;
                                  event.preventDefault();
                                  event.stopPropagation();
                                  if (!event.repeat && !empty) selectCell(r, c);
                                }
                              : undefined
                          }
                          onClick={onDatumSelect && !empty ? () => selectCell(r, c) : undefined}
                          data-step={empty ? undefined : model.steps.get(key)}
                          data-empty={empty ? "" : undefined}
                          data-emphasized={model.ranks.has(key) ? "" : undefined}
                          // ANY focus opens the tooltip, not only `:focus-visible`: a tap on a
                          // touch screen focuses the cell, and there is no hover to fall back on.
                          onFocus={(event) => {
                            setActive([r, c]);
                            showTip(r, c, event.currentTarget, 0);
                          }}
                          onBlur={hideTip}
                          onPointerEnter={(event) => showTip(r, c, event.currentTarget, OPEN_DELAY)}
                          onPointerLeave={hideTip}
                        >
                          <span className="sr-only">
                            {text.top ? `${text.value}, ${text.top}` : text.value}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {showLegend ? (
            <div className="ui-chart-heatmap-legend">
              <div className="ui-chart-heatmap-legend-scale">
                <span className="ui-chart-heatmap-legend-label" aria-hidden="true">
                  {fmt.format(model.min)}
                </span>
                <ul
                  role="list"
                  className="ui-chart-heatmap-legend-ramp"
                  aria-label={t("chart.heatmapLegend")}
                >
                  {RAMP.map((step) => (
                    <li key={step} className="ui-chart-heatmap-legend-swatch" data-step={step}>
                      <span className="sr-only">
                        {fmt.formatRange(bound(step - 1), bound(step))}
                      </span>
                    </li>
                  ))}
                </ul>
                <span className="ui-chart-heatmap-legend-label" aria-hidden="true">
                  {fmt.format(model.max)}
                </span>
              </div>
              {model.empty > 0 ? (
                <span className="ui-chart-heatmap-legend-item">
                  <span
                    className="ui-chart-heatmap-legend-swatch"
                    data-empty=""
                    aria-hidden="true"
                  />
                  {t("chart.heatmapNoData")}
                </span>
              ) : null}
              {model.ranks.size > 0 ? (
                <span className="ui-chart-heatmap-legend-item">
                  <span
                    className="ui-chart-heatmap-legend-swatch"
                    data-step={HEAT_STEPS}
                    data-emphasized=""
                    aria-hidden="true"
                  />
                  {t("chart.heatmapLegendTop", { count: countFmt.format(model.ranks.size) })}
                </span>
              ) : null}
            </div>
          ) : null}
        </>
      ) : (
        <EmptyState title={emptyMessage ?? t("chart.empty")} />
      )}
      <p id={descId} className="sr-only">
        {description ? <>{description} </> : null}
        {hasData ? summary : null}
      </p>
      <Tooltip
        open={tip !== null}
        onOpenChange={(next) => {
          if (!next) setTip(null);
        }}
      >
        <TooltipAnchorContext.Provider value={anchorRef}>
          {tip && tipText ? (
            <TooltipContent
              key={`${tip[0]}:${tip[1]}`}
              className="ui-chart-heatmap-tooltip"
              onPointerEnter={() => clearTimeout(timer.current)}
              onPointerLeave={hideTip}
            >
              <span className="ui-chart-heatmap-tooltip-title">
                {t("chart.heatmapCell", {
                  row: rows[tip[0]]?.label ?? "",
                  column: columns[tip[1]]?.label ?? "",
                  value: tipText.value,
                })}
              </span>
              {tipText.top ? (
                <span className="ui-chart-heatmap-tooltip-note">{tipText.top}</span>
              ) : null}
            </TooltipContent>
          ) : null}
        </TooltipAnchorContext.Provider>
      </Tooltip>
    </figure>
  );
}
