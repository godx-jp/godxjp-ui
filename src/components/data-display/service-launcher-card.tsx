import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { Plus } from "lucide-react";

import { cn } from "../../lib/utils";
import type { HeadingLevelProp, ToneProp } from "../../props/vocabulary";
import { Badge } from "./badge";
import { Card } from "./card";

export type ServiceLauncherStatusTone = Extract<
  ToneProp,
  "success" | "warning" | "destructive" | "info" | "neutral" | "muted"
>;

export interface ServiceLauncherCardProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "title"
> {
  icon: LucideIcon;
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
 * Token-owned launcher surface for an organization-scoped downstream service.
 * Consumers supply real status, metadata and actions; access is never inferred.
 */
export const ServiceLauncherCard = React.forwardRef<HTMLDivElement, ServiceLauncherCardProps>(
  (
    {
      className,
      icon: Icon,
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

    return (
      <Card
        ref={ref}
        density="tight"
        className={cn("ui-service-launcher-card", className)}
        data-service-launcher=""
        {...props}
      >
        <div data-slot="service-launcher-heading">
          <span data-slot="service-launcher-icon" aria-hidden="true">
            <Icon />
          </span>
          <Heading data-slot="service-launcher-title">{title}</Heading>
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
        <div data-slot="service-launcher-action">{action}</div>
        {disabledReason != null ? (
          <div data-slot="service-launcher-disabled-reason">{disabledReason}</div>
        ) : null}
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
      <Icon data-slot="service-catalog-icon" aria-hidden="true" />
      <div data-slot="service-catalog-title">{title}</div>
      <div data-slot="service-catalog-action">{action}</div>
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
      role="status"
      aria-label={label}
      aria-busy="true"
      {...props}
    >
      <div data-slot="service-launcher-skeleton-heading">
        <span className="ui-skeleton-block" data-slot="service-launcher-skeleton-icon" />
        <span className="ui-skeleton-block" data-slot="service-launcher-skeleton-title" />
        <span className="ui-skeleton-block" data-slot="service-launcher-skeleton-status" />
      </div>
      <span className="ui-skeleton-block" data-slot="service-launcher-skeleton-description" />
      <span className="ui-skeleton-block" data-slot="service-launcher-skeleton-metadata" />
      <span className="ui-skeleton-block" data-slot="service-launcher-skeleton-action" />
    </Card>
  );
}
