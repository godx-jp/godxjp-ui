import { forwardRef, type ComponentProps, type ReactNode } from "react";
import { cn } from "../cn";

/**
 * Card — surface container. 100% mapped to the dxs-kintai design canon
 * (`design-handoff/ui-system/dxs-kintai-design-system/project/preview/
 * comp-card.html`).
 *
 * One atom (`.card`, 1px border, 6px radius, `var(--card)` bg,
 * no shadow at rest) + four orthogonal prop axes:
 *
 *   - `padding` — tight / default / cozy / none (12 / 16 / 20 / 0)
 *   - `tone`    — default / muted / outline-only
 *   - `accent`  — primary / success / warning / attention / info /
 *                 destructive / featured (3px left edge or full ring)
 *   - `hoverable`
 *
 * Plus a `band` prop for the H11 color-strip variant (4px strip
 * above the header).
 *
 * Header shape auto-detects from the slot props:
 *
 *   - `kicker` set                          → `.ch-kicker` (3-tier
 *                                              column: kicker / title /
 *                                              subtitle)
 *   - `subtitle` set, no `kicker`           → `.ch-stack` (2-tier
 *                                              column: title /
 *                                              subtitle)
 *   - `meta` set, no `subtitle`/`kicker`    → `.ch` row with meta
 *                                              right-aligned
 *                                              (margin-left: auto)
 *   - just `title`                          → `.ch` row, title only
 *
 * `extra` always renders right-aligned at the end of the header row
 * (works with all three shapes). Used for action buttons + tags
 * (H4/H5/H7 patterns).
 *
 * For flush cards with internal sections (H1-H17 variants), use
 * `padding="none"` + the compositional atoms <CardHeader> /
 * <CardBody> / <CardFooter>.
 */

// ─── Prop axes ─────────────────────────────────────────────────────

export type CardPadding = "tight" | "default" | "cozy" | "none";
export type CardTone = "default" | "muted" | "outline-only";
export type CardAccent =
  | "primary"
  | "success"
  | "warning"
  | "attention"
  | "info"
  | "destructive"
  | "featured";
export type CardBand =
  | "primary"
  | "success"
  | "warning"
  | "attention"
  | "info"
  | "destructive"
  | "gradient"
  | "dotted";

export interface CardProps extends Omit<ComponentProps<"div">, "title"> {
  /** Card title — H1/H2/H3/H12 `<span class="t">…</span>`. */
  title?: ReactNode;
  /** Sub-text stacked BELOW the title (H2 `.ch-stack .sub`). */
  subtitle?: ReactNode;
  /** Small uppercase label ABOVE the title (H12 `.ch-kicker .k`). */
  kicker?: ReactNode;
  /** Right-aligned secondary text (H3 `.ch .sub` with margin-left:auto). */
  meta?: ReactNode;
  /** Right-aligned action slot — buttons, tags, status indicators. */
  extra?: ReactNode;
  /** Color strip above the header (4px, semantic). */
  band?: CardBand;
  /** Footer slot rendered with top divider + muted secondary tint. */
  footer?: ReactNode;
  /** Right-aligned action bar footer — no divider tint, transparent bg. */
  actions?: ReactNode;
  /** Padding density. */
  padding?: CardPadding;
  /** Surface tone. */
  tone?: CardTone;
  /** Edge accent (3px left edge, or full --primary ring for `featured`). */
  accent?: CardAccent;
  /** Hover affordance — border + shadow lift. */
  hoverable?: boolean;
}

const PADDING_CLASS: Record<CardPadding, string> = {
  tight: "card-padding-tight",
  default: "",
  cozy: "card-padding-cozy",
  none: "card-padding-none",
};

const TONE_CLASS: Record<CardTone, string> = {
  default: "",
  muted: "card-tone-muted",
  "outline-only": "card-tone-outline",
};

const ACCENT_CLASS: Record<CardAccent, string> = {
  primary: "card-accent-primary",
  success: "card-accent-success",
  warning: "card-accent-warning",
  attention: "card-accent-attention",
  info: "card-accent-info",
  destructive: "card-accent-destructive",
  featured: "card-accent-featured",
};

