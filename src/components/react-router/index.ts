/*
 * `@godxjp/ui/react-router` — the parts of the kit that import `react-router-dom` (gh#996).
 *
 * `react-router-dom` is an OPTIONAL peer. While `PrefetchLink` was exported from
 * `@godxjp/ui/query`, that barrel imported the router at module top level, so an app without it —
 * every Inertia app — failed its Vite build on ANY query import, `InfiniteQueryState` and
 * `DataState` included. Router-bound code lives behind its own entry, the way Inertia's does
 * behind `@godxjp/ui/inertia`.
 */
export { PrefetchLink } from "./prefetch-link";
export type { PrefetchLinkProp, PrefetchLinkProps } from "./prefetch-link";
