import { useTranslation } from "../../i18n/use-translation";
import { cn } from "../../lib/utils";
import type { AuthShellProp } from "../../props/components/layout.prop";

export type {
  AuthShellProp,
  AuthShellProp as AuthShellProps,
} from "../../props/components/layout.prop";

/**
 * AuthShell — centred auth/login page shell (login · mfa · passkey · device · reset). A top brand
 * bar (banner), a centred `main` that holds the auth `Card`, and an optional footer (contentinfo),
 * over a `min-h-dvh` surface. The banner also carries page-level `actions` at its inline end (a
 * locale picker, a theme toggle), and `measure="wide"` opens the content slot to the split login
 * (a brand panel beside the card) that used to have no shell of its own.
 */
export function AuthShell({
  brand,
  actions,
  footer,
  children,
  variant = "default",
  preset = "default",
  measure = "default",
  density,
  className,
}: AuthShellProp) {
  const { t } = useTranslation();
  const resolvedDensity = density ?? (variant === "canonical" ? "compact" : "comfortable");

  return (
    <div
      data-slot="auth-shell"
      data-variant={variant}
      // `data-preset` is only emitted for a real preset, so the default shell keeps its exact
      // pre-preset box (the `[data-preset]` stack rule must not apply to it).
      data-preset={preset === "default" ? undefined : preset}
      // Same rule as `data-preset`: emitted only for a real measure, so the default shell keeps its
      // exact box and the `[data-measure="wide"]` rules cannot reach it.
      data-measure={measure === "default" ? undefined : measure}
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
