import * as React from "react";
import { chain, mergeRefs } from "@react-aria/utils";
import { Popover as AriaPopover, type Placement } from "react-aria-components";

import { cn } from "../../lib/utils";
import { Slot } from "../../lib/slot";
import { useOverlayCloseFocus } from "../feedback/overlay-close-focus";
import type { FlushProp } from "../../props/vocabulary";

/*
 * Popover — nền là `Popover` của react-aria-components, API công khai vẫn nguyên văn Radix:
 * `open`/`defaultOpen`/`onOpenChange`/`modal` ở gốc, `side`/`align`/`sideOffset`/`alignOffset` ở
 * panel, và `asChild` trên trigger lẫn anchor.
 *
 * ## Tên prop dịch ở BÊN TRONG
 *
 * Cả hai thư viện đều đứng trên floating-ui nhưng gọi tên khác nhau. Bảng dịch, một chiều, chỉ
 * sống trong tệp này:
 *
 *     side + align  →  placement      ("bottom" + "start" → "bottom start")
 *     sideOffset    →  offset
 *     alignOffset   →  crossOffset
 *     avoidCollisions → shouldFlip
 *     collisionPadding → containerPadding   (RAC chỉ nhận MỘT số; object lấy cạnh lớn nhất)
 *     modal         →  isNonModal (đảo)
 *
 * `sticky` / `hideWhenDetached` / `forceMount` KHÔNG có tương đương trong RAC. Chúng vẫn nằm trong
 * kiểu vì đó là API công khai, nhưng không còn tác dụng — bỏ hẳn thì mọi call site đang truyền
 * chúng sẽ đỏ, mà không call site nào trong kho đang truyền.
 *
 * ## Ba biến CSS `--radix-*` được PHÁT LẠI
 *
 * `src/styles/control.css` bám vào `--radix-popover-trigger-width` (search-select, cascader,
 * tree-select) và `--radix-popover-content-available-height` (search-select), còn class trên panel
 * bám vào `--radix-popover-content-transform-origin`. Đó là hợp đồng CSS công khai, không phải chi
 * tiết cài đặt của Radix, nên chúng được ánh xạ sang thứ RAC cung cấp (`--trigger-width`,
 * `maxHeight` đã tính sẵn, `--trigger-anchor-point`) thay vì đi sửa 12k dòng CSS.
 *
 * ## `data-state` / `data-side` / `data-align`, chứ không phải `data-placement`
 *
 * RAC phát `data-placement` + `data-entering`/`data-exiting`; Radix phát `data-side`/`data-align`/
 * `data-state`. Class animation trên panel và CSS của consumer đọc bộ sau, nên bộ sau được phát lại.
 * `data-placement` của RAC vẫn nằm nguyên bên cạnh.
 *
 * ## Tự lo ba việc RAC không làm khi `isNonModal`
 *
 * Radix `modal={false}` vẫn: (1) đưa tiêu điểm vào panel khi mở, và cho phép chặn bằng
 * `onOpenAutoFocus`; (2) đóng khi bấm ra ngoài; (3) TRẢ tiêu điểm về chỗ cũ lúc đóng, ĐỒNG BỘ, và
 * cho phép chặn bằng `onCloseAutoFocus`. RAC ở chế độ non-modal bỏ (1) và (2) — `usePopover` đặt
 * `isDismissable: !isNonModal`, và chỉ panel dạng dialog (tức modal) mới được lấy tiêu điểm — còn
 * (3) thì làm, nhưng trong một `requestAnimationFrame` SAU khi tháo và không có móc để chặn.
 * Năm consumer trong kho (date/time/month picker) đang dựa vào (1) để CHẶN việc lấy tiêu điểm, cả
 * 9 consumer dựa vào (2), và (3) là API công khai mà app đang dùng để đưa tiêu điểm về ô soạn thảo
 * sau khi chọn xong. Nên ba hành vi ấy được chép tay ở đây — đúng phần Radix làm, không hơn; riêng
 * (3) dùng lại `useOverlayCloseFocus`, đúng hook Dialog/Sheet đang dùng, chứ không viết bản thứ
 * hai.
 *
 * ## Tab RA KHỎI panel: theo RAC, `loop` của Radix KHÔNG được chép — có chủ ý
 *
 * Đây là khác biệt hành vi công khai DUY NHẤT còn lại giữa hai nền, nên nó được quyết ở đây một
 * lần thay vì mỗi consumer tự đoán.
 *
 * Radix bọc panel trong `FocusScope loop trapped={modal}`, và `loop` áp dụng KỂ CẢ khi không trap:
 * Tab ở phần tử tab được cuối cùng quay về phần tử đầu, nên tiêu điểm không bao giờ rời panel —
 * chỉ Escape mới ra được. RAC làm khác: `Overlay` luôn dựng `FocusScope restoreFocus`, và
 * `useRestoreFocus` cài keydown ở PHA CAPTURE CẤP DOCUMENT: hết phần tử tab được trong panel thì
 * nó nhảy tới phần tử kế tiếp sau TRIGGER trong tài liệu, kèm `preventDefault` +
 * `stopPropagation`. Đo trên jsdom, panel mở với tiêu điểm ở ô tìm kiếm:
 *
 *     có phần tử tab được sau trigger  →  Tab tới đúng phần tử đó, và panel ĐÓNG (blur-within)
 *     không có gì sau trigger          →  tiêu điểm vẫn RA khỏi panel (RAC `blur()` xuống
 *                                         `document.body`, hoặc trả thẳng về trigger nếu trigger
 *                                         nằm trong một scope khác), panel vẫn mở
 *
 * Lấy hành vi của RAC, vì ba lẽ:
 *
 * 1. KHÔNG có đường cấu hình. `Overlay` chốt cứng `restoreFocus: true`, còn `shouldContainFocus`
 *    được `Popover` của RAC tự tính rồi đặt SAU `{...props}` — `PopoverProps` không khai báo
 *    `shouldContainFocus`, `restoreFocus`, `contain` hay `disableFocusManagement`. Giữ `loop` thì
 *    chỉ còn cách tự cài một keydown capture cấp document để tranh với RAC. Hai handler capture
 *    giành nhau cùng một phím trên cùng một tài liệu là dấu hiệu đang đi ngược thư viện nền, nên
 *    không làm.
 * 2. Đường hợp lệ duy nhất để có vòng lặp là bật `contain`, mà `contain` thì GIAM tiêu điểm: qua
 *    `focusin`, `FocusScope` kéo tiêu điểm trở lại panel. Năm picker (date/date-range/month/
 *    month-range/time) cố ý giữ tiêu điểm ở ô nhập BÊN NGOÀI panel bằng `onOpenAutoFocus`
 *    prevented — bật `contain` là hỏng cả năm.
 * 3. Hành vi RAC đúng APG hơn cho panel non-modal: Tab đi tiếp theo thứ tự tài liệu thay vì quay
 *    vòng. `loop` của Radix trên panel KHÔNG trap là một cái bẫy bàn phím mềm — người dùng bàn
 *    phím không Tab qua được popover, chỉ Escape mới thoát.
 *
 * Điểm dừng ở `document.body` KHÔNG được vá. Nó đến từ `focusedElement.blur()` của RAC khi không
 * còn gì để lấy tiêu điểm, và `useOverlay` cố tình KHÔNG đóng panel khi `relatedTarget` là null —
 * rời cửa sổ (alt-tab) cũng cho relatedTarget null. Đóng ở đó sẽ khiến mọi popover tự tắt mỗi lần
 * người dùng chuyển ứng dụng: đắt hơn hẳn một điểm dừng ở body, thứ chỉ xảy ra khi trigger là phần
 * tử tab được CUỐI CÙNG của trang, và từ đó thứ tự tab của chính tài liệu đưa tiêu điểm quay lại.
 *
 * Đổi cảm giác dùng ở 5/10 consumer — đúng những chỗ panel TỰ lấy tiêu điểm: `search-select`,
 * `cascader`, `tree-select`, `org-switcher` và flyout của `sidebar` (Tab qua hết mục là ra ngoài
 * và đóng, thay vì quay về mục đầu). Năm picker không đổi: tiêu điểm ở lại ô nhập ngoài scope, mà
 * handler của RAC thoát sớm khi phần tử đang focus không nằm trong scope.
 */

