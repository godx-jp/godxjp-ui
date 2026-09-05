import * as React from "react";
import { SearchX, ServerCrash, ShieldAlert, TriangleAlert, Wrench } from "lucide-react";

import { useTranslation } from "../../i18n/use-translation";
import { cn } from "../../lib/utils";
import { EmptyState } from "../data-display/empty-state";
import { Progress } from "../data-display/progress";
import { Text } from "../general/typography";
import { CenteredShell } from "./centered-shell";
import type {
  ErrorSurfaceMaintenanceProp,
  ErrorSurfaceProp,
} from "../../props/components/layout.prop";
import type { EmptyStateToneProp } from "../../props/components/data-display.prop";
import type { IconProp, ErrorSurfaceStatusProp } from "../../props/vocabulary";

export type {
  ErrorSurfaceMaintenanceProp,
  ErrorSurfaceProp,
  ErrorSurfaceProp as ErrorSurfaceProps,
} from "../../props/components/layout.prop";
export type { ErrorSurfaceModeProp, ErrorSurfaceStatusProp } from "../../props/vocabulary";

/**
 * Status → default icon + tone. Closed set (RFC 9110 §15.5.1 / §15.5.4 / §15.5.5 / §15.6.1 /
 * §15.6.4): the five exception pages every application ships.
 */
type StatusMeta = { icon: IconProp; tone: EmptyStateToneProp };
const STATUS_META: Partial<Record<number, StatusMeta>> = {
  400: { icon: TriangleAlert, tone: "warning" },
  403: { icon: ShieldAlert, tone: "warning" },
  404: { icon: SearchX, tone: "muted" },
  500: { icon: ServerCrash, tone: "destructive" },
  503: { icon: Wrench, tone: "warning" },
};

/** Any status outside the curated five renders by class: 4xx is the caller's request, 5xx the server. */
function statusMeta(status: number): StatusMeta {
  return (
    STATUS_META[status] ??
    (status >= 500 && status < 600
      ? { icon: ServerCrash, tone: "destructive" }
      : { icon: TriangleAlert, tone: "warning" })
  );
}

/**
 * EXACTLY ONE recovery action, enforced structurally. The slot is single by construction; this
 * flattens the one case the type system cannot catch (a fragment carrying two buttons) and drops
 * the extras with a development error.
 */
function singleAction(action: React.ReactNode): React.ReactNode {
  const flattened = React.Children.toArray(action).flatMap((child) =>
    React.isValidElement(child) && child.type === React.Fragment
      ? React.Children.toArray((child.props as { children?: React.ReactNode }).children)
      : [child],
  );

  if (flattened.length > 1 && process.env.NODE_ENV !== "production") {
    console.error(
      "[@godxjp/ui] ErrorSurface: `action` takes EXACTLY ONE recovery action. The extra elements " +
        "were dropped. Put support contact or secondary guidance in `description`.",
    );
  }

  return flattened[0] ?? null;
}

/**
 * ISO-8601 instants + an IANA zone → one CLDR-formatted, locale-correct window. `formatRange` is
 * what makes "2026年8月3日 3:00～5:00" collapse correctly in ja and expand in vi; a hand-built
 * `${start} - ${end}` cannot.
 */
function formatMaintenanceWindow(maintenance: ErrorSurfaceMaintenanceProp, locale: string): string {
  const options: Intl.DateTimeFormatOptions = {
    dateStyle: "medium",
    timeStyle: "short",
    ...(maintenance.timeZone ? { timeZone: maintenance.timeZone } : {}),
  };
  const start = new Date(maintenance.start);
  if (Number.isNaN(start.getTime())) return maintenance.start;

  const formatter = new Intl.DateTimeFormat(locale, options);
  if (maintenance.end === undefined) return formatter.format(start);

  const end = new Date(maintenance.end);
  if (Number.isNaN(end.getTime())) return formatter.format(start);
  return formatter.formatRange(start, end);
}

/**
 * What the surface owns is the CONTRACT the composition kept losing: - **`mode` is the shell
 * contract.** `application` (400/403/404) renders the surface as the BODY you place inside the
 * `AppShell` the route already provides, so the sidebar, topbar and breadcrumb are PRESERVED — it
 * never reconstructs navigation chrome, because nav data and the user menu are consumer-owned and
 * a component cannot manufacture them. `system` (500/503) owns the page and renders `CenteredShell
 * align="center"`, so the viewport-centred geometry at 1440 / 1024 / 390 is package-owned and the
 * consumer writes no `min-h-dvh`, no flex-centring class, no media query. - **Exactly one recovery
 * action**, structurally (see `singleAction`). - **Semantic metadata slots** instead of free-form
 * paragraphs: `requestId` (mono/tabular so a support id is read out accurately), `permission` and
 * `organization` (which of the two a 403 is actually about), and `maintenance` (ISO-8601 + IANA
 * formatted through `Intl.DateTimeFormat`, with an optional labelled `Progress` meter).
 */
