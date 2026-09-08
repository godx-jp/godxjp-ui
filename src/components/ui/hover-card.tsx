import * as React from "react";
import { chain, mergeRefs } from "@react-aria/utils";
import { Popover as AriaPopover, type Placement } from "react-aria-components";

import { cn } from "../../lib/utils";
import { Slot } from "../../lib/slot";

/*
 * HoverCard — nền là `Popover` của react-aria-components.
 *
 * ## React Aria KHÔNG có hover card, và `Popover` không mở bằng rê chuột
 *
 * Đây là chỗ hai thư viện lệch nhau nhiều nhất trong ba lớp phủ. RAC chỉ có `DialogTrigger` (bấm)
 * và `TooltipTrigger` (rê chuột, nhưng dựng ra `role="tooltip"` và không cho nội dung giàu). Không
 * có prop `trigger="hover"` nào trên `Popover`, và cũng không có hook hover nào được `react-aria-
 * components` xuất ra — `useHover` nằm trong `react-aria`, thứ kho này KHÔNG khai báo là phụ thuộc.
 *
 * Biến hover-card thành popover bấm-mới-mở là đổi hành vi, nên lịch mở/đóng theo con trỏ được chép
 * tay ở đây: hẹn giờ `openDelay`/`closeDelay`, mở ngay khi nhận tiêu điểm, và huỷ hẹn đóng khi con
 * trỏ đi từ trigger sang chính tấm thẻ. Đúng những gì Radix làm, không hơn. `Popover` của RAC chỉ
 * còn lo phần định vị và cổng portal.
 *
 * ## Tên prop dịch ở BÊN TRONG
 *
 *     side + align  →  placement       ("bottom" + "start" → "bottom start")
 *     sideOffset    →  offset
 *     alignOffset   →  crossOffset
 *     avoidCollisions → shouldFlip
 *     collisionPadding → containerPadding   (RAC chỉ nhận MỘT số; object lấy cạnh lớn nhất)
 *
 * `sticky` / `hideWhenDetached` / `forceMount` không có tương đương trong RAC; giữ trong kiểu vì là
 * API công khai.
 *
 * ## `data-state`, chứ không phải `data-entering`
 *
 * RAC phát `data-placement` + `data-entering`/`data-exiting`; class animation trên tấm thẻ đọc
 * `data-[state=open]` và `data-[side=...]` của Radix, nên hai cái đó được phát lại. Test hiện có
 * đòi đúng `data-state="open"`.
 */

/** Gói prop mà `render` của RAC trao lại; nó có thêm `data-rac`, thứ kiểu JSX không khai báo. */
type RacDomProps = React.ComponentPropsWithRef<"div"> & { "data-rac"?: string };

type Side = "top" | "right" | "bottom" | "left";
type Align = "start" | "center" | "end";

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

type HoverCardValue = {
  open: boolean;
  triggerRef: React.RefObject<HTMLElement | null>;
  /** Mở/đóng NGAY, không qua hẹn giờ — dùng cho tiêu điểm bàn phím. */
  setOpenImmediately: (open: boolean) => void;
  /** Hẹn mở sau `openDelay`. */
  scheduleOpen: () => void;
  /** Hẹn đóng sau `closeDelay`; gọi lại `scheduleOpen`/`cancelClose` sẽ huỷ. */
  scheduleClose: () => void;
  /** Huỷ hẹn đóng — con trỏ vừa rời trigger nhưng đã sang tới tấm thẻ. */
  cancelClose: () => void;
};

const HoverCardContext = React.createContext<HoverCardValue | null>(null);

function useHoverCard(component: string): HoverCardValue {
  const context = React.useContext(HoverCardContext);
  if (!context) {
    throw new Error(`\`${component}\` phải nằm trong \`HoverCard\`.`);
  }
  return context;
}

interface HoverCardProps {
  /** Trạng thái mở, có kiểm soát. */
  open?: boolean;
  /** Trạng thái mở ban đầu khi không kiểm soát. */
  defaultOpen?: boolean;
  /** Gọi khi trạng thái mở/đóng đổi. */
  onOpenChange?: (open: boolean) => void;
  /** Thời gian rê chuột trước khi mở, tính bằng ms. */
  openDelay?: number;
  /** Thời gian sau khi con trỏ rời đi trước khi đóng, tính bằng ms. */
  closeDelay?: number;
}

/**
 * HoverCard root. Defaults to a SNAPPY 200ms open / 100ms close (Radix's raw 700/300 default felt
 * laggy); consumers can still pass `openDelay`/`closeDelay`.
 */
