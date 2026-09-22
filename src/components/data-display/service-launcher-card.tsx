/**
 * RECORDED EXCEPTION to the Framework-Component Test (gh#814).
 *
 * `docs/COMPOSITION-VS-COMPONENT.md` §2 says all seven criteria must PASS and any FAIL makes a
 * thing a composition pattern. This file FAILS two of them, and stays anyway:
 *
 *   C2 (encapsulates reusable BEHAVIOR) — FAIL. It owns no state, no keyboard handling and no
 *      focus management; its only ARIA is three static attributes. §2 calls this "pure static
 *      layout/visual arrangement".
 *   C3 (not expressible by composing primitives) — FAIL. Its own imports are the answer: this is
 *      `Card` + `CardContent` + `Badge` + one Lucide glyph, and §2's heuristic — "could I build
 *      this right now from existing primitives + token overrides?" — is answered yes.
 *
 * It is RETAINED because `src/components/layout/app-launcher.tsx` consumes it: it is an internal
 * building block of a component that does pass the test, so deleting it is not on the table, and
 * removing a public export is breaking. Keeping it public was the cheaper call.
 *
 * SO: a consumer reaching for a service tile should compose `Card` + `CardContent` + `Badge`
 * themselves, which is what C3 says. Reach for `ServiceLauncherCard` only to match `AppLauncher`'s
 * own tiles. Do not cite it as precedent for adding another static tile to `src/components/` —
 * the test still means what it says, and this is the exception that was argued and written down
 * rather than the rule.
 *
 * Ledger, options considered and the decision: gh#814.
 */
import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { Plus } from "lucide-react";

import { useImageLoadingStatus, type ImageLoadingStatus } from "../../lib/image-loading-status";
import { cn } from "../../lib/utils";
import type { HeadingLevelProp, ToneProp } from "../../props/vocabulary";
import { Badge } from "./badge";
import { Card, CardContent } from "./card";

export type ServiceLauncherStatusTone = Extract<
  ToneProp,
  "success" | "warning" | "destructive" | "info" | "neutral" | "muted"
>;

export interface ServiceLauncherCardProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "title"
> {
  /**
   * The generic glyph for this KIND of service. Stays REQUIRED and stays a `LucideIcon`: every
   * service has one, including a service created ten seconds ago that has no logo yet, and it is
   * the thing `logo` falls back to. See the `logo` note for why this was not widened to a union.
   */
  icon: LucideIcon;
  /**
   * URL of the service's OWN uploaded mark — the PNG/WebP an administrator uploaded (gh#850).
   * When it loads, it replaces `icon` in the medallion, in the glyph's exact box.
   *
   * It is a fallback chain, not a switch: the tile shows `icon` while the URL is in flight, and
   * KEEPS showing `icon` if the URL 404s, is empty, or decodes to nothing. A launcher never
   * degrades to an empty medallion or a torn-page glyph because a logo went missing — which is the
   * only state that reaches production, since a logo path outlives the file it points at.
   *
   * Decorative, and deliberately has no `logoAlt` companion: the medallion is `aria-hidden` and the
   * service NAME sits beside it. A screen reader must not hear "Attendance" twice (WCAG 2.2 · 1.1.1
   * — an image adjacent to text conveying the same thing is decorative).
   */
  logo?: string;
  title: React.ReactNode;
  titleLevel?: HeadingLevelProp;
  statusLabel?: React.ReactNode;
  statusTone?: ServiceLauncherStatusTone;
  description?: React.ReactNode;
  metadata?: React.ReactNode;
  action: React.ReactNode;
  disabledReason?: React.ReactNode;
}

/**
 * Token-owned launcher surface for an organization-scoped downstream service. Consumers supply
 * real status, metadata and actions; access is NEVER inferred — the component derives no
 * entitlement, no launch URL and no disabled state of its own.
 */
