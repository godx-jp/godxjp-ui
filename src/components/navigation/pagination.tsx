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
    <nav
      aria-label={t("navigation.pagination.ariaLabel")}
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
            className="ui-pagination-size-trigger"
            aria-label={t("navigation.pagination.pageSize")}
          >
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

      <Button
        type="button"
        variant="outline"
        size="icon"
        className="ui-button--compact-icon"
        disabled={Boolean(disabled) || safeCurrent <= 1}
        aria-label={t("navigation.pagination.prev")}
        onClick={() => go(safeCurrent - 1)}
      >
        <ChevronLeft aria-hidden="true" />
      </Button>

      <ul className="ui-pagination-list">
        {pages.map((page, index) =>
          page === "ellipsis" ? (
            <li key={`e-${index}`} className="ui-pagination-ellipsis ui-button--compact-icon">
              <MoreHorizontal aria-hidden="true" />
            </li>
          ) : (
            <li key={page}>
              <Button
                type="button"
                variant={page === safeCurrent ? "default" : "outline"}
                size="icon"
                className="ui-button--compact-icon ui-pagination-page"
                disabled={disabled}
                aria-label={t("navigation.pagination.page", { page })}
                aria-current={page === safeCurrent ? "page" : undefined}
                onClick={() => go(page)}
              >
                {page}
              </Button>
            </li>
          ),
        )}
      </ul>

      <Button
        type="button"
        variant="outline"
        size="icon"
        className="ui-button--compact-icon"
        disabled={Boolean(disabled) || safeCurrent >= totalPages}
        aria-label={t("navigation.pagination.next")}
        onClick={() => go(safeCurrent + 1)}
      >
        <ChevronRight aria-hidden="true" />
      </Button>
    </nav>
  );
}
