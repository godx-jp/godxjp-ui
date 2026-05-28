import * as React from "react";

import { AlertQueryError } from "../feedback/alert";
import type { DataStateProp } from "../../props/components/query.prop";

export type {
  DataStateProp,
  DataStateProp as DataStateProps,
} from "../../props/components/query.prop";

function defaultIsEmpty(data: unknown): boolean {
  if (!data) return true;
  if (Array.isArray(data)) return data.length === 0;
  if (typeof data === "object" && data !== null) {
    const obj = data as { items?: unknown[]; length?: number };
    if (Array.isArray(obj.items)) return obj.items.length === 0;
    if (typeof obj.length === "number") return obj.length === 0;
  }
  return false;
}

/**
 * Query lifecycle widget — orchestrates skeleton / error / empty / success for one `useQuery` block.
 * Not a visual component; prefer `@godxjp/ui/query`. Apps may also import via `@godxjp/ui/admin`.
 */
export function DataState<T>({
  query,
  skeleton,
  empty,
  isEmpty = defaultIsEmpty,
  errorRenderer,
  showRetry = true,
  onRetry,
  children,
}: DataStateProp<T>) {
  const retry = React.useCallback(() => {
    if (onRetry) {
      void onRetry();
      return;
    }
    void query.refetch();
  }, [onRetry, query]);

  if (query.isPending) return <>{skeleton}</>;

  if (query.isError) {
    if (query.isFetching) return <>{skeleton}</>;
    if (errorRenderer) return <>{errorRenderer(query.error, retry)}</>;
    return <AlertQueryError error={query.error} onRetry={showRetry ? retry : undefined} />;
  }

  const data = query.data;
  if (data === undefined) return <>{skeleton}</>;

  if (empty && (data === null || isEmpty(data))) return <>{empty}</>;

  return <>{children(data as NonNullable<T>)}</>;
}
