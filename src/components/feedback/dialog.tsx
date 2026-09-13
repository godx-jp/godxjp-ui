import { useOverlayPortalContainer } from "../../lib/overlay-portal";
import * as React from "react";
import { chain, mergeRefs } from "@react-aria/utils";
import { Dialog as RacDialog, Modal, ModalOverlay } from "react-aria-components";
import { AlertCircle, X } from "lucide-react";

import { cn } from "../../lib/utils";
import { Slot } from "../../lib/slot";
import type { ConfirmVariantProp, ToneProp } from "../../props/vocabulary";
import { overlayHeaderToneClass } from "./overlay-header-tone";
import { useOverlayCloseFocus } from "./overlay-close-focus";
import { buttonVariants } from "../general/button";
import { useTranslation } from "../../i18n/use-translation";
import { Button } from "../general/button";
import { Input } from "../data-entry/input";
import { FormField } from "../data-entry/form-field";
import type {
  AlertDialogProp,
  DialogContentProp,
  DialogProp,
} from "../../props/components/feedback.prop";

export type {
  AlertDialogProp,
  AlertDialogProp as AlertDialogProps,
  DialogProp,
  DialogProp as DialogProps,
  DialogContentProp,
  DialogContentProp as DialogContentProps,
} from "../../props/components/feedback.prop";

