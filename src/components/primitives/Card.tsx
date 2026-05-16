import type { ComponentProps, ReactNode } from "react";
import { cn } from "./cn";

/**
 * Card — surface container with Ant-Design-shaped prop API.
 *
 * Common pattern:
 *
 *   <Card title="Pull requests" extra={<a>More</a>}>
 *     content…
 *   </Card>
 *
 * Or, when finer control over the header is wanted, the legacy
 * compositional API still works:
 *
 *   <Card>
 *     <CardHeader>
 *       <CardTitle>Pull requests</CardTitle>
 *       <CardSubtitle>Open / merged this week</CardSubtitle>
 *     </CardHeader>
 *     <CardContent>…</CardContent>
 *   </Card>
 */
export type CardSize = "small" | "default";
export type CardVariant = "outlined" | "filled" | "borderless";

export interface CardProps extends Omit<ComponentProps<"div">, "title"> {
  /** Card header title — rendered with CardTitle styles. */
  title?: ReactNode;
  /** Header right-side slot (typically an action link or button). */
  extra?: ReactNode;
  /** Sub-text under the title. */
  subtitle?: ReactNode;
  /** Footer slot — separated by a divider. */
  actions?: ReactNode;
  /** Density step. `small` shrinks padding to compact. */
  size?: CardSize;
  /** Visual variant — `outlined` (default), `filled` (no border, surface-2),
   *  `borderless` (no border, no background). */
  variant?: CardVariant;
  /** Adds a hover affordance + cursor pointer. */
  hoverable?: boolean;
}

const SIZE_CLASS: Record<CardSize, string> = {
  small: "card-size-small",
  default: "",
};

const VARIANT_CLASS: Record<CardVariant, string> = {
  outlined: "",
  filled: "card-variant-filled",
  borderless: "card-variant-borderless",
};

export function Card({
  title,
  subtitle,
  extra,
  actions,
  size = "default",
  variant = "outlined",
  hoverable,
  className,
  children,
  ...rest
}: CardProps) {
  const hasHeader =
    title !== undefined || extra !== undefined || subtitle !== undefined;
  return (
    <div
      className={cn(
        "card",
        SIZE_CLASS[size],
        VARIANT_CLASS[variant],
        hoverable && "card-hoverable",
        className,
      )}
      {...rest}
    >
      {hasHeader && (
        <div className="card-header">
          <div className="card-header-title-group">
            {title !== undefined && <h3 className="card-title">{title}</h3>}
            {subtitle !== undefined && (
              <p className="card-subtitle">{subtitle}</p>
            )}
          </div>
          {extra !== undefined && (
            <div className="card-header-extra">{extra}</div>
          )}
        </div>
      )}
      <div className="card-body">{children}</div>
      {actions !== undefined && <div className="card-actions">{actions}</div>}
    </div>
  );
}

export function CardHeader({ className, ...rest }: ComponentProps<"div">) {
  return <div className={cn("card-header", className)} {...rest} />;
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

export function CardContent({ className, ...rest }: ComponentProps<"div">) {
  return <div className={className} {...rest} />;
}
