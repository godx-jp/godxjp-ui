import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ElementRef,
  type ReactNode,
} from "react";
import { cn } from "../cn";

/**
 * Tooltip — Radix-backed floating label anchored to a trigger.
 *
 * Two surfaces:
 *   • Compositional — `<TooltipProvider><Tooltip><TooltipTrigger>...
 *     <TooltipContent>...</TooltipContent></Tooltip></TooltipProvider>`
 *     mirrors Radix verbatim for full control.
 *   • Convenience  — `<SimpleTooltip title="…">child</SimpleTooltip>`
 *     wires provider + root + trigger (asChild) + content for the
 *     common case.
 *
 * Styled via the canonical `.tooltip-content` class from
 * `src/styles/shell/35-badge-tag-misc.css` (cardinal rule 21 —
 * reads tokens, honours every axis).
 */

export const TooltipProvider = TooltipPrimitive.Provider;
export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;
export const TooltipPortal = TooltipPrimitive.Portal;

export interface TooltipContentProps
  extends ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> {}

export const TooltipContent = forwardRef<
  ElementRef<typeof TooltipPrimitive.Content>,
  TooltipContentProps
>(function TooltipContent({ className, sideOffset = 4, ...rest }, ref) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn("tooltip-content", className)}
        {...rest}
      />
    </TooltipPrimitive.Portal>
  );
});

export interface SimpleTooltipProps {
  /** Tooltip text / content. */
  title: ReactNode;
  /** Trigger element. */
  children: ReactNode;
  /** Anchor side per §23.B `placement` vocabulary. */
  placement?: "top" | "right" | "bottom" | "left";
  /** Open / close delay in ms. */
  delayDuration?: number;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function SimpleTooltip({
  title,
  children,
  placement = "top",
  delayDuration = 200,
  open,
  defaultOpen,
  onOpenChange,
}: SimpleTooltipProps) {
  return (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={onOpenChange}
      >
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side={placement}>{title}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