/*
 * Dialog + AlertDialog — nền là `ModalOverlay` / `Modal` / `Dialog` của
 * react-aria-components; API công khai vẫn nguyên văn Radix.
 *
 * ## HAI gói Radix, MỘT `Dialog` của RAC
 *
 * `@radix-ui/react-dialog` và `@radix-ui/react-alert-dialog` là hai gói tách
 * rời; RAC chỉ có một `Dialog`, và khác biệt nằm ở hai prop:
 *
 *     Dialog       → <Dialog role="dialog">      + <ModalOverlay isDismissable>
 *     AlertDialog  → <Dialog role="alertdialog"> + <ModalOverlay isDismissable={false}>
 *
 * `role` là prop THẬT của RAC (`useDialog` đọc nó và đặt thẳng lên thẻ), nên
 * `getByRole('alertdialog')` — thứ `messages.spec.js` của consumer bám vào —
 * không cần khe `render` để chữa. Escape thì VẪN đóng alert-dialog: đó là hành
 * vi Radix đo được (`dialog-alert-primitives.test.tsx` · "closes on Escape"),
 * nên `isKeyboardDismissDisabled` để nguyên mặc định `false`.
 *
 * ## Portal / Overlay: RAC gộp, nên `*Portal` và `*Overlay` đổi vai
 *
 * Radix: `Portal > Overlay + Content` — màn nền và tấm nội dung là ANH EM.
 * RAC: `ModalOverlay > Modal > Dialog` — LỒNG NHAU, và chính `ModalOverlay`
 * mới là thứ mang khoá cuộn, `ariaHideOutside` và bẫy tiêu điểm. Hai cây không
 * dựng chồng lên nhau được, nên:
 *
 *   • `DialogPortal` / `AlertDialogPortal` = ống dẫn (RAC tự portal ra body).
 *   • `DialogOverlay` / `AlertDialogOverlay` = KHÔNG dựng gì. Màn nền do
 *     `*Content` phát ra, ngay trên `ModalOverlay`, mang y nguyên
 *     `data-slot="dialog-overlay"` + `.ui-dialog-overlay`. Dựng thêm một
 *     `ModalOverlay` rỗng bên cạnh sẽ ra hai lớp scrim chồng nhau VÀ một
 *     `ariaHideOutside` thứ hai không có tấm nội dung để chừa lại.
 *     Muốn đổi lớp của màn nền thì dùng `overlayClassName` của `DialogContent`.
 *
 * ## `data-state` được PHÁT LẠI
 *
 * RAC phát `data-entering` / `data-exiting`; 6 lớp `data-[state=…]` ở đây (mờ
 * dần + zoom) và khối reduced-motion trong `styles/dialog-layout.css` đều đọc
 * `data-state`. Nó được phát lại từ trạng thái mở của chính kho — đúng lúc
 * `isOpen` thành `false` mà RAC còn giữ thẻ để chạy hoạt ảnh thoát, y như
 * Presence của Radix.
 *
 * ## `aria-labelledby` / `aria-describedby`
 *
 * RAC chỉ tự nối nhãn khi con là `<Heading slot="title">`, và chỉ đặt
 * `aria-describedby` cho `role="alertdialog"`. Radix thì luôn nối cả hai qua
 * cặp id sinh ở Content. Giữ nết Radix: `*Content` sinh id, `*Title` /
 * `*Description` đọc lại — nên `DialogTitle` vẫn là `<h2>`, `DialogDescription`
 * vẫn là `<p>`, và consumer không phải đổi một dòng nào.
 *
 * ## Thẻ là `<section>`, không còn là `<div>`
 *
 * `dom.section` là thẻ RAC chờ đợi ở `Dialog`; trả về `<div>` từ khe `render`
 * làm RAC log cảnh báo ở MỌI lần dựng trong dev. `role` phủ lên vai ngầm của
 * `<section>`, và không móc CSS nào trong `src/styles/` chọn theo tên thẻ.
 *
 * ## MỘT họ, không phải hai — `variant` là lối chuẩn (gh#567)
 *
 * Số đo trên `dist/components/feedback/dialog.d.ts` lúc issue được mở: 26
 * export — 14 `Dialog*`, 12 `AlertDialog*`, **12 cặp trùng tên**, **0** phần
 * chỉ `AlertDialog` mới có, 2 phần chỉ `Dialog` có (`DialogBody`,
 * `DialogClose`). Khác biệt thật giữa hai họ nằm ở ĐÚNG hai prop nội bộ của
 * `DialogShell`, và cả hai đã có sẵn ở đây từ trước: `role` và `isDismissable`
 * (xem `AlertDialogContent` bên dưới).
 *
 * antd — thẩm quyền bề mặt prop của kho này (docs/DESIGN-AUTHORITY.md) — chỉ có
 * MỘT `Modal`. Mức nguy hiểm ở antd là một PROP (`okType="danger"`, và
 * `Modal.confirm()` cùng họ `info/success/error/warning`); antd KHÔNG có
 * `AlertModal`. Hai họ tách rời là hình dạng của Radix
 * (`@radix-ui/react-dialog` + `@radix-ui/react-alert-dialog`), thứ kho này
 * không còn chạy trên nữa.
 *
 * Nên `DialogContent` — và `DialogRoot`, để consumer đặt được một lần ở gốc —
 * nhận `variant`, và MỘT prop ấy quyết định ba thứ luôn đi cùng nhau:
 *
 *     variant="default"     → role="dialog"      · click ra ngoài ĐÓNG   · nút chính nhấn mạnh thường
 *     variant="destructive" → role="alertdialog" · click ra ngoài KHÔNG  · nút chính nhấn mạnh destructive
 *
 * ### Bốn chỗ lệch khỏi đề nghị trong issue, và lý do từng chỗ
 *
 * 1. **Tên prop là `variant`, không phải `severity`.** antd không có tên cho
 *    một-knob-ba-việc này, nên không có gì để port nguyên văn. Nhưng trục
 *    "nhấn mạnh của xác nhận" thì kho này ĐÃ publish: `ConfirmVariantProp`
 *    (`"default" | "destructive"`), và preset `AlertDialog` gọi nó là `variant`
 *    từ trước. Thêm `severity` là thêm cách viết THỨ HAI cho cùng một trục —
 *    đúng thứ `check:prop-vocabulary` (`^variant$` → `*VariantProp`) tồn tại để
 *    chặn, và đúng luật "controlled vocabulary wins on values" trong
 *    DESIGN-AUTHORITY.
 * 2. **Escape VẪN đóng `variant="destructive"`.** Issue muốn prop quyết định cả
 *    Esc. Nhưng Esc-đóng-alertdialog là hành vi ĐANG CHẠY của 12 export
 *    `AlertDialog*`, có test đo (`dialog-alert-primitives.test.tsx` · "closes on
 *    Escape and restores focus"); `isKeyboardDismissDisabled` để nguyên mặc
 *    định `false` của RAC. Cho prop mới tắt Esc sẽ làm `variant="destructive"`
 *    KHÁC `AlertDialogContent`, tức phá đúng lời hứa "prop mới thay được họ
 *    cũ". antd đồng ý: `keyboard` mặc định `true`. Nên prop quyết định
 *    click-ra-ngoài, KHÔNG quyết định Esc.
 * 3. **Nút ✕ mặc định biến mất ở `destructive`** (`variant="default"` vẫn mặc
 *    định hiện nó, y như trước). Một dấu ✕ LÀ một lối đóng-không-chủ-đích, cùng
 *    họ với click ra ngoài, và `AlertDialogContent` mặc định
 *    `showCloseButton={false}`. Nhờ vậy `<DialogContent variant="destructive">`
 *    TRÙNG KHÍT `<AlertDialogContent>` chứ không "gần giống" — consumer vẫn bật
 *    lại được bằng `showCloseButton`.
 * 4. **Tông của dải header KHÔNG bị ép theo.** `DialogHeader tone` là một trục
 *    đã publish riêng (7 giá trị `ToneProp`). Preset `AlertDialog` cũng KHÔNG còn
 *    ép nó nữa: theo antd, tín hiệu nguy hiểm là một GLYPH cạnh tiêu đề, không
 *    phải một mảng nền được tô. Ai muốn dải màu vẫn đặt `tone` trực tiếp.
 *
 * 12 export `AlertDialog*` Ở LẠI và chạy y như cũ — gỡ chúng là breaking change
 * và cần một bản major. Chúng là LỐI CŨ; `variant` là lối chuẩn. Quy tắc chọn
 * cho consumer nằm trong `docs/DESIGN-AUTHORITY.md`.
 */

