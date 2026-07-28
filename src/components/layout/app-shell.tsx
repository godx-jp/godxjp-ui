import * as React from "react";
import { Menu } from "lucide-react";

import { useTranslation } from "../../i18n/use-translation";
import { Button } from "../general/button";
import { Sheet, SheetBody, SheetContent, SheetHeader, SheetTrigger } from "../feedback/sheet";
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
  mobileNav,
  mobileNavLabel,
  mobileNavOpen,
  onMobileNavOpenChange,
}: AppShellProp) {
  const { t } = useTranslation();

  // The docked sidebar is hidden at the DXS 900px breakpoint, so AppShell OWNS an accessible mobile drawer: a
  // hamburger trigger in the topbar opens a focus-trapped Sheet (Radix Dialog → Esc + overlay
  // close, focus returns to the trigger). The drawer nav defaults to the SAME `sidebar` node, so
  // navigation is never merely hidden (gh#165); pass `mobileNav` for a tailored menu, or `null`
  // to opt out.
  const drawerNav = mobileNav !== undefined ? mobileNav : sidebar;
  const hasDrawer = drawerNav != null;
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const drawerOpen = mobileNavOpen ?? uncontrolledOpen;
  const setDrawerOpen = onMobileNavOpenChange ?? setUncontrolledOpen;

  // Tapping a destination (a leaf link/row) inside the drawer closes it — the expected mobile
  // pattern — while a group expand/collapse trigger keeps it open so the user can drill in.
  const handleDrawerClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    const hit = target.closest("a[href], button, [role='menuitem']");
    if (hit && !hit.classList.contains("sb-nav-group-trigger")) {
      setDrawerOpen(false);
    }
  };

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
      <aside className="app-sidebar" aria-label={t("layout.appShell.sidebarLabel")}>
        {sidebar}
      </aside>
      <header className="app-topbar ui-scale-fixed" aria-label={t("layout.appShell.headerLabel")}>
        {hasDrawer && (
          <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
            <SheetTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="app-mobile-nav-trigger hidden max-[900px]:inline-flex"
                aria-label={t("layout.appShell.openNav")}
                aria-haspopup="dialog"
              >
                <Menu className="size-5" aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              width="var(--app-shell-mobile-nav-width)"
              className="app-mobile-nav-drawer"
              overlayClassName="app-mobile-nav-overlay"
            >
              <SheetHeader title={mobileNavLabel ?? t("layout.appShell.navLabel")} />
              <SheetBody className="app-mobile-nav-body" onClick={handleDrawerClick}>
                {drawerNav}
              </SheetBody>
            </SheetContent>
          </Sheet>
        )}
        {resolvedTopbar}
      </header>
      <main className="app-main" aria-label={t("layout.appShell.mainLabel")}>
        {breadcrumb !== undefined && <div className="app-breadcrumb">{breadcrumb}</div>}
        {children}
      </main>
      {footer !== undefined && (
        <footer className="app-footer" aria-label={t("layout.appShell.footerLabel")}>
          {footer}
        </footer>
      )}
    </div>
  );
}
