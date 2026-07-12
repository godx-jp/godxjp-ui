import * as React from "react";

import { AlertQueryError } from "../feedback/alert";
import { useTranslation } from "../../i18n/use-translation";
import { classifyQueryError } from "../../lib/query-error";
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
  prerequisite = null,
  empty,
  isEmpty = defaultIsEmpty,
  errorRenderer,
  showRetry = false,
  onRetry,
  onAuthError,
  children,
}: DataStateProp<T>) {
  const { t } = useTranslation();
  const retry = React.useCallback(() => {
    if (onRetry) {
      void onRetry();
      return;
    }
    void query.refetch();
  }, [onRetry, query]);

  // Disabled/unstarted (`enabled:false`) reads as pending in TanStack Query but `fetchStatus` is
  // "idle" — no request is in flight. Render the prerequisite/idle slot, NOT an endless skeleton.
  if (query.isPending && query.fetchStatus === "idle") return <>{prerequisite}</>;
  if (query.isPending) return <>{skeleton}</>;

  if (query.isError) {
    if (query.isFetching) return <>{skeleton}</>;
    if (errorRenderer) return <>{errorRenderer(query.error, retry)}</>;
    // Cause-aware recovery: Retry is offered ONLY for causes where retrying could help — transient
    // failures (auto), or an `unknown` cause the consumer explicitly opts into (showRetry/onRetry).
    // auth/forbidden/notFound/validation never get a blind retry (401 routes to session renewal).
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
  if (data === undefined) return <>{skeleton}</>;

  if (empty && (data === null || isEmpty(data))) return <>{empty}</>;

  const content = children(data as NonNullable<T>);
  // Background refetch (existing data present, `isFetching` true) keeps content on screen and
  // announces the busy state politely instead of flashing the skeleton over resolved data.
  if (query.isFetching) {
    return (
      <>
        {content}
        <span role="status" aria-live="polite" className="sr-only">
          {t("query.refreshing")}
        </span>
      </>
    );
  }
  return <>{content}</>;
}
