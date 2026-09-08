import * as React from "react";
import { chain, mergeRefs } from "@react-aria/utils";
import {
  ButtonContext,
  Disclosure,
  DisclosurePanel,
  DisclosureStateContext,
  useSlottedContext,
} from "react-aria-components";

import { Slot } from "../../lib/slot";

/*
 * Collapsible — nền là `Disclosure` / `DisclosurePanel` của react-aria-components,
 * nhưng API công khai vẫn nguyên văn Radix: `open` / `defaultOpen` /
 * `onOpenChange` / `disabled`, và `asChild` trên trigger.
 *
 * ## Vì sao KHÔNG dùng thẳng `<Button slot="trigger">` của RAC
 *
 * RAC nối trigger với panel bằng `ButtonContext` slot "trigger", và gói prop nó
 * phát ra là prop của RAC (`onPress`, `isDisabled`), không phải prop DOM. Mà
 * `asChild` là API công khai của kho — mọi consumer đang bọc `Button` của
 * godx-ui vào `CollapsibleTrigger` — trong khi `Button` của RAC không có mô
 * hình đó. Nên trigger ở đây đọc thẳng slot "trigger" để lấy `id` /
 * `aria-controls`, rồi tự dựng `<button>` (hoặc mượn thẻ của con qua `Slot`) và
 * tự gọi `state.toggle()` trong `onClick` — đúng như Radix làm. `<button>` thật
 * đã xử lý Enter/Space sẵn, nên không mất phím nào.
 *
 * ## `data-state`, chứ không phải `data-expanded`
 *
 * RAC phát `data-expanded`; Radix phát `data-state="open" | "closed"`. CSS của
 * kho và của consumer bám vào `data-state` — `docs/data-display/collapsible.tsx`
 * xoay chevron bằng đúng `data-[state=open]:rotate-180` trên thẻ con truyền qua
 * `asChild`. Nên `data-state` được PHÁT LẠI ở đây thay vì đi sửa selector: nó là
 * hợp đồng DOM công khai, không phải chi tiết cài đặt. `data-expanded` của RAC
 * vẫn nằm nguyên bên cạnh — thêm thì không mất gì.
 *
 * ## Nội dung được GẮN/THÁO, không chỉ ẩn
 *
 * RAC giữ con của panel luôn nằm trong DOM và chỉ đặt `hidden="until-found"`.
 * Radix tháo hẳn con khi đóng, và kho đang dựa vào vế sau (test đòi chữ trong
 * panel BIẾN MẤT khỏi DOM khi đóng). Nên con chỉ được dựng khi mở — hoặc khi
 * `forceMount`, đúng như Radix. Thẻ panel thì vẫn luôn có mặt, vì `useDisclosure`
 * cần một thẻ thật để đặt `hidden` lên.
 */

/**
 * Gói prop mà `render` của RAC trao lại. Nó có thêm `data-rac` — cái móc CSS
 * riêng của react-aria-components — mà kiểu JSX của React không khai báo.
 */
type RacDomProps = React.ComponentPropsWithRef<"div"> & { "data-rac"?: string };

/** Gói prop mà `useDisclosure` đẩy vào slot "trigger" của `ButtonContext`. */
type DisclosureTriggerSlot = {
  id?: string;
  "aria-controls"?: string;
  isDisabled?: boolean;
};

interface CollapsibleProps extends React.ComponentPropsWithRef<"div"> {
  /** Trạng thái mở, có kiểm soát. */
  open?: boolean;
  /** Trạng thái mở ban đầu khi không kiểm soát. */
  defaultOpen?: boolean;
  /** Gọi khi trạng thái mở/đóng đổi. */
  onOpenChange?: (open: boolean) => void;
  /** Khoá trigger; `data-disabled` được phát ra để CSS bám vào. */
  disabled?: boolean;
}

export function Collapsible({
  open,
  defaultOpen,
  onOpenChange,
  disabled,
  children,
  ref,
  ...props
}: CollapsibleProps) {
  return (
    <Disclosure
      isExpanded={open}
      defaultExpanded={defaultOpen}
      onExpandedChange={onOpenChange}
      isDisabled={disabled}
      render={(racProps, { isExpanded }) => {
        const {
          className: _racClass,
          "data-rac": _rac,
          ref: racRef,
          ...rest
        } = racProps as RacDomProps;
        return (
          <div
            {...props}
            {...rest}
            ref={mergeRefs(ref, racRef)}
            data-state={isExpanded ? "open" : "closed"}
            data-disabled={disabled ? "" : undefined}
          >
            {children}
          </div>
        );
      }}
    />
  );
}

interface CollapsibleTriggerProps extends React.ComponentPropsWithRef<"button"> {
  /** Mượn thẻ của con thay vì dựng `<button>` riêng. */
  asChild?: boolean;
}

export function CollapsibleTrigger({
  asChild,
  onClick,
  disabled,
  ...props
}: CollapsibleTriggerProps) {
  const trigger = useSlottedContext(ButtonContext, "trigger") as DisclosureTriggerSlot | null;
  const state = React.useContext(DisclosureStateContext);
  if (!trigger || !state) {
    throw new Error("`CollapsibleTrigger` phải nằm trong `Collapsible`.");
  }

  const isDisabled = disabled ?? trigger.isDisabled ?? false;
  const Comp = (asChild ? Slot : "button") as React.ElementType;

  return (
    <Comp
      type="button"
      id={trigger.id}
      /*
       * `aria-controls` chỉ khi ĐANG MỞ — giống Radix. Thẻ panel luôn có mặt,
       * nhưng consumer được phép dựng trigger mà không dựng content, và một
       * `aria-controls` trỏ vào id không tồn tại là lỗi axe thật.
       */
      aria-controls={state.isExpanded ? trigger["aria-controls"] : undefined}
      aria-expanded={state.isExpanded}
      data-state={state.isExpanded ? "open" : "closed"}
      data-disabled={isDisabled ? "" : undefined}
      disabled={isDisabled}
      {...props}
      onClick={chain(onClick, () => {
        /*
         * `<button disabled>` không phát click, nhưng qua `asChild` thẻ con có
         * thể là bất cứ gì — nên chốt chặn vẫn phải nằm ở đây.
         */
        if (!isDisabled) {
          state.toggle();
        }
      })}
    />
  );
}

interface CollapsibleContentProps extends React.ComponentPropsWithRef<"div"> {
  /** Giữ nội dung trong DOM cả khi đóng. */
  forceMount?: true;
}

export function CollapsibleContent({
  forceMount,
  children,
  ref,
  ...props
}: CollapsibleContentProps) {
  const trigger = useSlottedContext(ButtonContext, "trigger") as DisclosureTriggerSlot | null;
  const state = React.useContext(DisclosureStateContext);
  if (!state) {
    throw new Error("`CollapsibleContent` phải nằm trong `Collapsible`.");
  }

  return (
    <DisclosurePanel
      render={(racProps) => {
        const {
          className: _racClass,
          "data-rac": _rac,
          children: _racChildren,
          ref: racRef,
          ...rest
        } = racProps as RacDomProps;
        return (
          <div
            {...props}
            {...rest}
            ref={mergeRefs(ref, racRef)}
            data-state={state.isExpanded ? "open" : "closed"}
            data-disabled={trigger?.isDisabled ? "" : undefined}
          >
            {state.isExpanded || forceMount ? children : null}
          </div>
        );
      }}
    >
      {null}
    </DisclosurePanel>
  );
}
