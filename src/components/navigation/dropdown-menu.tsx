import * as React from "react";
import {
  Header,
  Menu,
  MenuItem,
  MenuSection,
  MenuTrigger,
  OverlayTriggerStateContext,
  Popover,
  Pressable,
  Separator,
  SubmenuTrigger,
  type MenuItemRenderProps,
  type PopoverProps,
  type PopoverRenderProps,
} from "react-aria-components";
import { Check, ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils";
import { Slot } from "../../lib/slot";

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

type ModalOptions = { modal: boolean };
const DropdownMenuModalContext = React.createContext<ModalOptions>({ modal: true });

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
}

type DropdownMenuProps = React.PropsWithChildren<DropdownMenuPropsOwn>;

export function DropdownMenu({
  children,
  open,
  defaultOpen,
  onOpenChange,
  modal = true,
  dir,
}: DropdownMenuProps) {
  void dir;
  const options = React.useMemo<ModalOptions>(() => ({ modal }), [modal]);
  return (
    <DropdownMenuModalContext.Provider value={options}>
      <MenuTrigger isOpen={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
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
  const dataState = state?.isOpen ? "open" : "closed";
  if (asChild && React.isValidElement(children)) {
    return (
      <Pressable>
        {
          React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
            "data-slot": "dropdown-menu-trigger",
            "data-state": dataState,
          }) as React.ReactElement<React.DOMAttributes<Element>, string>
        }
      </Pressable>
    );
  }
  return (
    <Pressable>
      <button type="button" data-slot="dropdown-menu-trigger" data-state={dataState} {...props}>
        {children}
      </button>
    </Pressable>
  );
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

interface DropdownMenuContentPropsOwn {
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
  sideOffset = 4,
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
  const { modal } = React.useContext(DropdownMenuModalContext);
  return (
    <DropdownMenuPortal>
      <Popover
        data-slot="dropdown-menu-content"
        isNonModal={!modal}
        placement={toPlacement(side, align)}
        offset={sideOffset}
        crossOffset={alignOffset}
        shouldFlip={avoidCollisions}
        containerPadding={collisionPadding}
        className={cn(
          "ui-dropdown-menu-content data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 origin-[var(--trigger-anchor-point)]",
          className,
        )}
        render={(props, state) => (
          // `role={undefined}`: một menu không phải một dialog — xem radixSurfaceState.
          <div {...props} role={undefined} {...radixSurfaceState(state)} />
        )}
      >
        <Menu shouldFocusWrap={loop}>{children}</Menu>
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
          : undefined
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
const CHECKBOX_KEY = "checked-item";

export function DropdownMenuCheckboxItem({
  children,
  className,
  checked,
  onCheckedChange,
  disabled,
  textValue,
  asChild,
}: DropdownMenuCheckboxItemProps) {
  const tag = borrowedTag(children, asChild);
  return (
    <MenuSection
      selectionMode="multiple"
      shouldCloseOnSelect
      selectedKeys={checked ? [CHECKBOX_KEY] : []}
      onSelectionChange={(keys) => {
        onCheckedChange?.(keys === "all" ? true : keys.has(CHECKBOX_KEY));
      }}
    >
      <MenuItem
        id={CHECKBOX_KEY}
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
  return (
    <Popover
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
        <div {...props} role={undefined} {...radixSurfaceState(state)} />
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
