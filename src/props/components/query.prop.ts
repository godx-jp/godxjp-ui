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
  className?: ClassNameProp;
};

type QueryRefetchLike = Pick<UseQueryResult<unknown>, "isFetching" | "refetch">;

/** @see ButtonRefetch — Button recipe wired to `query.refetch()`. */
export type ButtonRefetchProp = Omit<ButtonProp, "onClick" | "disabled"> & {
  query: QueryRefetchLike;
  label?: React.ReactNode;
};

type InfiniteQueryLike<TPage> = Pick<
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
>;

export type InfiniteQueryHelpers = {
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
};

/** @see InfiniteQueryState — useInfiniteQuery lifecycle + load more. */
export type InfiniteQueryStateProp<TPage, TFlat> = {
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