export const ServiceLauncherCard = React.forwardRef<HTMLDivElement, ServiceLauncherCardProps>(
  (
    {
      className,
      icon: Icon,
      logo,
      title,
      titleLevel = 2,
      statusLabel,
      statusTone = "neutral",
      description,
      metadata,
      action,
      disabledReason,
      ...props
    },
    ref,
  ) => {
    const Heading = `h${titleLevel}` as const;
    /*
     * THE SAME PROBE `Avatar` USES (`lib/image-loading-status`), not a second one. A detached
     * `new Image()` decides `loaded` vs `error`, so a broken `logo` never enters the DOM as an
     * `<img>` for the browser to paint its torn-page glyph over the medallion — the tile simply
     * still has its `icon`.
     */
    const [logoStatus, setLogoStatus] = React.useState<ImageLoadingStatus>("idle");
    const logoLoadingStatus = useImageLoadingStatus(logo || undefined, {
      loadingStatus: logoStatus,
      setLoadingStatus: setLogoStatus,
    });

    return (
      <Card
        ref={ref}
        density="tight"
        className={cn("ui-service-launcher-card", className)}
        data-service-launcher=""
        data-unavailable={disabledReason != null ? "" : undefined}
        {...props}
      >
        <CardContent solo>
          {/*
           * THE MEDALLION AND THE NAME ARE ONE THING; the status is the part that may move.
           *
           * They were three siblings in one wrapping row, and a row of three cannot express "keep
           * the first two together, break before the third" — the browser breaks wherever the
           * items stop fitting, which put the medallion alone on its own line above the name.
           * Grouping them says it structurally: the group is one flex item, so the status is the
           * only thing that can wrap away.
           */}
          <div data-slot="service-launcher-heading">
            <div data-slot="service-launcher-identity">
              <span data-slot="service-launcher-icon" aria-hidden="true">
                {logoLoadingStatus === "loaded" ? (
                  /* No `loading="lazy"`: the probe above has ALREADY fetched this URL by the time
                   * this element exists, so a lazy hint would describe a request that is over.
                   * `decoding="async"` is the hint that still means something here — it keeps the
                   * decode of a grid of logos off the main thread. */
                  <img data-slot="service-launcher-logo" src={logo} alt="" decoding="async" />
                ) : (
                  <Icon />
                )}
              </span>
              <Heading data-slot="service-launcher-title">{title}</Heading>
            </div>
            {statusLabel != null ? (
              <Badge tone={statusTone} data-slot="service-launcher-status">
                {statusLabel}
              </Badge>
            ) : null}
          </div>
          {description != null ? (
            <div data-slot="service-launcher-description">{description}</div>
          ) : null}
          {metadata != null ? <div data-slot="service-launcher-metadata">{metadata}</div> : null}
          {/* The reason precedes the action on purpose: a disabled control announces nothing about
           * WHY, so screen-reader and keyboard users must meet the explanation first in DOM order
           * (WCAG 2.2 · 1.3.2 meaningful sequence). */}
          {disabledReason != null ? (
            <div data-slot="service-launcher-disabled-reason">{disabledReason}</div>
          ) : null}
          <div data-slot="service-launcher-action">{action}</div>
        </CardContent>
      </Card>
    );
  },
);
ServiceLauncherCard.displayName = "ServiceLauncherCard";

export interface ServiceCatalogCtaProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "title"
> {
  icon?: LucideIcon;
  title: React.ReactNode;
  action: React.ReactNode;
}

/** Dashed companion tile for the real catalog/add action beside launcher cards. */
export const ServiceCatalogCta = React.forwardRef<HTMLDivElement, ServiceCatalogCtaProps>(
  ({ className, icon: Icon = Plus, title, action, ...props }, ref) => (
    <Card
      ref={ref}
      variant="outline"
      className={cn("ui-service-catalog-cta", className)}
      data-service-catalog-cta=""
      {...props}
    >
      <CardContent solo>
        <Icon data-slot="service-catalog-icon" aria-hidden="true" />
        <div data-slot="service-catalog-title">{title}</div>
        <div data-slot="service-catalog-action">{action}</div>
      </CardContent>
    </Card>
  ),
);
ServiceCatalogCta.displayName = "ServiceCatalogCta";

export interface ServiceLauncherCardSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
}

/** Shape-matched loading placeholder for a launcher card. */
export function ServiceLauncherCardSkeleton({
  className,
  label,
  ...props
}: ServiceLauncherCardSkeletonProps) {
  return (
    <Card
      density="tight"
      className={cn("ui-service-launcher-card", className)}
      data-service-launcher=""
      aria-busy="true"
      {...props}
    >
      <CardContent solo>
        <span className="sr-only">{label}</span>
        <div data-slot="service-launcher-skeleton-heading">
          <span className="ui-skeleton-block" data-slot="service-launcher-skeleton-icon" />
          <span className="ui-skeleton-block" data-slot="service-launcher-skeleton-title" />
          <span className="ui-skeleton-block" data-slot="service-launcher-skeleton-status" />
        </div>
        <span className="ui-skeleton-block" data-slot="service-launcher-skeleton-description" />
        <span className="ui-skeleton-block" data-slot="service-launcher-skeleton-metadata" />
        <span className="ui-skeleton-block" data-slot="service-launcher-skeleton-action" />
      </CardContent>
    </Card>
  );
}
