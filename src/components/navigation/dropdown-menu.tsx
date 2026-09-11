import { useOverlayPortalContainer } from "../../lib/overlay-portal";
import * as React from "react";
import {
  Header,
  Button as AriaButton,
  Menu,
  MenuItem,
  MenuSection,
  MenuTrigger,
  OverlayTriggerStateContext,
  Popover,
  Pressable,
  RootMenuTriggerStateContext,
  Separator,
  OverlayArrow,
  SubmenuTrigger,
  useLocale,
  type MenuItemRenderProps,
  type PopoverProps,
  type PopoverRenderProps,
} from "react-aria-components";
import { Check, ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils";
import { Slot } from "../../lib/slot";
import type {
  DropdownMenuPlacementProp,
  DropdownMenuTriggerActionProp,
} from "../../props/components/navigation.prop";

export type {
  DropdownMenuPlacementProp,
  DropdownMenuTriggerActionProp,
} from "../../props/components/navigation.prop";

/**
 * Ant Design `placement` → the two Radix anchors it is made of. `align` is LOGICAL in Radix
 * (`start`/`end` follow the writing direction), which is why the block-axis anchors can be offered
 * on the logical axis at no cost.
 *
 * antd's inline-side placements (`left`, `leftTop`, `rightBottom`, …) are deliberately NOT here:
 * Radix's `side` is physical, this library ships no `DirectionProvider`, and a `side="left"` menu
 * would open on the wrong edge of an RTL screen. A consumer who genuinely wants a physical inline
 * side still passes Radix's own `side` / `align`, which this component forwards untouched.
 */
const DROPDOWN_MENU_PLACEMENT: Record<
  DropdownMenuPlacementProp,
  { side: "top" | "bottom"; align: "start" | "center" | "end" }
> = {
  top: { side: "top", align: "center" },
  topStart: { side: "top", align: "start" },
  topEnd: { side: "top", align: "end" },
  bottom: { side: "bottom", align: "center" },
  bottomStart: { side: "bottom", align: "start" },
  bottomEnd: { side: "bottom", align: "end" },
};

/*
 * NỀN: React Aria Components, không còn @radix-ui/react-dropdown-menu.
 *
 * API CÔNG KHAI GIỮ NGUYÊN HÌNH DẠNG RADIX (compound + tên prop Radix). RAC gọi mọi thứ bằng tên
 * khác — `isOpen`, `isDisabled`, `onAction`, `isSelected` — và những tên đó KHÔNG được rò ra
 * ngoài; chúng được dịch ngay trong tệp này.
 *
 * RAC `Menu` là một COLLECTION: nó dựng cây từ children qua một lượt render ẩn. Wrapper tự viết
 * vẫn hợp lệ miễn là chúng trả về một nút collection (`MenuItem`, `MenuSection`, `Separator`,
 * `Header`, `SubmenuTrigger`). Hệ quả: hook đặt trong
 * wrapper chạy ở LƯỢT ẨN, nơi chưa có state của menu; mọi thứ phụ thuộc trạng thái item phải đi
 * qua prop `render` của RAC, thứ được gọi ở lượt DOM thật.
 *
 * `render` cũng là chỗ tái lập các `data-*` của Radix mà 12k dòng CSS đang bám: RAC phát
 * `data-focused` / `data-selected` / `data-placement`, CSS ở đây đọc `data-highlighted` /
 * `data-state` / `data-side`.
 */

/** Thuộc tính DOM mà `render` của một MenuItem nhận (nhánh không-phải-link của RAC). */
type ItemDomProps = React.JSX.IntrinsicElements["div"];

/** Thẻ mà `asChild` đi mượn: đúng một phần tử, và ruột của nó được lấy ra dùng riêng. */
type BorrowedTag = React.ReactElement<{ children?: React.ReactNode }>;

/**
 * `asChild` trên một mục menu, dưới ràng buộc collection của RAC.
 *
 * Không thể gộp thẳng props vào `props.children` trong `render`: cái đó KHÔNG phải children của
 * consumer — RAC bọc chúng trong một `Provider` mang các slot label/description. Nên thẻ đi mượn
 * phải tách làm hai nửa. `borrowedTag` rút thẻ ra ở lượt render ẩn, còn RUỘT của nó được giao lại
 * cho `MenuItem` làm children để collection vẫn rút được `textValue` như thường.
 *
 * Tới lượt DOM thật, `renderItemTag` ghép hai nửa: thẻ mượn nhận nội dung RAC trả về, và `Slot`
 * gộp props của RAC vào nó — `ref` (mergeProps hợp nhất hai ref), handler nhấn, `role`, `tabIndex`.
 * Kết quả: chính thẻ của consumer LÀ mục menu, không có phần tử bọc nào chen vào giữa.
 */
function borrowedTag(children: React.ReactNode, asChild?: boolean): BorrowedTag | null {
  return asChild ? (React.Children.only(children) as BorrowedTag) : null;
}

/** Gói prop dựng nên một mục menu: DOM props của RAC cộng bộ `data-*` dịch từ Radix. */
type ItemTagProps = ItemDomProps & Record<`data-${string}`, string | boolean | undefined>;

function renderItemTag(tag: BorrowedTag | null, domProps: ItemTagProps, content: React.ReactNode) {
  if (!tag) {
    return <div {...domProps}>{content}</div>;
  }
  return (
    <Slot {...(domProps as React.HTMLAttributes<HTMLElement> & React.RefAttributes<HTMLElement>)}>
      {React.cloneElement(tag, undefined, content)}
    </Slot>
  );
}

/**
 * Dịch trạng thái item của RAC sang bộ `data-*` mà Radix phát ra và CSS của kho đang bám.
 *
 * `data-highlighted` là móc tô sáng bàn phím (`.ui-dropdown-menu-item[data-highlighted]`);
 * `data-state` mang cả hai nghĩa của Radix — "open" cho sub-trigger, "checked" cho hàng có chọn.
 */
export function radixItemState(state: MenuItemRenderProps): Record<string, string | undefined> {
  return {
    "data-highlighted": state.isFocused ? "" : undefined,
    "data-disabled": state.isDisabled ? "" : undefined,
    "data-state": state.hasSubmenu
      ? state.isOpen
        ? "open"
        : "closed"
      : state.selectionMode === "none"
        ? undefined
        : state.isSelected
          ? "checked"
          : "unchecked",
  };
}

/**
 * Dịch trạng thái popover của RAC sang `data-state` / `data-side` của Radix.
 *
 * ĐI KÈM: hai chỗ gọi nó đều bỏ `role` khỏi DOM (`role={undefined}`). RAC tự gắn `role="dialog"`
 * cho MỌI popover modal — "Automatically render Popover with role=dialog except when isNonModal is
 * true" — kể cả khi ruột của nó là một `role="menu"`. Radix không làm thế, và hợp đồng của tệp này
 * là giữ hình dạng Radix ở CẢ cây a11y chứ không chỉ ở tên prop.
 *
 * Cái giá, đo được ở consumer chuột bạch (godx-chat, 08/09/2026): mở một hộp thoại TỪ một mục menu
 * để lại HAI phần tử `role="dialog"` trong DOM suốt ~300ms — popover của menu đang chạy animation
 * thoát (`data-exiting`), cộng chính hộp thoại vừa mở. 12 phép kiểm Playwright đỏ bằng "strict mode
 * violation" trên `getByRole('dialog')`, thứ Playwright KHÔNG thử lại. Và với trình đọc màn hình,
 * một menu vẫn tự xưng là "dialog".
 *
 * Bỏ đúng THUỘC TÍNH, không đụng hành vi: state `isDialog` bên trong RAC không đổi, nên việc đưa
 * tiêu điểm vào popover lúc mở vẫn chạy nguyên như cũ.
 */
export function radixSurfaceState(state: PopoverRenderProps): Record<string, string | undefined> {
  return {
    "data-state": state.isExiting ? "closed" : "open",
    "data-side": state.placement && state.placement !== "center" ? state.placement : undefined,
  };
}

/** Radix `side` + `align` → `placement` của RAC. `align="center"` là placement trần. */
export function toPlacement(
  side?: "top" | "right" | "bottom" | "left",
  align?: "start" | "center" | "end",
): PopoverProps["placement"] {
  const resolvedSide = side ?? "bottom";
  if (!align || align === "center") return resolvedSide;
  return `${resolvedSide} ${align}` as PopoverProps["placement"];
}

/**
 * Radix trao cho `onSelect` một `Event` huỷ được. RAC's `onAction` không có sự kiện nào, nên ta
 * dựng một cái tương đương để consumer gọi `preventDefault()` không nổ — nhưng nó KHÔNG còn giữ
 * menu mở được nữa (xem báo cáo di trú).
 */
export function selectEvent(name: string): Event {
  return typeof CustomEvent === "function"
    ? new CustomEvent(name, { bubbles: false, cancelable: true })
    : ({ defaultPrevented: false, preventDefault() {} } as unknown as Event);
}

/*
 * ANT DESIGN `trigger` — the gestures that open the menu.
 *
 * antd: `trigger: ('click' | 'hover' | 'contextMenu')[]`, and `disabled` simply empties that list
 * (`triggerActions = disabled ? [] : trigger`). Same shape here, with one deliberate difference:
 * the default is `['click']`, not antd's `['hover']`, because that is what every call site in this
 * ecosystem already does and a hover-only default would silently make existing menus pointer-only.
 *
 * HOW EACH ONE IS SERVED. React Aria's `MenuTrigger` takes ONE `trigger` mode, so the three antd
 * gestures map onto it like this:
 *
 *   • `contextMenu` ALONE → RAC's own `trigger="contextMenu"`. That mode is worth using verbatim:
 *     it drops the press handlers (so a left click does nothing), records the pointer with
 *     `state.setPoint` so the menu opens AT the cursor, calls `preventDefault()` on the native
 *     menu, maps a touch LONG-PRESS onto the same gesture (iOS fires no `contextmenu` event at
 *     all), and closes when the reader right clicks outside. It also strips `aria-haspopup` /
 *     `aria-expanded`, which is correct: those announce "activating me opens a menu", and
 *     activating a context-menu target does not.
 *   • anything containing `click` (or `hover`) → RAC's `trigger="press"`, which carries the press
 *     AND keyboard openers. When `contextMenu` rides along with them, the right click half is
 *     added here by hand, because RAC cannot run both modes at once.
 *   • `hover` → not a RAC mode at all; it is timers over the controlled open state, below.
 *
 * THE KEYBOARD OPENER IS NEVER A CASUALTY OF THE GESTURE LIST. `press` mode keeps Enter / Space /
 * ArrowDown. `contextMenu` mode gets Shift+F10 and the ContextMenu key wired here — RAC leans on
 * the browser emitting a `contextmenu` event for those, which Windows/Linux do and macOS never
 * does, so on a Mac the keyboard route would otherwise not exist. This is also why the earlier
 * "hover-only is a keyboard trap" objection (docs/roadmap) no longer holds.
 */
const DROPDOWN_MENU_DEFAULT_TRIGGER: readonly DropdownMenuTriggerActionProp[] = ["click"];
/** antd's own defaults, and antd counts these in SECONDS. */
const DROPDOWN_MENU_MOUSE_ENTER_DELAY = 0.15;
const DROPDOWN_MENU_MOUSE_LEAVE_DELAY = 0.1;
const SECOND_IN_MS = 1000;

type HoverIntent = { enter: () => void; leave: () => void };

type DropdownMenuOptions = {
  modal: boolean;
  /** Whether right click is one of the gestures. A boolean, so the context value stays stable. */
  contextMenuGesture: boolean;
  disabled: boolean;
  /** Null unless `hover` is in the gesture list. */
  hover: HoverIntent | null;
  /** True when RAC itself is running the right click gesture, so it must not be added twice. */
  racOwnsContextMenu: boolean;
  /** Menu autofocus is suppressed for a hover-opened menu — see DropdownMenuContent. */
  openedByHover: React.RefObject<boolean>;
};

const DropdownMenuModalContext = React.createContext<DropdownMenuOptions>({
  modal: true,
  contextMenuGesture: false,
  disabled: false,
  hover: null,
  racOwnsContextMenu: false,
  openedByHover: { current: false },
});

/** The state RAC's MenuTrigger publishes: `point` is the context-menu anchor, in viewport coords. */
type MenuTriggerLikeState = {
  isOpen: boolean;
  open: (focusStrategy?: "first" | "last" | null) => void;
  point: { x: number; y: number } | null;
  setPoint: (point: { x: number; y: number } | null) => void;
};

/**
 * `state.setPoint(null)` is what react-stately's own state starts as and what `usePopover` checks
 * for (`state.point ? () => new DOMRect(...) : undefined`), but its TYPE says `setPoint(point: Point)`
 * — null is unspellable through it. The cast is that gap and nothing more.
 *
 * It has to be cleared at all, because react-stately NEVER resets `point`: once a right click sets
 * it, a later click- or hover-open would anchor the menu at the stale cursor position instead of at
 * the trigger. Clearing runs in a CAPTURE handler so it lands before RAC's own press/keyboard
 * openers, which sit in the bubble phase on the same element.
 */
function clearContextMenuPoint(state: MenuTriggerLikeState | null): void {
  state?.setPoint(null as unknown as { x: number; y: number });
}

/**
 * Chain our gesture handlers BEHIND whatever the caller already put on the element. Both paths
 * below hand these props to an element that may carry handlers of its own — a plain override would
 * silently swallow a consumer's `onKeyDown` the moment they turned on `trigger={["contextMenu"]}`.
 * The caller's handler runs first and may `preventDefault()` to opt out of the gesture entirely.
 */
function chainGestureProps(
  own: Record<string, unknown>,
  incoming: Record<string, unknown>,
): Record<string, unknown> {
  const merged: Record<string, unknown> = { ...own };
  for (const [key, handler] of Object.entries(incoming)) {
    const existing = own[key];
    merged[key] =
      typeof existing === "function" && typeof handler === "function"
        ? (event: React.SyntheticEvent) => {
            (existing as (e: React.SyntheticEvent) => void)(event);
            if (!event.defaultPrevented) (handler as (e: React.SyntheticEvent) => void)(event);
          }
        : handler;
  }
  return merged;
}

/** Shift+F10 and the ContextMenu key — the two keyboard gestures for "open this thing's menu". */
function isContextMenuKey(event: React.KeyboardEvent): boolean {
  return event.key === "ContextMenu" || (event.key === "F10" && event.shiftKey);
}

/*
 * Prop types below are DELIBERATELY not exported.
 *
 * None of them was exported before this file left Radix — `dropdown-menu.tsx` exported no prop
 * type at all, and `tabs.tsx` exported only `TabsProps`. They appeared here only because moving
 * off a third-party primitive forces the shapes to be written down locally, and exporting them
 * would grow the package's public surface as a side effect of an internal change: every field
 * would become an API promise nobody asked for, on a component whose internals just moved once
 * and may move again.
 *
 * Nothing in this repo consumes them and the package barrel re-exports the COMPONENTS only, so no
 * consumer can be relying on them today. Export one when a consumer has a real reason, and govern
 * it in COMPONENT_PROP_REGISTRY at the same time.
 */
interface DropdownMenuPropsOwn {
  /** Trạng thái mở có kiểm soát (Radix). Bên trong là `isOpen` của RAC. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** `modal={false}` → `isNonModal` của RAC: nền không bị khoá cuộn, không bị `inert`. */
  modal?: boolean;
  /**
   * Radix đọc `dir` để đảo mũi tên trái/phải. RAC lấy hướng từ locale (`I18nProvider` /
   * `useLocale`), nên prop này còn trong API vì hợp đồng, nhưng không tự đảo hướng.
   */
  dir?: "ltr" | "rtl";
  /** Ant Design `trigger`. @see DropdownMenuTriggerActionProp. Default `['click']`. */
  trigger?: readonly DropdownMenuTriggerActionProp[];
  /** Ant Design `disabled` — no gesture opens the menu (antd empties the trigger list). */
  disabled?: boolean;
  /** Ant Design `mouseEnterDelay`, in SECONDS, for `trigger={['hover']}`. Default 0.15. */
  mouseEnterDelay?: number;
  /** Ant Design `mouseLeaveDelay`, in SECONDS. Default 0.1 — long enough to cross the gap. */
  mouseLeaveDelay?: number;
}

type DropdownMenuProps = React.PropsWithChildren<DropdownMenuPropsOwn>;

export function DropdownMenu({
  children,
  open,
  defaultOpen,
  onOpenChange,
  modal = true,
  dir,
  trigger = DROPDOWN_MENU_DEFAULT_TRIGGER,
  disabled = false,
  mouseEnterDelay = DROPDOWN_MENU_MOUSE_ENTER_DELAY,
  mouseLeaveDelay = DROPDOWN_MENU_MOUSE_LEAVE_DELAY,
}: DropdownMenuProps) {
  void dir;
  // antd: `triggerActions = disabled ? [] : trigger`. Disabling is the absence of every gesture,
  // not a separate state to keep in sync. Read as three booleans rather than kept as an array, so
  // a caller writing `trigger={["click"]}` inline does not hand a new identity down the context on
  // every render.
  const wantsHover = !disabled && trigger.includes("hover");
  const wantsClick = !disabled && trigger.includes("click");
  const wantsContextMenu = !disabled && trigger.includes("contextMenu");
  const racOwnsContextMenu = wantsContextMenu && !wantsClick && !wantsHover;

  // The open state is held here in every mode, because hover has to drive it from the outside.
  const [uncontrolled, setUncontrolled] = React.useState(defaultOpen ?? false);
  const isOpen = open ?? uncontrolled;
  const isOpenRef = React.useRef(isOpen);
  isOpenRef.current = isOpen;
  const openedByHover = React.useRef(false);

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (next === isOpenRef.current) return;
      if (next && disabled) return;
      if (!next) openedByHover.current = false;
      if (open === undefined) setUncontrolled(next);
      onOpenChange?.(next);
    },
    [disabled, open, onOpenChange],
  );

  const enterTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const leaveTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  React.useEffect(
    () => () => {
      if (enterTimer.current) clearTimeout(enterTimer.current);
      if (leaveTimer.current) clearTimeout(leaveTimer.current);
    },
    [],
  );

  /**
   * Hover, the way antd means it: a delay in each direction, and the menu counts as hovered while
   * the pointer is over EITHER the trigger or the menu surface — otherwise crossing the gap between
   * them would close it. `leave` is therefore a cancellable intent, not an immediate close.
   */
  const hover = React.useMemo<HoverIntent | null>(() => {
    if (!wantsHover) return null;
    return {
      enter: () => {
        if (leaveTimer.current) clearTimeout(leaveTimer.current);
        if (isOpenRef.current) return;
        enterTimer.current = setTimeout(() => {
          openedByHover.current = true;
          setOpen(true);
        }, mouseEnterDelay * SECOND_IN_MS);
      },
      leave: () => {
        if (enterTimer.current) clearTimeout(enterTimer.current);
        leaveTimer.current = setTimeout(() => setOpen(false), mouseLeaveDelay * SECOND_IN_MS);
      },
    };
  }, [wantsHover, mouseEnterDelay, mouseLeaveDelay, setOpen]);

  const options = React.useMemo<DropdownMenuOptions>(
    () => ({
      // A HOVER MENU CANNOT BE MODAL. A modal RAC popover paints a full-bleed underlay the instant
      // it opens; that underlay lands under the pointer, the trigger gets `pointerleave`, and the
      // menu closes before the reader can move onto it. antd's hover dropdown is non-modal for the
      // same reason. Every other mode keeps the caller's `modal`.
      modal: wantsHover ? false : modal,
      contextMenuGesture: wantsContextMenu,
      disabled,
      hover,
      racOwnsContextMenu,
      openedByHover,
    }),
    [modal, wantsContextMenu, disabled, hover, racOwnsContextMenu, wantsHover],
  );

  return (
    <DropdownMenuModalContext.Provider value={options}>
      <MenuTrigger
        isOpen={isOpen}
        onOpenChange={setOpen}
        trigger={racOwnsContextMenu ? "contextMenu" : "press"}
      >
        {children}
      </MenuTrigger>
    </DropdownMenuModalContext.Provider>
  );
}

