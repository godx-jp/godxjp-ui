import type { ComponentProps, ReactNode } from "react";
import { cn } from "./cn";

/**
 * Card — surface container with Ant-Design-shaped prop API.
 *
 * Mirrors the dxs-kintai design canon (handoff
 * `design-handoff/ui-system/dxs-kintai-design-system/project/preview/
 * comp-card.html`): one atom (`.card`, 1px border, 6px radius,
 * `var(--card)` bg, no shadow at rest) + four orthogonal modifiers:
 *
 *   - `padding`  — tight (12) / default (16) / cozy (20) / none (0).
 *   - `tone`     — default / muted / outline-only.
 *   - `accent`   — undefined / primary / success / warning /
 *                  attention / info / destructive / featured.
 *   - `hoverable`— adds a border + shadow lift affordance.
 *
 * Per cardinal rule 21 every modifier reads from semantic tokens,
 * so theme / accent / density / font-size axes flow through.
 *
 * Two consumption shapes:
 *
 *   1) Slot props (the common case):
 *
 *      <Card title="Pull requests" subtitle="Open this week"
 *            extra={<a>More</a>} footer={<Button>View all</Button>}
 *            accent="primary">
 *        content
 *      </Card>
 *
 *   2) Compositional (when you need full control of header /
 *      body / footer regions, e.g. for `padding="none"` cards
 *      with internal sections):
 *
 *      <Card padding="none">
 *        <CardHeader title="…" extra={…} />
 *        <CardBody>…</CardBody>
 *        <CardFooter actions>
 *          <Button>Save</Button>
 *        </CardFooter>
 *      </Card>
 */
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

export interface CardProps extends Omit<ComponentProps<"div">, "title"> {
  /** Card header title — rendered with CardTitle styles. */
  title?: ReactNode;
  /** Sub-text rendered under the title. */
  subtitle?: ReactNode;
  /** Header right-side slot (typically an action link or button). */
  extra?: ReactNode;
  /** Footer slot rendered with a top divider. */
  footer?: ReactNode;
  /** Footer slot rendered right-aligned, no divider tint (action bar). */
  actions?: ReactNode;
  /** Padding density. Default 16px; tight 12px; cozy 20px; none 0 (use CardHeader/Body/Footer for internal sections). */
  padding?: CardPadding;
  /** Surface tone. `muted` paints `var(--secondary)` bg; `outline-only` keeps the border but drops the background. */
  tone?: CardTone;
  /** Edge accent. `primary` / `success` / `warning` / `attention` / `info` / `destructive` paints a 3px left edge; `featured` rings the entire card with `--primary`. */
  accent?: CardAccent;
  /** Hover affordance — border lift + shadow + cursor pointer. */
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

export function Card({
  title,
  subtitle,
  extra,
  footer,
  actions,
  padding = "default",
  tone = "default",
  accent,
  hoverable,
  className,
  children,
  ...rest
}: CardProps) {
  const hasHeader =
    title !== undefined || extra !== undefined || subtitle !== undefined;
  const flush = padding === "none";
  return (
    <div
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
      {hasHeader && (
        <CardHeader
          title={title}
          subtitle={subtitle}
          extra={extra}
          block={flush}
        />
      )}
      {flush ? children : <div className="card-body-inline">{children}</div>}
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
}

// ─── Compositional atoms ─────────────────────────────────────────

export interface CardHeaderProps extends Omit<ComponentProps<"div">, "title"> {
  title?: ReactNode;
  subtitle?: ReactNode;
  extra?: ReactNode;
  /** When `true`, the header pads itself + draws a bottom divider —
   * the `.ch` block used inside flush cards (`padding="none"`). When
   * `false` (default), the header is a flex row that sits inside the
   * parent card's padding with a small margin-bottom and NO divider —
   * matches the design canon's padded-card slot pattern. */
  block?: boolean;
}

export function CardHeader({
  title,
  subtitle,
  extra,
  block = false,
  className,
  children,
  ...rest
}: CardHeaderProps) {
  return (
    <div
      className={cn(
        block ? "card-header-block" : "card-header-inline",
        className,
      )}
      {...rest}
    >
      {(title !== undefined || subtitle !== undefined) && (
        <div className="card-header-title-group">
          {title !== undefined && <h3 className="card-title">{title}</h3>}
          {subtitle !== undefined && (
            <p className="card-subtitle">{subtitle}</p>
          )}
        </div>
      )}
      {children}
      {extra !== undefined && (
        <div className="card-header-extra">{extra}</div>
      )}
    </div>
  );
}

export function CardTitle({ className, ...rest }: ComponentProps<"h3">) {
  return <h3 className={cn("card-title", className)} {...rest} />;
}

export interface CardSubtitleProps extends ComponentProps<"p"> {
  children?: ReactNode;
}

export function CardSubtitle({ className, ...rest }: CardSubtitleProps) {
  return <p className={cn("card-subtitle", className)} {...rest} />;
}

export interface CardBodyProps extends ComponentProps<"div"> {
  /** When `true`, the body pads itself (the `.cb` block used in flush cards). */
  block?: boolean;
}

export function CardBody({
  block = false,
  className,
  ...rest
}: CardBodyProps) {
  return (
    <div
      className={cn(block ? "card-body-block" : "card-body-inline", className)}
      {...rest}
    />
  );
}

export interface CardFooterProps extends ComponentProps<"div"> {
  /** Right-aligned action bar, no muted tint, no separator background. */
  actions?: boolean;
  /** When `true`, the footer pads itself + draws a top divider — the
   * `.cf` block used inside flush cards. When `false`, the footer sits
   * inside the parent card's padding with margin-top + top divider. */
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

// Legacy compat — older callers might import CardContent.
// Same render as a un-classed div; new code should use CardBody.
export const CardContent = CardBody;