/** Gói prop mà `render` của RAC trao lại; nó có thêm `data-rac`, thứ kiểu JSX không khai báo. */
type RacDomProps = React.ComponentPropsWithRef<"div"> & { "data-rac"?: string };

type Side = "top" | "right" | "bottom" | "left";
type Align = "start" | "center" | "end";

/**
 * `side` + `align` của Radix → `placement` của RAC.
 *
 * Trục dọc (`top`/`bottom`) nhận hậu tố `start`/`end` theo chiều đọc; trục ngang (`left`/`right`)
 * KHÔNG — RAC chỉ chấp nhận `top`/`bottom` ở đó, và đó đúng là ý nghĩa của `align` khi panel nằm
 * cạnh trigger.
 */
function toPlacement(side: Side, align: Align): Placement {
  if (align === "center") return side;
  if (side === "top" || side === "bottom") return `${side} ${align}` as Placement;
  return `${side} ${align === "start" ? "top" : "bottom"}` as Placement;
}

/** `collisionPadding` của Radix (số HOẶC object bốn cạnh) → `containerPadding` của RAC (một số). */
function toContainerPadding(
  padding: number | Partial<Record<Side, number>> | undefined,
): number | undefined {
  if (padding == null) return undefined;
  if (typeof padding === "number") return padding;
  const sides = Object.values(padding).filter(
    (value): value is number => typeof value === "number",
  );
  return sides.length ? Math.max(...sides) : undefined;
}

