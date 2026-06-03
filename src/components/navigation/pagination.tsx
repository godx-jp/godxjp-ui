import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

import { useTranslation } from "../../i18n/use-translation";
import { cn } from "../../lib/utils";
import { Button } from "../general/button";
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
} from "../../props/components/navigation.prop";

const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.HTMLAttributes<HTMLUListElement>
>(({ className, ...props }, ref) => {
  return <ul ref={ref} className={cn("ui-pagination-list", className)} role="list" {...props} />;
});
PaginationContent.displayName = "PaginationContent";

const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.LiHTMLAttributes<HTMLLIElement>
>(({ className, ...props }, ref) => <li ref={ref} className={cn("ui-pagination-item", className)} {...props} />);
PaginationItem.displayName = "PaginationItem";

type PaginationLinkProps = React.ComponentPropsWithoutRef<"a"> & {
  isActive?: boolean;
  disabled?: boolean;
};

const PaginationLink = React.forwardRef<HTMLAnchorElement, PaginationLinkProps>(({
  className,
  isActive,
  disabled,
  children,
  onClick,
  ...props
}, ref) => (
  <a
    ref={ref}
    data-active={isActive || undefined}
    aria-current={isActive ? "page" : undefined}
    aria-disabled={disabled || undefined}
    data-state={disabled ? "disabled" : undefined}
    className={cn(
      "ui-pagination-link ui-button--compact-icon ui-pagination-page",
      isActive ? "ui-pagination-link-active" : undefined,
      disabled ? "ui-pagination-link-disabled" : undefined,
      className,
    )}
    role="button"
    onClick={(event) => {
      if (disabled) {
        event.preventDefault();
        return;
      }

      onClick?.(event);
    }}
    {...props}
  >
    {children}
  </a>
));
PaginationLink.displayName = "PaginationLink";

const PaginationEllipsis = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={cn("ui-pagination-ellipsis ui-button--compact-icon", className)}
    aria-hidden="true"
    role="presentation"
    {...props}
  >
    <MoreHorizontal />
  </span>
);
PaginationEllipsis.displayName = "PaginationEllipsis";

const PaginationPrevious = React.forwardRef<
  HTMLAnchorElement,
  PaginationLinkProps
>(({ className, children, ...props }, ref) => (
  <PaginationLink
    ref={ref}
    className={cn("ui-pagination-prev", className)}
    disabled={props.disabled}
    {...props}
  >
    {children}
  </PaginationLink>
));
PaginationPrevious.displayName = "PaginationPrevious";

const PaginationNext = React.forwardRef<
  HTMLAnchorElement,
  PaginationLinkProps
>(({ className, children, ...props }, ref) => (
  <PaginationLink
    ref={ref}
    className={cn("ui-pagination-next", className)}
    disabled={props.disabled}
    {...props}
  >
    {children}
  </PaginationLink>
));
PaginationNext.displayName = "PaginationNext";


export function Pagination({
  current = 1,
  total = 0,
  pageSize = 10,
  pageSizeOptions = [10, 20, 50, 100],
  showSizeChanger,
  showTotal,
  simple,
  disabled,
  className,
  onChange,
}: PaginationProp) {
  const { t } = useTranslation();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safeCurrent = Math.min(Math.max(1, current), totalPages);
  const pages = buildPageRange(safeCurrent, totalPages);

  const go = (page: number, size = pageSize) => {
    if (disabled) return;
    const nextPage = Math.min(Math.max(1, page), Math.max(1, Math.ceil(total / size)));
    onChange?.(nextPage, size);
  };

  const totalLabel =
    typeof showTotal === "function"
      ? showTotal(total, [
          (safeCurrent - 1) * pageSize + 1,
          Math.min(safeCurrent * pageSize, total),
        ])
      : showTotal
        ? t("navigation.pagination.total", { total })
        : null;

  if (simple) {
    return (
      <nav
        aria-label={t("navigation.pagination.ariaLabel")}
        data-simple="true"
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
          <ChevronLeft className="size-4" aria-hidden="true" />
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
          <ChevronRight className="size-4" aria-hidden="true" />
        </Button>
      </nav>
    );
  }

  return (
    <nav aria-label={t("navigation.pagination.ariaLabel")} className={cn("ui-pagination", className)}>
      {totalLabel && <span className="ui-pagination-total">{totalLabel}</span>}

      {showSizeChanger && (
        <Select
          value={String(pageSize)}
          onValueChange={(v: string) => go(1, Number(v))}
          disabled={disabled}
        >
          <SelectTrigger className="ui-pagination-size-trigger" aria-label={t("navigation.pagination.pageSize")}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {t("navigation.pagination.pageSizeOption", { size })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            aria-label={t("navigation.pagination.prev")}
            onClick={(event) => {
              event.preventDefault();
              go(safeCurrent - 1);
            }}
            className="ui-button--compact-icon"
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
                onClick={(event) => {
                  event.preventDefault();
                  if (!disabled) go(page);
                }}
                href="#"
                disabled={disabled}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ),
        )}

        <PaginationItem>
          <PaginationNext
            href="#"
            aria-label={t("navigation.pagination.next")}
            onClick={(event) => {
              event.preventDefault();
              go(safeCurrent + 1);
            }}
            className="ui-button--compact-icon"
            disabled={Boolean(disabled) || safeCurrent >= totalPages}
          >
            <ChevronRight aria-hidden="true" />
          </PaginationNext>
        </PaginationItem>
      </PaginationContent>
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