/** Gói prop khe `render` của RAC trao lại — nó có thêm `data-rac`, thứ kiểu JSX không khai báo. */
type RacSectionProps = React.ComponentPropsWithRef<"section"> & { "data-rac"?: string };

/** Trạng thái mở dùng chung cho Root ↔ Trigger ↔ Content ↔ Close. */
interface OverlayOpenState {
  readonly isOpen: boolean;
  setOpen: (open: boolean) => void;
}

interface OverlayOpenProps {
  /** Trạng thái mở, có kiểm soát. */
  open?: boolean;
  /** Trạng thái mở ban đầu khi không kiểm soát. */
  defaultOpen?: boolean;
  /** Gọi khi trạng thái mở đổi. */
  onOpenChange?: (open: boolean) => void;
}

/**
 * `useControllableState` của Radix, viết gọn: chỉ gọi `onOpenChange` khi giá trị THẬT SỰ đổi, để
 * `ModalOverlay` (nơi RAC tự gọi `setOpen` lúc Escape / click ngoài) không phát trùng.
 */
function useOverlayOpenState({ open, defaultOpen, onOpenChange }: OverlayOpenProps) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultOpen ?? false);
  const isOpen = open ?? uncontrolled;

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

  return React.useMemo<OverlayOpenState>(() => ({ isOpen, setOpen }), [isOpen, setOpen]);
}

const DialogOpenContext = React.createContext<OverlayOpenState | null>(null);

function useDialogOpenState(component: string): OverlayOpenState {
  const state = React.useContext(DialogOpenContext);
  if (!state) {
    throw new Error(`\`${component}\` phải nằm trong \`Dialog\` hoặc \`AlertDialogRoot\`.`);
  }
  return state;
}

/** Cặp id `*Content` sinh ra và `*Title` / `*Description` đọc lại — hợp đồng nhãn của Radix. */
const DialogLabelContext = React.createContext<{
  titleId: string;
  descriptionId: string;
} | null>(null);

/**
 * Mức nguy hiểm đã giải, chảy từ `DialogRoot` / `DialogContent` xuống `DialogAction` — xem đầu
 * tệp. Mặc định `"default"` nên mọi cây `AlertDialog*` hiện có (không cái nào đặt prop này) giữ
 * nguyên nhấn mạnh nút chính như trước.
 */
const DialogVariantContext = React.createContext<ConfirmVariantProp>("default");

const OVERLAY_CLASS =
  "ui-dialog-overlay data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0";
const CONTENT_CLASS =
  "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 duration-200 outline-none";

interface DialogShellProps extends Omit<React.ComponentPropsWithRef<"section">, "role"> {
  /** `"alertdialog"` cho nhánh AlertDialog. */
  role?: "dialog" | "alertdialog";
  /** Lớp ngữ nghĩa cho màn nền do tấm nội dung sở hữu. */
  overlayClassName?: string;
  /** Radix: click ra ngoài đóng Dialog, KHÔNG đóng AlertDialog. */
  isDismissable: boolean;
  onCloseAutoFocus?: (event: Event) => void;
}

