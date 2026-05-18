import { useCallback, useState } from "react";

export interface UseTablePaginationOptions {
  /** Initial page (1-based). Default 1. */
  defaultPage?: number;
  /** Initial page size. Default 20. */
  defaultPageSize?: number;
  /** Controlled page — when set, hook becomes view-only for page. */
  page?: number;
  /** Controlled page size — when set, hook becomes view-only for size. */
  pageSize?: number;
  /** Fires when either page or pageSize changes. */
  onChange?: (page: number, pageSize: number) => void;
}

export interface UseTablePaginationResult {
  page: number;
  pageSize: number;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  /** Unified handler — matches `<Pagination onChange>` and `<Table pagination.onChange>` shapes. */
  onChange: (page: number, pageSize: number) => void;
  /** Reset page to 1 (keep size). Call after filter/sort/search changes. */
  resetPage: () => void;
  /** Reset both back to defaults. */
  reset: () => void;
}

/**
 * useTablePagination — `page` + `pageSize` slice.
 *
 * Ergonomic accessor for the canonical pagination state any
 * `<DataTable>` (or bare `<Table pagination=…>`) needs. Mirrors the
 * MRT / TanStack pattern: controlled OR uncontrolled, single `onChange`
 * surface that matches `<Pagination>`.
 *
 * @example
 *   const pagination = useTablePagination({ defaultPageSize: 20 });
 *   const rows = useMemo(
 *     () => allRows.slice((pagination.page - 1) * pagination.pageSize, ...),
 *     [allRows, pagination.page, pagination.pageSize],
 *   );
 *   <Table pagination={{ ...pagination, total: allRows.length }} />
 */
export function useTablePagination(
  options: UseTablePaginationOptions = {},
): UseTablePaginationResult {
  const {
    defaultPage = 1,
    defaultPageSize = 20,
    page: controlledPage,
    pageSize: controlledPageSize,
    onChange,
  } = options;

  const [internalPage, setInternalPage] = useState(defaultPage);
  const [internalPageSize, setInternalPageSize] = useState(defaultPageSize);

  const page = controlledPage ?? internalPage;
  const pageSize = controlledPageSize ?? internalPageSize;

  const setPage = useCallback(
    (nextPage: number) => {
      if (controlledPage === undefined) setInternalPage(nextPage);
      onChange?.(nextPage, pageSize);
    },
    [controlledPage, onChange, pageSize],
  );

  const setPageSize = useCallback(
    (nextPageSize: number) => {
      if (controlledPageSize === undefined) setInternalPageSize(nextPageSize);
      // Page-size change conventionally resets to page 1.
      if (controlledPage === undefined) setInternalPage(1);
      onChange?.(1, nextPageSize);
    },
    [controlledPage, controlledPageSize, onChange],
  );

  const handleChange = useCallback(
    (nextPage: number, nextPageSize: number) => {
      if (controlledPage === undefined) setInternalPage(nextPage);
      if (controlledPageSize === undefined) setInternalPageSize(nextPageSize);
      onChange?.(nextPage, nextPageSize);
    },
    [controlledPage, controlledPageSize, onChange],
  );

  const resetPage = useCallback(() => {
    if (controlledPage === undefined) setInternalPage(1);
    onChange?.(1, pageSize);
  }, [controlledPage, onChange, pageSize]);

  const reset = useCallback(() => {
    if (controlledPage === undefined) setInternalPage(defaultPage);
    if (controlledPageSize === undefined) setInternalPageSize(defaultPageSize);
    onChange?.(defaultPage, defaultPageSize);
  }, [
    controlledPage,
    controlledPageSize,
    defaultPage,
    defaultPageSize,
    onChange,
  ]);

  return {
    page,
    pageSize,
    setPage,
    setPageSize,
    onChange: handleChange,
    resetPage,
    reset,
  };
}
