import * as React from "react";

import { AlertQueryError } from "../feedback/alert";
import { Button } from "../general/button";
import { useTranslation } from "../../i18n/use-translation";
import type { InfiniteQueryStateProp } from "../../props/components/query.prop";
import { classifyQueryError } from "../../lib/query-error";

export type {
  InfiniteQueryStateProp,
  InfiniteQueryStateProp as InfiniteQueryStateProps,
} from "../../props/components/query.prop";

/** Flatten `{ pages: [{ items }] }` — default GODX paginated API shape. */
export function flattenItemPages<TItem, TPage extends { items: TItem[] }>(
  data: { pages: TPage[] } | undefined,
): TItem[] {
  if (!data) return [];
  return data.pages.flatMap((page) => page.items);
}

function defaultIsEmptyFlat(flat: unknown): boolean {
  if (Array.isArray(flat)) return flat.length === 0;
  return !flat;
}

/**
 * `useInfiniteQuery` lifecycle widget — flatten pages, load-more footer.
 * Cursor / activity feeds where user accumulates pages (vs DataTable cursor buttons).
 */
export function InfiniteQueryState<TPage, TFlat>({
  query,
  skeleton,
  empty,
  flatten,
  isEmpty = defaultIsEmptyFlat,
  errorRenderer,
  showRetry = false,
  onRetry,
  onAuthError,
  loadingMore,
  loadMore,
  showLoadMore = true,
  children,
}: InfiniteQueryStateProp<TPage, TFlat>) {
  const { t } = useTranslation();

  const retry = React.useCallback(() => {
    if (onRetry) {
      void onRetry();
      return;
    }
    void query.refetch();
  }, [onRetry, query]);

  if (query.isPending) return <>{skeleton}</>;

  if (query.isError) {
    if (query.isFetching && !query.isFetchingNextPage) return <>{skeleton}</>;
    if (errorRenderer) return <>{errorRenderer(query.error, retry)}</>;
    const info = classifyQueryError(query.error);
    const canRetry =
      (info.category === "transient" || info.category === "unknown") &&
      (info.retryable || showRetry || Boolean(onRetry));
    return (
      <AlertQueryError
        error={query.error}
        category={info.category}
        onRetry={canRetry ? retry : undefined}
        onAuthAction={info.category === "auth" ? onAuthError : undefined}
      />
    );
  }

  const data = query.data;
  if (!data) return <>{skeleton}</>;

  const flat = flatten(data);
  if (empty && isEmpty(flat)) return <>{empty}</>;

  const footer =
    showLoadMore && query.hasNextPage
      ? (loadMore ?? (
          <div className="flex justify-center pt-[var(--query-load-more-space-block-start)]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={query.isFetchingNextPage}
              onClick={() => void query.fetchNextPage()}
            >
              {query.isFetchingNextPage ? t("common.working") : t("query.loadMore")}
            </Button>
          </div>
        ))
      : null;

  return (
    <>
      {children(flat, {
        fetchNextPage: () => void query.fetchNextPage(),
        hasNextPage: !!query.hasNextPage,
        isFetchingNextPage: query.isFetchingNextPage,
      })}
      {query.isFetchingNextPage &&
        (loadingMore ?? (
          <p className="text-muted-foreground pt-[var(--query-loading-more-space-block-start)] text-center text-xs">
            {t("common.working")}
          </p>
        ))}
      {footer}
    </>
  );
}
