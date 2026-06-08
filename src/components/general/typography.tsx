import * as React from "react";

import { cn } from "../../lib/utils";
import type { HeadingProp, TextProp } from "../../props/components/general.prop";

export type {
  TextProp,
  TextProp as TextProps,
  HeadingProp,
  HeadingProp as HeadingProps,
} from "../../props/components/general.prop";

/**
 * Text — the typographic primitive. Use it INSTEAD of a hand-rolled `<span className="text-[13px]
 * font-medium text-muted-foreground">`. `size` only accepts steps of the golden-ratio type scale
 * (never an arbitrary px), `tone` maps to semantic foreground tokens, `weight` respects the system's
 * 2-weight scale. Fully token-driven via `[data-slot="text"]` rules in text-layout.css.
 */
export const Text = React.forwardRef<HTMLElement, TextProp>(
  (
    {
      as = "span",
      size = "sm",
      tone = "default",
      weight = "regular",
      align,
      truncate,
      tabular,
      mono,
      className,
      ...props
    },
    ref,
  ) =>
    React.createElement(as, {
      ref,
      "data-slot": "text",
      "data-size": size,
      "data-tone": tone,
      "data-weight": weight,
      "data-align": align,
      "data-truncate": truncate ? "" : undefined,
      "data-tabular": tabular ? "" : undefined,
      "data-mono": mono ? "" : undefined,
      className: cn("ui-text", className),
      ...props,
    }),
);
Text.displayName = "Text";

/**
 * Heading — h1..h4 sized from the `--heading-h*` tokens. `level` sets both the size token and the
 * semantic element; override the rendered element with `as` (e.g. a visual h2 that is a real <h1>).
 */
export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProp>(
  ({ level = 2, as, tone = "default", align, truncate, className, ...props }, ref) =>
    React.createElement(as ?? `h${level}`, {
      ref,
      "data-slot": "heading",
      "data-level": level,
      "data-tone": tone,
      "data-align": align,
      "data-truncate": truncate ? "" : undefined,
      className: cn("ui-heading", className),
      ...props,
    }),
);
Heading.displayName = "Heading";
