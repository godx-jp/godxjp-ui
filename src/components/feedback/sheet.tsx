import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import { useMediaQuery } from "../../lib/hooks";
import { cn } from "../../lib/utils";
import type { SheetResponsiveProp } from "../../props/components/feedback.prop";
import type { ToneProp, WidthProp } from "../../props/vocabulary";
import { overlayHeaderToneClass } from "./overlay-header-tone";
import { useTranslation } from "../../i18n/use-translation";

export type { SheetResponsiveProp } from "../../props/components/feedback.prop";

/** number → px; string → any CSS length. */
const toCssLength = (v: WidthProp): string => (typeof v === "number" ? `${v}px` : v);

/** Resolved presentation of a responsive sheet: the named side panel, or the mobile bottom sheet. */
export type SheetPresentation = "side" | "bottom";

/** Theme knob holding the drawer breakpoint (src/tokens/components/sheet.css). */
const SHEET_BREAKPOINT_TOKEN = "--sheet-responsive-breakpoint-width";
/** Mirrors the token default (48rem @ a 16px root) so SSR and a token-less test env agree. */
const SHEET_BREAKPOINT_FALLBACK_QUERY = "(max-width: 768px)";

/** CSS length → px. Supports the units a breakpoint knob is realistically written in. */
function cssLengthToPx(value: string, rootFontSize: number): number | undefined {
  const match = /^(-?\d*\.?\d+)(px|rem|em)?$/.exec(value.trim());
  if (match == null) return undefined;
  const amount = Number(match[1]);
  if (!Number.isFinite(amount)) return undefined;
  return match[2] === "rem" || match[2] === "em" ? amount * rootFontSize : amount;
}

/**
 * Build the media query from the token. A CSS `@media` cannot resolve a custom property, so the
 * breakpoint is read off the document root once per mount — that is what makes the drawer
 * breakpoint themeable instead of a literal baked into every composite.
 */
function readSheetBreakpointQuery(): string {
  if (typeof document === "undefined" || typeof window.getComputedStyle !== "function") {
    return SHEET_BREAKPOINT_FALLBACK_QUERY;
  }
  const rootStyle = window.getComputedStyle(document.documentElement);
  const rootFontSize = cssLengthToPx(rootStyle.fontSize || "16px", 16) ?? 16;
  const px = cssLengthToPx(rootStyle.getPropertyValue(SHEET_BREAKPOINT_TOKEN), rootFontSize);
  return px == null ? SHEET_BREAKPOINT_FALLBACK_QUERY : `(max-width: ${String(px)}px)`;
}

/**
 * The canonical responsive-overlay decision, shared by `SheetContent` and by any composite that
 * swaps a desktop surface for a mobile sheet (see `OrgSwitcher`). Returns `"bottom"` when the
 * viewport is at or below `--sheet-responsive-breakpoint-width`.
 */
export function useSheetResponsiveMode(
  responsive: SheetResponsiveProp = "side",
): SheetPresentation {
  const [query, setQuery] = React.useState(SHEET_BREAKPOINT_FALLBACK_QUERY);

  React.useEffect(() => {
    // Same-value updates bail out inside React, so this is a no-op unless a theme moved the knob.
    setQuery(readSheetBreakpointQuery());
  }, []);

  const compact = useMediaQuery(query);

  if (responsive === "side" || responsive === "bottom") return responsive;
  return compact ? "bottom" : "side";
}

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
      // Scrim colour comes from the shared --overlay-background token (see dialog-layout.css),
      // so a service tints every overlay's backdrop from one knob instead of a baked bg-black/50.
      "ui-sheet-overlay data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 fixed",
      className,
    )}
    {...props}
  />
));
SheetOverlay.displayName = DialogPrimitive.Overlay.displayName;

const sheetVariants = cva(
  "ui-sheet-panel fixed flex flex-col gap-[var(--space-chrome-gap)] bg-background px-[var(--sheet-pad-x)] py-[var(--sheet-pad-y)] transition ease-in-out data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:animate-in data-[state=open]:duration-500",
  {
    variants: {
      // `side` is a deliberately PHYSICAL API (left/right/top/bottom) — a sheet
      // opens from the edge the consumer names, not a locale-flipped one, matching
      // the Radix/shadcn Sheet convention. The physical classes below are intended.
      side: {
        /* rtl-ignore: named physical side */ right:
          "inset-y-0 right-0 h-full w-[min(var(--sheet-width-default),100%)] max-w-none border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
        /* rtl-ignore: named physical side */ left: "inset-y-0 left-0 h-full w-[min(var(--sheet-width-default),100%)] max-w-none border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left",
        top: "inset-x-0 h-auto data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom:
          "inset-x-0 h-auto data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
      },
    },
    defaultVariants: { side: "right" },
  },
);

