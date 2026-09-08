import * as React from "react";
import { chain, mergeRefs } from "@react-aria/utils";
import { Dialog as RacDialog, Modal, ModalOverlay } from "react-aria-components";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import { useMediaQuery } from "../../lib/hooks";
import { cn } from "../../lib/utils";
import { Slot } from "../../lib/slot";
import type { SheetResponsiveProp } from "../../props/components/feedback.prop";
import type { ToneProp, WidthProp } from "../../props/vocabulary";
import { overlayHeaderToneClass } from "./overlay-header-tone";
import { useOverlayCloseFocus } from "./overlay-close-focus";
import { useTranslation } from "../../i18n/use-translation";

export type { SheetResponsiveProp } from "../../props/components/feedback.prop";

/*
 * Sheet — cùng một đợt đổi nền như `dialog.tsx`: `@radix-ui/react-dialog` →
 * `ModalOverlay` / `Modal` / `Dialog` của react-aria-components.
 *
 * RAC KHÔNG có Drawer. Nó cũng không cần có: một drawer là một modal dialog
 * neo vào một cạnh, và toàn bộ diện mạo ấy đã nằm trong `sheetVariants` +
 * `.ui-sheet-*` của kho này. Nên phần đổi là nền hành vi, còn hình học —
 * `data-side`, `data-responsive`, `--sheet-width`, mọi lớp trượt-vào — giữ
 * nguyên từng ký tự.
 *
 * Ba điểm lệch, giống hệt `dialog.tsx` (đọc chú thích đầu tệp đó cho lý do):
 *
 *   • `SheetPortal` thành ống dẫn, `SheetOverlay` không dựng gì — màn nền là
 *     `ModalOverlay` do `SheetContent` phát ra, vẫn mang `data-slot="sheet-overlay"`
 *     + `.ui-sheet-overlay`. `overlayClassName` vẫn là cửa để đặt lớp riêng lên
 *     nó (AppShell dùng: `app-mobile-nav-overlay`).
 *   • `data-state` được phát lại từ trạng thái mở của kho, vì 12 lớp
 *     `data-[state=…]` dưới đây (trượt vào / trượt ra theo từng cạnh) đọc nó.
 *   • Tấm nội dung là `<section>` chứ không còn `<div>` — thẻ mà RAC chờ đợi ở
 *     khe `render`; `role="dialog"` phủ lên vai ngầm của nó.
 */

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

/** Gói prop khe `render` của RAC trao lại — nó có thêm `data-rac`, thứ kiểu JSX không khai báo. */
type RacSectionProps = React.ComponentPropsWithRef<"section"> & { "data-rac"?: string };

/** Trạng thái mở dùng chung cho Sheet ↔ SheetTrigger ↔ SheetContent ↔ SheetClose. */
interface SheetOpenState {
  readonly isOpen: boolean;
  setOpen: (open: boolean) => void;
}

const SheetOpenContext = React.createContext<SheetOpenState | null>(null);

function useSheetOpenState(component: string): SheetOpenState {
  const state = React.useContext(SheetOpenContext);
  if (!state) {
    throw new Error(`\`${component}\` phải nằm trong \`Sheet\`.`);
  }
  return state;
}

/** Cặp id `SheetContent` sinh ra và `SheetTitle` / `SheetDescription` đọc lại — hợp đồng của Radix. */
const SheetLabelContext = React.createContext<{
  titleId: string;
  descriptionId: string;
} | null>(null);

export interface SheetProps {
  /** Trạng thái mở, có kiểm soát. */
  open?: boolean;
  /** Trạng thái mở ban đầu khi không kiểm soát. */
  defaultOpen?: boolean;
  /** Gọi khi trạng thái mở đổi. */
  onOpenChange?: (open: boolean) => void;
  /**
   * Giữ tên prop của Radix. RAC không có kiểu overlay không-modal: `Modal` LUÔN khoá cuộn và ẩn
   * nền khỏi trình đọc màn hình, nên `modal={false}` không còn tắt được điều đó.
   */
  modal?: boolean;
  children?: React.ReactNode;
}

