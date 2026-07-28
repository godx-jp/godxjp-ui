import * as React from "react";

import { cn } from "../../lib/utils";

export type LogoSize = "xs" | "sm" | "md" | "lg";
export type LogoTone = "primary" | "success";

export interface LogoProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  /**
   * The brand glyph — a short mark (a letter/initials, default `"g"`) or a custom node such as an
   * inline `<svg>`. Keep it to 1–2 glyphs; the box is square and centres its content.
   */
  glyph?: React.ReactNode;
  /** Box size tier (tokenised). Default `"md"` (1.75rem). */
  size?: LogoSize;
  /**
   * Semantic fill role. `"success"` provides the canonical green identity mark without changing
   * the application's primary action colour. Default `"primary"` preserves existing behaviour.
   */
  tone?: LogoTone;
  /**
   * Accessible name for the mark. When set, the logo is exposed to assistive tech as an image with
   * this name; when omitted the mark is decorative (`aria-hidden`) — the correct default when a
   * readable wordmark sits beside it.
   */
  label?: string;
}

/**
 * Logo — the product brand-mark box: a glyph on the primary fill. Use it INSTEAD of hand-rolling a
 * bare span with a fixed square size, a literal radius, and `bg-primary` + type utilities in shell
 * headers, auth screens, and topbars — that repeats literal size/radius and puts type utilities on
 * a bare span (rules #45/#46). Size, radius, and per-tier font-size are tokens; the fill reads the
 * primary role, so a re-themed `--primary` re-tints the mark automatically. Pair with a wordmark for
 * the full lockup (leave `label` unset so the mark stays decorative and the wordmark carries the
 * accessible name).
 */
export const Logo = React.forwardRef<HTMLSpanElement, LogoProps>(
  ({ glyph = "g", size = "md", tone = "primary", label, className, ...props }, ref) => (
    <span
      ref={ref}
      data-slot="logo"
      data-size={size}
      data-tone={tone}
      className={cn("ui-logo", className)}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      {...props}
    >
      {glyph}
    </span>
  ),
);
Logo.displayName = "Logo";
