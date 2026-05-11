import type { ReactNode } from "react";

// AppShell — the canonical chrome layout.
//
// Grid: sidebar (collapsible) + topbar (header) + main scroll area.
// All visual rules come from `tokens-ext.css` (`.app-root`,
// `.app-sidebar`, `.app-topbar`, `.app-main`) so dark mode, density,
// tenant accent + sidebar-collapsed all swap automatically when the
// `<html data-*>` attributes change (driven by useTweaks).
//
// Per MUST RULE #11, every GoDX service shell renders <AppShell>;
// services do not hand-roll the grid.
export interface AppShellProps {
  sidebar: ReactNode;
  topbar: ReactNode;
  children: ReactNode;
  /**
   * Controls the visual collapsed state. The hook + Tweaks panel
   * mirror this onto `<html data-collapsed>` via useTweaks; pass the
   * same value here so the grid columns shrink in lockstep.
   */
  sidebarCollapsed?: boolean;
}

export function AppShell({ sidebar, topbar, children, sidebarCollapsed = false }: AppShellProps) {
  return (
    <div className="app-root" data-collapsed={sidebarCollapsed}>
      <aside className="app-sidebar">{sidebar}</aside>
      <header className="app-topbar">{topbar}</header>
      <main className="app-main">{children}</main>
    </div>
  );
}