export function HoverCard({
  open,
  defaultOpen,
  onOpenChange,
  openDelay = 200,
  closeDelay = 100,
  children,
}: React.PropsWithChildren<HoverCardProps>) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen ?? false);
  const triggerRef = React.useRef<HTMLElement | null>(null);
  const openTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const isOpen = open ?? uncontrolledOpen;

  const setOpenImmediately = React.useCallback(
    (next: boolean) => {
      if (open === undefined) {
        setUncontrolledOpen(next);
      }
      onOpenChange?.(next);
    },
    [open, onOpenChange],
  );

  const value = React.useMemo<HoverCardValue>(() => {
    const clearOpen = () => {
      if (openTimer.current) clearTimeout(openTimer.current);
      openTimer.current = null;
    };
    const clearClose = () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
      closeTimer.current = null;
    };

    return {
      open: isOpen,
      triggerRef,
      setOpenImmediately: (next) => {
        clearOpen();
        clearClose();
        setOpenImmediately(next);
      },
      scheduleOpen: () => {
        clearClose();
        if (openTimer.current) return;
        openTimer.current = setTimeout(() => {
          openTimer.current = null;
          setOpenImmediately(true);
        }, openDelay);
      },
      scheduleClose: () => {
        clearOpen();
        if (closeTimer.current) return;
        closeTimer.current = setTimeout(() => {
          closeTimer.current = null;
          setOpenImmediately(false);
        }, closeDelay);
      },
      cancelClose: clearClose,
    };
  }, [isOpen, setOpenImmediately, openDelay, closeDelay]);

  React.useEffect(
    () => () => {
      if (openTimer.current) clearTimeout(openTimer.current);
      if (closeTimer.current) clearTimeout(closeTimer.current);
    },
    [],
  );

  return <HoverCardContext.Provider value={value}>{children}</HoverCardContext.Provider>;
}

interface HoverCardTriggerProps extends React.ComponentPropsWithRef<"a"> {
  /** Mượn thẻ của con thay vì dựng `<a>` riêng. */
  asChild?: boolean;
}

export function HoverCardTrigger({
  asChild,
  onPointerEnter,
  onPointerLeave,
  onFocus,
  onBlur,
  ref,
  ...props
}: HoverCardTriggerProps) {
  const card = useHoverCard("HoverCardTrigger");
  const Comp = (asChild ? Slot : "a") as React.ElementType;

  return (
    <Comp
      data-state={card.open ? "open" : "closed"}
      {...props}
      ref={mergeRefs(ref, card.triggerRef)}
      /*
       * `pointerType === "touch"` bị bỏ qua, đúng như Radix: trên cảm ứng không có trạng thái "rê
       * chuột", và mở thẻ ở đó sẽ nuốt luôn cú chạm đầu tiên của người dùng.
       */
      onPointerEnter={chain(onPointerEnter, (event: React.PointerEvent) => {
        if (event.pointerType === "touch") return;
        card.scheduleOpen();
      })}
      onPointerLeave={chain(onPointerLeave, (event: React.PointerEvent) => {
        if (event.pointerType === "touch") return;
        card.scheduleClose();
      })}
      /* Bàn phím: mở/đóng NGAY, không bắt người dùng chờ hẹn giờ của con trỏ. */
      onFocus={chain(onFocus, () => card.setOpenImmediately(true))}
      onBlur={chain(onBlur, () => card.setOpenImmediately(false))}
    />
  );
}

interface HoverCardContentProps extends React.ComponentPropsWithRef<"div"> {
  /** Cạnh của trigger mà tấm thẻ bám vào. */
  side?: Side;
  /** Canh tấm thẻ theo cạnh của trigger. */
  align?: Align;
  /** Khoảng cách theo trục chính, tính bằng px. */
  sideOffset?: number;
  /** Khoảng cách theo trục phụ, tính bằng px. */
  alignOffset?: number;
  /** Lật tấm thẻ sang cạnh đối diện khi hết chỗ. */
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

export function HoverCardContent({
  className,
  style,
  children,
  ref,
  side = "bottom",
  align = "center",
  sideOffset = 4,
  alignOffset,
  avoidCollisions = true,
  collisionPadding,
  sticky: _sticky,
  hideWhenDetached: _hideWhenDetached,
  forceMount: _forceMount,
  onPointerEnter,
  onPointerLeave,
  ...props
}: HoverCardContentProps) {
  const card = useHoverCard("HoverCardContent");

  return (
    <AriaPopover
      isOpen={card.open}
      onOpenChange={card.setOpenImmediately}
      isNonModal
      triggerRef={card.triggerRef}
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

        return (
          <div
            {...rest}
            data-slot="hover-card-content"
            data-side={side}
            data-align={align}
            data-state={isExiting ? "closed" : "open"}
            {...props}
            ref={mergeRefs(ref, racRef)}
            /* Con trỏ đi từ trigger sang tấm thẻ: huỷ hẹn đóng, đúng như Radix. */
            onPointerEnter={chain(onPointerEnter, () => card.cancelClose())}
            onPointerLeave={chain(onPointerLeave, () => card.scheduleClose())}
            className={cn(
              // Match Popover/Tooltip: a directional fade+zoom+slide entrance so it doesn't pop abruptly.
              "ui-hover-card-content origin-[var(--radix-hover-card-content-transform-origin)]",
              "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
              "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
              "data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2",
              "data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2",
              className,
            )}
            style={
              {
                ...racStyle,
                "--radix-hover-card-content-transform-origin": "var(--trigger-anchor-point)",
                ...style,
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