export interface SheetContentProps
  extends
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof sheetVariants> {
  showCloseButton?: boolean;
  /** Optional semantic class for the owned backdrop (for a shell-specific overlay token). */
  overlayClassName?: string;
  /**
   * Desired panel size for side left/right (Ant Drawer `width`). Omit to keep the canonical drawer
   * default from `--sheet-width-default`.
   */
  width?: WidthProp;
  /**
   * Responsive drawer / detail-panel contract. `"side"` (default) keeps today's behaviour: the
   * physical `side` the consumer named, at every viewport.
   */
  responsive?: SheetResponsiveProp;
}

export const SheetContent = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  SheetContentProps
>(
  (
    {
      side = "right",
      className,
      children,
      showCloseButton = true,
      overlayClassName,
      width,
      responsive = "side",
      style,
      ...props
    },
    ref,
  ) => {
    const { t } = useTranslation();
    const presentation = useSheetResponsiveMode(responsive);
    // The bottom sheet REPLACES the named side (never merges with it) so the geometry classes stay
    // a single coherent set — a side variant's inset classes UNIONED with the bottom variant's would
    // pin all four edges and produce a full-screen overlay instead of a drawer.
    const resolvedSide = presentation === "bottom" ? "bottom" : side;
    const bottomSheet = responsive !== "side" && presentation === "bottom";
    const horizontal = resolvedSide === "left" || resolvedSide === "right";
    const widthSet = width != null && horizontal;
    const mergedStyle = widthSet
      ? ({ ...style, ["--sheet-width" as string]: toCssLength(width) } as React.CSSProperties)
      : style;
    return (
      <SheetPortal>
        <SheetOverlay className={overlayClassName} />
        <DialogPrimitive.Content
          ref={ref}
          data-slot="sheet-content"
          data-responsive={responsive}
          data-side={resolvedSide}
          style={mergedStyle}
          className={cn(
            sheetVariants({ side: resolvedSide }),
            // `width` caps at the viewport: full-width panel on a small screen, capped on a large one.
            widthSet && "w-[min(var(--sheet-width),100%)] max-w-none sm:max-w-none",
            // Only the RESPONSIVE bottom presentation is capped — a plain `side="bottom"` sheet keeps
            // its content-sized height so existing usage is untouched.
            bottomSheet && "max-h-[var(--sheet-bottom-max-height)]",
            className,
          )}
          {...props}
        >
          {children}
          {showCloseButton ? (
            <DialogPrimitive.Close
              data-slot="sheet-close"
              className="ui-sheet-close ring-offset-background focus:ring-ring focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none"
            >
              <X className="ui-sheet-close-icon" aria-hidden="true" />
              <span className="sr-only">{t("feedback.alert.dismiss")}</span>
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
        "ui-sheet-header -mx-[var(--sheet-pad-x)] -mt-[var(--sheet-pad-y)] px-[var(--sheet-pad-x)] py-[var(--sheet-pad-y)]",
        overlayHeaderToneClass[tone],
        className,
      )}
      {...props}
    >
      {children ?? (
        // `pe-8` reserves room for the absolute close button (end-4) so title/extra never sit under it.
        <div className="ui-sheet-title-row">
          <div className="ui-sheet-title-block">
            {title != null && <SheetTitle>{title}</SheetTitle>}
            {subtitle != null && <SheetDescription>{subtitle}</SheetDescription>}
          </div>
          {extra != null && <div className="ui-sheet-extra">{extra}</div>}
        </div>
      )}
    </div>
  );
};

export const SheetBody = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  // Full-bleed horizontally
  // (`-mx-6 px-6`) so content aligns to the sheet edge while the 3px focus ring of a full-width
  // control keeps 24px of room and never clips against the scroll container's computed
  // `overflow-x`. `py-1`/`scroll-py-1` keep a focused control's ring visible at the scroll edges.
  // Use this instead of a hand-rolled `<div className="overflow-y-auto">` (which clips rings).
  <div
    data-slot="sheet-body"
    className={cn(
      "ui-sheet-body-space -mx-[var(--sheet-pad-x)] flex-1 overflow-y-auto px-[var(--sheet-pad-x)]",
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
      "ui-sheet-footer-row -mx-[var(--sheet-pad-x)] mt-auto -mb-[var(--sheet-pad-y)] px-[var(--sheet-pad-x)] py-[var(--sheet-pad-y)]",
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
    className={cn("ui-sheet-title", className)}
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
    className={cn("ui-sheet-description", className)}
    {...props}
  />
));
SheetDescription.displayName = DialogPrimitive.Description.displayName;
