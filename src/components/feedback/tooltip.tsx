import * as React from "react";
import { mergeRefs } from "@react-aria/utils";
import {
  Focusable,
  Tooltip as AriaTooltip,
  TooltipTrigger as AriaTooltipTrigger,
  TooltipTriggerStateContext,
  type Placement,
} from "react-aria-components";

import { cn } from "../../lib/utils";
import { Slot } from "../../lib/slot";

/*
 * Tooltip — nền là `TooltipTrigger` / `Tooltip` của react-aria-components, API công khai vẫn
 * nguyên văn Radix.
 *
 * ## `TooltipProvider` được DỰNG LẠI bằng context của riêng kho
 *
 * Radix có một provider bọc cả cây và chia sẻ delay; React Aria không có — `delay`/`closeDelay`
 * nằm trên TỪNG `TooltipTrigger`. Nhưng `TooltipProvider` là API công khai của kho (docs dạy dùng
 * nó để đặt một delay chung cho cả một thanh công cụ), nên nó được dựng lại ở đây bằng một context
 * mỏng: provider chỉ chở con số, `Tooltip` đọc và truyền xuống `delay` của RAC.
 *
 * `skipDelayDuration` và `disableHoverableContent` KHÔNG ánh xạ được. Cửa sổ "vừa mới xem tooltip
 * nên cái tiếp theo hiện ngay" của React Aria là biến toàn cục trong `react-stately`, cứng ở 500ms,
 * không có lối vào; và tooltip của React Aria luôn giữ mở khi con trỏ rê lên chính nó. Hai prop
 * này vẫn nằm trong kiểu vì là API công khai, nhưng không còn tác dụng.
 *
 * ## Tên prop dịch ở BÊN TRONG
 *
 *     side + align   →  placement    ("top" + "start" → "top start")
 *     sideOffset     →  offset
 *     alignOffset    →  crossOffset
 *     avoidCollisions → shouldFlip
 *     collisionPadding → containerPadding   (RAC chỉ nhận MỘT số; object lấy cạnh lớn nhất)
 *     delayDuration  →  delay
 *
 * ## Hai chốt a11y, giữ nguyên
 *
 * 1. Tooltip KHÔNG nhận tiêu điểm: thẻ nội dung không có `tabIndex`, và `useTooltip` của React Aria
 *    cũng không đặt. Đừng thêm.
 * 2. `aria-describedby` trên trigger ↔ `id` trên nội dung do `useTooltipTrigger` nối; nó tới được
 *    trigger qua `FocusableContext`, và `Focusable` là thứ duy nhất react-aria-components xuất ra
 *    để đọc context đó. Đó là lý do trigger bọc `Focusable` thay vì tự gắn handler.
 */

/** Gói prop mà `render` của RAC trao lại; nó có thêm `data-rac`, thứ kiểu JSX không khai báo. */
type RacDomProps = React.ComponentPropsWithRef<"div"> & { "data-rac"?: string };

type Side = "top" | "right" | "bottom" | "left";
type Align = "start" | "center" | "end";

/** Delay mặc định của kho — nhanh hơn hẳn 1500ms của React Aria và 700ms của Radix. */
const DEFAULT_DELAY_DURATION = 200;

/** `side` + `align` của Radix → `placement` của RAC (trục ngang chỉ nhận `top`/`bottom`). */
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

/** Chỗ `TooltipProvider` cất delay chung; `Tooltip` là người đọc duy nhất. */
const TooltipDelayContext = React.createContext<number | undefined>(undefined);

interface TooltipProviderProps {
  /** Delay mở dùng chung cho mọi `Tooltip` bên trong, tính bằng ms. */
  delayDuration?: number;
  /** Không còn tác dụng trên nền RAC — cửa sổ warm-up là biến toàn cục, cứng ở 500ms. */
  skipDelayDuration?: number;
  /** Không còn tác dụng trên nền RAC — tooltip của React Aria luôn giữ mở khi rê lên nội dung. */
  disableHoverableContent?: boolean;
}

/** Opt-in provider for tuning delay across a subtree. Each <Tooltip> already self-provides. */
export function TooltipProvider({
  delayDuration = DEFAULT_DELAY_DURATION,
  skipDelayDuration: _skipDelayDuration,
  disableHoverableContent: _disableHoverableContent,
  children,
}: React.PropsWithChildren<TooltipProviderProps>) {
  return (
    <TooltipDelayContext.Provider value={delayDuration}>{children}</TooltipDelayContext.Provider>
  );
}