/** `ModalOverlay > Modal > Dialog` — vỏ chung của cả ba lối vào trong tệp này. */
function DialogShell({
  role = "dialog",
  className,
  overlayClassName,
  isDismissable,
  onCloseAutoFocus,
  children,
  style,
  ref,
  ...props
}: DialogShellProps) {
  const state = useDialogOpenState("DialogContent");
  const titleId = React.useId();
  const descriptionId = React.useId();
  const labels = React.useMemo(() => ({ titleId, descriptionId }), [titleId, descriptionId]);
  const dataState = state.isOpen ? "open" : "closed";

  useOverlayCloseFocus(state.isOpen, onCloseAutoFocus);

  const overlayPortalContainer = useOverlayPortalContainer();

  return (
    <ModalOverlay
      UNSTABLE_portalContainer={overlayPortalContainer}
      isOpen={state.isOpen}
      onOpenChange={state.setOpen}
      isDismissable={isDismissable}
      data-slot="dialog-overlay"
      data-state={dataState}
      className={cn(OVERLAY_CLASS, overlayClassName)}
    >
      {/* `display: contents` — thẻ `Modal` là chỗ RAC treo khoá cuộn / bẫy tiêu điểm, không phải
          một hộp bố cục. Bỏ nó đi thì `useInteractOutside` mất mốc để so. */}
      <Modal className="contents">
        <RacDialog
          role={role}
          aria-labelledby={props["aria-labelledby"] ?? titleId}
          aria-describedby={props["aria-describedby"] ?? descriptionId}
          data-slot="dialog-content"
          data-state={dataState}
          className={cn(CONTENT_CLASS, className)}
          render={(racProps) => {
            const { "data-rac": _rac, ref: racRef, ...rest } = racProps as RacSectionProps;
            return <section {...rest} {...props} style={style} ref={mergeRefs(ref, racRef)} />;
          }}
        >
          <DialogLabelContext.Provider value={labels}>{children}</DialogLabelContext.Provider>
        </RacDialog>
      </Modal>
    </ModalOverlay>
  );
}

interface DialogRootProps extends OverlayOpenProps, Pick<DialogProp, "variant"> {
  /**
   * Giữ tên prop của Radix. RAC không có kiểu overlay không-modal: `Modal` LUÔN khoá cuộn và ẩn
   * nền khỏi trình đọc màn hình, nên `modal={false}` không còn tắt được điều đó.
   */
  modal?: boolean;
  children?: React.ReactNode;
}

/** `data-slot="dialog"` cũ nằm trên Root của Radix, thứ không dựng thẻ nào — nó chưa từng ra DOM. */
function DialogRoot({
  children,
  modal: _modal,
  variant = "default",
  ...openProps
}: DialogRootProps) {
  const state = useOverlayOpenState(openProps);
  return (
    <DialogOpenContext.Provider value={state}>
      <DialogVariantContext.Provider value={variant}>{children}</DialogVariantContext.Provider>
    </DialogOpenContext.Provider>
  );
}

interface DialogTriggerProps extends React.ComponentPropsWithRef<"button"> {
  /** Mượn thẻ của con thay vì dựng `<button>` riêng. */
  asChild?: boolean;
}

