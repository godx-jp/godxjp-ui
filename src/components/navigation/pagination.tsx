import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

import { useTranslation } from "../../i18n/use-translation";
import { useIsMobile, useScrollableRegionTabIndex } from "../../lib/hooks";
import { cn } from "../../lib/utils";
import { Button } from "../general/button";
import { Form } from "../data-entry/form";
import { FormField } from "../data-entry/form-field";
import { Input } from "../data-entry/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../data-entry/select";
import { buildPageRange } from "./pagination-utils";
import type { PaginationProp } from "../../props/components/navigation.prop";

export type {
  PaginationProp,
  PaginationProp as PaginationProps,
  PaginationSizeProp,
  PaginationAlignProp,
} from "../../props/components/navigation.prop";

const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.HTMLAttributes<HTMLUListElement>
>(({ className, ...props }, ref) => {
  // The strip scrolls horizontally instead of wrapping. Its page buttons normally supply the
  // keyboard route to that overflow — but a fully disabled pagination has none, so the hook gives
  // the list its own tab stop (WCAG 2.1.1).
  const [scrollRegion, setScrollRegion] = React.useState<HTMLUListElement | null>(null);
  const setListElement = React.useCallback(
    (node: HTMLUListElement | null) => {
      setScrollRegion(node);
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );
  useScrollableRegionTabIndex(scrollRegion);

  return (
    <ul
      ref={setListElement}
      className={cn("ui-pagination-list", className)}
      role="list"
      {...props}
    />
  );
});
PaginationContent.displayName = "PaginationContent";

const PaginationItem = React.forwardRef<HTMLLIElement, React.LiHTMLAttributes<HTMLLIElement>>(
  ({ className, ...props }, ref) => (
    <li ref={ref} className={cn("ui-pagination-item", className)} {...props} />
  ),
);
PaginationItem.displayName = "PaginationItem";

// `href` is accepted for API back-compat but ignored — page controls are real <button>s so that
// Space activates them and disabled items leave the tab order (instead of `<a aria-disabled>`).
type PaginationLinkProps = Omit<React.ComponentPropsWithoutRef<"button">, "type"> & {
  isActive?: boolean;
  disabled?: boolean;
  href?: string;
};

const PaginationLink = React.forwardRef<HTMLButtonElement, PaginationLinkProps>(
  ({ className, isActive, disabled, children, onClick, href: _href, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      data-active={isActive || undefined}
      aria-current={isActive ? "page" : undefined}
      disabled={disabled || undefined}
      data-state={disabled ? "disabled" : undefined}
      className={cn(
        "ui-pagination-link ui-pagination-page",
        isActive ? "ui-pagination-link-active" : undefined,
        disabled ? "ui-pagination-link-disabled" : undefined,
        className,
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  ),
);
PaginationLink.displayName = "PaginationLink";

const PaginationEllipsis = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={cn("ui-pagination-ellipsis", className)}
    aria-hidden="true"
    role="presentation"
    {...props}
  >
    <MoreHorizontal />
  </span>
);
PaginationEllipsis.displayName = "PaginationEllipsis";

const PaginationPrevious = React.forwardRef<HTMLButtonElement, PaginationLinkProps>(
  ({ className, children, ...props }, ref) => (
    <PaginationLink
      ref={ref}
      className={cn("ui-pagination-prev", className)}
      disabled={props.disabled}
      {...props}
    >
      {children}
    </PaginationLink>
  ),
);
PaginationPrevious.displayName = "PaginationPrevious";

const PaginationNext = React.forwardRef<HTMLButtonElement, PaginationLinkProps>(
  ({ className, children, ...props }, ref) => (
    <PaginationLink
      ref={ref}
      className={cn("ui-pagination-next", className)}
      disabled={props.disabled}
      {...props}
    >
      {children}
    </PaginationLink>
  ),
);
PaginationNext.displayName = "PaginationNext";

export function Pagination({
  ariaLabel,
  value = 1,
  total = 0,
  pageSize = 10,
  pageSizeOptions = [10, 20, 50, 100],
  showSizeChanger,
  showTotal,
  hideOnSinglePage = true,
  simple,
  showQuickJumper,
  size = "md",
  align = "end",
  responsive = true,
  disabled,
  className,
  onValueChange,
}: PaginationProp) {
  const { t } = useTranslation();
  const jumperId = React.useId();
  const [jumperDraft, setJumperDraft] = React.useState("");
  // Ant Design's `responsive` collapses the bar on a phone rather than leaving a number strip
  // wider than the viewport to scroll. The breakpoint is the library's ONE mobile query
  // (`useIsMobile`, max-width 767px) — never a second literal that could drift from it.
  const isNarrowViewport = useIsMobile();
  const navLabel = ariaLabel ?? t("navigation.pagination.ariaLabel");
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safeCurrent = Math.min(Math.max(1, value), totalPages);
  const pages = buildPageRange(safeCurrent, totalPages);
  const compact = Boolean(simple) || (responsive && isNarrowViewport);

  const go = (page: number, size = pageSize) => {
    if (disabled) return;
    const nextPage = Math.min(Math.max(1, page), Math.max(1, Math.ceil(total / size)));
    onValueChange?.(nextPage, size);
  };

  /** Ant Design's quick jumper: a free-typed page number, clamped into `[1, pageCount]` on commit. */
  const commitJump = () => {
    const parsed = Number.parseInt(jumperDraft, 10);
    setJumperDraft("");
    if (!Number.isFinite(parsed)) return;
    go(parsed);
  };

  const totalLabel =
    typeof showTotal === "function"
      ? showTotal(total, [
          total === 0 ? 0 : (safeCurrent - 1) * pageSize + 1,
          Math.min(safeCurrent * pageSize, total),
        ])
      : showTotal
        ? t("navigation.pagination.total", { total })
        : null;

  // Pagination is navigation between multiple result pages. `total === 0` is ALWAYS hidden — there
  // is no data to navigate (and a custom total label would produce the invalid range `[1, 0]`).
  // `hideOnSinglePage={false}` when it still wants the bar (e.g. to keep `showTotal` visible).
  if (total <= 0) return null;
  if (hideOnSinglePage && totalPages <= 1) return null;

  const goButton =
    showQuickJumper && typeof showQuickJumper === "object" ? showQuickJumper.goButton : undefined;
  const quickJumper = showQuickJumper ? (
    <div className="ui-pagination-jumper" data-slot="pagination-jumper">
      <Form asChild layout="horizontal" collapseBelow={false}>
        <div>
          <FormField
            id={jumperId}
            label={t("navigation.pagination.jumpTo")}
            layout="horizontal"
            labelWidth="auto"
            controlWidth="auto"
          >
            <Input
              id={jumperId}
              size={size}
              type="number"
              inputMode="numeric"
              min={1}
              max={totalPages}
              disabled={disabled}
              className="ui-pagination-jumper-input w-[var(--pagination-jumper-width)]"
              value={jumperDraft}
              onChange={(event) => setJumperDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key !== "Enter") return;
                event.preventDefault();
                commitJump();
              }}
            />
          </FormField>
        </div>
      </Form>
      {goButton ? (
        <Button type="button" variant="outline" size="sm" disabled={disabled} onClick={commitJump}>
          {goButton}
        </Button>
      ) : null}
    </div>
  ) : null;

  if (compact) {
    return (
      <nav
        aria-label={navLabel}
        data-simple="true"
        data-size={size}
        data-align={align}
        className={cn("ui-pagination", className)}
      >
        {totalLabel && <span className="ui-pagination-total">{totalLabel}</span>}
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={Boolean(disabled) || safeCurrent <= 1}
          aria-label={t("navigation.pagination.prev")}
          onClick={() => go(safeCurrent - 1)}
        >
          {}
          <ChevronLeft aria-hidden="true" />
        </Button>
        <span className="ui-pagination-count">
          {safeCurrent} / {totalPages}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={Boolean(disabled) || safeCurrent >= totalPages}
          aria-label={t("navigation.pagination.next")}
          onClick={() => go(safeCurrent + 1)}
        >
          <ChevronRight aria-hidden="true" />
        </Button>
        {quickJumper}
      </nav>
    );
  }

  return (
    <nav
      aria-label={navLabel}
      data-size={size}
      data-align={align}
      className={cn("ui-pagination", className)}
    >
      {totalLabel && <span className="ui-pagination-total">{totalLabel}</span>}

      {showSizeChanger && (
        <Select
          value={String(pageSize)}
          onValueChange={(v: string) => go(1, Number(v))}
          disabled={disabled}
        >
          <SelectTrigger
            // ラベル (ja「100 件/ページ」) を切り詰める。token は下限のみ。
            className="ui-pagination-size-trigger w-max min-w-[var(--pagination-size-width)]"
            aria-label={t("navigation.pagination.pageSize")}
          >
            {}
            <SelectValue>
              {t("navigation.pagination.pageSizeTrigger", { size: pageSize })}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map((option) => (
              <SelectItem key={option} value={String(option)}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            aria-label={t("navigation.pagination.prev")}
            onClick={() => go(safeCurrent - 1)}
            disabled={Boolean(disabled) || safeCurrent <= 1}
          >
            <ChevronLeft aria-hidden="true" />
          </PaginationPrevious>
        </PaginationItem>

        {pages.map((page, index) =>
          page === "ellipsis" ? (
            <PaginationItem key={`e-${index}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={page}>
              <PaginationLink
                isActive={page === safeCurrent}
                aria-label={t("navigation.pagination.page", { page })}
                onClick={() => {
                  if (!disabled) go(page);
                }}
                disabled={disabled}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ),
        )}

        <PaginationItem>
          <PaginationNext
            aria-label={t("navigation.pagination.next")}
            onClick={() => go(safeCurrent + 1)}
            disabled={Boolean(disabled) || safeCurrent >= totalPages}
          >
            <ChevronRight aria-hidden="true" />
          </PaginationNext>
        </PaginationItem>
      </PaginationContent>

      {quickJumper}
    </nav>
  );
}

export {
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationEllipsis,
  PaginationPrevious,
  PaginationNext,
};
