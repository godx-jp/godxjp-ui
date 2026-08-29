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

  // A shell whose PAGE owns the top row — chat, mail, an IDE — has nothing to put in the bar, and
  // an empty bar is not free: the grid reserves --app-shell-bar-height and the <header> paints a
  // border plus a card background under it, so the page's own header lands on a SECOND row of
  // chrome (measured at ~48px bar + ~60px page header in a consumer chat shell, over exactly the
  // region that needs the height most). With all four bar slots undefined there is no <header> at
  // all and the row is published as data-topbar="none", which collapses it to zero.
  const hasTopbarContent =
    topbar !== undefined ||
    topbarLeft !== undefined ||
    topbarRight !== undefined ||
    logo !== undefined;

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

  // The ONE thing that survives in a bar-less shell: AppShell's own hamburger. Below the 900px
  // breakpoint the docked sidebar is hidden, so dropping the bar there as well would leave the
  // shell with no reachable navigation at all — a worse bug than the double chrome this state
  // exists to fix (gh#165). When a drawer exists the <header> is therefore still rendered, holding
  // the trigger and nothing else; CSS (`[data-topbar="none"] > .app-topbar`) keeps it out of the
  // layout entirely above the breakpoint and brings it back below it.
  const bar = !hasTopbarContent && !hasDrawer ? null : (
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
      {hasTopbarContent && resolvedTopbar}
    </header>
  );

  return (
    <div
      className="app-root"
      data-collapsed={sidebarCollapsed ? "true" : undefined}
      data-responsive-navigation={responsiveNavigation}
      data-topbar={hasTopbarContent ? undefined : "none"}
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
