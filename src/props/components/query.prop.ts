/** Query / async lifecycle helpers — @see docs/COMPONENTS.md#query */
import type * as React from "react";
import type {
  InfiniteData,
  QueryKey,
  UseInfiniteQueryResult,
  UseMutationResult,
  UseQueryResult,
} from "@tanstack/react-query";
import type { LinkProps } from "react-router-dom";
import type { ButtonProp } from "./general.prop";
import type { ClassNameProp, HandlerProp } from "../vocabulary";

/** @see DataState — TanStack Query lifecycle widget (not a visual component). */
export type DataStateProp<T> = {
  query: UseQueryResult<T>;
  skeleton: React.ReactNode;
  /** Rendered when a query is disabled/unstarted (`fetchStatus: "idle"` with no data). */
  prerequisite?: React.ReactNode;
  empty?: React.ReactNode;
  isEmpty?: (data: NonNullable<T>) => boolean;
  errorRenderer?: (error: unknown, retry: () => void) => React.ReactNode;
  /** Force the Retry affordance even for non-transient causes. Retry is offered automatically for
   * transient/network/5xx errors regardless of this flag; default `false` for all other causes. */
  showRetry?: boolean;
  /** Default `() => query.refetch()`. */
  onRetry?: HandlerProp;
  /** Recovery for authentication errors (401 / expired token): renew the session or sign in again.
   * When provided, a 401 renders this action instead of Retry. */
  onAuthError?: HandlerProp;
  children: (data: NonNullable<T>) => React.ReactNode;
};

type MutationLike = Pick<
  UseMutationResult<unknown, unknown, unknown, unknown>,
  "isError" | "error" | "isPending"
>;

/** @see Alert.QueryError — inline mutation error (form submit, simulator run). */
export type AlertMutationFeedbackProp = {
  mutation: MutationLike;
  onRetry?: HandlerProp;
  showRetry?: boolean;
  /** Optional inline pending slot while `mutation.isPending`. */
  pending?: React.ReactNode;
  /**
   * Skip rendering when the error classifies as a validation error (`classifyQueryError` category
   * `"validation"`: 400/422). `true` skips every such error. When omitted, the alert is skipped only
   * inside a `FormRoot`/`Form` whose `errors` bag holds at least one message (the fields show it;
   * `FormErrors` shows unclaimed keys); an empty/absent bag still renders the alert.
   */
  ignoreValidationErrors?: boolean;
  className?: ClassNameProp;
};

type QueryRefetchLike = Pick<UseQueryResult<unknown>, "isFetching" | "refetch">;

/** @see ButtonRefetch — Button recipe wired to `query.refetch()`. */
export type ButtonRefetchProp = Omit<ButtonProp, "onClick" | "disabled"> & {
  query: QueryRefetchLike;
  label?: React.ReactNode;
};

/**
 * TPage MUST BE INFERABLE FROM `data`, WHICH A BARE `Pick` MAKES IMPOSSIBLE (gh#889).
 *
 * This was `Pick<UseInfiniteQueryResult<InfiniteData<TPage>, unknown>, … | "data" | …>`. TPage is
 * then buried under a mapped type over a generic instantiation, and TypeScript cannot run inference
 * backwards through a mapped type — so every consumer of `InfiniteQueryState` got `TPage = unknown`
 * from `query={q}` however well typed `q` was, which collapsed TFlat and handed `unknown` to
 * `flatten`, `isEmpty` and `children`. The catalog example was written with
 * `flatten={flattenItemPages as any}` and three `: any` annotations, and the cast is what kept the
 * defect invisible: a reader could not tell whether the inference was broken or the example sloppy.
 *
 * Spelling `data` as its own intersection member puts `InfiniteData<TPage>` — a plain object type
 * whose `pages` is `TPage[]` — in an inference position. The `Pick` still supplies the other eight
 * fields, so they stay tied to tanstack's real result shape and a signature change there still
 * breaks the build here.
 */
type InfiniteQueryLike<TPage> = Omit<
  Pick<
    UseInfiniteQueryResult<InfiniteData<TPage>, unknown>,
    | "isPending"
    | "isError"
    | "isFetching"
    | "isFetchingNextPage"
    | "error"
    | "data"
    | "hasNextPage"
    | "fetchNextPage"
    | "refetch"
  >,
  "data"
> & { data: InfiniteData<TPage> | undefined };

export type InfiniteQueryHelpers = {
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
};

/** @see InfiniteQueryState — useInfiniteQuery lifecycle + load more. */
/**
 * TFLAT'S DEFAULT IS WHAT MAKES `flatten={flattenItemPages}` TYPE (gh#889).
 *
 * TypeScript infers a type parameter from argument POSITIONS. `TFlat` appears in the RETURN of
 * `flatten`, so when `flatten` is handed a generic function BY REFERENCE the source signature is
 * still uninstantiated and produces no inference candidate at all — `TFlat` fell to `unknown` and
 * `isEmpty` and `children` received `unknown`. That is why the catalog example shipped as
 * `flatten={flattenItemPages as any}` with `(it: any)` and `(items: any)`.
 *
 * A default is used exactly when inference yields no candidate, which is precisely this case: the
 * flattened shape of the library's own `flattenItemPages`. An inline arrow — `flatten={(d) =>
 * d.pages.flatMap((p) => p.rows)}` — is context-sensitive, so it DOES produce a candidate and
 * overrides the default as before. Nothing about a custom flatten changes.
 */
export type InfiniteQueryStateProp<
  TPage,
  TFlat = TPage extends { items: (infer TItem)[] } ? TItem[] : unknown,
> = {
  query: InfiniteQueryLike<TPage>;
  skeleton: React.ReactNode;
  empty?: React.ReactNode;
  flatten: (data: { pages: TPage[] }) => TFlat;
  isEmpty?: (flat: TFlat) => boolean;
  errorRenderer?: (error: unknown, retry: () => void) => React.ReactNode;
  showRetry?: boolean;
  onRetry?: HandlerProp;
  /** Recovery for authentication errors (401 / expired token), shown instead of Retry. */
  onAuthError?: HandlerProp;
  loadingMore?: React.ReactNode;
  /** Custom load-more footer; `false` hides footer entirely. */
  loadMore?: React.ReactNode | false;
  /** Show default load-more button when `hasNextPage`. Default `true`. */
  showLoadMore?: boolean;
  children: (flat: TFlat, helpers: InfiniteQueryHelpers) => React.ReactNode;
};

/** @see PrefetchLink — Link + prefetchQuery on hover/focus. */
export type PrefetchLinkProp = LinkProps & {
  queryKey: QueryKey;
  queryFn: () => Promise<unknown>;
  prefetchOn?: "hover" | "focus" | "both" | "none";
  staleTime?: number;
};
