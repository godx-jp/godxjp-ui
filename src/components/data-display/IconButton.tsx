import { Slot } from "@radix-ui/react-slot";
import { forwardRef, useEffect, useRef } from "react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "../cn";

/**
 * IconButton — square button with icon-only content.
 *
 * Maps onto the canonical `.icon-btn` family in shell.css (matches the
 * `K:comp-pageheader.html` reference at lines 14–17): 32 × 32 box,
 * `--radius-sm`, hairline border + `--background` fill by default
 * (`secondary` variant), with `ghost` (transparent / borderless) and
 * `primary` (filled brand) modifiers.
 *
 * Sizes:
 *   - `sm`      → 28 px (compact toolbars)
 *   - `default` → 32 px (page-header default)
 *   - `lg`      → 36 px (touch / hero contexts)
 *
 * Accessible-name requirement: an icon-only control MUST carry a
 * discoverable name via one of `aria-label` / `aria-labelledby` /
 * `title`. React's HTML types make these always optional, so the
 * component instead emits a `console.warn` in development when none
 * is supplied. Production builds (`process.env.NODE_ENV === "production"`)
 * skip the check.
 *
 * @example
 *   <IconButton aria-label="戻る"><ArrowLeft size={14} /></IconButton>
 *   <IconButton variant="ghost" aria-label="More"><MoreHorizontal size={16} /></IconButton>
 *   <IconButton variant="primary" size="lg" aria-label="Save"><Check size={18} /></IconButton>
 */

import type { IconSizeProp } from "../../props";

export type IconButtonVariant = "secondary" | "ghost" | "primary";
/** Alias of the shared `IconSizeProp` (`sm | md | lg`) — IconButton is
 *  icon-symbol shaped, same axis as Spinner. Renamed `"default"` → `"md"`
 *  so the verb stays consistent across icon-only primitives. */
export type IconButtonSize = IconSizeProp;

export interface IconButtonProps extends Omit<
  ComponentProps<"button">,
  "children"
> {
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  asChild?: boolean;
  children?: ReactNode;
}

const VARIANT_CLASS: Record<IconButtonVariant, string> = {
  secondary: "icon-btn-secondary",
  ghost: "icon-btn-ghost",
  primary: "icon-btn-primary",
};

const SIZE_CLASS: Record<IconButtonSize, string> = {
  sm: "icon-btn-sm",
  md: "",
  lg: "icon-btn-lg",
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    {
      variant = "secondary",
      size = "md",
      asChild = false,
      className,
      type = "button",
      children,
      ...rest
    },
    ref,
  ) {
    // Dev-only accessible-name check. Stripped from production bundles
    // because `process.env.NODE_ENV !== "production"` collapses to
    // `false` in production builds and the dead branch is tree-shaken.
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const warnedRef = useRef(false);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      if (process.env.NODE_ENV === "production") return;
      if (warnedRef.current) return;
      const props = rest as Record<string, unknown>;
      const ariaLabel = props["aria-label"];
      const ariaLabelledBy = props["aria-labelledby"];
      const title = props.title;
      const hasName =
        (typeof ariaLabel === "string" && ariaLabel.trim() !== "") ||
        (typeof ariaLabelledBy === "string" && ariaLabelledBy.trim() !== "") ||
        (typeof title === "string" && title.trim() !== "");
      if (!hasName) {
        warnedRef.current = true;
        // eslint-disable-next-line no-console
        console.warn(
          "[@godxjp/ui] <IconButton> is missing an accessible name. " +
            "Pass `aria-label`, `aria-labelledby`, or `title` so " +
            "screen-reader users can identify the control. " +
            "See docs/reference/data-display/IconButton.md#accessibility.",
        );
      }
    }, [rest]);

    const Component = asChild ? Slot : "button";
    return (
      <Component
        ref={ref}
        type={asChild ? undefined : type}
        className={cn(
          "icon-btn",
          VARIANT_CLASS[variant],
          SIZE_CLASS[size],
          className,
        )}
        {...rest}
      >
        {children}
      </Component>
    );
  },
);
