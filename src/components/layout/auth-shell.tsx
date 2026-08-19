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
 *
 * `preset` names the flow MEASURE (card max-width + desktop/mobile page gutters) so a consumer
 * never overrides page geometry by hand: `"login"` = SCR-001's stable identity/card/footer anchor
 * for standalone and real requester states; `"registration"` = the 360px sign-up measure,
 * start-aligned like login (a tall sign-up card must scroll, not clip its own top above the scroll
 * origin) and the only one with its own footer clearance; `"device-authorization"` = 380px card
 * with a 5px inline gutter at 390px; `"context-selection"` = 25rem card, edge-to-edge on mobile;
 * `"account-recovery"` = the 432px SCR-008 panel measure shared by password recovery and the
 * sign-in MFA challenge, with a 15px inline gutter at 390px. It is orthogonal to `variant` —
 * combine `variant="canonical"` with any preset.
 */
export function AuthShell({
  brand,
  footer,
  children,
  variant = "default",
  preset = "default",
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
      data-density={resolvedDensity}
      className={cn("ui-auth-shell", className)}
    >
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