function DialogTrigger({ asChild, onClick, ...props }: DialogTriggerProps) {
  const state = useDialogOpenState("DialogTrigger");
  const Comp = (asChild ? Slot : "button") as React.ElementType;

  return (
    <Comp
      type="button"
      data-slot="dialog-trigger"
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

interface DialogPortalProps {
  /** Giữ tên prop của Radix; RAC tự portal ra `document.body` từ `ModalOverlay`. */
  forceMount?: true;
  children?: React.ReactNode;
}

function DialogPortal({ children }: DialogPortalProps) {
  return <>{children}</>;
}

interface DialogCloseProps extends React.ComponentPropsWithRef<"button"> {
  /** Mượn thẻ của con thay vì dựng `<button>` riêng. */
  asChild?: boolean;
}

function DialogClose({ asChild, onClick, ...props }: DialogCloseProps) {
  const state = useDialogOpenState("DialogClose");
  const Comp = (asChild ? Slot : "button") as React.ElementType;

  return (
    <Comp
      type="button"
      data-slot="dialog-close"
      {...props}
      onClick={chain(onClick, () => {
        state.setOpen(false);
      })}
    />
  );
}

interface DialogOverlayProps extends React.ComponentPropsWithRef<"div"> {
  /** Giữ tên prop của Radix. */
  forceMount?: true;
}

/**
 * Không dựng gì — xem đầu tệp. Màn nền là `ModalOverlay` bên trong `DialogContent`, và nó vẫn mang
 * `data-slot="dialog-overlay"` + `.ui-dialog-overlay` như trước.
 */
function DialogOverlay(_props: DialogOverlayProps) {
  return null;
}
DialogOverlay.displayName = "DialogOverlay";

interface DialogContentProps
  extends Omit<React.ComponentPropsWithRef<"section">, "role">, Pick<DialogContentProp, "variant"> {
  showClose?: boolean;
  showCloseButton?: boolean;
  overlayClassName?: string;
  /** Giữ tên prop của Radix. */
  forceMount?: true;
  /** Giữ tên prop của Radix — xem `useCloseAutoFocus`. */
  onCloseAutoFocus?: (event: Event) => void;
}

function DialogContent({
  className,
  children,
  showClose,
  showCloseButton: showCloseButtonProp,
  overlayClassName,
  variant: variantProp,
  forceMount: _forceMount,
  ...props
}: DialogContentProps) {
  const { t } = useTranslation();
  // Prop tại chỗ thắng; không có thì kế thừa `DialogRoot`. Xem đầu tệp cho ba thứ nó quyết định.
  const inheritedVariant = React.useContext(DialogVariantContext);
  const variant = variantProp ?? inheritedVariant;
  const isDestructive = variant === "destructive";
  // Dấu ✕ là một lối đóng-không-chủ-đích, cùng họ với click ra ngoài — nên nó theo `variant`, và
  // `<DialogContent variant="destructive">` trùng khít `<AlertDialogContent>`.
  const showCloseButton = showCloseButtonProp ?? showClose ?? !isDestructive;

  return (
    <DialogVariantContext.Provider value={variant}>
      <DialogShell
        role={isDestructive ? "alertdialog" : "dialog"}
        isDismissable={!isDestructive}
        data-variant={variant}
        className={className}
        overlayClassName={overlayClassName}
        {...props}
      >
        {children}
        {showCloseButton ? (
          <DialogClose
            // `ui-focus-ring` is the ONE focus affordance (styles/focus-ring.css): it reads the
            // four --focus-ring-* tokens, so a service retunes this ring with every other one.
            // The hand-written `focus:ring-2 focus:ring-offset-2` it replaces was un-themeable
            // AND fired on plain `:focus` (i.e. on a mouse click), unlike every other control.
            className="ui-focus-ring transition-opacity disabled:pointer-events-none"
          >
            <X className="ui-dialog-close-icon" aria-hidden="true" />
            <span className="sr-only">{t("feedback.alert.dismiss")}</span>
          </DialogClose>
        ) : null}
      </DialogShell>
    </DialogVariantContext.Provider>
  );
}
DialogContent.displayName = "DialogContent";

interface DialogHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  extra?: React.ReactNode;
  tone?: ToneProp;
}

const DialogHeader = ({
  className,
  title,
  subtitle,
  extra,
  tone = "default",
  children,
  ...props
}: DialogHeaderProps) => {
  // Band layout (full-bleed, border-bottom, padding) lives in dialog-layout.css so it mirrors the
  // footer exactly; here we only add the soft `tone` background + the title/subtitle/extra row.
  return (
    <div
      data-slot="dialog-header"
      data-tone={tone}
      className={cn(overlayHeaderToneClass[tone], className)}
      {...props}
    >
      {children ?? (
        // Chrome rhythm lives in dialog-layout.css (`.ui-dialog-*`, mirroring `.ui-sheet-*`), so
        // the two overlay siblings retune from one --dialog-*/--sheet-* set instead of literals.
        <div className="ui-dialog-title-row">
          <div className="ui-dialog-title-block">
            {title != null && <DialogTitle>{title}</DialogTitle>}
            {subtitle != null && <DialogDescription>{subtitle}</DialogDescription>}
          </div>
          {extra != null && <div className="ui-dialog-extra">{extra}</div>}
        </div>
      )}
    </div>
  );
};
DialogHeader.displayName = "DialogHeader";

// Ring-safe scrollable region for a tall dialog. Layout lives in dialog-layout.css
// [data-slot="dialog-body"]: full-bleed inset (matches the dialog padding) so a full-width
// control's 3px focus ring never clips against the scroll container. Mirrors SheetBody.
const DialogBody = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div data-slot="dialog-body" className={className} {...props} />
);
DialogBody.displayName = "DialogBody";

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  // Layout (right-aligned actions, mobile column-reverse) lives in feedback-layout.css
  // [data-slot="dialog-footer"]. Destructive action goes to the start via `className="me-auto"`.
  <div data-slot="dialog-footer" className={className} {...props} />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<HTMLHeadingElement, React.ComponentPropsWithoutRef<"h2">>(
  ({ className, ...props }, ref) => {
    const labels = React.useContext(DialogLabelContext);
    const cls = cn(className);
    return (
      <h2 ref={ref} id={labels?.titleId} data-slot="dialog-title" className={cls} {...props} />
    );
  },
);
DialogTitle.displayName = "DialogTitle";

