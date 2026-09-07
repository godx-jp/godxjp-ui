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
 * font-medium text-muted-foreground">`.
 */
export const Text = React.forwardRef<HTMLElement, TextProp>(
  (
    {
      as = "span",
      asChild = false,
      size = "sm",
      // `link` is an affordance, not a colour: it only moves the DEFAULT tone, so
      // `link tone="destructive"` is a destructive link rather than an argument between two rules.
      tone,
      weight = "regular",
      align,
      truncate,
      clamp,
      tabular,
      mono,
      link,
      className,
      style,
      children,
      ...props
    },
    ref,
  ) => {
    // `clamp` is a max line count: integer ≥ 1. Anything else is ignored (dev builds warn).
    const clampLines =
      typeof clamp === "number" && Number.isFinite(clamp) && clamp >= 1
        ? Math.floor(clamp)
        : undefined;
    if (typeof process !== "undefined" && process.env?.NODE_ENV !== "production") {
      if (clamp !== undefined && clampLines === undefined) {
        console.warn(
          `Text: \`clamp\` must be a finite number ≥ 1 (got ${String(clamp)}); ignored.`,
        );
      }
      if (truncate && clampLines !== undefined) {
        // Mutually exclusive by contract: clamp (multi-line) wins over truncate (single-line).
        console.warn(
          "Text: `truncate` and `clamp` are mutually exclusive — `clamp` takes precedence; drop `truncate`.",
        );
      }
    }
    const typography = {
      "data-slot": "text",
      "data-size": size,
      "data-tone": tone ?? (link ? "primary" : "default"),
      "data-link": link ? "" : undefined,
      "data-weight": weight,
      "data-align": align,
      "data-truncate": truncate && clampLines === undefined ? "" : undefined,
      "data-clamp": clampLines !== undefined ? "" : undefined,
      style:
        clampLines !== undefined
          ? ({ ...style, "--text-clamp": clampLines } as React.CSSProperties)
          : style,
      "data-tabular": tabular ? "" : undefined,
      "data-mono": mono ? "" : undefined,
      className: cn("ui-text", className),
      ...props,
    } as Record<string, unknown>;

    // `asChild` by cloneElement, NOT by Radix Slot.
    //
    // Slot is the house pattern and it is the right one for a Button, whose asChild has to chain
    // event handlers onto a child that already has its own. Text has no handlers of its own — it
    // is type, tone and truncation — so all Slot would add here is its import, and that import is
    // what the cost is: `scripts/add-use-client.mjs` treats `@radix-ui/react-slot` as a client
    // dependency, so pulling it in would stamp "use client" onto this module and take Text and
    // Heading out of the set an RSC can render. `use-client-directive.test.ts` asserts they are in
    // it, and it caught exactly that.
    //
    // Slot's merge order, reproduced: our props first, the child's own on top (so the child keeps
    // its `href`), with className concatenated rather than replaced.
    if (asChild) {
      const child = React.Children.only(children) as React.ReactElement<{
        className?: string;
      }>;
      return React.cloneElement(child, {
        ...typography,
        ...child.props,
        ref,
        className: cn(typography.className as string, child.props.className),
      } as never);
    }

    return React.createElement(as, { ref, ...typography }, children);
  },
);
Text.displayName = "Text";

/**
 * Heading — h1..h4 sized from the `--heading-h*` tokens. `level` sets both the size token and the
 * semantic element; override the rendered element with `as` (e.g. a visual h2 that is a real <h1>).
 */
export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProp>(
  (
    { level = 2, as, tone = "default", align, truncate, weight = "medium", className, ...props },
    ref,
  ) =>
    React.createElement(as ?? `h${level}`, {
      ref,
      "data-slot": "heading",
      "data-level": level,
      "data-tone": tone,
      "data-align": align,
      "data-weight": weight,
      "data-truncate": truncate ? "" : undefined,
      className: cn("ui-heading", className),
      ...props,
    }),
);
Heading.displayName = "Heading";