export function Sheet({ open, defaultOpen, onOpenChange, modal: _modal, children }: SheetProps) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultOpen ?? false);
  const isOpen = open ?? uncontrolled;

  // Chỉ gọi `onOpenChange` khi giá trị THẬT SỰ đổi, để `ModalOverlay` (nơi RAC tự gọi `setOpen`
  // lúc Escape / click ngoài) không phát trùng — đúng nết `useControllableState` của Radix.
  const setOpen = React.useCallback(
    (next: boolean) => {
      if (next === isOpen) {
        return;
      }
      if (open === undefined) {
        setUncontrolled(next);
      }
      onOpenChange?.(next);
    },
    [isOpen, open, onOpenChange],
  );

  const state = React.useMemo<SheetOpenState>(() => ({ isOpen, setOpen }), [isOpen, setOpen]);

  return <SheetOpenContext.Provider value={state}>{children}</SheetOpenContext.Provider>;
}

export interface SheetTriggerProps extends React.ComponentPropsWithRef<"button"> {
  /** Mượn thẻ của con thay vì dựng `<button>` riêng. */
  asChild?: boolean;
}

export function SheetTrigger({ asChild, onClick, ...props }: SheetTriggerProps) {
  const state = useSheetOpenState("SheetTrigger");
  const Comp = (asChild ? Slot : "button") as React.ElementType;

  return (
    <Comp
      type="button"
      data-slot="sheet-trigger"
      aria-haspopup="dialog"
      aria-expanded={state.isOpen}
      data-state={state.isOpen ? "open" : "closed"}
      {...props}
      onClick={chain(onClick, () => {
        state.setOpen(!state.isOpen);
      })}
    />
  );
}

export interface SheetCloseProps extends React.ComponentPropsWithRef<"button"> {
  /** Mượn thẻ của con thay vì dựng `<button>` riêng. */
  asChild?: boolean;
}

export function SheetClose({ asChild, onClick, ...props }: SheetCloseProps) {
  const state = useSheetOpenState("SheetClose");
  const Comp = (asChild ? Slot : "button") as React.ElementType;

  return (
    <Comp
      type="button"
      data-slot="sheet-close"
      {...props}
      onClick={chain(onClick, () => {
        state.setOpen(false);
      })}
    />
  );
}

export interface SheetPortalProps {
  /** Giữ tên prop của Radix; RAC tự portal ra `document.body` từ `ModalOverlay`. */
  forceMount?: true;
  children?: React.ReactNode;
}

export function SheetPortal({ children }: SheetPortalProps) {
  return <>{children}</>;
}

export interface SheetOverlayProps extends React.ComponentPropsWithRef<"div"> {
  /** Giữ tên prop của Radix. */
  forceMount?: true;
}

/**
 * Không dựng gì — xem đầu tệp. Màn nền là `ModalOverlay` bên trong `SheetContent`, và nó vẫn mang
 * `data-slot="sheet-overlay"` + `.ui-sheet-overlay` như trước.
 */
export function SheetOverlay(_props: SheetOverlayProps) {
  return null;
}
SheetOverlay.displayName = "SheetOverlay";

/** Scrim colour comes from the shared --overlay-background token (see dialog-layout.css),
 * so a service tints every overlay's backdrop from one knob instead of a baked bg-black/50. */
