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
  responsiveNavigation = "drawer",
  topbarSpan = "content",
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
  const hasDrawer = responsiveNavigation === "drawer" && drawerNav != null;
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

  const rail = (
    <aside className="app-sidebar" aria-label={t("layout.appShell.sidebarLabel")}>
      {sidebar}
    </aside>
  );

  const bar = (
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
              {/* The hamburger glyph is DELIBERATELY larger than this `size="sm"` Button's own
               * icon size (--control-icon-size-sm, 0.875rem): on a phone it is the only
               * navigation affordance there is. Passed as a utility reading the knob, not as a
               * `.app-mobile-nav-trigger svg` rule, for the same reason as
               * --app-shell-mobile-nav-inset below: shell-layout.css is imported BEFORE
               * control.css and both live in `@layer components`, so a rule at the identical
               * (0,1,1) specificity of `.ui-button--sm svg` would silently LOSE and the glyph
               * would shrink back to 0.875rem. */}
              <Menu className="size-[var(--app-shell-mobile-nav-icon-size)]" aria-hidden="true" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            width="var(--app-shell-mobile-nav-width)"
            className="app-mobile-nav-drawer"
            overlayClassName="app-mobile-nav-overlay"
          >
            <SheetHeader title={mobileNavLabel ?? t("layout.appShell.navLabel")} />
            {/* The drawer body is edge-to-edge: the nav it hosts (the <Sidebar> node by default)
             * owns its own inset via --sidebar-nav-scroll-padding, so stacking SheetBody's
             * generic chrome inset (--sheet-pad-x = 24px) on top of it double-padded every row
             * — 32px of dead space per side on a ~293px drawer (gh#211). The inset is a
             * documented knob (--app-shell-mobile-nav-inset); a custom `mobileNav` that wants
             * the full chrome inset sets it to var(--space-6) once in the service theme.
             * Passed as a utility (not CSS) because *-layout.css is `@layer components`, where
             * SheetBody's own px-* utility would win. */}
            <SheetBody
              className="app-mobile-nav-body px-[var(--app-shell-mobile-nav-inset)]"
              onClick={handleDrawerClick}
            >
              {drawerNav}
            </SheetBody>
          </SheetContent>
        </Sheet>
      )}
      {resolvedTopbar}
    </header>
  );

  return (
    <div
      className="app-root"
      data-collapsed={sidebarCollapsed ? "true" : undefined}
      data-responsive-navigation={responsiveNavigation}
      data-topbar-span={topbarSpan === "full" ? "full" : undefined}
    >
      {/* Grid areas place these regardless of source order, so source order is free to be the
       * ACCESSIBLE one: whichever region the eye reaches first comes first in the DOM. With a
       * full-width bar above the rail, leaving the aside first would send Tab into the sidebar
       * while the bar sits visibly above it (WCAG 2.4.3 / 1.3.2). */}
      {topbarSpan === "full" ? bar : rail}
      {topbarSpan === "full" ? rail : bar}
      <main className="app-main" aria-label={t("layout.appShell.mainLabel")} tabIndex={0}>
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
