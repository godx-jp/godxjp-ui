import type { ComponentProps, ReactNode } from "react";
import { cn } from "./cn";

/**
 * Empty — Ant-Design empty-state placeholder.
 *
 *   <Empty description="No data" />
 *   <Empty image={<CustomIllustration />} description="Nothing here yet">
 *     <Button>Create one</Button>
 *   </Empty>
 */

export interface EmptyProps extends ComponentProps<"div"> {
  /** Image / illustration / icon at the top. */
  image?: ReactNode;
  /** Text below the image (default `null` — no text). */
  description?: ReactNode;
  /** Action area below description (typically a button). */
  children?: ReactNode;
}

const DEFAULT_IMAGE = (
  <svg
    width="64"
    height="48"
    viewBox="0 0 64 48"
    fill="none"
    role="img"
    aria-hidden="true"
  >
    <ellipse
      cx="32"
      cy="42"
      rx="28"
      ry="3"
      fill="currentColor"
      opacity="0.1"
    />
    <path
      d="M14 18l8-12h20l8 12M14 18v18h36V18M14 18h36"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
      opacity="0.45"
    />
    <path
      d="M22 18l4 6h12l4-6"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
      opacity="0.45"
    />
  </svg>
);

export function Empty({
  image,
  description,
  children,
  className,
  ...rest
}: EmptyProps) {
  return (
    <div className={cn("empty", className)} {...rest}>
      <div className="empty-image">{image ?? DEFAULT_IMAGE}</div>
      {description !== undefined && (
        <p className="empty-description">{description}</p>
      )}
      {children && <div className="empty-footer">{children}</div>}
    </div>
  );
}