const SHEET_OVERLAY_CLASS =
  "ui-sheet-overlay data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 fixed";

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
  extends React.ComponentPropsWithRef<"section">, VariantProps<typeof sheetVariants> {
  showCloseButton?: boolean;
  /** Optional semantic class for the owned backdrop (for a shell-specific overlay token). */
  overlayClassName?: string;
  /** Giữ tên prop của Radix; RAC tự portal ra `document.body` từ `ModalOverlay`. */
  forceMount?: true;
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

export function SheetContent({
  side = "right",
  className,
  children,
  showCloseButton = true,
  overlayClassName,
  forceMount: _forceMount,
  width,
  responsive = "side",
  style,
  ref,
  ...props
}: SheetContentProps) {
  const { t } = useTranslation();
  const state = useSheetOpenState("SheetContent");
  const presentation = useSheetResponsiveMode(responsive);
  const titleId = React.useId();
  const descriptionId = React.useId();
  const labels = React.useMemo(() => ({ titleId, descriptionId }), [titleId, descriptionId]);
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
  const dataState = state.isOpen ? "open" : "closed";

  useOverlayCloseFocus(state.isOpen);

  return (
    <ModalOverlay
      isOpen={state.isOpen}
      onOpenChange={state.setOpen}
      isDismissable
      data-slot="sheet-overlay"
      data-state={dataState}
      className={cn(SHEET_OVERLAY_CLASS, overlayClassName)}
    >
      {/* `display: contents` — thẻ `Modal` là chỗ RAC treo khoá cuộn / bẫy tiêu điểm, không phải
          một hộp bố cục. Bỏ nó đi thì `useInteractOutside` mất mốc để so. */}
      <Modal className="contents">
        <RacDialog
          aria-labelledby={props["aria-labelledby"] ?? titleId}
          aria-describedby={props["aria-describedby"] ?? descriptionId}
          data-slot="sheet-content"
          data-state={dataState}
          data-responsive={responsive}
          data-side={resolvedSide}
          className={cn(
            sheetVariants({ side: resolvedSide }),
            // `width` caps at the viewport: full-width panel on a small screen, capped on a large one.
            widthSet && "w-[min(var(--sheet-width),100%)] max-w-none sm:max-w-none",
            // Only the RESPONSIVE bottom presentation is capped — a plain `side="bottom"` sheet keeps
            // its content-sized height so existing usage is untouched.
            bottomSheet && "max-h-[var(--sheet-bottom-max-height)]",
            className,
          )}
          render={(racProps) => {
            const { "data-rac": _rac, ref: racRef, ...rest } = racProps as RacSectionProps;
            return (
              <section {...rest} {...props} style={mergedStyle} ref={mergeRefs(ref, racRef)} />
            );
          }}
        >
          <SheetLabelContext.Provider value={labels}>
            {children}
            {showCloseButton ? (
              <SheetClose
                // `ui-focus-ring` = the single focus source. It replaces a hand-rolled
                // `focus:ring-2 focus:ring-offset-2 focus:ring-ring` — token-blind, on `:focus`
                // rather than `:focus-visible`, and with a 2px offset nothing else in the system
                // used. Matches DialogClose, which already carries the marker class.
                className="ui-sheet-close ui-focus-ring disabled:pointer-events-none"
              >
                <X className="ui-sheet-close-icon" aria-hidden="true" />
                <span className="sr-only">{t("feedback.alert.dismiss")}</span>
              </SheetClose>
            ) : null}
          </SheetLabelContext.Provider>
        </RacDialog>
      </Modal>
    </ModalOverlay>
  );
}
SheetContent.displayName = "SheetContent";

export interface SheetHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Header title (Ant Drawer-style). Rendered as the bound SheetTitle (accessible name). */
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
  // Pinned action bar (the Drawer footer convention): sticks to the bottom, full-bleed top border, actions
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
  HTMLHeadingElement,
  React.ComponentPropsWithoutRef<"h2">
>(({ className, ...props }, ref) => {
  const labels = React.useContext(SheetLabelContext);
  return (
    <h2
      ref={ref}
      id={labels?.titleId}
      data-slot="sheet-title"
      className={cn("ui-sheet-title", className)}
      {...props}
    />
  );
});
SheetTitle.displayName = "SheetTitle";

export const SheetDescription = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentPropsWithoutRef<"p">
>(({ className, ...props }, ref) => {
  const labels = React.useContext(SheetLabelContext);
  return (
    <p
      ref={ref}
      id={labels?.descriptionId}
      data-slot="sheet-description"
      className={cn("ui-sheet-description", className)}
      {...props}
    />
  );
});
SheetDescription.displayName = "SheetDescription";
