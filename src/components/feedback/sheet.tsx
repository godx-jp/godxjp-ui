import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";
import type { ToneProp, WidthProp } from "../../props/vocabulary";
import { overlayHeaderToneClass } from "./overlay-header-tone";

/** number → px; string → any CSS length. */
const toCssLength = (v: WidthProp): string => (typeof v === "number" ? `${v}px` : v);

export function Sheet(props: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="sheet" {...props} />;
}

export function SheetTrigger(props: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

export function SheetClose(props: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="sheet-close" {...props} />;
}

export function SheetPortal(props: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="sheet-portal" {...props} />;
}

export const SheetOverlay = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    data-slot="sheet-overlay"
    className={cn(
      "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
      className,
    )}
    {...props}
  />
));
SheetOverlay.displayName = DialogPrimitive.Overlay.displayName;

const sheetVariants = cva(
  "fixed z-50 flex flex-col gap-[var(--space-chrome-gap)] bg-background px-[var(--sheet-pad-x)] py-[var(--sheet-pad-y)] shadow-lg transition ease-in-out data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:animate-in data-[state=open]:duration-500",
  {
    variants: {
      // `side` is a deliberately PHYSICAL API (left/right/top/bottom) — a sheet
      // opens from the edge the consumer names, not a locale-flipped one, matching
      // the Radix/shadcn Sheet convention. The physical classes below are intended.
      side: {
        /* rtl-ignore: named physical side */ right:
          "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-md",
        /* rtl-ignore: named physical side */ left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-md",
        top: "inset-x-0 top-0 h-auto border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom:
          "inset-x-0 bottom-0 h-auto border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
      },
    },
    defaultVariants: { side: "right" },
  },
);

interface SheetContentProps
  extends
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof sheetVariants> {
  showCloseButton?: boolean;
  /**
   * Desired panel size for side left/right (Ant Drawer `width`). Caps at the viewport — a small
   * screen still gets a full-width panel (`min(width, 100%)`), it is NOT a hard fixed width. Omit
   * to keep the default `w-3/4 sm:max-w-md`.
   */
  width?: WidthProp;
}

export const SheetContent = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  SheetContentProps
>(
  (
    { side = "right", className, children, showCloseButton = true, width, style, ...props },
    ref,
  ) => {
    const horizontal = side === "left" || side === "right";
    const widthSet = width != null && horizontal;
    const mergedStyle = widthSet
      ? ({ ...style, ["--sheet-width" as string]: toCssLength(width) } as React.CSSProperties)
      : style;
    return (
      <SheetPortal>
        <SheetOverlay />
        <DialogPrimitive.Content
          ref={ref}
          data-slot="sheet-content"
          style={mergedStyle}
          className={cn(
            sheetVariants({ side }),
            // `width` caps at the viewport: full-width panel on a small screen, capped on a large one.
            widthSet && "w-[min(var(--sheet-width),100%)] max-w-none sm:max-w-none",
            className,
          )}
          {...props}
        >
          {children}
          {showCloseButton ? (
            <DialogPrimitive.Close
              data-slot="sheet-close"
              className="ring-offset-background focus:ring-ring absolute end-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none"
            >
              <X className="size-4" aria-hidden="true" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          ) : null}
        </DialogPrimitive.Content>
      </SheetPortal>
    );
  },
);
SheetContent.displayName = DialogPrimitive.Content.displayName;

export interface SheetHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Header title (Ant Drawer-style). Rendered as the Radix-bound SheetTitle (accessible name). */
  title?: React.ReactNode;
  /** Secondary line under the title (rendered as SheetDescription). */
  subtitle?: React.ReactNode;
  /** Trailing actions/content, end-aligned (e.g. a status Badge or a Button). */
  extra?: React.ReactNode;
  /** Soft semantic background band for the header. `default` = no band. */
  tone?: ToneProp;
}

export const SheetHeader = ({
  className,
  title,
  subtitle,
  extra,
  tone = "default",
  children,
  ...props
}: SheetHeaderProps) => {
  return (
    <div
      data-slot="sheet-header"
      data-tone={tone}
      // Full-bleed band that MIRRORS the footer (+ same 16/24 padding). `-mx/-mt` cancel the content
      // inset; `tone` adds a soft bg band. The divider border is added by CSS ONLY when a SheetBody is
      // present (dialog-layout.css) — so a body-less sheet never shows a doubled header/footer line.
      className={cn(
        "-mx-[var(--sheet-pad-x)] -mt-[var(--sheet-pad-y)] flex flex-col gap-1.5 px-[var(--sheet-pad-x)] py-[var(--sheet-pad-y)]",
        overlayHeaderToneClass[tone],
        className,
      )}
      {...props}
    >
      {children ?? (
        // `pe-8` reserves room for the absolute close button (end-4) so title/extra never sit under it.
        <div className="flex items-start justify-between gap-3 pe-8">
          <div className="flex min-w-0 flex-col gap-1">
            {title != null && <SheetTitle>{title}</SheetTitle>}
            {subtitle != null && <SheetDescription>{subtitle}</SheetDescription>}
          </div>
          {extra != null && (
            <div className="flex shrink-0 items-center gap-2 whitespace-nowrap">{extra}</div>
          )}
        </div>
      )}
    </div>
  );
};

export const SheetBody = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  // Scrollable region between a fixed header and a pinned footer (rule #41). Full-bleed horizontally
  // (`-mx-6 px-6`) so content aligns to the sheet edge while the 3px focus ring of a full-width
  // control keeps 24px of room and never clips against the scroll container's computed
  // `overflow-x`. `py-1`/`scroll-py-1` keep a focused control's ring visible at the scroll edges.
  // Use this instead of a hand-rolled `<div className="overflow-y-auto">` (which clips rings).
  <div
    data-slot="sheet-body"
    className={cn(
      "-mx-[var(--sheet-pad-x)] min-h-0 flex-1 scroll-py-1 overflow-y-auto px-[var(--sheet-pad-x)] py-1",
      className,
    )}
    {...props}
  />
);

export const SheetFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  // Pinned action bar (Ant Design Drawer footer): sticks to the bottom, full-bleed top border, actions
  // RIGHT-aligned (primary rightmost). A destructive / clear / reset action goes far-LEFT — give it
  // `className="me-auto"`. See cardinal rule "Drawer & dialog footer layout".
  // Owns its full vertical padding (symmetric 16/16) via `py-4`; `-mb-6` cancels SheetContent's
  // `p-6` bottom so the footer doesn't inherit an asymmetric 16-top / 24-bottom rhythm.
  <div
    data-slot="sheet-footer"
    className={cn(
      "-mx-[var(--sheet-pad-x)] mt-auto -mb-[var(--sheet-pad-y)] flex flex-wrap items-center justify-end gap-2 px-[var(--sheet-pad-x)] py-[var(--sheet-pad-y)]",
      className,
    )}
    {...props}
  />
);

export const SheetTitle = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    data-slot="sheet-title"
    className={cn("text-foreground text-lg font-medium", className)}
    {...props}
  />
));
SheetTitle.displayName = DialogPrimitive.Title.displayName;

export const SheetDescription = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    data-slot="sheet-description"
    className={cn("text-muted-foreground text-sm", className)}
    {...props}
  />
));
SheetDescription.displayName = DialogPrimitive.Description.displayName;