/**
 * Phần tử tab được đầu tiên bên trong panel, hoặc `null`.
 *
 * Bản rút gọn của `getTabbableCandidates` + `removeLinks` trong `FocusScope` của Radix: duyệt theo
 * thứ tự DOM, bỏ phần tử `disabled` / `hidden` / input ẩn và mọi thẻ `<a>`, lấy phần tử đầu tiên
 * có `tabIndex >= 0`.
 */
function firstTabbable(container: HTMLElement): HTMLElement | null {
  for (const node of container.querySelectorAll<HTMLElement>("*")) {
    if (node.tagName === "A") continue;
    if (node.hidden || (node as HTMLInputElement).disabled) continue;
    if (node.tagName === "INPUT" && (node as HTMLInputElement).type === "hidden") continue;
    if (node.tabIndex >= 0) return node;
  }
  return null;
}

type PopoverRootValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  contentId: string;
  isNonModal: boolean;
  triggerRef: React.RefObject<HTMLElement | null>;
  anchorRef: React.RefObject<HTMLElement | null>;
  /** `PopoverAnchor` có mặt → panel định vị theo anchor, không theo trigger (đúng như Radix). */
  anchored: boolean;
  setAnchored: (anchored: boolean) => void;
  /*
   * NAMING THE DIALOG. `PopoverContent` publishes `role="dialog"`, and a dialog without an
   * accessible name is announced as the bare word "dialog" (axe: aria-dialog-name, WCAG 4.1.2).
   * This shipped nameless: `PopoverTitle` was a plain `<div>` with no id and nothing wired to it,
   * so even a popover that DID render a title had none. It went unseen because the shared a11y
   * helper audited the render container while every overlay portals into `document.body`.
   *
   * `PopoverTitle` registers on mount; the content points at it when it is there and falls back to
   * the TRIGGER's own name when it is not — a popover with no heading is named by the control that
   * opened it, which is what the reader just activated. Pointing at an unrendered id would be a
   * different violation (a reference to a missing element), so the fallback is not optional.
   */
  titleId: string;
  descriptionId: string;
  hasTitle: boolean;
  hasDescription: boolean;
  registerTitle: (present: boolean) => void;
  registerDescription: (present: boolean) => void;
  triggerId: string;
};

const PopoverRootContext = React.createContext<PopoverRootValue | null>(null);

function usePopoverRoot(component: string): PopoverRootValue {
  const context = React.useContext(PopoverRootContext);
  if (!context) {
    throw new Error(`\`${component}\` phải nằm trong \`Popover\`.`);
  }
  return context;
}

interface PopoverProps {
  /** Trạng thái mở, có kiểm soát. */
  open?: boolean;
  /** Trạng thái mở ban đầu khi không kiểm soát. */
  defaultOpen?: boolean;
  /** Gọi khi trạng thái mở/đóng đổi. */
  onOpenChange?: (open: boolean) => void;
  /** Khoá tương tác ngoài panel và giam tiêu điểm, đúng như `modal` của Radix. */
  modal?: boolean;
}