interface TooltipProps {
  /** Trạng thái mở, có kiểm soát. */
  open?: boolean;
  /** Trạng thái mở ban đầu khi không kiểm soát. */
  defaultOpen?: boolean;
  /** Gọi khi trạng thái mở/đóng đổi. */
  onOpenChange?: (open: boolean) => void;
  /** Delay mở riêng cho tooltip này; thắng giá trị của `TooltipProvider`. */
  delayDuration?: number;
  /** Không còn tác dụng trên nền RAC — tooltip của React Aria luôn giữ mở khi rê lên nội dung. */
  disableHoverableContent?: boolean;
}

/** Self-contained tooltip — no app-level provider needed. Controllable via `open`/`onOpenChange`. */
export function Tooltip({
  open,
  defaultOpen,
  onOpenChange,
  delayDuration,
  disableHoverableContent: _disableHoverableContent,
  children,
}: React.PropsWithChildren<TooltipProps>) {
  const providedDelay = React.useContext(TooltipDelayContext);

  return (
    <AriaTooltipTrigger
      delay={delayDuration ?? providedDelay ?? DEFAULT_DELAY_DURATION}
      isOpen={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
    >
      {children}
    </AriaTooltipTrigger>
  );
}

interface TooltipTriggerProps extends React.ComponentPropsWithRef<"button"> {
  /** Mượn thẻ của con thay vì dựng `<button>` riêng. */
  asChild?: boolean;
}

export function TooltipTrigger({ asChild, children, ...props }: TooltipTriggerProps) {
  const state = React.useContext(TooltipTriggerStateContext);
  const Comp = (asChild ? Slot : "button") as React.ElementType;

  /*
   * `Focusable` là cách duy nhất react-aria-components cho phép đọc `FocusableContext` — nơi
   * `useTooltipTrigger` để lại handler rê chuột / tiêu điểm VÀ `aria-describedby` trỏ tới nội
   * dung. Nó chỉ nhân bản đúng một con, nên `asChild` vẫn chạy qua `Slot` như mọi trigger khác.
   */
  return (
    <Focusable>
      <Comp type="button" data-state={state?.isOpen ? "delayed-open" : "closed"} {...props}>
        {children}
      </Comp>
    </Focusable>
  );
}

interface TooltipContentProps extends React.ComponentPropsWithRef<"div"> {
  /** Cạnh của trigger mà tooltip bám vào. */
  side?: Side;
  /** Canh tooltip theo cạnh của trigger. */
  align?: Align;
  /** Khoảng cách theo trục chính, tính bằng px. */
  sideOffset?: number;
  /** Khoảng cách theo trục phụ, tính bằng px. */
  alignOffset?: number;
  /** Lật tooltip sang cạnh đối diện khi hết chỗ. */
  avoidCollisions?: boolean;
  /** Khoảng chừa với mép khung nhìn. RAC chỉ nhận một số; object lấy cạnh lớn nhất. */
  collisionPadding?: number | Partial<Record<Side, number>>;
  /** Không còn tác dụng trên nền RAC — giữ trong kiểu vì là API công khai. */
  sticky?: "partial" | "always";
  /** Không còn tác dụng trên nền RAC — giữ trong kiểu vì là API công khai. */
  hideWhenDetached?: boolean;
  /** Không còn tác dụng trên nền RAC — giữ trong kiểu vì là API công khai. */
  forceMount?: true;
}

export function TooltipContent({
  className,
  style,
  children,
  ref,
  side = "top",
  align = "center",
  sideOffset = 6,
  alignOffset,
  avoidCollisions = true,
  collisionPadding,
  sticky: _sticky,
  hideWhenDetached: _hideWhenDetached,
  forceMount: _forceMount,
  ...props
}: TooltipContentProps) {
  return (
    <AriaTooltip
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
          children: _racChildren,
          ...rest
        } = racProps as RacDomProps;

        return (
          <div
            {...rest}
            data-slot="tooltip-content"
            data-side={side}
            data-align={align}
            /*
             * `delayed-open`, không phải `open`: class animation của kho đọc đúng chuỗi đó
             * (`data-[state=delayed-open]:animate-in`), là tên Radix đặt cho "đã mở sau khi chờ".
             */
            data-state={isExiting ? "closed" : "delayed-open"}
            {...props}
            ref={mergeRefs(ref, racRef)}
            className={cn(
              "ui-tooltip-content",
              "data-[state=delayed-open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=delayed-open]:fade-in-0",
              "data-[side=bottom]:slide-in-from-top-1 data-[side=top]:slide-in-from-bottom-1",
              "data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1",
              className,
            )}
            style={{ ...racStyle, ...style }}
          >
            {children}
          </div>
        );
      }}
    />
  );
}