const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentPropsWithoutRef<"p">
>(({ className, ...props }, ref) => {
  const labels = React.useContext(DialogLabelContext);
  const cls = cn(className);
  return (
    <p
      ref={ref}
      id={labels?.descriptionId}
      data-slot="dialog-description"
      className={cls}
      {...props}
    />
  );
});
DialogDescription.displayName = "DialogDescription";

type AlertDialogRootProps = OverlayOpenProps & { children?: React.ReactNode };

/**
 * Compound alert-dialog Root — the `role="alertdialog"` mirror of {@link DialogRoot}. It supplies
 * the open-state context that `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogAction` and
 * `AlertDialogCancel` read, so the compound parts are assemblable from the public API alone (no
 * direct `react-aria-components` import).
 */
function AlertDialogRoot({ children, ...openProps }: AlertDialogRootProps) {
  const state = useOverlayOpenState(openProps);
  return <DialogOpenContext.Provider value={state}>{children}</DialogOpenContext.Provider>;
}

/** Radix's alert-dialog trigger carries no `data-slot`; keeping it that way keeps the DOM identical. */
function AlertDialogTrigger({ asChild, onClick, ...props }: DialogTriggerProps) {
  const state = useDialogOpenState("AlertDialogTrigger");
  const Comp = (asChild ? Slot : "button") as React.ElementType;

  return (
    <Comp
      type="button"
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

function AlertDialogPortal({ children }: DialogPortalProps) {
  return <>{children}</>;
}

/** Không dựng gì — màn nền do `AlertDialogContent` phát ra. Xem đầu tệp. */
function AlertDialogOverlay(_props: DialogOverlayProps) {
  return null;
}
AlertDialogOverlay.displayName = "AlertDialogOverlay";

interface AlertDialogContentProps extends Omit<React.ComponentPropsWithRef<"section">, "role"> {
  showClose?: boolean;
  showCloseButton?: boolean;
  /** Giữ tên prop của Radix. */
  forceMount?: true;
  /** Giữ tên prop của Radix — xem `useCloseAutoFocus`. */
  onCloseAutoFocus?: (event: Event) => void;
}

function AlertDialogContent({
  className,
  children,
  showClose,
  showCloseButton: showCloseButtonProp,
  forceMount: _forceMount,
  ...props
}: AlertDialogContentProps) {
  const { t } = useTranslation();
  const state = useDialogOpenState("AlertDialogContent");
  const showCloseButton = showCloseButtonProp ?? showClose ?? false;

  return (
    <DialogShell role="alertdialog" isDismissable={false} className={className} {...props}>
      {children}
      {showCloseButton ? (
        <button
          type="button"
          // Same slot as DialogContent's close: `[data-slot="dialog-close"]`
          // (styles/dialog-layout.css) is what pins the ✕ to the corner and gives it the rest
          // opacity. Without it this button rendered inline, in flow, under the footer.
          data-slot="dialog-close"
          // Same single-source ring as DialogContent's close (styles/focus-ring.css).
          className="ui-focus-ring transition-opacity disabled:pointer-events-none"
          aria-label={t("feedback.alert.dismiss")}
          onClick={() => {
            state.setOpen(false);
          }}
        >
          <X className="ui-dialog-close-icon" aria-hidden="true" />
        </button>
      ) : null}
    </DialogShell>
  );
}
AlertDialogContent.displayName = "AlertDialogContent";

const AlertDialogHeader = ({
  className,
  title,
  subtitle,
  extra,
  tone = "default",
  children,
  ...props
}: DialogHeaderProps) => {
  return (
    <div
      data-slot="dialog-header"
      data-tone={tone}
      className={cn(overlayHeaderToneClass[tone], className)}
      {...props}
    >
      {children ?? (
        <div className="ui-dialog-title-row">
          <div className="ui-dialog-title-block">
            {title != null && <AlertDialogTitle>{title}</AlertDialogTitle>}
            {subtitle != null && <AlertDialogDescription>{subtitle}</AlertDialogDescription>}
          </div>
          {extra != null && <div className="ui-dialog-extra">{extra}</div>}
        </div>
      )}
    </div>
  );
};
AlertDialogHeader.displayName = "AlertDialogHeader";

const AlertDialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  // Layout lives in feedback-layout.css [data-slot="dialog-footer"] (right-aligned actions).
  <div data-slot="dialog-footer" className={cn(className)} {...props} />
);
AlertDialogFooter.displayName = "AlertDialogFooter";

const AlertDialogTitle = DialogTitle;
const AlertDialogDescription = DialogDescription;

interface DialogActionProps extends React.ComponentPropsWithRef<"button"> {
  /** Mượn thẻ của con thay vì dựng `<button>` riêng. */
  asChild?: boolean;
}

/**
 * Confirm mode — primary action (maps to Radix AlertDialogAction). Nhấn mạnh đọc từ `variant` của
 * hộp thoại: đây là phần thứ ba của một-prop-ba-việc ở đầu tệp, và là chỗ antd đặt `okType`.
 */
function DialogAction({ asChild, className, onClick, ...props }: DialogActionProps) {
  const state = useDialogOpenState("DialogAction");
  const variant = React.useContext(DialogVariantContext);
  const Comp = (asChild ? Slot : "button") as React.ElementType;

  return (
    <Comp
      type="button"
      /*
       * `data-variant` CHỈ khi tự dựng thẻ. Dưới `asChild`, gói prop này chảy vào con — và
       * `Button` spread `{...props}` SAU `data-variant` của chính nó, nên một `data-variant` từ
       * đây sẽ ghi đè và biến thuộc tính ấy thành lời khai sai về nút đang được vẽ.
       */
      data-variant={asChild ? undefined : variant}
      className={cn(buttonVariants({ variant }), className)}
      {...props}
      onClick={chain(onClick, () => {
        state.setOpen(false);
      })}
    />
  );
}
DialogAction.displayName = "DialogAction";

/** Confirm mode — dismiss without action (maps to Radix AlertDialogCancel). */
function DialogCancel({ asChild, className, onClick, ...props }: DialogActionProps) {
  const state = useDialogOpenState("DialogCancel");
  const Comp = (asChild ? Slot : "button") as React.ElementType;

  return (
    <Comp
      type="button"
      className={cn(buttonVariants({ variant: "outline" }), className)}
      {...props}
      onClick={chain(onClick, () => {
        state.setOpen(false);
      })}
    />
  );
}
DialogCancel.displayName = "DialogCancel";

const AlertDialogAction = DialogAction;
const AlertDialogCancel = DialogCancel;

/**
 * Preset: confirm / destructive / typed-challenge / step-up without compound markup. Both flows
 * force the destructive shape: the confirm button plus antd's leading status glyph. The header
 * surface stays untinted — see the note on `showDangerIcon` below.
 */
function AlertDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel,
  variant = "default",
  confirmPhrase,
  challenge,
  onConfirm,
  stepUp,
  keepOpenOnConfirm = false,
  pending = false,
}: AlertDialogProp) {
  const { t } = useTranslation();
  const [typed, setTyped] = React.useState("");
  const [verifying, setVerifying] = React.useState(false);
  const [stepUpFailed, setStepUpFailed] = React.useState(false);
  const inputId = React.useId();
  const stepErrorId = React.useId();

  // `challenge` is the semantic name for the typed token (an org slug); `confirmPhrase` is the
  // back-compat alias. Either enables the same type-to-confirm friction.
  const phrase = confirmPhrase ?? challenge;
  const needsPhrase = phrase != null && phrase.length > 0;
  const phraseMatches = !needsPhrase || typed === phrase;
  const effectiveVariant = needsPhrase ? "destructive" : variant;
  // ANT DESIGN PARITY: the DANGER SIGNAL IS A GLYPH, NOT A TINTED SURFACE.
  //
  // antd's `Modal.confirm` paints a red status icon beside the title and leaves the surface at
  // `colorBgElevated`; it never tints a modal header. (Its soft `colorErrorBg` belongs to
  // `Alert`/`Tag`/`message`, and always arrives with padding and a border.) The preset used to
  // force `tone="destructive"` on the header instead, which put a third danger signal on a screen
  // that already has a destructive button and a type-to-confirm challenge — the strongest of the
  // three — while matching neither antd nor a proper band.
  //
  // `DialogHeader tone` stays a published seven-value axis for a caller who wants the band; the
  // preset simply stops imposing it (DESIGN-AUTHORITY.md §4 keeps that separation).
  const showDangerIcon = effectiveVariant === "destructive";
  const resolvedConfirm = confirmLabel ?? (needsPhrase ? t("common.delete") : t("common.continue"));
  const resolvedCancel = cancelLabel ?? t("common.cancel");
  const busy = pending || verifying;
  const confirmLabelText = verifying
    ? t("feedback.alert.verifying")
    : pending
      ? t("common.working")
      : resolvedConfirm;

  const reset = () => {
    setTyped("");
    setVerifying(false);
    setStepUpFailed(false);
  };

  const handleOpenChange = (next: boolean) => {
    reset();
    onOpenChange(next);
  };

  const handleConfirm = () => {
    if (!phraseMatches || busy) return;
    void (async () => {
      if (stepUp) {
        setStepUpFailed(false);
        setVerifying(true);
        // Both the try and the catch assign, so an initialiser here is dead.
        let ok: boolean;
        try {
          ok = await stepUp();
        } catch {
          ok = false;
        }
        setVerifying(false);
        if (!ok) {
          setStepUpFailed(true);
          return;
        }
      }
      await onConfirm();
      if (!keepOpenOnConfirm) onOpenChange(false);
    })();
  };

  return (
    <AlertDialogRoot open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <DialogHeader>
          <div className="ui-dialog-confirm-body">
            {showDangerIcon && <AlertCircle className="ui-dialog-confirm-icon" aria-hidden />}
            <div className="ui-dialog-confirm-text">
              <AlertDialogTitle>{title}</AlertDialogTitle>
              {description ? <AlertDialogDescription>{description}</AlertDialogDescription> : null}
            </div>
          </div>
        </DialogHeader>

        {/* The middle is a BODY, and the body is where the scroll lives (gh#617). Without it a long
            challenge label or a step-up error pushes the footer's buttons off-screen, with Escape as
            the only way out — `[data-slot=dialog-content]` is `overflow: hidden` by design. */}
        <DialogBody>
        {needsPhrase && (
          <FormField id={inputId} label={t("common.typeToConfirm", { phrase })}>
            <Input
              id={inputId}
              value={typed}
              onChange={(e) => {
                setTyped(e.target.value);
              }}
              autoComplete="off"
              spellCheck={false}
              placeholder={phrase}
              aria-required="true"
              disabled={busy}
            />
          </FormField>
        )}

        {stepUpFailed && (
          <p id={stepErrorId} role="alert" className="ui-dialog-step-up-error">
            {t("feedback.alert.stepUpFailed")}
          </p>
        )}
        </DialogBody>

        <DialogFooter>
          <DialogCancel asChild>
            <Button variant="ghost" disabled={busy}>
              {resolvedCancel}
            </Button>
          </DialogCancel>
          <Button
            variant={effectiveVariant === "destructive" ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={busy || !phraseMatches}
            aria-describedby={stepUpFailed ? stepErrorId : undefined}
          >
            {confirmLabelText}
          </Button>
        </DialogFooter>
      </AlertDialogContent>
    </AlertDialogRoot>
  );
}

export const Dialog = Object.assign(DialogRoot, {
  Trigger: DialogTrigger,
  Portal: DialogPortal,
  Overlay: DialogOverlay,
  Content: DialogContent,
  Header: DialogHeader,
  Body: DialogBody,
  Footer: DialogFooter,
  Title: DialogTitle,
  Description: DialogDescription,
  Close: DialogClose,
  Action: DialogAction,
  Cancel: DialogCancel,
});

export {
  DialogRoot,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogAction,
  DialogCancel,
  AlertDialogRoot,
  AlertDialogTrigger,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialog,
};
