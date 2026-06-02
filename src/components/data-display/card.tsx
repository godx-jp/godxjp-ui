import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/utils";

type CardSize = "default" | "compact";
/** Semantic 3px left-edge accent stripe. */
type CardAccent = "primary" | "success" | "warning" | "info" | "attention" | "destructive";
/** Surface fill — plain card, muted band, borderless outline, or emphasized featured ring. */
type CardVariant = "default" | "muted" | "outline" | "featured";
/** Padding density — base 16px · tight 12px · cozy 20px. */
type CardDensity = "tight" | "cozy";

const cardVariants = cva("group/card border", {
  variants: {
    size: {
      default: "",
      compact: "",
    },
  },
  defaultVariants: { size: "default" },
});

export type CardProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof cardVariants> & {
    size?: CardSize;
    accent?: CardAccent;
    variant?: CardVariant;
    density?: CardDensity;
  };

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, size = "default", accent, variant, density, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ size }), className)}
      data-slot="card"
      data-size={size === "compact" ? "compact" : undefined}
      data-accent={accent}
      data-variant={variant && variant !== "default" ? variant : undefined}
      data-density={density}
      {...props}
    />
  ),
);
Card.displayName = "Card";

/** Full-bleed cover media — first child; header below uses section top (φ⁰), not shell. */
export type CardCoverProps = React.HTMLAttributes<HTMLDivElement>;

export const CardCover = React.forwardRef<HTMLDivElement, CardCoverProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} data-slot="card-cover" className={cn("ui-card-cover", className)} {...props} />
  ),
);
CardCover.displayName = "CardCover";

export type CardHeaderProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Muted background + border-bottom — section band (mirror footer `separated`). */
  banded?: boolean;
};

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, banded, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="card-header"
      data-banded={banded ? "" : undefined}
      className={cn(banded && "ui-card-header--banded", className)}
      {...props}
    />
  ),
);
CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => (
  <h3 ref={ref} data-slot="card-title" className={className} {...props}>
    {children}
  </h3>
));
CardTitle.displayName = "CardTitle";

export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} data-slot="card-description" className={className} {...props} />
));
CardDescription.displayName = "CardDescription";

export type CardContentProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Edge-to-edge body (tables, tabs list). Horizontal padding removed. */
  flush?: boolean;
  /** No gap after header — pair with tabs / flush toolbar. */
  tight?: boolean;
  /** No header above — top padding matches card shell. */
  solo?: boolean;
};

export const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, flush, tight, solo, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="card-content"
      data-flush={flush ? "" : undefined}
      data-tight={tight ? "" : undefined}
      data-solo={solo ? "" : undefined}
      className={className}
      {...props}
    />
  ),
);
CardContent.displayName = "CardContent";

export type CardFooterProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Top border + symmetric action band — form Save/Cancel, table summary. */
  separated?: boolean;
  /** Full-bleed footer (Ant Design `actions` bar). */
  flush?: boolean;
};

export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, separated, flush, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="card-footer"
      data-separated={separated ? "" : undefined}
      data-flush={flush ? "" : undefined}
      className={className}
      {...props}
    />
  ),
);
CardFooter.displayName = "CardFooter";

export type StatCardProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof cardVariants> & {
    label: React.ReactNode;
    value: React.ReactNode;
    hint?: React.ReactNode;
    /** Optional compact trend text beside the value. Avoid badge-like deltas. */
    delta?: React.ReactNode;
    /** KPI layout: stacked = design default, inline = label left / value right. */
    layout?: "stacked" | "inline";
    /** Align the metric group. */
    align?: "start" | "end";
    /** Flip delta semantics for metrics where lower is better. */
    inverse?: boolean;
  };

function getDeltaTone(
  delta: React.ReactNode,
  inverse: boolean,
): "positive" | "negative" | undefined {
  const text = typeof delta === "string" || typeof delta === "number" ? String(delta).trim() : "";
  const sign = text.match(/^[+\-−]/)?.[0];

  if (!sign) return undefined;

  const isPositive = sign === "+";
  const semanticPositive = inverse ? !isPositive : isPositive;

  return semanticPositive ? "positive" : "negative";
}

/** KPI / stat tile — token-driven layout aligned to dashboard KPI cards. */
export function StatCard({
  label,
  value,
  hint,
  delta,
  layout = "stacked",
  align = "start",
  inverse = false,
  className,
  size = "compact",
  ...props
}: StatCardProps) {
  const deltaTone = getDeltaTone(delta, inverse);

  return (
    <Card
      size={size ?? "compact"}
      className={cn("ui-stat-card", className)}
      data-stat-card=""
      data-stat-layout={layout}
      data-stat-align={align}
      {...props}
    >
      <div data-slot="stat-card-body">
        <div data-slot="stat-card-label">{label}</div>
        {hint && layout === "inline" ? <div data-slot="stat-card-hint">{hint}</div> : null}
      </div>
      <div>
        <div data-slot="stat-card-value-row">
          <span data-slot="stat-card-value">{value}</span>
          {delta ? (
            <span
              data-slot="stat-card-delta"
              data-delta-tone={deltaTone}
              className={cn(
                deltaTone === "positive" && "text-success",
                deltaTone === "negative" && "text-destructive",
              )}
            >
              {delta}
            </span>
          ) : null}
        </div>
        {hint && layout !== "inline" ? <div data-slot="stat-card-hint">{hint}</div> : null}
      </div>
    </Card>
  );
}

/** Header actions slot — pair with `CardHeader className="flex flex-row …"`. */
export const CardAction = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} data-slot="card-action" className={className} {...props} />
  ),
);
CardAction.displayName = "CardAction";
