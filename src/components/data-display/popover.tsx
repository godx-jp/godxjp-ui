import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "../../lib/utils";
import type { FlushProp } from "../../props/vocabulary";

export function Popover(props: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

export function PopoverTrigger(props: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

export function PopoverAnchor(props: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />;
}

/**
 * The panel's CONTENT owns its inset — a Command list, a menu or a table that must run edge to
 * edge and draw its own separators across the full width. The popover drops its own padding by
 * zeroing `--popover-space-inset` ON THE PANEL, so the inset stays one token (a service that
 * retunes `--popover-space-inset` still owns every padded popover) and no consumer has to reach
 * for a zero-padding utility, which no service theme can reach (gh#354).
 */
type PopoverContentFlush = { flush?: FlushProp };

export const PopoverContent = React.forwardRef<
  React.ComponentRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> & PopoverContentFlush
>(({ className, align = "center", sideOffset = 4, flush, style, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      data-slot="popover-content"
      data-flush={flush ? "" : undefined}
      align={align}
      sideOffset={sideOffset}
      style={flush ? ({ ...style, "--popover-space-inset": "0" } as React.CSSProperties) : style}
      className={cn(
        "ui-popover-content origin-[var(--radix-popover-content-transform-origin)]",
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        "data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2",
        "data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2",
        className,
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export const PopoverHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div data-slot="popover-header" className={cn("ui-popover-header", className)} {...props} />
);

export const PopoverTitle = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div data-slot="popover-title" className={cn("font-medium", className)} {...props} />
);

export const PopoverDescription = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p
    data-slot="popover-description"
    className={cn("text-muted-foreground", className)}
    {...props}
  />
);