interface DropdownMenuTriggerProps extends React.ComponentPropsWithoutRef<"button"> {
  /** Giao hành vi mở cho phần tử con thay vì `<button>` mặc định — như Radix. */
  asChild?: boolean;
}

/**
 * RAC không nhận một `<button>` trần làm trigger: hành vi nhấn đi qua `PressResponder`, và chỉ
 * `Pressable` (hoặc một component gọi `usePress`) mới nhận được nó. `asChild` vì vậy trở thành
 * "bọc con trong `Pressable`" thay vì "hợp nhất props vào con" — kết quả với consumer là như nhau:
 * chính phần tử của họ mang `aria-haspopup` / `aria-expanded` và nhận cú nhấn.
 */
export function DropdownMenuTrigger({ asChild, children, ...props }: DropdownMenuTriggerProps) {
  const state = React.useContext(OverlayTriggerStateContext);
  const menuState = React.useContext(
    RootMenuTriggerStateContext,
  ) as unknown as MenuTriggerLikeState | null;
  const { contextMenuGesture, disabled, hover, racOwnsContextMenu } =
    React.useContext(DropdownMenuModalContext);
  const dataState = state?.isOpen ? "open" : "closed";

  const wantsContextMenu = contextMenuGesture;
  const isDisabled = disabled || props.disabled;

  /**
   * Open anchored at the trigger's own box — the keyboard has no cursor to anchor to.
   *
   * The edge is chosen from the LOCALE direction, not the element's computed `direction`, because
   * that is what decides which way the menu then GROWS: react-aria resolves the logical
   * `bottom start` placement through `useLocale()`, never through CSS. Measured with the two
   * disagreeing (an RTL `dir` attribute over this package's LTR-only locales): anchoring on the
   * element's right edge while the menu still grew rightwards left it lying across its own trigger
   * and jammed against the viewport edge. Reading the same source RAC reads keeps the corner and
   * the growth on the same side in either direction.
   */
  const { direction } = useLocale();
  const openAtTriggerBox = (element: Element) => {
    const rect = element.getBoundingClientRect();
    menuState?.setPoint({ x: direction === "rtl" ? rect.right : rect.left, y: rect.bottom });
    // `first`: a keyboard open lands on the first item, the same as Enter on a menu button.
    menuState?.open("first");
  };

  const gestureProps: React.DOMAttributes<Element> & {
    onPointerDownCapture?: React.PointerEventHandler<Element>;
    onKeyDownCapture?: React.KeyboardEventHandler<Element>;
  } = {};

  if (wantsContextMenu && !isDisabled) {
    gestureProps.onKeyDown = (event: React.KeyboardEvent<Element>) => {
      if (!isContextMenuKey(event)) return;
      // Also stops the browser opening ITS menu: the native one is the default action of this very
      // keydown on the platforms that have the gesture.
      event.preventDefault();
      openAtTriggerBox(event.currentTarget);
    };
    if (!racOwnsContextMenu) {
      // RAC runs only one trigger mode, so when right click shares the trigger with click/hover the
      // gesture is wired by hand. Mirrors what RAC's own `useContextMenu` does.
      gestureProps.onContextMenu = (event: React.MouseEvent<Element>) => {
        event.preventDefault();
        menuState?.setPoint({ x: event.clientX, y: event.clientY });
        // `null`: a pointer-opened menu focuses the surface, not an item.
        menuState?.open(null);
      };
    }
  }

  if (!racOwnsContextMenu) {
    // CAPTURE phase, so the stale point is gone before RAC's press/keyboard opener runs in the
    // bubble phase on this same element. @see clearContextMenuPoint.
    gestureProps.onPointerDownCapture = () => clearContextMenuPoint(menuState);
    gestureProps.onKeyDownCapture = (event: React.KeyboardEvent<Element>) => {
      if (!isContextMenuKey(event)) clearContextMenuPoint(menuState);
    };
  }

  if (hover && !isDisabled) {
    gestureProps.onPointerEnter = (event: React.PointerEvent<Element>) => {
      // Mouse only. A touch tap emits a compatibility `pointerenter` too, and honouring it would
      // open the menu on the way to somewhere else.
      if (event.pointerType === "mouse") hover.enter();
    };
    gestureProps.onPointerLeave = (event: React.PointerEvent<Element>) => {
      if (event.pointerType === "mouse") hover.leave();
    };
  }

  if (asChild && React.isValidElement(children)) {
    return (
      <Pressable isDisabled={isDisabled}>
        {
          React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
            "data-slot": "dropdown-menu-trigger",
            "data-state": dataState,
            // A right click target is usually a region rather than a button, and Shift+F10 needs it
            // focusable — so it is given a tab stop unless the consumer already placed one.
            ...(wantsContextMenu &&
            (children.props as Record<string, unknown>).tabIndex === undefined
              ? { tabIndex: 0 }
              : {}),
            ...chainGestureProps(
              children.props as Record<string, unknown>,
              gestureProps as Record<string, unknown>,
            ),
          }) as React.ReactElement<React.DOMAttributes<Element>, string>
        }
      </Pressable>
    );
  }
  return (
    <AriaButton
      {...(chainGestureProps(
        props as Record<string, unknown>,
        gestureProps as Record<string, unknown>,
      ) as React.ComponentProps<typeof AriaButton>)}
      isDisabled={isDisabled}
      data-slot="dropdown-menu-trigger"
      data-state={dataState}
    >
      {children}
    </AriaButton>
  );
}

