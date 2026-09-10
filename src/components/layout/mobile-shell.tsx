import { useTranslation } from "../../i18n/use-translation";
import { cn } from "../../lib/utils";
import type { MobileShellProp } from "../../props/components/layout.prop";

export type {
  MobileShellProp,
  MobileShellProp as MobileShellProps,
} from "../../props/components/layout.prop";

/**
 * MobileShell — the HANDHELD app shell: a status band, an app bar, ONE scroll region,
 * a sticky action bar and a bottom tab bar, in that fixed order.
 *
 * The fourth root shell. The other three cannot express a phone app: `AppShell` REQUIRES a sidebar
 * (its bar is a grid area beside the nav rail), `AuthShell` is the UNAUTHENTICATED root and centres
 * a ~24rem card, and `CenteredShell` is a scrolling DOCUMENT — its `main` scrolls the page, which
 * is precisely what a handheld app must not do.
 *
 * SOURCE ORDER IS THE LAYOUT. The bands are a flex column and nothing repositions them, so the DOM
 * order and the reading order are the same order — the accessibility property AppShell has to buy
 * back with grid areas. `actions` therefore comes before `tabBar` in the DOM as well as on screen.
 *
 * i18n: the three landmarks reuse the SHARED shell labels (`layout.appShell.headerLabel` /
 * `.mainLabel` for the bar and the scroll region, `layout.sidebar.ariaLabel` for the tab bar, which
 * IS the app's primary navigation). They are the same strings in all three locales, and a fourth
 * identical copy under `layout.mobileShell.*` would be three files of duplication to keep in sync.
 */
export function MobileShell({
  statusBar,
  header,
  children,
  actions,
  tabBar,
  height = "viewport",
  width = "fill",
  className,
}: MobileShellProp) {
  const { t } = useTranslation();

  return (
    <div
      data-slot="mobile-shell"
      // Quiet default (rule #44): `viewport` emits NO attribute, so the shell's own 100dvh box is
      // what a plain <MobileShell> gets and the `[data-height="fill"]` rule cannot reach it.
      data-height={height === "viewport" ? undefined : height}
      // Same quiet default on the inline axis: `fill` is what the shell has always done, so it
      // emits nothing and only `phone` reaches the cap-and-centre rule.
      data-width={width === "fill" ? undefined : width}
      className={cn("ui-mobile-shell", className)}
    >
      {/* Băng trạng thái và app bar nằm chung trong MỘT landmark <header>. Để băng trạng thái
       * đứng trần là axe `region` đỏ: nội dung không thuộc landmark nào. Gộp cũng đúng ngữ nghĩa,
       * cả hai đều là chrome đầu màn hình. */}
      {(statusBar !== undefined || header !== undefined) && (
        <header className="ui-mobile-shell-chrome" aria-label={t("layout.appShell.headerLabel")}>
          {statusBar !== undefined && <div className="ui-mobile-shell-status">{statusBar}</div>}
          {/* No `ui-scale-fixed` on the chrome bands, unlike AppShell's topbar. That helper RE-DECLARES
           * `--control-height: var(--control-height-default)` (32px) as part of pinning a subtree to
           * `--scaling: 1`, and it is declared UNLAYERED, so it would beat the shell's own touch tier
           * from `@layer components` — reverting the app bar and the tab bar to 32px targets, the two
           * bands where rule #24's 44px floor matters most. A handheld app has one density anyway. */}
          {header !== undefined && <div className="ui-mobile-shell-header">{header}</div>}
        </header>
      )}
      {/* tabIndex={0} for axe `scrollable-region-focusable`: this is the shell's only scroll
       * container, so a keyboard user must be able to focus and scroll it (same as `.app-main`). */}
      <main
        className="ui-mobile-shell-main"
        aria-label={t("layout.appShell.mainLabel")}
        tabIndex={0}
      >
        {children}
      </main>
      {/* <footer> chứ không phải <div>: băng này nằm ngoài vùng cuộn nên cũng phải thuộc một
       * landmark. Nó là con trực tiếp của gốc shell (một div, không phải sectioning content) nên
       * ánh xạ thành contentinfo. */}
      {actions !== undefined && <footer className="ui-mobile-shell-actions">{actions}</footer>}
      {tabBar !== undefined && (
        <nav className="ui-mobile-shell-tabbar" aria-label={t("layout.sidebar.ariaLabel")}>
          {tabBar}
        </nav>
      )}
    </div>
  );
}
