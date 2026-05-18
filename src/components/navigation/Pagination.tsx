import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import {
  forwardRef,
  useMemo,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
import { useTranslation } from "react-i18next";
import { cn } from "../cn";

/**
 * Pagination — page jumper.
 *
 *   <Pagination total={120} pageSize={10} defaultValue={1} onValueChange={…} />
 *
 * Three variants:
 *   - `default` (pill bar) — freestanding pagination chips
 *   - `simple` — only ‹ N/M ›
 *   - `embedded` — table-footer layout (`info` + page-size changer +
 *     numeric pager). Use when embedding inside a `<Table>` footer.
 *
 * Vocabulary (§23.B):
 *   - `value` / `defaultValue` / `onValueChange` — current page (1-based)
 *   - `pageSize` / `defaultPageSize` / `onPageSizeChange` — rows per page
 *   - `size` — "small" | "default" — dimensional scale (default + simple)
 *   - `variant` — visual treatment (above)
 *   - `justify` — "start" | "center" | "end" | "between"
 *   - `disabled` — interaction state
 *   - `showTotal`, `showSizeChanger`, `showFirstLast`, `hideOnSinglePage`
 *     — adjective-boolean toggles
 */

export type PaginationSize = "small" | "default";
export type PaginationVariant = "default" | "simple" | "embedded";
export type PaginationJustify = "start" | "center" | "end" | "between";

export interface PaginationProps
  extends Omit<
    ComponentProps<"nav">,
    "onChange" | "defaultValue" | "value"
  > {
  /** Total row count. */
  total: number;
  /** Rows per page. Controlled or uncontrolled via `defaultPageSize`. */
  pageSize?: number;
  defaultPageSize?: number;
  onPageSizeChange?: (pageSize: number) => void;
  /** Current page (1-based). Controlled or uncontrolled via `defaultValue`. */
  value?: number;
  defaultValue?: number;
  onValueChange?: (page: number) => void;
  size?: PaginationSize;
  variant?: PaginationVariant;
  justify?: PaginationJustify;
  disabled?: boolean;
  /** Selectable page sizes when `showSizeChanger` is true. */
  pageSizeOptions?: number[];
  /** Render the page-size `<select>` (embedded variant only). */
  showSizeChanger?: boolean;
  /** Render first/last page chevron buttons (embedded variant). */
  showFirstLast?: boolean;
  /** Suppress render when total fits in a single page. */
  hideOnSinglePage?: boolean;
  /** Show total-row label. Accepts a render function for full control. */
  showTotal?: boolean | ((total: number, range: [number, number]) => ReactNode);
  /** Sibling pages either side of current (default 1). */
  siblings?: number;
  /** Pages anchored at each end before the ellipsis (default 1). */
  boundary?: number;
  /** Override page-size dropdown label (defaults to i18n `table.pageSize`). */
  pageSizeLabel?: ReactNode;
  /** Override first-page button aria-label. */
  firstPageLabel?: string;
  /** Override previous-page button aria-label. */
  previousPageLabel?: string;
  /** Override next-page button aria-label. */
  nextPageLabel?: string;
  /** Override last-page button aria-label. */
  lastPageLabel?: string;
}

/**
 * Laravel-style page range — first + last anchor pages, a window of
 * `sibling` pages around the current page, and `"gap"` markers
 * (rendered as `…`) where pages are elided. Exported for consumers
 * building custom paginators.
 *
 *   computePageRange(1, 52)   →  [1, 2, 3, "gap", 52]
 *   computePageRange(25, 52)  →  [1, "gap", 24, 25, 26, "gap", 52]
 *   computePageRange(3, 6)    →  [1, 2, 3, 4, 5, 6]
 */
export function computePageRange(
  current: number,
  total: number,
  sibling = 1,
  boundary = 1,
): Array<number | "gap"> {
  if (total <= 1) return [1];
  const windowSize = 2 * sibling + 1 + 2 * boundary + 2;
  if (total <= windowSize) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const startPages = Array.from({ length: boundary }, (_, i) => i + 1);
  const endPages = Array.from(
    { length: boundary },
    (_, i) => total - boundary + 1 + i,
  );
  const siblingStart = Math.max(
    Math.min(current - sibling, total - boundary - 2 * sibling - 1),
    boundary + 2,
  );
  const siblingEnd = Math.min(
    Math.max(current + sibling, boundary + 2 * sibling + 2),
    endPages[0] - 2,
  );
  const items: Array<number | "gap"> = [];
  items.push(...startPages);
  if (siblingStart > boundary + 2) items.push("gap");
  else if (boundary + 1 < endPages[0]) items.push(boundary + 1);
  for (let p = siblingStart; p <= siblingEnd; p++) items.push(p);
  if (siblingEnd < endPages[0] - 2) items.push("gap");
  else if (endPages[0] - 1 > boundary) items.push(endPages[0] - 1);
  items.push(...endPages);
  return items;
}

export const Pagination = forwardRef<HTMLElement, PaginationProps>(
  function Pagination(
    {
      total,
      pageSize,
      defaultPageSize = 10,
      onPageSizeChange,
      value,
      defaultValue = 1,
      onValueChange,
      size = "default",
      variant = "default",
      justify = "start",
      disabled,
      pageSizeOptions = [10, 20, 50, 100],
      showSizeChanger = true,
      showFirstLast = false,
      hideOnSinglePage = false,
      showTotal,
      siblings = 1,
      boundary = 1,
      pageSizeLabel,
      firstPageLabel,
      previousPageLabel,
      nextPageLabel,
      lastPageLabel,
      className,
      ...rest
    },
    ref,
  ) {
    const { t } = useTranslation();
    const [internalPage, setInternalPage] = useState(defaultValue);
    const [internalPageSize, setInternalPageSize] = useState(defaultPageSize);
    const effectivePageSize = pageSize ?? internalPageSize;
    const safePageSize = Math.max(effectivePageSize, 1);
    const safeTotal = Math.max(total, 0);
    const totalPages = Math.max(1, Math.ceil(safeTotal / safePageSize));
    const current = value ?? internalPage;
    const safeCurrent = Math.min(Math.max(1, current), totalPages);

    const range = useMemo(
      () => computePageRange(safeCurrent, totalPages, siblings, boundary),
      [safeCurrent, totalPages, siblings, boundary],
    );

    function goToPage(nextPage: number) {
      if (disabled) return;
      const clamped = Math.min(Math.max(1, nextPage), totalPages);
      if (clamped === safeCurrent) return;
      if (value === undefined) setInternalPage(clamped);
      onValueChange?.(clamped);
    }

    function changePageSize(nextPageSize: number) {
      if (disabled) return;
      if (pageSize === undefined) setInternalPageSize(nextPageSize);
      onPageSizeChange?.(nextPageSize);
      if (value === undefined) setInternalPage(1);
      onValueChange?.(1);
    }

    const start = safeTotal === 0 ? 0 : (safeCurrent - 1) * safePageSize + 1;
    const end = Math.min(safeCurrent * safePageSize, safeTotal);

    if (hideOnSinglePage && safeTotal <= safePageSize) return null;

    if (variant === "embedded") {
      const resolvedPageSizeOptions = Array.from(
        new Set([...pageSizeOptions, safePageSize]),
      ).sort((left, right) => left - right);

      return (
        <nav
          ref={ref}
          role="navigation"
          aria-label="Pagination"
          className={cn("pagination", className)}
          data-variant="embedded"
          data-size={size === "small" ? "small" : undefined}
          {...rest}
        >
          <div className="info">
            {typeof showTotal === "function"
              ? showTotal(safeTotal, [start, end])
              : t("table.paginationTotal", {
                  start,
                  end,
                  total: safeTotal,
                })}
          </div>
          {showSizeChanger && (
            <div className="ps">
              <span>{pageSizeLabel ?? t("table.pageSize")}</span>
              <select
                aria-label={
                  typeof pageSizeLabel === "string"
                    ? pageSizeLabel
                    : t("table.pageSize")
                }
                value={safePageSize}
                disabled={disabled}
                onChange={(event) =>
                  changePageSize(Number(event.target.value))
                }
              >
                {resolvedPageSizeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="spacer" />
          <div className="pgn">
            {showFirstLast && (
              <button
                type="button"
                className={safeCurrent === 1 ? "disabled" : ""}
                disabled={disabled || safeCurrent === 1}
                onClick={() => goToPage(1)}
                aria-label={firstPageLabel ?? t("table.firstPage")}
              >
                <ChevronsLeft aria-hidden focusable="false" />
              </button>
            )}
            <button
              type="button"
              className={safeCurrent === 1 ? "disabled" : ""}
              disabled={disabled || safeCurrent === 1}
              onClick={() => goToPage(safeCurrent - 1)}
              aria-label={previousPageLabel ?? t("table.previousPage")}
            >
              <ChevronLeft aria-hidden focusable="false" />
            </button>
            {range.map((item, index) =>
              item === "gap" ? (
                <span key={`gap-${index}`} className="gap" aria-hidden>
                  …
                </span>
              ) : (
                <button
                  type="button"
                  key={item}
                  className={item === safeCurrent ? "on" : ""}
                  disabled={disabled}
                  onClick={() => goToPage(item)}
                  aria-current={item === safeCurrent ? "page" : undefined}
                >
                  {item}
                </button>
              ),
            )}
            <button
              type="button"
              className={safeCurrent === totalPages ? "disabled" : ""}
              disabled={disabled || safeCurrent === totalPages}
              onClick={() => goToPage(safeCurrent + 1)}
              aria-label={nextPageLabel ?? t("table.nextPage")}
            >
              <ChevronRight aria-hidden focusable="false" />
            </button>
            {showFirstLast && (
              <button
                type="button"
                className={safeCurrent === totalPages ? "disabled" : ""}
                disabled={disabled || safeCurrent === totalPages}
                onClick={() => goToPage(totalPages)}
                aria-label={lastPageLabel ?? t("table.lastPage")}
              >
                <ChevronsRight aria-hidden focusable="false" />
              </button>
            )}
          </div>
        </nav>
      );
    }

    return (
      <nav
        ref={ref}
        role="navigation"
        aria-label="Pagination"
        className={cn("pagination", className)}
        data-size={size === "small" ? "small" : undefined}
        data-justify={justify === "start" ? undefined : justify}
        {...rest}
      >
        {showTotal && (
          <span className="pagination-total">
            {typeof showTotal === "function"
              ? showTotal(safeTotal, [start, end])
              : `${start}–${end} / ${safeTotal}`}
          </span>
        )}
        <button
          type="button"
          className="pagination-item"
          aria-label={previousPageLabel ?? "Previous page"}
          onClick={() => goToPage(safeCurrent - 1)}
          disabled={disabled || safeCurrent === 1}
        >
          <ChevronLeft aria-hidden focusable="false" />
        </button>
        {variant === "simple" ? (
          <span className="pagination-item" aria-current="page">
            {safeCurrent} / {totalPages}
          </span>
        ) : (
          range.map((p, idx) =>
            p === "gap" ? (
              <span key={`e${idx}`} className="pagination-ellipsis" aria-hidden>
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                className="pagination-item"
                data-state={p === safeCurrent ? "selected" : undefined}
                aria-current={p === safeCurrent ? "page" : undefined}
                onClick={() => goToPage(p)}
                disabled={disabled}
              >
                {p}
              </button>
            ),
          )
        )}
        <button
          type="button"
          className="pagination-item"
          aria-label={nextPageLabel ?? "Next page"}
          onClick={() => goToPage(safeCurrent + 1)}
          disabled={disabled || safeCurrent === totalPages}
        >
          <ChevronRight aria-hidden focusable="false" />
        </button>
      </nav>
    );
  },
);
