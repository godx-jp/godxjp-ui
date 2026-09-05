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
 * shells: - `AppShell` REQUIRES a sidebar — its padded topbar chrome (`.app-topbar`) is a grid
 * area beside the nav rail, so you cannot get a padded top bar without a rail. - `AuthShell` is
 * the UNAUTHENTICATED root (login/mfa/reset); it centres a narrow ~24rem card VERTICALLY and has
 * no top-right actions slot.
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
