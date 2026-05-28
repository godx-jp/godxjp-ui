import type { AppShellProp } from "../../props/components/layout.prop";

export type {
  AppShellProp,
  AppShellProp as AppShellProps,
} from "../../props/components/layout.prop";

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
}: AppShellProp) {
  const resolvedTopbar =
    topbar !== undefined ? (
      topbar
    ) : (
      <div className="app-topbar-rail">
        {logo !== undefined && <div className="app-topbar-logo">{logo}</div>}
        {topbarLeft !== undefined && <div className="app-topbar-left">{topbarLeft}</div>}
        <div className="app-topbar-spacer" />
        {topbarRight !== undefined && <div className="app-topbar-right">{topbarRight}</div>}
      </div>
    );

  return (
    <div className="app-root" data-collapsed={sidebarCollapsed ? "true" : undefined}>
      <aside className="app-sidebar">{sidebar}</aside>
      <header className="app-topbar">{resolvedTopbar}</header>
      <main className="app-main">
        {breadcrumb !== undefined && <div className="app-breadcrumb">{breadcrumb}</div>}
        {children}
      </main>
      {footer !== undefined && <footer className="app-footer">{footer}</footer>}
    </div>
  );
}