export function Popover({
  open,
  defaultOpen,
  onOpenChange,
  modal = false,
  children,
}: React.PropsWithChildren<PopoverProps>) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen ?? false);
  const [anchored, setAnchored] = React.useState(false);
  const triggerRef = React.useRef<HTMLElement | null>(null);
  const anchorRef = React.useRef<HTMLElement | null>(null);
  const contentId = React.useId();
  const titleId = React.useId();
  const descriptionId = React.useId();
  const triggerId = React.useId();
  const [hasTitle, registerTitle] = React.useState(false);
  const [hasDescription, registerDescription] = React.useState(false);
  const isOpen = open ?? uncontrolledOpen;

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (open === undefined) {
        setUncontrolledOpen(next);
      }
      onOpenChange?.(next);
    },
    [open, onOpenChange],
  );

  const value = React.useMemo<PopoverRootValue>(
    () => ({
      open: isOpen,
      setOpen,
      contentId,
      isNonModal: !modal,
      triggerRef,
      anchorRef,
      anchored,
      setAnchored,
      titleId,
      descriptionId,
      hasTitle,
      hasDescription,
      registerTitle,
      registerDescription,
      triggerId,
    }),
    [
      isOpen,
      setOpen,
      contentId,
      modal,
      anchored,
      titleId,
      descriptionId,
      hasTitle,
      hasDescription,
      triggerId,
    ],
  );

  return <PopoverRootContext.Provider value={value}>{children}</PopoverRootContext.Provider>;
}

interface PopoverTriggerProps extends React.ComponentPropsWithRef<"button"> {
  /** Mượn thẻ của con thay vì dựng `<button>` riêng. */
  asChild?: boolean;
}

export function PopoverTrigger({ asChild, onClick, ref, ...props }: PopoverTriggerProps) {
  const root = usePopoverRoot("PopoverTrigger");
  const Comp = (asChild ? Slot : "button") as React.ElementType;

  return (
    <Comp
      type="button"
      data-slot="popover-trigger"
      aria-haspopup="dialog"
      aria-expanded={root.open}
      /* `aria-controls` chỉ khi ĐANG MỞ: panel bị tháo khi đóng, và trỏ vào id không tồn tại là
       * lỗi axe thật. Radix cũng làm đúng vậy. */
      id={props.id ?? root.triggerId}
      aria-controls={root.open ? root.contentId : undefined}
      data-state={root.open ? "open" : "closed"}
      {...props}
      ref={mergeRefs(ref, root.triggerRef)}
      onClick={chain(onClick, () => root.setOpen(!root.open))}
    />
  );
}

interface PopoverAnchorProps extends React.ComponentPropsWithRef<"span"> {
  /** Mượn thẻ của con thay vì dựng `<span>` riêng. */
  asChild?: boolean;
}

export function PopoverAnchor({ asChild, ref, ...props }: PopoverAnchorProps) {
  const root = usePopoverRoot("PopoverAnchor");
  const Comp = (asChild ? Slot : "span") as React.ElementType;
  const { setAnchored } = root;

  React.useEffect(() => {
    setAnchored(true);
    return () => setAnchored(false);
  }, [setAnchored]);

  return <Comp data-slot="popover-anchor" {...props} ref={mergeRefs(ref, root.anchorRef)} />;
}

/**
 * The panel's CONTENT owns its inset — a Command list, a menu or a table that must run edge to
 * edge and draw its own separators across the full width. The popover drops its own padding by
 * zeroing `--popover-space-inset` ON THE PANEL, so the inset stays one token (a service that
 * retunes `--popover-space-inset` still owns every padded popover) and no consumer has to reach
 * for a zero-padding utility, which no service theme can reach.
 */
type PopoverContentFlush = { flush?: FlushProp };

