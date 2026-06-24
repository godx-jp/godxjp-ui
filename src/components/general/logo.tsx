import * as React from "react";
import { cva } from "class-variance-authority";

import { cn } from "../../lib/utils";
import type { ShapeProp } from "../../props/vocabulary";

// Brand-mark box. Fill is the brand `--primary` (a service rethemes it there); the box size comes
// from the `size` prop (system sizing, never a hand-rolled literal) and the corner from the
// `--logo-radius` token. Bold lettermark by default; pass a custom SVG/image via `glyph`.
const logoVariants = cva(
  "inline-flex shrink-0 select-none items-center justify-center bg-primary font-bold leading-none text-primary-foreground [&_svg]:size-[60%]",
  {
    variants: {
      size: {
        xs: "size-[var(--logo-size-xs)] text-xs",
        sm: "size-[var(--logo-size-sm)] text-sm",
        md: "size-[var(--logo-size)] text-base",
        lg: "size-[var(--logo-size-lg)] text-lg",
      },
      shape: {
        default: "rounded-[var(--logo-radius)]",
        pill: "rounded-[var(--radius-pill)]",
        sharp: "rounded-[var(--radius-sharp)]",
      },
    },
    defaultVariants: { size: "md", shape: "default" },
  },
);

export interface LogoProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  /**
   * Accessible product name. When set, the mark exposes `role="img"` + `aria-label` (use this when
   * the Logo IS the accessible name — e.g. a home link). When omitted the mark is `aria-hidden`
   * (decorative — assume an adjacent wordmark provides the name).
   */
  label?: string;
  /** Box size — maps to the square size scale. Default `md`. */
  size?: "xs" | "sm" | "md" | "lg";
  /** Corner shape — `default` (--logo-radius) · `pill` (fully rounded) · `sharp` (square). */
  shape?: ShapeProp;
  /** The mark — a short lettermark string (default `"G"`) or a custom SVG/image node. */
  glyph?: React.ReactNode;
}

/**
 * Logo — the product brand-mark primitive. Use it INSTEAD of a hand-rolled
 * `<span className="flex size-[2rem] rounded-md bg-primary font-bold …">g</span>` (typography-on-span,
 * literal size/radius — cardinal rules #42/#46). Renders the lettermark (or a custom SVG) in a
 * tokenized box that a service rethemes via `--primary` (fill) and `--logo-radius` (corner).
 */
export const Logo = React.forwardRef<HTMLSpanElement, LogoProps>(
  ({ glyph = "G", label, size, shape, className, ...props }, ref) => (
    <span
      ref={ref}
      data-slot="logo"
      data-size={size ?? "md"}
      data-shape={shape ?? "default"}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn(logoVariants({ size, shape }), className)}
      {...props}
    >
      {glyph}
    </span>
  ),
);
Logo.displayName = "Logo";

export { logoVariants };