export const ErrorSurface = React.forwardRef<HTMLDivElement, ErrorSurfaceProp>(
  function ErrorSurface(
    {
      mode,
      status,
      title,
      description,
      action,
      icon,
      tone,
      titleLevel,
      requestId,
      permission,
      organization,
      maintenance,
      brand,
      footer,
      width = "sm",
      id,
      className,
    },
    ref,
  ) {
    const { t, locale } = useTranslation();
    const meta = statusMeta(status);
    const resolvedIcon = icon ?? meta.icon;
    const resolvedTone = tone ?? meta.tone;
    // The surface IS the page in system mode (h1); in application mode a PageContainer h1 sits
    // above it, so the surface title is the section heading (h2). Never chosen for size.
    const resolvedTitleLevel = titleLevel ?? (mode === "system" ? 1 : 2);

    const maintenanceWindow =
      maintenance === undefined ? undefined : formatMaintenanceWindow(maintenance, locale);
    const maintenanceProgress = maintenance?.progress;
    const hasProgress =
      typeof maintenanceProgress === "number" && Number.isFinite(maintenanceProgress);
    const progressLabel = hasProgress
      ? t("layout.errorSurface.maintenanceProgress", {
          percent: new Intl.NumberFormat(locale, {
            style: "percent",
            maximumFractionDigits: 0,
          }).format(Math.max(0, Math.min(100, maintenanceProgress)) / 100),
        })
      : undefined;

    const hasMetadata =
      requestId !== undefined ||
      permission !== undefined ||
      organization !== undefined ||
      maintenanceWindow !== undefined;

    const surface = (
      <div
        ref={ref}
        id={id}
        data-slot="error-surface"
        data-mode={mode}
        data-status={status}
        className={cn("ui-error-surface", className)}
      >
        {brand !== undefined && mode === "system" && (
          <div className="ui-error-surface-brand">{brand}</div>
        )}

        {/* The visible digits are tabular/mono so 403 and 503 occupy the same box; the accessible
         * name is the full "HTTP status 403" phrase, because a bare "403" is announced as the
         * cardinal number "four hundred three" and tells a screen-reader user nothing. */}
        <Text
          as="p"
          size="sm"
          tone="muted"
          weight="medium"
          mono
          tabular
          className="ui-error-surface-status"
        >
          <span aria-hidden="true">{status}</span>
          <span className="sr-only">
            {t("layout.errorSurface.statusLabel", { status: String(status) })}
          </span>
        </Text>

        <EmptyState
          icon={resolvedIcon}
          tone={resolvedTone}
          titleLevel={resolvedTitleLevel}
          title={title}
          description={description}
          action={singleAction(action)}
          className="ui-error-surface-body"
        />

        {hasMetadata && (
          /* A description list, not a sentence: each metadata row keeps a machine-readable
           * label↔value pair, so "Request ID / 01J9Z…" is navigable instead of being one run-on
           * paragraph. `<div>` wrappers around dt/dd are valid HTML5 and give each row its box. */
          <dl className="ui-error-surface-meta">
            {requestId !== undefined && (
              <div className="ui-error-surface-meta-row">
                <Text as="dt" size="xs" tone="muted">
                  {t("layout.errorSurface.requestId")}
                </Text>
                <Text as="dd" size="xs" tone="muted" mono tabular>
                  {requestId}
                </Text>
              </div>
            )}
            {permission !== undefined && (
              <div className="ui-error-surface-meta-row">
                <Text as="dt" size="xs" tone="muted">
                  {t("layout.errorSurface.permission")}
                </Text>
                <Text as="dd" size="xs" tone="muted" mono>
                  {permission}
                </Text>
              </div>
            )}
            {organization !== undefined && (
              <div className="ui-error-surface-meta-row">
                <Text as="dt" size="xs" tone="muted">
                  {t("layout.errorSurface.organization")}
                </Text>
                <Text as="dd" size="xs" tone="muted">
                  {organization}
                </Text>
              </div>
            )}
            {maintenanceWindow !== undefined && maintenance !== undefined && (
              <div className="ui-error-surface-meta-row">
                <Text as="dt" size="xs" tone="muted">
                  {t("layout.errorSurface.maintenanceWindow")}
                </Text>
                <Text as="dd" size="xs" tone="muted">
                  {/* The MACHINE-readable value stays the ISO-8601 instant; the visible text is the
                   * CLDR rendering for the active locale. */}
                  <time dateTime={maintenance.start}>{maintenanceWindow}</time>
                </Text>
              </div>
            )}
          </dl>
        )}

        {hasProgress && progressLabel !== undefined && (
          <div className="ui-error-surface-progress">
            <Progress
              value={Math.max(0, Math.min(100, maintenanceProgress))}
              label={progressLabel}
              tone="warning"
            />
          </div>
        )}
      </div>
    );

    // application mode: the surface is the BODY. It returns only its own block, so the AppShell the
    // route already renders (sidebar · topbar · breadcrumb) stays mounted and untouched.
    if (mode === "application") return surface;

    // system mode: the surface owns the page. CenteredShell align="center" is the package-owned
    // viewport-centred geometry — tall localized copy still scrolls from the top instead of
    // clipping, because the auto block offsets collapse.
    return (
      <CenteredShell align="center" width={width} {...(footer !== undefined ? { footer } : {})}>
        {surface}
      </CenteredShell>
    );
  },
);
ErrorSurface.displayName = "ErrorSurface";