interface PopoverContentProps extends React.ComponentPropsWithRef<"div">, PopoverContentFlush {
  /** Cạnh của trigger mà panel bám vào. */
  side?: Side;
  /** Canh panel theo cạnh của trigger. */
  align?: Align;
  /** Khoảng cách theo trục chính, tính bằng px. */
  sideOffset?: number;
  /** Khoảng cách theo trục phụ, tính bằng px. */
  alignOffset?: number;
  /** Lật panel sang cạnh đối diện khi hết chỗ. */
  avoidCollisions?: boolean;
  /** Khoảng chừa với mép khung nhìn. RAC chỉ nhận một số; object lấy cạnh lớn nhất. */
  collisionPadding?: number | Partial<Record<Side, number>>;
  /** Không còn tác dụng trên nền RAC — giữ trong kiểu vì là API công khai. */
  sticky?: "partial" | "always";
  /** Không còn tác dụng trên nền RAC — giữ trong kiểu vì là API công khai. */
  hideWhenDetached?: boolean;
  /** Không còn tác dụng trên nền RAC — giữ trong kiểu vì là API công khai. */
  forceMount?: true;
  /**
   * Chặn việc panel tự lấy tiêu điểm khi mở, bằng `event.preventDefault()`.
   *
   * Năm picker trong kho dựa vào đúng điều này để giữ tiêu điểm ở ô nhập, nên hành vi được chép
   * tay từ Radix chứ không bỏ.
   */
  onOpenAutoFocus?: (event: Event) => void;
  /**
   * Chặn việc trả tiêu điểm về nơi nó đứng trước khi panel mở, bằng `event.preventDefault()`.
   *
   * Phát ở MỌI đường đóng (chọn một mục, Escape, bấm ra ngoài, Tab ra ngoài), nên consumer đưa
   * được tiêu điểm tới đúng chỗ người dùng cần gõ tiếp thay vì để nó quay về trigger.
   */
  onCloseAutoFocus?: (event: Event) => void;
}

