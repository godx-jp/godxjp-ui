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
 * over a `min-h-dvh` surface. Control density is scoped to the comfortable tier (44px, the WCAG
 * touch floor) and the auth heading is bumped up, so forms read at the right size — replacing a
 * consumer's `.auth-shell-*` / `.ui-auth-scope` classes. Motion is delegated to `Reveal` (wrap the
 * card) so `prefers-reduced-motion` is honoured in one place.
 */
export function AuthShell({ brand, footer, children, className }: AuthShellProp) {
  const { t } = useTranslation();

  return (
    <div data-slot="auth-shell" className={cn("ui-auth-shell", className)}>
      {brand !== undefined && (
        <header className="ui-auth-shell-bar" aria-label={t("layout.authShell.brandLabel")}>
          {brand}
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
