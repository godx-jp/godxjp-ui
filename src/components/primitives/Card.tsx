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
  const headerInline = padding !== "none";
  const bodyInline = padding !== "none";
  const footerInline = padding !== "none";
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
          inline={headerInline}
        />
      )}
      {headerInline && bodyInline ? (
        <div className="card-body">{children}</div>
      ) : (
        children
      )}
      {footer !== undefined && (
        <CardFooter inline={footerInline}>{footer}</CardFooter>
      )}
      {actions !== undefined && (
        <CardFooter inline={footerInline} actions>
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
  /** Internal flag — when true, the header is wrapped in the parent's
   * padding; set to `false` if the parent Card uses `padding="none"`
   * and the header lives in an explicit `.card-header-block` region. */
  inline?: boolean;
}

export function CardHeader({
  title,
  subtitle,
  extra,
  inline = false,
  className,
  children,
  ...rest
}: CardHeaderProps) {
  return (
    <div
      className={cn(
        "card-header",
        !inline && "card-header-block",
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
  /** When the parent Card uses `padding="none"`, the body pads itself. */
  inline?: boolean;
}

export function CardBody({
  inline = false,
  className,
  ...rest
}: CardBodyProps) {
  return (
    <div
      className={cn("card-body", !inline && "card-body-block", className)}
      {...rest}
    />
  );
}

export interface CardFooterProps extends ComponentProps<"div"> {
  /** Right-aligned action bar, no muted tint. */
  actions?: boolean;
  /** When the parent Card uses `padding="none"`, the footer pads itself. */
  inline?: boolean;
}

export function CardFooter({
  actions,
  inline = false,
  className,
  ...rest
}: CardFooterProps) {
  return (
    <div
      className={cn(
        "card-footer",
        !inline && "card-footer-block",
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