export function PopoverContent({
  className,
  style,
  children,
  ref,
  flush,
  side = "bottom",
  align = "center",
  sideOffset = 4,
  alignOffset,
  avoidCollisions = true,
  collisionPadding,
  sticky: _sticky,
  hideWhenDetached: _hideWhenDetached,
  forceMount: _forceMount,
  onOpenAutoFocus,
  onCloseAutoFocus,
  ...props
}: PopoverContentProps) {
  const root = usePopoverRoot("PopoverContent");
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const openAutoFocusRef = React.useRef(onOpenAutoFocus);
  openAutoFocusRef.current = onOpenAutoFocus;

  /*
   * Đối xứng của `onOpenAutoFocus`, và dùng lại đúng hook mà Dialog/Sheet đang dùng chứ không viết
   * bản thứ hai: `FocusScope` của react-aria trả tiêu điểm trong một `requestAnimationFrame` SAU
   * khi tháo, nên trong đúng một khung hình `document.activeElement` là `<body>` — và Radix thì trả
   * đồng bộ, có `onCloseAutoFocus` để chặn. Hook lấp khung hình đó và phát sự kiện huỷ được.
   */
  useOverlayCloseFocus(root.open, onCloseAutoFocus, contentRef);

  /*
   * Radix đưa tiêu điểm vào panel khi mở và cho consumer chặn bằng `onOpenAutoFocus`; RAC ở chế độ
   * non-modal không làm gì cả. Chép tay lại, vì Escape của RAC nằm trên CHÍNH thẻ panel — không có
   * tiêu điểm bên trong thì không có phím nào tới nơi.
   */
  React.useEffect(() => {
    if (!root.open) return;
    const node = contentRef.current;
    if (!node) return;
    const event = new Event("popover.openAutoFocus", { bubbles: false, cancelable: true });
    openAutoFocusRef.current?.(event);
    if (!event.defaultPrevented) {
      /*
       * Đích là phần tử tab được ĐẦU TIÊN bên trong, chỉ lùi về chính thẻ panel khi không có phần
       * tử nào — đúng thứ tự `focusFirst(getTabbableCandidates(container))` rồi mới
       * `focus(container)` trong `FocusScope` của Radix. Ô tìm kiếm của search-select / cascader /
       * tree-select / org-switcher dựa vào bước ĐẦU: mở panel xong là gõ được ngay. Chỉ lấy tiêu
       * điểm cho thẻ panel thì phím gõ rơi vào hư không.
       */
      const target = firstTabbable(node);
      target?.focus({ preventScroll: true });
      if (!node.contains(document.activeElement)) {
        node.focus({ preventScroll: true });
      }
    }
  }, [root.open]);

  /*
   * Bấm ra ngoài thì đóng — `usePopover` đặt `isDismissable: !isNonModal`, nên panel non-modal của
   * RAC KHÔNG tự đóng. Trigger được loại trừ vì `onClick` của nó đã tự lật trạng thái.
   */
  const { open, setOpen, triggerRef } = root;
  React.useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (contentRef.current?.contains(target)) return;
      if (triggerRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, setOpen, triggerRef]);

  return (
    <AriaPopover
      isOpen={root.open}
      onOpenChange={root.setOpen}
      isNonModal={root.isNonModal}
      triggerRef={root.anchored ? root.anchorRef : root.triggerRef}
      placement={toPlacement(side, align)}
      offset={sideOffset}
      crossOffset={alignOffset}
      shouldFlip={avoidCollisions}
      containerPadding={toContainerPadding(collisionPadding)}
      render={(racProps, { isExiting }) => {
        const {
          className: _racClassName,
          "data-rac": _rac,
          ref: racRef,
          style: racStyle,
          ...rest
        } = racProps as RacDomProps;

        /*
         * `maxHeight` là chỗ RAC cất chiều cao còn trống; Radix cất nó vào biến CSS và để
         * stylesheet quyết định có dùng hay không. `.ui-search-select-panel` đang đọc biến đó.
         */
        const availableHeight = racStyle?.maxHeight;

        return (
          <div
            {...rest}
            id={root.contentId}
            role="dialog"
            tabIndex={-1}
            data-slot="popover-content"
            data-side={side}
            data-align={align}
            data-state={isExiting ? "closed" : "open"}
            data-flush={flush ? "" : undefined}
            {...props}
            /*
             * AFTER `{...props}`, and computed from `props` rather than `rest`: `rest` is RAC's own
             * DOM bag, so a consumer's `aria-label` is not in it. Reading the wrong bag put an
             * `aria-labelledby` alongside an explicit `aria-label`, and labelledby WINS the
             * accessible-name algorithm — OrgSwitcher's "Choose organization" panel silently became
             * the trigger's name instead. An explicit label from the consumer has to survive.
             */
            aria-labelledby={
              props["aria-labelledby"] ??
              (props["aria-label"] ? undefined : root.hasTitle ? root.titleId : root.triggerId)
            }
            aria-describedby={
              props["aria-describedby"] ?? (root.hasDescription ? root.descriptionId : undefined)
            }
            ref={mergeRefs(ref, racRef, contentRef)}
            className={cn(
              "ui-popover-content origin-[var(--radix-popover-content-transform-origin)]",
              "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
              "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
              "data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2",
              "data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2",
              className,
            )}
            style={
              {
                ...racStyle,
                "--radix-popover-trigger-width": "var(--trigger-width)",
                "--radix-popover-content-transform-origin": "var(--trigger-anchor-point)",
                ...(availableHeight == null
                  ? null
                  : {
                      "--radix-popover-content-available-height":
                        typeof availableHeight === "number"
                          ? `${availableHeight}px`
                          : availableHeight,
                    }),
                ...style,
                ...(flush ? { "--popover-space-inset": "0" } : null),
              } as React.CSSProperties
            }
          >
            {children}
          </div>
        );
      }}
    />
  );
}

export const PopoverHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div data-slot="popover-header" className={cn("ui-popover-header", className)} {...props} />
);

export const PopoverTitle = ({ className, id, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  const root = usePopoverRoot("PopoverTitle");
  // Registering on mount rather than having the content look for a title: the content renders in a
  // portal and cannot see what its own children are, and a title added later must still name it.
  React.useEffect(() => {
    root.registerTitle(true);
    return () => root.registerTitle(false);
  }, [root]);

  return (
    <div
      data-slot="popover-title"
      id={id ?? root.titleId}
      className={cn("font-medium", className)}
      {...props}
    />
  );
};

export const PopoverDescription = ({
  className,
  id,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => {
  const root = usePopoverRoot("PopoverDescription");
  React.useEffect(() => {
    root.registerDescription(true);
    return () => root.registerDescription(false);
  }, [root]);

  return (
    <p
      data-slot="popover-description"
      id={id ?? root.descriptionId}
      className={cn("text-muted-foreground", className)}
      {...props}
    />
  );
};
