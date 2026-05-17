// Public surface for the shell layer. Per MUST RULE #11, every GoDX
// service composes its chrome from these components — no hand-rolled
// grids, no per-service Sidebar/Topbar implementations.
export { AppShell } from "./AppShell";
export type { AppShellProps } from "./AppShell";
export { Sidebar } from "./Sidebar";
export type { SidebarProps, SidebarItem, SidebarSection } from "./Sidebar";
export { Topbar } from "./Topbar";
export type { TopbarProps } from "./Topbar";
export { TweaksPanel } from "./TweaksPanel";
export type { TweaksPanelProps } from "./TweaksPanel";
export { ProductSwitcher } from "./ProductSwitcher";
export type { ProductSwitcherProps } from "./ProductSwitcher";
export { ProjectSwitcher } from "./ProjectSwitcher";
export type { ProjectSwitcherProps, RecentProject } from "./ProjectSwitcher";
export { CommandPalette } from "./CommandPalette";
export type { CommandPaletteProps, CommandItem } from "./CommandPalette";
export { PageContent } from "./PageContent";
export type { PageContentProps, PageContentPadding } from "./PageContent";

// Shell type contracts — PURE types, no mock data. Consumers pass
// products + projects to the shell primitives as props. Per cardinal
// rule 28 the shell layer is data-agnostic; mock fixtures for the
// storybook live under `src/stories/examples/products.ts`.
export type {
  ForgeProduct,
  ForgeProject,
  ProjectKind,
  ProjectStatus,
} from "./types";
