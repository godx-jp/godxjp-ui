// @godxjp/ui — public API barrel.
//
// Consumers import from this entry point or one of the sub-paths:
//   - `@godxjp/ui/tokens.css`  + `@godxjp/ui/tokens-ext.css` (CSS imports)
//   - `@godxjp/ui/i18n`       (translation infrastructure)
//   - `@godxjp/ui/hooks`      (useTweaks + others)
//   - `@godxjp/ui/data`       (mock data + types)
//   - `@godxjp/ui/primitives` (shadcn-styled atoms)
//   - `@godxjp/ui/components/shell` (AppShell, Sidebar, Topbar, …)
export * from "./hooks";
export * from "./data";
export * from "./i18n";
