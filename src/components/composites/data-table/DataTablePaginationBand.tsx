/**
 * @godxjp/ui DataTable — pagination band.
 *
 * Stage 4b of the Table refactor (Plan §3). Owns the numbered /
 * load-more / cursor pagination rendering for the composite. The
 * slim `<Table>` primitive no longer renders pagination.
 */
import { isValidElement, type ReactNode } from "react";
import { Pagination } from "../../navigation/Pagination";
import { Button } from "../../general/Button";
import type {
  TablePagination,
  TablePaginationCursorConfig,
  TablePaginationLoadMoreConfig,
  TablePaginationNumberedConfig,
  TablePaginationVariantConfig,
} from "../../data-display/Table.types";

export function isTablePaginationVariantConfig(
  value: TablePagination | undefined,
): value is TablePaginationVariantConfig {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value) ||
    isValidElement(value)
  )
    return false;
  const candidate = value as { type?: string };
  if (candidate.type === "load-more" || candidate.type === "cursor")
    return true;
  return "total" in value && "current" in value && "pageSize" in value;
}

export function isNumberedPaginationConfig(
  value: TablePaginationVariantConfig,
): value is TablePaginationNumberedConfig {
  return value.type === undefined || value.type === "numbered";
}

interface PaginationRendered {
  variant: TablePaginationVariantConfig["type"];
  node: ReactNode;
}

export function renderTablePagination(
  pagination: TablePagination | undefined,
  t: (key: string, options?: Record<string, unknown>) => string,
): PaginationRendered | null {
  if (pagination === undefined || pagination === false) return null;
  if (!isTablePaginationVariantConfig(pagination))
    return { variant: undefined, node: pagination as ReactNode };
  if (pagination.type === "load-more")
    return { variant: "load-more", node: renderLoadMore(pagination, t) };
  if (pagination.type === "cursor")
    return { variant: "cursor", node: renderCursor(pagination, t) };
  const config = pagination;
  return {
    variant: "numbered",
    node: (
      <Pagination
        variant="embedded"
        showFirstLast
        total={config.total}
        pageSize={config.pageSize}
        value={config.current}
        onValueChange={(page) => config.onChange?.(page, config.pageSize)}
        onPageSizeChange={(size) => config.onChange?.(1, size)}
        pageSizeOptions={config.pageSizeOptions}
        showSizeChanger={config.showSizeChanger}
        showTotal={
          config.showTotal !== undefined ? config.showTotal : true
        }
        hideOnSinglePage={config.hideOnSinglePage}
        disabled={config.disabled}
      />
    ),
  };
}

export function renderLoadMore(
  config: TablePaginationLoadMoreConfig,
  t: (key: string, options?: Record<string, unknown>) => string,
): ReactNode {
  const remaining = Math.max(config.total - config.currentCount, 0);
  const batch =
    config.batchSize !== undefined
      ? Math.min(config.batchSize, remaining)
      : remaining;
  const defaultLabel = t("table.loadMore", { count: batch });
  return (
    <div className="tbl-load-more">
      <Button
        size="small"
        variant="outline"
        disabled={!config.hasMore || config.loadingMore === true}
        onClick={config.onLoadMore}
      >
        {config.loadMoreLabel ?? defaultLabel}
      </Button>
      <div className="tbl-load-more-progress">
        {config.progressLabel?.(config.currentCount, config.total) ??
          t("table.loadMoreProgress", {
            current: config.currentCount,
            total: config.total,
          })}
      </div>
    </div>
  );
}

export function renderCursor(
  config: TablePaginationCursorConfig,
  t: (key: string, options?: Record<string, unknown>) => string,
): ReactNode {
  const inputType = config.inputType ?? "month";
  return (
    <>
      <Button
        size="x-small"
        variant="ghost"
        disabled={config.disabled}
        onClick={config.onJumpToLatest}
      >
        {config.jumpToLatestLabel ?? t("table.jumpToLatest")}
      </Button>
      <Button
        size="x-small"
        variant="outline"
        disabled={config.disabled}
        onClick={config.onPrev}
      >
        {config.prevLabel ?? t("table.previousPeriod")}
      </Button>
      <span className="spacer" />
      <div className="label">{config.label}</div>
      <span className="spacer" />
      <input
        type={inputType}
        value={config.value}
        disabled={config.disabled}
        aria-label={t("table.jumpToPeriod")}
        onChange={(event) => config.onChange(event.target.value)}
      />
      <Button
        size="x-small"
        variant="outline"
        disabled={config.disabled}
        onClick={config.onNext}
      >
        {config.nextLabel ?? t("table.nextPeriod")}
      </Button>
    </>
  );
}

interface DataTablePaginationBandProps {
  config: TablePagination;
  t: (key: string, options?: Record<string, unknown>) => string;
}

export function DataTablePaginationBand(props: DataTablePaginationBandProps) {
  const rendered = renderTablePagination(props.config, props.t);
  if (rendered === null) return null;
  if (rendered.variant === "numbered") {
    // <Pagination variant="embedded"> owns its <nav> wrapper.
    return <>{rendered.node}</>;
  }
  return (
    <div
      className={rendered.variant === "load-more" ? undefined : "tbl-pagination"}
      data-variant={rendered.variant}
    >
      {rendered.node}
    </div>
  );
}
