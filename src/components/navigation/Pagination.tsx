import {
  forwardRef,
  useMemo,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
import { cn } from "../cn";

/**
 * Pagination — page jumper.
 *
 *   <Pagination total={120} pageSize={10} defaultValue={1} onValueChange={…} />
 *
 * Vocabulary (§23.B):
 *   - `size` — "small" | "default" — dimensional scale
 *   - `variant` — "default" | "simple" — visual treatment (simple
 *     shows only ‹ N/M › without per-page buttons)
 *   - `value` / `defaultValue` / `onValueChange` — current page index
 *     (1-based, consistent with display semantics)
 *   - `justify` — "start" | "center" | "end" | "between" (reuses
 *     Flex's `justify`, not coining `align`)
 *   - `disabled` — interaction state
 *   - adjective-booleans: `showTotal`, `showSizeChanger` (planned)
 *
 * `total` + `pageSize` derive the page count; `value` (or
 * `defaultValue`) selects which page is active.
 */

export type PaginationSize = "small" | "default";
export type PaginationVariant = "default" | "simple";
export type PaginationJustify = "start" | "center" | "end" | "between";

export interface PaginationProps
  extends Omit<ComponentProps<"nav">, "onChange" | "defaultValue"> {
  total: number;
  pageSize?: number;
  value?: number;
  defaultValue?: number;
  onValueChange?: (page: number) => void;
  size?: PaginationSize;
  variant?: PaginationVariant;
  justify?: PaginationJustify;
  disabled?: boolean;
  /** Show total-row label. Accepts a render function for full control. */
  showTotal?: boolean | ((total: number, range: [number, number]) => ReactNode);
  /** Number of sibling pages to show around current (default 1). */
  siblings?: number;
}

const ELLIPSIS = "…" as const;

function paginationRange(
  current: number,
  totalPages: number,
  siblings: number,
): Array<number | typeof ELLIPSIS> {
  const total = totalPages;
  const showAll = 5 + siblings * 2;
  if (total <= showAll) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const left = Math.max(current - siblings, 2);
  const right = Math.min(current + siblings, total - 1);
  const out: Array<number | typeof ELLIPSIS> = [1];
  if (left > 2) out.push(ELLIPSIS);
  for (let i = left; i <= right; i++) out.push(i);
  if (right < total - 1) out.push(ELLIPSIS);
  out.push(total);
  return out;
}

const ChevronLeft = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const ChevronRight = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

export const Pagination = forwardRef<HTMLElement, PaginationProps>(
  function Pagination(
    {
      total,
      pageSize = 10,
      value,
      defaultValue = 1,
      onValueChange,
      size = "default",
      variant = "default",
      justify = "start",
      disabled,
      showTotal,
      siblings = 1,
      className,
      ...rest
    },
    ref,
  ) {
    const [internal, setInternal] = useState(defaultValue);
    const current = value ?? internal;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safeCurrent = Math.min(Math.max(1, current), totalPages);

    const range = useMemo(
      () => paginationRange(safeCurrent, totalPages, siblings),
      [safeCurrent, totalPages, siblings],
    );

    const go = (p: number) => {
      const clamped = Math.min(Math.max(1, p), totalPages);
      if (clamped === safeCurrent) return;
      if (value === undefined) setInternal(clamped);
      onValueChange?.(clamped);
    };

    const start = (safeCurrent - 1) * pageSize + 1;
    const end = Math.min(safeCurrent * pageSize, total);

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
              ? showTotal(total, [start, end])
              : `${start}–${end} / ${total}`}
          </span>
        )}
        <button
          type="button"
          className="pagination-item"
          aria-label="Previous page"
          onClick={() => go(safeCurrent - 1)}
          disabled={disabled || safeCurrent === 1}
        >
          <ChevronLeft />
        </button>
        {variant === "simple" ? (
          <span className="pagination-item" aria-current="page">
            {safeCurrent} / {totalPages}
          </span>
        ) : (
          range.map((p, idx) =>
            p === ELLIPSIS ? (
              <span key={`e${idx}`} className="pagination-ellipsis" aria-hidden>
                {ELLIPSIS}
              </span>
            ) : (
              <button
                key={p}
                type="button"
                className="pagination-item"
                data-state={p === safeCurrent ? "selected" : undefined}
                aria-current={p === safeCurrent ? "page" : undefined}
                onClick={() => go(p)}
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
          aria-label="Next page"
          onClick={() => go(safeCurrent + 1)}
          disabled={disabled || safeCurrent === totalPages}
        >
          <ChevronRight />
        </button>
      </nav>
    );
  },
);