/**
 * Keep a hover-opened menu open while the pointer is on the SURFACE, and let leaving it close the
 * menu after `mouseLeaveDelay`. Shared by the menu and its submenus, which are separate popovers.
 */
function useHoverSurfaceProps(): React.DOMAttributes<Element> {
  const { hover } = React.useContext(DropdownMenuModalContext);
  if (!hover) return {};
  return {
    onPointerEnter: (event: React.PointerEvent<Element>) => {
      if (event.pointerType === "mouse") hover.enter();
    },
    onPointerLeave: (event: React.PointerEvent<Element>) => {
      if (event.pointerType === "mouse") hover.leave();
    },
  };
}

interface DropdownMenuPortalPropsOwn {
  /** Giữ tên vì hợp đồng: RAC `Popover` tự cổng ra `document.body`, không có bản dựng cưỡng bức. */
  forceMount?: true;
}

type DropdownMenuPortalProps = React.PropsWithChildren<DropdownMenuPortalPropsOwn>;

/** RAC `Popover` đã tự cổng, nên Portal chỉ còn là chỗ giữ hình dạng cây của Radix. */
export function DropdownMenuPortal({ children }: DropdownMenuPortalProps) {
  return <>{children}</>;
}

interface DropdownMenuGroupPropsOwn {
  className?: string;
}

