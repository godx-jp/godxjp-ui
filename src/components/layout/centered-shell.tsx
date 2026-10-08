import { useTranslation } from "../../i18n/use-translation";
import { cn } from "../../lib/utils";
import type {
  CenteredShellAuthProp,
  CenteredShellPageProp,
  CenteredShellProp,
} from "../../props/components/layout.prop";

export type {
  CenteredShellProp,
  CenteredShellProp as CenteredShellProps,
  CenteredShellAuthProp,
  CenteredShellPageProp,
} from "../../props/components/layout.prop";

/**
 * CenteredShell — the ONE centred root shell (v32 #1223 folded `AuthShell` in), in two shapes the
 * `variant` picks:
 *
 * - `"page"` (default) — authenticated, no-sidebar, centred-column page: the hosted-ID "My Page",
 *   account / self-service, and standalone-settings shape. `AppShell` REQUIRES a sidebar (its
 *   padded topbar chrome is a grid area beside the nav rail); this is the padded top bar without
 *   one, over a top-aligned column that flows and scrolls.
 * - `"auth"` / `"auth-canonical"` — the UNAUTHENTICATED root (login · mfa · passkey · device ·
 *   reset): a brand bar (banner) that also carries page-level `actions` at its inline end, a
 *   vertically centred `main` holding the auth `Card`, an optional footer, over a `min-h-dvh`
 *   surface. `measure="wide"` opens the slot to a split login (a brand panel beside the card).
 */
export function CenteredShell(props: CenteredShellProp) {
  return isAuth(props) ? <AuthLayout {...props} /> : <PageLayout {...props} />;
}

/** An optional discriminant (`variant?: "page"`) does not narrow on its own; this guard does. */
function isAuth(props: CenteredShellProp): props is CenteredShellAuthProp {
  return props.variant === "auth" || props.variant === "auth-canonical";
}

function PageLayout({
  topbar,
  footer,
  children,
  width = "md",
  align = "start",
  preset = "default",
  className,
}: CenteredShellPageProp) {
  const { t } = useTranslation();

  return (
    <div
      data-slot="centered-shell"
      // `data-preset` is only emitted for a REAL preset, so the default shell keeps its exact
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

function AuthLayout({
  variant,
  brand,
  actions,
  footer,
  children,
  preset = "default",
  measure = "default",
  align,
  density,
  className,
}: CenteredShellAuthProp) {
  const { t } = useTranslation();
  const canonical = variant === "auth-canonical";
  const resolvedDensity = density ?? (canonical ? "compact" : "comfortable");

  return (
    <div
      // The auth shape keeps its own slot, classes and `data-variant` vocabulary, so every token,
      // selector and preset written for the former AuthShell still reaches it unchanged.
      data-slot="auth-shell"
      data-variant={canonical ? "canonical" : "default"}
      // `data-preset` is only emitted for a real preset, so the default shell keeps its exact
      // pre-preset box (the `[data-preset]` stack rule must not apply to it).
      data-preset={preset === "default" ? undefined : preset}
      // Same rule as `data-preset`: emitted only for a real measure, so the default shell keeps its
      // exact box and the `[data-measure="wide"]` rules cannot reach it.
      data-measure={measure === "default" ? undefined : measure}
      // Emitted only when the caller states an alignment, so an unset `align` leaves the preset's
      // own `--auth-shell-main-align` untouched — the two rules carry equal specificity and would
      // otherwise decide the default by source order.
      data-align={align}
      data-density={resolvedDensity}
      className={cn("ui-auth-shell", className)}
    >
      {(brand !== undefined || actions !== undefined) && (
        <header className="ui-auth-shell-bar" aria-label={t("layout.authShell.brandLabel")}>
          {brand}
          {actions !== undefined && <div className="ui-auth-shell-bar-actions">{actions}</div>}
        </header>
      )}
      <main className="ui-auth-shell-main" aria-label={t("layout.authShell.mainLabel")}>
        <div className="ui-auth-shell-card">{children}</div>
      </main>
      {footer !== undefined && (
        <footer className="ui-auth-shell-footer" aria-label={t("layout.authShell.footerLabel")}>
          {footer}
        </footer>
      )}
    </div>
  );
}
