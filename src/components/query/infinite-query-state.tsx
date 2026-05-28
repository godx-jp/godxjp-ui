import * as React from "react";

import { AlertQueryError } from "../feedback/alert";
import { Button } from "../general/button";
import { useTranslation } from "../../i18n/use-translation";
import type { InfiniteQueryStateProp } from "../../props/components/query.prop";

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
  showRetry = true,
  onRetry,
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
    return <AlertQueryError error={query.error} onRetry={showRetry ? retry : undefined} />;
  }

  const data = query.data;
  if (!data) return <>{skeleton}</>;

  const flat = flatten(data);
  if (empty && isEmpty(flat)) return <>{empty}</>;

  const footer =
    showLoadMore && query.hasNextPage
      ? (loadMore ?? (
          <div className="flex justify-center pt-4">
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
          <p className="text-muted-foreground pt-2 text-center text-xs">{t("common.working")}</p>
        ))}
      {footer}
    </>
  );
}
