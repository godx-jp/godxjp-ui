import * as React from "react";
import { Menu } from "lucide-react";

import { useTranslation } from "../../i18n/use-translation";
import { Button } from "../general/button";
import { Sheet, SheetBody, SheetContent, SheetHeader, SheetTrigger } from "../feedback/sheet";
import { NavSurfaceProvider } from "./nav-surface";
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
  navRail,
  navRailLabel,
  mobileNav,
  mobileNavLabel,
  mobileNavOpen,
  onMobileNavOpenChange,
}: AppShellProp) {
  const { t } = useTranslation();
  const hasSidebar = sidebar !== undefined && sidebar !== null && sidebar !== false;

  // The docked sidebar is hidden at the DXS 900px breakpoint, so AppShell OWNS an accessible mobile drawer: a
  // hamburger trigger in the topbar opens a focus-trapped Sheet (Radix Dialog → Esc + overlay
  // close, focus returns to the trigger). The drawer nav defaults to the SAME `sidebar` node, so
  // to opt out.
  /*
   * BOTH docked columns are hidden at the breakpoint, so both have to reach the drawer.
   *
   * The default used to be `sidebar` alone. Once a `navRail` exists that is no longer the whole
   * navigation: the rail carries the app-level destinations (the workspace switcher, the top-level
   * sections), and hiding its track without re-homing its content deletes them outright below
   * 900px — reachable on a laptop, gone on a phone. A control that exists on only some viewports
   * is not a control, it is a trap.
   */
  const drawerNav =
    mobileNav !== undefined ? (
      mobileNav
    ) : navRail !== undefined ? (
      <>
        {navRail}
        {sidebar}
      </>
    ) : (
      sidebar
    );
  const hasDrawer = responsiveNavigation === "drawer" && drawerNav != null && drawerNav !== false;
  /* Only the DEFAULT drawer nav splits into columns. A consumer that supplied `mobileNav` built
   * one node for one surface and gets it back untouched — the shell does not know where its two
   * halves would be. */
  const railInDrawer = mobileNav === undefined && navRail !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const drawerOpen = mobileNavOpen ?? uncontrolledOpen;
  const setDrawerOpen = onMobileNavOpenChange ?? setUncontrolledOpen;

  /*
   * Tapping a DESTINATION inside the drawer closes it — the expected mobile pattern. Tapping a
   * control that OPENS something must not, and the difference is not a list of class names.
   *
   * This shipped as "any button except `.sb-nav-group-trigger`", which was the only disclosure
   * the drawer had at the time. The moment the rail carried an organization switcher, tapping it
   * closed the whole drawer out from under the panel it had just opened — reported from a phone,
   * and the panel is portalled so it took the drawer's dismissal with it.
   *
   * A control that opens something SAYS SO, in the attributes it must carry anyway for assistive
   * tech: `aria-expanded` on a disclosure, `aria-haspopup` on anything that summons a menu,
   * dialog or listbox. Reading those instead of a class means every future overlay trigger — one
   * this file has never heard of — is handled the day it is added. The group trigger keeps its
   * name here only as a belt: it is a disclosure and already carries `aria-expanded`.
   */
  const handleDrawerClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    const hit = target.closest("a[href], button, [role='menuitem']");
    if (!hit) {
      return;
    }

    const opensSomething =
      hit.hasAttribute("aria-expanded") ||
      hit.hasAttribute("aria-haspopup") ||
      hit.classList.contains("sb-nav-group-trigger");

    if (!opensSomething) {
      setDrawerOpen(false);
    }
  };

  // A shell whose PAGE owns the top row — chat, mail, an IDE — has nothing to put in the bar, and
  // an empty bar is not free: the grid reserves --app-shell-bar-height and the <header> paints a
  // border plus a card background under it, so the page's own header lands on a SECOND row of
  // region that needs the height most). With all four bar slots undefined there is no <header> at
  // all and the row is published as data-topbar="none", which collapses it to zero.
  const hasTopbarContent =
    topbar !== undefined ||
    topbarLeft !== undefined ||
    topbarRight !== undefined ||
    logo !== undefined;

  /*
   * `logo` LÀ MỘT PHẦN CỦA DẢI TRÊN, không phải một khe mà `topbar` được nuốt.
   *
   * Trước đây `resolvedTopbar` trả thẳng `topbar` khi có, nên một shell truyền cả `logo` lẫn
   * `topbar` sẽ KHÔNG BAO GIỜ vẽ logo. Trớ trêu là `hasTopbarContent` vẫn ĐẾM `logo`, nên dải trên
   * được dựng VÌ có logo — rồi không vẽ logo.
   *
   * Đã gặp thật ở hai kho: godx-chat truyền cả hai suốt nhiều tháng, và gino-cloud đang truyền
   * đúng khe `logo` mà trên trang không có logo nào. Không lỗi, không cảnh báo, và dải trên vẫn có
   * nội dung khác nên trông vẫn "đúng" — đúng hình dạng hỏng im lặng.
   *
   * Nay logo luôn được vẽ, và `topbar` điền phần còn lại của dải. `topbarLeft`/`topbarRight` thì
   * vẫn bị `topbar` thay thế — chúng là các khe của bố cục MẶC ĐỊNH, và một `topbar` tự viết chính
   * là việc thay bố cục ấy. Nhận diện thương hiệu thì không: nó thuộc về khung, không thuộc về
   * nội dung của trang.
   */
  if (process.env.NODE_ENV !== "production" && topbar !== undefined) {
    const ignored = [
      topbarLeft !== undefined && "topbarLeft",
      topbarRight !== undefined && "topbarRight",
    ].filter(Boolean);

    if (ignored.length > 0) {
      console.warn(
        `AppShell: \`topbar\` được truyền, nên ${ignored.join(", ")} bị bỏ qua và KHÔNG được vẽ. ` +
          "Hoặc bỏ `topbar` để AppShell tự dựng dải từ các khe kia, hoặc đặt nội dung đó vào trong chính `topbar`. " +
          "(`logo` KHÔNG nằm trong số này — nó luôn được vẽ.)",
      );
    }
  }

  /*
   * THE LOGO BELONGS TO WHOEVER OWNS THE TOP-LEFT CORNER, and `topbarSpan` already says who that
   * is — so the brand follows that axis instead of getting one of its own.
   *
   * `topbarSpan="content"` (the default, the admin-console arrangement) runs the rail the full
   * height of the window with the bar starting beside it. The corner is the SIDEBAR's, so the
   * brand sits at its head, aligned to the rail's width — the shape every console with a docked
   * sidebar uses, and the one this consumer asked for after seeing the logo floating in the
   * content column at x=280, indented 24px past the rail it should have been sitting above.
   *
   * `topbarSpan="full"` is the other arrangement: the bar runs edge to edge and the sidebar starts
   * beneath it. There the corner is the BAR's, and the brand goes in the bar with the rest of the
   * space-level chrome.
   */
  const logoInRail = hasSidebar && logo !== undefined && topbarSpan !== "full";

  const resolvedTopbar =
    topbar !== undefined ? (
      <div className="app-topbar-rail">
        {!logoInRail && logo !== undefined && <div className="app-topbar-logo">{logo}</div>}
        <div className="app-topbar-custom">{topbar}</div>
      </div>
    ) : (
      <div className="app-topbar-rail">
        {!logoInRail && logo !== undefined && <div className="app-topbar-logo">{logo}</div>}
        {topbarLeft !== undefined && <div className="app-topbar-left">{topbarLeft}</div>}
        <div className="app-topbar-spacer" />
        {topbarRight !== undefined && <div className="app-topbar-right">{topbarRight}</div>}
      </div>
    );

  const rail = hasSidebar ? (
    <aside className="app-sidebar" aria-label={t("layout.appShell.sidebarLabel")}>
      {logoInRail && <div className="app-sidebar-logo">{logo}</div>}
      {sidebar}
    </aside>
  ) : null;

  /*
   * The second navigation column. It is a landmark of the same rank as the sidebar, so it gets the
   * same treatment: its own `aside`, and a name the shell supplies by default. Two `complementary`
   * landmarks on one page must be distinguishable by name (ARIA), and leaving that to the consumer
   * is how the shipped attempt at this shape ended up with an inconsistent landmark count.
   */
  const navRailRegion =
    navRail === undefined ? null : (
      <aside
        className="app-nav-rail"
        aria-label={navRailLabel ?? t("layout.appShell.navRailLabel")}
      >
        {navRail}
      </aside>
    );

  // The ONE thing that survives in a bar-less shell: AppShell's own hamburger. Below the 900px
  // breakpoint the docked sidebar is hidden, so dropping the bar there as well would leave the
  // shell with no reachable navigation at all — a worse bug than the double chrome this state
  // When a drawer exists the <header> is therefore still rendered, holding
  // the trigger and nothing else; CSS (`[data-topbar="none"] > .app-topbar`) keeps it out of the
  // layout entirely above the breakpoint and brings it back below it.
  const bar =
    !hasTopbarContent && !hasDrawer ? null : (
      <header className="app-topbar ui-scale-fixed" aria-label={t("layout.appShell.headerLabel")}>
        {hasDrawer && (
          <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
            <SheetTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="app-mobile-nav-trigger"
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
              {/* The inset is a documented knob (--app-shell-mobile-nav-inset); a custom `mobileNav` that wants the full chrome inset sets it to var(--space-6) once in the service theme. Passed as a utility (not CSS) because *-layout.css is `@layer components`, where SheetBody's own px-* utility would win. */}
              <SheetBody
                className="app-mobile-nav-body px-[var(--app-shell-mobile-nav-inset)]"
                onClick={handleDrawerClick}
              >
                {/* THE DRAWER KEEPS THE SHAPE OF THE SHELL IT REPLACES. With a rail, it is two
                 * columns — narrow rail, then the section list — the same reading order the
                 * docked shell has, so nothing has to be relearned at 393px.
                 *
                 * Stacking them instead put one column above the other with the section list
                 * pushed to the middle of an otherwise empty sheet, and it forced a choice
                 * neither answer survives: honour `collapsed` and the whole drawer is anonymous
                 * glyphs, drop it and the rail's app switcher becomes a second full-width list
                 * indistinguishable from the sections beneath it.
                 *
                 * Two columns dissolve that. The rail is narrow again, so it KEEPS `collapsed`
                 * (surface="docked"); only the section column is told it is a drawer, where a
                 * desktop collapse buys no room and costs every label. */}
                {railInDrawer ? (
                  <div className="app-mobile-nav-columns">
                    <div className="app-mobile-nav-rail">{navRail}</div>
                    <NavSurfaceProvider surface="drawer">
                      <div className="app-mobile-nav-sections">{sidebar}</div>
                    </NavSurfaceProvider>
                  </div>
                ) : (
                  <NavSurfaceProvider surface="drawer">{drawerNav}</NavSurfaceProvider>
                )}
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
      data-collapsed={hasSidebar && sidebarCollapsed ? "true" : undefined}
      data-sidebar={hasSidebar ? undefined : "none"}
      data-responsive-navigation={responsiveNavigation}
      data-topbar={hasTopbarContent ? undefined : "none"}
      data-topbar-span={topbarSpan === "full" ? "full" : undefined}
      data-nav-rail={navRail !== undefined ? "" : undefined}
    >
      {/* Grid areas place these regardless of source order, so source order is free to be the
       * ACCESSIBLE one: whichever region the eye reaches first comes first in the DOM. With a
       * full-width bar above the rail, leaving the aside first would send Tab into the sidebar
       * while the bar sits visibly above it (WCAG 2.4.3 / 1.3.2). */}
      {/* The nav rail is the leftmost column, so it precedes the sidebar in source for the same
       * reason the bar precedes both under `topbarSpan="full"`: source order IS the focus order,
       * and it has to match the visual one (WCAG 2.4.3 / 1.3.2). */}
      {topbarSpan === "full" ? (
        <>
          {bar}
          {navRailRegion}
          {rail}
        </>
      ) : (
        <>
          {navRailRegion}
          {rail}
          {bar}
        </>
      )}
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