const BAND_CLASS: Record<CardBand, string> = {
  primary: "card-band-primary",
  success: "card-band-success",
  warning: "card-band-warning",
  attention: "card-band-attention",
  info: "card-band-info",
  destructive: "card-band-destructive",
  gradient: "card-band-gradient",
  dotted: "card-band-dotted",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  {
    title,
    subtitle,
    kicker,
    meta,
    extra,
    band,
    footer,
    actions,
    padding = "default",
    tone = "default",
    accent,
    hoverable,
    className,
    children,
    ...rest
  },
  ref,
) {
  const hasHeader =
    title !== undefined ||
    subtitle !== undefined ||
    kicker !== undefined ||
    meta !== undefined ||
    extra !== undefined;
  const flush = padding === "none";

  return (
    <div
      ref={ref}
      className={cn(
        "card",
        PADDING_CLASS[padding],
        TONE_CLASS[tone],
        accent && ACCENT_CLASS[accent],
        hoverable && "card-hoverable",
        className,
      )}
      {...rest}
    >
      {band && <div className={cn("card-band", BAND_CLASS[band])} aria-hidden />}
      {hasHeader && (
        <CardHeader
          title={title}
          subtitle={subtitle}
          kicker={kicker}
          meta={meta}
          extra={extra}
          block={flush}
        />
      )}
      {flush ? children : <div className="card-body">{children}</div>}
      {footer !== undefined && (
        <CardFooter block={flush}>{footer}</CardFooter>
      )}
      {actions !== undefined && (
        <CardFooter block={flush} actions>
          {actions}
        </CardFooter>
      )}
    </div>
  );
});

// ─── Compositional atoms (for flush / padding="none" cards) ──────────

export interface CardHeaderProps extends Omit<ComponentProps<"div">, "title"> {
  title?: ReactNode;
  subtitle?: ReactNode;
  kicker?: ReactNode;
  meta?: ReactNode;
  extra?: ReactNode;
  /** When `true`, the header pads itself + draws a bottom divider —
   * the `.ch` / `.ch-stack` / `.ch-kicker` block used inside flush
   * cards. When `false` (default), the header is the same shape but
   * sits inside the parent card's padding (no extra divider). */
  block?: boolean;
}

export function CardHeader({
  title,
  subtitle,
  kicker,
  meta,
  extra,
  block = false,
  className,
  children,
  ...rest
}: CardHeaderProps) {
  // Header shape selector per design canon:
  //   kicker present                → `.ch-kicker` (3-tier column)
  //   subtitle present, no kicker   → `.ch-stack`  (2-tier column)
  //   else                          → `.ch`        (row with optional meta-right)
  const shape: "kicker" | "stack" | "row" =
    kicker !== undefined
      ? "kicker"
      : subtitle !== undefined
        ? "stack"
        : "row";
  const shapeClass =
    shape === "kicker"
      ? "card-header-kicker"
      : shape === "stack"
        ? "card-header-stack"
        : "card-header-row";

  return (
    <div
      className={cn(
        shapeClass,
        block && "card-header-block",
        className,
      )}
      {...rest}
    >
      {shape === "kicker" && (
        <>
          {kicker !== undefined && (
            <span className="card-kicker">{kicker}</span>
          )}
          {title !== undefined && <h3 className="card-title">{title}</h3>}
          {subtitle !== undefined && (
            <span className="card-subtitle">{subtitle}</span>
          )}
        </>
      )}
      {shape === "stack" && (
        <>
          {title !== undefined && <h3 className="card-title">{title}</h3>}
          {subtitle !== undefined && (
            <span className="card-subtitle">{subtitle}</span>
          )}
        </>
      )}
      {shape === "row" && (
        <>
          {title !== undefined && <h3 className="card-title">{title}</h3>}
          {meta !== undefined && <span className="card-meta">{meta}</span>}
        </>
      )}
      {children}
      {extra !== undefined && (
        <span className="card-header-extra">{extra}</span>
      )}
    </div>
  );
}

export interface CardBodyProps extends ComponentProps<"div"> {
  /** When `true`, the body pads itself — the `.cb` block in flush cards. */
  block?: boolean;
}

export function CardBody({
  block = false,
  className,
  ...rest
}: CardBodyProps) {
  return (
    <div
      className={cn(block ? "card-body-block" : "card-body", className)}
      {...rest}
    />
  );
}

export interface CardFooterProps extends ComponentProps<"div"> {
  /** Right-aligned action bar, transparent bg, no muted tint. */
  actions?: boolean;
  /** When `true`, the footer pads itself + draws a top divider — the
   * `.cf` block in flush cards. */
  block?: boolean;
}

export function CardFooter({
  actions,
  block = false,
  className,
  ...rest
}: CardFooterProps) {
  return (
    <div
      className={cn(
        block ? "card-footer-block" : "card-footer-inline",
        actions && "card-footer-actions",
        className,
      )}
      {...rest}
    />
  );
}

// ─── Direct-control atoms (when the slot API doesn't fit) ───────────

export function CardTitle({ className, ...rest }: ComponentProps<"h3">) {
  return <h3 className={cn("card-title", className)} {...rest} />;
}

export interface CardSubtitleProps extends ComponentProps<"span"> {
  children?: ReactNode;
}
export function CardSubtitle({ className, ...rest }: CardSubtitleProps) {
  return <span className={cn("card-subtitle", className)} {...rest} />;
}

// Legacy alias — older code imports CardContent.
export const CardContent = CardBody;