type DropdownMenuGroupProps = React.PropsWithChildren<DropdownMenuGroupPropsOwn>;

/** Radix dựng `<div role="group">`; RAC `MenuSection` dựng `<section role="group">`. */
export function DropdownMenuGroup({ children, className }: DropdownMenuGroupProps) {
  return (
    <MenuSection data-slot="dropdown-menu-group" className={className}>
      {children}
    </MenuSection>
  );
}

interface DropdownMenuRadioGroupPropsOwn {
  className?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

type DropdownMenuRadioGroupProps = React.PropsWithChildren<DropdownMenuRadioGroupPropsOwn>;

/**
 * Radix giữ trạng thái chọn ở chính RadioGroup; RAC giữ ở collection, khoá theo `id` của item.
 * Nên `value` của consumer trở thành `selectedKeys` và `value` của RadioItem trở thành khoá.
 */
export function DropdownMenuRadioGroup({
  children,
  className,
  value,
  onValueChange,
}: DropdownMenuRadioGroupProps) {
  return (
    <MenuSection
      data-slot="dropdown-menu-radio-group"
      className={className}
      selectionMode="single"
      disallowEmptySelection
      selectedKeys={value == null ? [] : [value]}
      onSelectionChange={(keys) => {
        if (keys === "all") return;
        const [first] = [...keys];
        if (first != null) onValueChange?.(String(first));
      }}
    >
      {children}
    </MenuSection>
  );
}

interface DropdownMenuSubPropsOwn {
  /**
   * RAC `SubmenuTrigger` tự giữ trạng thái mở của submenu và không phơi ra chỗ nào để điều khiển
   * nó. Ba prop này còn trong API vì hợp đồng, nhưng không còn tác dụng.
   */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

type DropdownMenuSubProps = React.PropsWithChildren<DropdownMenuSubPropsOwn>;

/**
 * `SubmenuTrigger` đọc children THEO VỊ TRÍ — `children[0]` là item mở submenu, `children[1]` là
 * popover — nên thứ tự `<SubTrigger/>` rồi `<SubContent/>` của Radix ánh xạ thẳng.
 */
export function DropdownMenuSub({ children }: DropdownMenuSubProps) {
  const parts = React.Children.toArray(children).filter(React.isValidElement);
  return <SubmenuTrigger>{parts as React.ReactElement[]}</SubmenuTrigger>;
}

/**
 * Width axis of the menu surface (gh#396) — the vocabulary `Select` already publishes, extended to
 * the one member of the family that never got it. `"trigger"` matches the anchor, `"auto"` releases
 * the floor and shrinks to the content, and `sm | md | lg` select the `--menu-content-width-*`
 * ladder. Unset = today's `--dropdown-content-min-width`, so nothing moves.
 */
type DropdownMenuContentWidth = "trigger" | "auto" | "sm" | "md" | "lg";

interface DropdownMenuContentPropsOwn {
  placement?: DropdownMenuPlacementProp;
  arrow?: boolean;
  width?: DropdownMenuContentWidth;
  className?: string;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  sideOffset?: number;
  alignOffset?: number;
  avoidCollisions?: boolean;
  collisionPadding?: number;
  /** Radix `loop` cho điều hướng bàn phím → `shouldFocusWrap` của RAC. */
  loop?: boolean;
  /** Giữ tên vì hợp đồng; RAC không có bản dựng cưỡng bức và không tự tháo khi trigger rời màn. */
  forceMount?: true;
  hideWhenDetached?: boolean;
  sticky?: "partial" | "always";
}

type DropdownMenuContentProps = React.PropsWithChildren<DropdownMenuContentPropsOwn>;

/**
 * Một phần tử của Radix (`Content`) tách thành HAI ở RAC: `Popover` là hộp được định vị, `Menu` là
 * phần tử mang `role="menu"`. `data-slot` và lớp `ui-dropdown-menu-content` ở lại trên HỘP, cùng
 * chỗ với `data-state` / `data-side` mà các utility animate đang đọc.
 *
 * `useInertHiddenBackground` đã được gỡ ở đây: RAC gọi `ariaHideOutside(..., {shouldUseInert:
 * true})` — nền thành `inert` thật chứ không chỉ `aria-hidden`, nên axe `aria-hidden-focus` không
 * còn cửa để nổ. Và hiệu ứng đó khoá theo `state.isOpen`, không theo unmount, nên `inert` được nhả
 * NGAY ở ý định đóng: đúng lớp lỗi gh#385, đã sửa ở thượng nguồn. Phép đo là
 * `src/components/__tests__/overlay-inert-release-385.test.tsx`.
 */
export function DropdownMenuContent({
  children,
  className,
  side,
  align,
  sideOffset,
  placement,
  arrow,
  width,
  alignOffset,
  avoidCollisions,
  collisionPadding,
  loop,
  hideWhenDetached,
  sticky,
  forceMount,
}: DropdownMenuContentProps) {
  void hideWhenDetached;
  void sticky;
  void forceMount;
  const { modal, openedByHover } = React.useContext(DropdownMenuModalContext);
  const hoverSurfaceProps = useHoverSurfaceProps();
  const menuState = React.useContext(
    RootMenuTriggerStateContext,
  ) as unknown as MenuTriggerLikeState | null;
  const anchor = placement ? DROPDOWN_MENU_PLACEMENT[placement] : undefined;
  const overlayPortalContainer = useOverlayPortalContainer();

  /*
   * A menu opened at the POINTER is anchored to a 0×0 rect at the cursor (react-aria turns
   * `state.point` into exactly that), so the two defaults written for a trigger-anchored menu are
   * both wrong for it: `bottom` would centre the menu ON the cursor, and the 4px gap would push it
   * off the thing that was clicked. `bottom start` + 0 puts the menu's corner at the cursor, which
   * is what every platform's context menu does — and it is what RAC's own MenuTrigger asks for.
   * An explicit `placement` / `side` / `align` / `sideOffset` from the caller still wins.
   */
  const pointAnchored = menuState?.point != null;
  const hasExplicitAnchor = placement !== undefined || side !== undefined || align !== undefined;
  const resolvedPlacement =
    hasExplicitAnchor || !pointAnchored
      ? toPlacement(side ?? anchor?.side, align ?? anchor?.align)
      : "bottom start";
  const resolvedOffset = sideOffset ?? (pointAnchored && !hasExplicitAnchor ? 0 : 4);

  return (
    <DropdownMenuPortal>
      <Popover
        UNSTABLE_portalContainer={overlayPortalContainer}
        data-slot="dropdown-menu-content"
        isNonModal={!modal}
        placement={resolvedPlacement}
        offset={resolvedOffset}
        crossOffset={alignOffset}
        shouldFlip={avoidCollisions}
        containerPadding={collisionPadding}
        className={cn(
          "ui-dropdown-menu-content data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 origin-[var(--trigger-anchor-point)]",
          className,
        )}
        render={(props, state) => (
          // `role={undefined}`: một menu không phải một dialog — xem radixSurfaceState.
          <div
            {...props}
            {...hoverSurfaceProps}
            role={undefined}
            {...radixSurfaceState(state)}
            data-align={
              align ?? anchor?.align ?? (pointAnchored && !hasExplicitAnchor ? "start" : "center")
            }
            // Absent when the prop is unset (the `data-priority` rule), so an untouched menu
            // matches none of the width rules and keeps --dropdown-content-min-width.
            data-width={width}
          />
        )}
      >
        {/* A HOVER-OPENED MENU MUST NOT TAKE FOCUS. RAC's MenuTrigger hands the Menu
            `autoFocus: state.focusStrategy || true`, which is right for a click or a key — but on
            hover it would yank focus out of whatever the reader was typing in, just because the
            pointer crossed the trigger. Pointer hover moves no focus; every other route keeps it. */}
        <Menu shouldFocusWrap={loop} autoFocus={openedByHover.current ? false : undefined}>
          {children}
        </Menu>
        {arrow ? (
          <OverlayArrow>
            <svg
              data-slot="dropdown-menu-arrow"
              className="ui-dropdown-menu-arrow"
              viewBox="0 0 10 5"
              aria-hidden="true"
            >
              <path d="M0 0 L5 5 L10 0 Z" />
            </svg>
          </OverlayArrow>
        ) : null}
      </Popover>
    </DropdownMenuPortal>
  );
}

interface DropdownMenuItemPropsOwn {
  className?: string;
  inset?: boolean;
  variant?: "default" | "destructive";
  disabled?: boolean;
  onSelect?: (event: Event) => void;
  textValue?: string;
  /** Mượn thẻ của con thay vì dựng `<div>` riêng — chỗ để nhét một `<Link>` vào một mục menu. */
  asChild?: boolean;
}

type DropdownMenuItemProps = React.PropsWithChildren<DropdownMenuItemPropsOwn>;

export function DropdownMenuItem({
  children,
  className,
  inset,
  variant = "default",
  disabled,
  onSelect,
  textValue,
  asChild,
}: DropdownMenuItemProps) {
  const tag = borrowedTag(children, asChild);
  return (
    <MenuItem
      isDisabled={disabled}
      textValue={textValue}
      onAction={onSelect ? () => onSelect(selectEvent("dropdownmenu.itemSelect")) : undefined}
      className={cn(
        "ui-dropdown-menu-item [&_svg:not([class*='text-'])]:text-muted-foreground",
        className,
      )}
      render={(props, state) => {
        const { children: content, ...rest } = props as ItemDomProps;
        return renderItemTag(
          tag,
          {
            ...rest,
            "data-slot": "dropdown-menu-item",
            "data-inset": inset,
            "data-variant": variant,
            ...radixItemState(state),
          },
          content,
        );
      }}
    >
      {tag ? tag.props.children : children}
    </MenuItem>
  );
}

interface DropdownMenuLabelPropsOwn {
  className?: string;
  inset?: boolean;
  /** Mượn thẻ của con thay vì dựng `<header>` riêng. */
  asChild?: boolean;
}

type DropdownMenuLabelProps = React.PropsWithChildren<DropdownMenuLabelPropsOwn>;

/**
 * Radix dựng `<div>`; nút nhãn của một collection RAC là `Header`, tức `<header>`.
 *
 * `Header` không đi qua `useRenderProps`, nên `props.children` trong `render` CHÍNH là children của
 * consumer — không có `Provider` chen vào như ở `MenuItem`. `Slot` vì thế nhận thẳng gói props.
 *
 * NHƯNG PHẢI RENDER RA `<div>`, KHÔNG PHẢI `<header>`. `<header>` mang vai trò ngầm `banner`, và
 * `banner` không nằm trong danh sách con hợp lệ của `role="menu"` (axe: aria-required-children,
 * ARIA 1.2 — menu chỉ nhận menuitem / menuitemcheckbox / menuitemradio / group / separator). Radix
 * dựng `<div>`, vai trò `generic`, nên nó không bao giờ vấp lỗi này.
 *
 * `Header` vẫn được dùng chứ không thay bằng `<div>` trần: bộ dựng collection của RAC chỉ nhận các
 * nút nó biết, một phần tử lạ đặt thẳng trong `Menu` sẽ bị nó bỏ. Nên giữ nút, đổi thẻ.
 *
 * Lỗi này ẩn suốt vì helper a11y dùng chung soi container của lần render, còn menu thì portal ra
 * `document.body` — phép kiểm mang tên "open, fully-composed menu" thực chất soi một hộp rỗng.
 */
export function DropdownMenuLabel({ children, className, inset, asChild }: DropdownMenuLabelProps) {
  return (
    <Header
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn("ui-dropdown-menu-label", className)}
      render={
        asChild
          ? (props) => (
              <Slot
                {...(props as React.HTMLAttributes<HTMLElement> & React.RefAttributes<HTMLElement>)}
              />
            )
          : (props) => (
              <div
                {...(props as React.HTMLAttributes<HTMLDivElement> &
                  React.RefAttributes<HTMLDivElement>)}
              />
            )
      }
    >
      {children}
    </Header>
  );
}

interface DropdownMenuSeparatorProps {
  className?: string;
}

export function DropdownMenuSeparator({ className }: DropdownMenuSeparatorProps) {
  return (
    <Separator
      data-slot="dropdown-menu-separator"
      className={cn("ui-dropdown-menu-separator", className)}
    />
  );
}

interface DropdownMenuCheckboxItemPropsOwn {
  className?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  textValue?: string;
  /** Mượn thẻ của con thay vì dựng `<div>` riêng; ô đánh dấu vẫn nằm bên trong thẻ mượn. */
  asChild?: boolean;
}

type DropdownMenuCheckboxItemProps = React.PropsWithChildren<DropdownMenuCheckboxItemPropsOwn>;

/**
 * Ở Radix mỗi CheckboxItem tự giữ `checked`. Ở RAC không có `isSelected` trên item: `aria-checked`
 * và `role="menuitemcheckbox"` chỉ xuất hiện khi collection BAO QUANH khai báo `selectionMode`.
 * Nên mỗi hàng độc lập được bọc trong một `MenuSection` một-phần-tử — đó là cái giá để giữ đúng
 * vai trò ARIA mà consumer đang test.
 */

export function DropdownMenuCheckboxItem({
  children,
  className,
  checked,
  onCheckedChange,
  disabled,
  textValue,
  asChild,
}: DropdownMenuCheckboxItemProps) {
  const checkboxKey = React.useId();
  const tag = borrowedTag(children, asChild);
  return (
    <MenuSection
      selectionMode="multiple"
      shouldCloseOnSelect
      selectedKeys={checked ? [checkboxKey] : []}
      onSelectionChange={(keys) => {
        onCheckedChange?.(keys === "all" ? true : keys.has(checkboxKey));
      }}
    >
      <MenuItem
        id={checkboxKey}
        isDisabled={disabled}
        textValue={textValue}
        className={cn("ui-dropdown-menu-checkbox-item", className)}
        render={(props, state) => {
          const { children: content, ...rest } = props as ItemDomProps;
          return renderItemTag(
            tag,
            { ...rest, "data-slot": "dropdown-menu-checkbox-item", ...radixItemState(state) },
            <>
              <span className="ui-dropdown-menu-indicator-slot">
                {state.isSelected ? (
                  <Check className="ui-dropdown-menu-check" aria-hidden="true" />
                ) : null}
              </span>
              {content}
            </>,
          );
        }}
      >
        {tag ? tag.props.children : children}
      </MenuItem>
    </MenuSection>
  );
}

interface DropdownMenuRadioItemPropsOwn {
  className?: string;
  value: string;
  disabled?: boolean;
  textValue?: string;
  /** Mượn thẻ của con thay vì dựng `<div>` riêng. */
  asChild?: boolean;
}

type DropdownMenuRadioItemProps = React.PropsWithChildren<DropdownMenuRadioItemPropsOwn>;

export function DropdownMenuRadioItem({
  children,
  className,
  value,
  disabled,
  textValue,
  asChild,
}: DropdownMenuRadioItemProps) {
  const tag = borrowedTag(children, asChild);
  return (
    <MenuItem
      id={value}
      isDisabled={disabled}
      textValue={textValue}
      className={cn("ui-dropdown-menu-radio-item", className)}
      render={(props, state) => {
        const { children: content, ...rest } = props as ItemDomProps;
        return renderItemTag(
          tag,
          { ...rest, "data-slot": "dropdown-menu-radio-item", ...radixItemState(state) },
          content,
        );
      }}
    >
      {tag ? tag.props.children : children}
    </MenuItem>
  );
}

interface DropdownMenuSubTriggerPropsOwn {
  className?: string;
  inset?: boolean;
  disabled?: boolean;
  textValue?: string;
  /** Mượn thẻ của con thay vì dựng `<div>` riêng; mũi tên submenu vẫn nằm bên trong thẻ mượn. */
  asChild?: boolean;
}

type DropdownMenuSubTriggerProps = React.PropsWithChildren<DropdownMenuSubTriggerPropsOwn>;

export function DropdownMenuSubTrigger({
  children,
  className,
  inset,
  disabled,
  textValue,
  asChild,
}: DropdownMenuSubTriggerProps) {
  const tag = borrowedTag(children, asChild);
  return (
    <MenuItem
      isDisabled={disabled}
      textValue={textValue}
      className={cn(
        "ui-dropdown-menu-sub-trigger [&_svg:not([class*='text-'])]:text-muted-foreground",
        className,
      )}
      render={(props, state) => {
        const { children: content, ...rest } = props as ItemDomProps;
        return renderItemTag(
          tag,
          {
            ...rest,
            "data-slot": "dropdown-menu-sub-trigger",
            "data-inset": inset,
            ...radixItemState(state),
          },
          <>
            {content}
            <ChevronRight className="ui-dropdown-menu-sub-trigger-icon" aria-hidden="true" />
          </>,
        );
      }}
    >
      {tag ? tag.props.children : children}
    </MenuItem>
  );
}

interface DropdownMenuSubContentPropsOwn {
  className?: string;
  align?: "start" | "center" | "end";
  alignOffset?: number;
  sideOffset?: number;
  avoidCollisions?: boolean;
  collisionPadding?: number;
  loop?: boolean;
  forceMount?: true;
  hideWhenDetached?: boolean;
  sticky?: "partial" | "always";
}

type DropdownMenuSubContentProps = React.PropsWithChildren<DropdownMenuSubContentPropsOwn>;

export function DropdownMenuSubContent({
  children,
  className,
  align,
  alignOffset,
  sideOffset,
  avoidCollisions,
  collisionPadding,
  loop,
  forceMount,
  hideWhenDetached,
  sticky,
}: DropdownMenuSubContentProps) {
  void forceMount;
  void hideWhenDetached;
  void sticky;
  const overlayPortalContainer = useOverlayPortalContainer();
  const hoverSurfaceProps = useHoverSurfaceProps();

  return (
    <Popover
      UNSTABLE_portalContainer={overlayPortalContainer}
      data-slot="dropdown-menu-sub-content"
      placement={align ? toPlacement("right", align) : undefined}
      offset={sideOffset}
      crossOffset={alignOffset}
      shouldFlip={avoidCollisions}
      containerPadding={collisionPadding}
      className={cn(
        "ui-dropdown-menu-sub-content data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 origin-[var(--trigger-anchor-point)]",
        className,
      )}
      render={(props, state) => (
        // `role={undefined}`: một menu không phải một dialog — xem radixSurfaceState.
        <div
          {...props}
          {...hoverSurfaceProps}
          role={undefined}
          {...radixSurfaceState(state)}
          data-align={align ?? "center"}
        />
      )}
    >
      <Menu shouldFocusWrap={loop}>{children}</Menu>
    </Popover>
  );
}

export const DropdownMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    data-slot="dropdown-menu-shortcut"
    className={cn("text-muted-foreground ms-auto text-xs tracking-widest", className)}
    {...props}
  />
);
