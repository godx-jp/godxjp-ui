// Shell type contracts — pure type definitions consumed by AppShell,
// Sidebar, Topbar, ProductSwitcher, ProjectSwitcher, TweaksPanel,
// CommandPalette. NO mock data here — shell is data-agnostic per
// cardinal rule 28 §A. Mock data fixtures for stories / examples
// live at `src/stories/examples/products.ts`.

export type ProjectKind =
  | "service"
  | "web"
  | "desktop"
  | "workstation"
  | "mobile"
  | "library"
  | "infra";

export type ProjectStatus = "active" | "review" | "planning" | "archived";

export interface ForgeProject {
  id: string;
  name: string;
  stack: string;
  kind: ProjectKind;
  devs: number;
  status: ProjectStatus;
  branch: string;
  lastCommit: string;
  openIssues: number;
  prs: number;
  sandbox: boolean;
}

export interface ForgeProduct {
  id: string;
  name: string;
  /** Tenant slug — matches `[data-tenant]` attribute. Operator-defined; not a closed enum. */
  tenant: string;
  role: string;
  desc: string;
  /** Brand color in OKLCH — used as the sidebar logo mark + accent. */
  color: string;
  owner: string;
  devs: number;
  projects: ForgeProject[];
}
