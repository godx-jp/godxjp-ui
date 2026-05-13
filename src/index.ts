// @godxjp/ui — public API barrel.
//
// Flat top-level export re-surfaces primitives (Badge, Button, Card,
// Input, Label, Tabs, Avatar, Separator, cn) + every public hook /
// i18n helper / data type. Sub-path imports stay available for callers
// that want a smaller payload:
//
//   import "@godxjp/ui/tokens"                              // CSS — required ONCE at app entry
//   import { Badge, Button, Card } from "@godxjp/ui"
//   import { AppShell, Sidebar, Topbar } from "@godxjp/ui/components/shell"
//   import { DashboardScreen } from "@godxjp/ui/components/screens"
//   import { useTweaks } from "@godxjp/ui/hooks"
//   import { initI18n } from "@godxjp/ui/i18n"
//   import { products } from "@godxjp/ui/data"
//
// Drop-in rule: a new service needs only the tokens import + whatever
// React surface it consumes. No theming step, no per-service tokens.
// See BRAND.md for the brand contract.

export * from "./components/primitives"
export * from "./hooks"
export * from "./data"
export * from "./i18n"
