export { DataState } from "./data-state";
export type { DataStateProp, DataStateProps } from "./data-state";
export { AlertMutationFeedback } from "./mutation-feedback";
// Central session-expiry handling every query surface consults (gh#1022). It lives in feedback
// because AlertQueryError consults it too; re-exported here, where query consumers look.
export { AuthExpiryProvider } from "../feedback/auth-expiry";
export type { AuthExpiryProviderProp, AuthExpiryProviderProps } from "../feedback/auth-expiry";
export type { AlertMutationFeedbackProp, AlertMutationFeedbackProps } from "./mutation-feedback";
export { ButtonRefetch } from "./query-refetch-button";
export type { ButtonRefetchProp, ButtonRefetchProps } from "./query-refetch-button";
export { InfiniteQueryState, flattenItemPages } from "./infinite-query-state";
export type { InfiniteQueryStateProp, InfiniteQueryStateProps } from "./infinite-query-state";
// `PrefetchLink` imports `react-router-dom` (an optional peer) and lives at
// `@godxjp/ui/react-router` — here it broke every router-less app's build (gh#996).
export { classifyQueryError, isRetryableQueryError } from "../../lib/query-error";
export type { QueryErrorCategory, QueryErrorInfo } from "../../lib/query-error";
