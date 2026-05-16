import type { ReactNode } from "react";

// AppShell — canonical chrome layout for every GoDX service.
//
// Slot-based composition (inspired by Ant Design ProLayout): each visual
// region is a slot; services choose what to render. Tokens drive density,
// dark mode, tenant accent, and sidebar-collapsed state via the
// `<html data-*>` attributes (set by `useTweaks`).
//
// Grid: sidebar (collapsible) + topbar (header) + main scroll area +
// optional footer band under main. Per MUST RULE #11, every service
// renders <AppShell>; no service hand-rolls the grid.

export interface AppShellProps {
  /** Sidebar content — usually `<Sidebar … />` from this package. */
  sidebar: ReactNode;
  /** Main content — page or `<Outlet />`. */
  children: ReactNode;

  /**
   * Topbar slot. Provide EITHER `topbar` for a single composed header
   * (e.g. `<Topbar … />` from this package) OR `topbarLeft` +
   * `topbarRight` to lay out two slot groups within the canonical
   * header rail. Mixing `topbar` with the split slots is allowed —
   * the single `topbar` wins.
   */
  topbar?: ReactNode;
  topbarLeft?: ReactNode;
  topbarRight?: ReactNode;

  /** Optional logo / brand mark — rendered at the top-left of the topbar. */
  logo?: ReactNode;

  /** Optional breadcrumb rail — sits just above main content. */
  breadcrumb?: ReactNode;

  /** Optional footer band under main content. */
  footer?: ReactNode;

  /** Sidebar collapsed state — mirror onto `<html data-collapsed>` via useTweaks. */
  sidebarCollapsed?: boolean;
}

export function AppShell({
  sidebar,
  topbar,
  topbarLeft,
  topbarRight,
  logo,
  breadcrumb,
  footer,
  children,
  sidebarCollapsed = false,
}: AppShellProps) {
  const resolvedTopbar =
    topbar !== undefined ? (
      topbar
    ) : (
      <div className="app-topbar-rail">
        {logo !== undefined && <div className="app-topbar-logo">{logo}</div>}
        {topbarLeft !== undefined && (
          <div className="app-topbar-left">{topbarLeft}</div>
        )}
        <div className="app-topbar-spacer" />
        {topbarRight !== undefined && (
          <div className="app-topbar-right">{topbarRight}</div>
        )}
      </div>
    );

  return (
    <div className="app-root" data-collapsed={sidebarCollapsed}>
      <aside className="app-sidebar">{sidebar}</aside>
      <header className="app-topbar">{resolvedTopbar}</header>
      <main className="app-main">
        {breadcrumb !== undefined && (
          <div className="app-breadcrumb">{breadcrumb}</div>
        )}
        {children}
      </main>
      {footer !== undefined && <footer className="app-footer">{footer}</footer>}
    </div>
  );
}
