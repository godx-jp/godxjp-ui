import { useTranslation } from "../../i18n/use-translation";
import { cn } from "../../lib/utils";
import type { CenteredShellProp } from "../../props/components/layout.prop";

export type {
  CenteredShellProp,
  CenteredShellProp as CenteredShellProps,
} from "../../props/components/layout.prop";

/**
 * CenteredShell — authenticated, no-sidebar, centred-column page shell: the hosted-ID "My Page",
 * account / self-service, and standalone-settings shape. It fills the gap between the two existing
 * shells:
 *
 * - `AppShell` REQUIRES a sidebar — its padded topbar chrome (`.app-topbar`) is a grid area beside
 *   the nav rail, so you cannot get a padded top bar without a rail.
 * - `AuthShell` is the UNAUTHENTICATED root (login/mfa/reset); it centres a narrow ~24rem card
 *   VERTICALLY and has no top-right actions slot.
 *
 * CenteredShell gives a **padded top bar with real actions** (banner) reusing the SAME chrome as
 * `.app-topbar` (padding-inline · border · backdrop) WITHOUT a sidebar, a scrollable `main` whose
 * content is a **centred column** of a configurable medium width (`width` = sm|md|lg, all wider than
 * the 24rem auth card) **top-aligned** so sections flow and scroll (not vertically centred), and an
 * optional footer (contentinfo) — or, with `align="center"`, the column centred in the viewport for
 * a SYSTEM-level standalone surface (a 500/503 error page, a maintenance notice), so that full-page
 * geometry stays package-owned instead of a consumer re-implementing `min-h-dvh` + flex centring.
 * A hosted account page thus needs ZERO custom CSS and never
 * hand-rolls a bar (the bare `Topbar` primitive ships no padding — the `.ui-topbar` zero-inset
 * footgun). Layout-only: delegate motion to `Reveal` (wrap a section) so `prefers-reduced-motion`
 * is honoured in one place.
 */
export function CenteredShell({
  topbar,
  footer,
  children,
  width = "md",
  align = "start",
  preset = "default",
  className,
}: CenteredShellProp) {
  const { t } = useTranslation();

  return (
    <div
      data-slot="centered-shell"
      // `data-preset` is only emitted for a REAL preset, so the default shell keeps its exact
      // pre-preset box — `default` is never a selector in the stylesheet (gh#231 / gh#220).
      data-preset={preset === "default" ? undefined : preset}
      className={cn("ui-centered-shell", className)}
    >
      {topbar !== undefined && (
        <header
          className="ui-centered-shell-bar ui-scale-fixed"
          aria-label={t("layout.centeredShell.headerLabel")}
        >
          {topbar}
        </header>
      )}
      <main className="ui-centered-shell-main" aria-label={t("layout.centeredShell.mainLabel")}>
        <div className="ui-centered-shell-column" data-width={width} data-align={align}>
          {children}
        </div>
      </main>
      {footer !== undefined && (
        <footer
          className="ui-centered-shell-footer"
          aria-label={t("layout.centeredShell.footerLabel")}
        >
          {footer}
        </footer>
      )}
    </div>
  );
}
