import * as React from "react";
import { chain, mergeRefs } from "@react-aria/utils";
import {
  ButtonContext,
  Disclosure,
  DisclosureGroup,
  DisclosureGroupStateContext,
  DisclosurePanel,
  DisclosureStateContext,
  useSlottedContext,
} from "react-aria-components";
import { ChevronDown } from "lucide-react";

import { cn } from "../../lib/utils";
import { Slot } from "../../lib/slot";

/*
 * Accordion — nền là `DisclosureGroup` / `Disclosure` của react-aria-components,
 * API công khai vẫn nguyên văn Radix.
 *
 * ## Hai mô hình trạng thái lệch nhau, và bản dịch
 *
 * Radix: `type="single" | "multiple"` + `collapsible` + `value` / `defaultValue`
 * / `onValueChange`, với `value` là `string` ở single và `string[]` ở multiple.
 * RAC: `allowsMultipleExpanded` + `expandedKeys` / `onExpandedChange`, luôn là
 * một `Set`. Bản dịch nằm gọn trong `Accordion`:
 *
 *     type="multiple"    → allowsMultipleExpanded
 *     value/defaultValue → expandedKeys (Set); single thì Set có 0 hoặc 1 phần tử
 *     onExpandedChange   → onValueChange, trả string ở single, string[] ở multiple
 *
 * `collapsible` KHÔNG có tương đương ở RAC: `toggleKey` của RAC luôn cho đóng
 * mục đang mở. Nên `expandedKeys` được kiểm soát hoàn toàn ở đây, và khi
 * `type="single"` mà `collapsible` sai thì lần đóng cuối cùng bị bỏ qua — đúng
 * hành vi Radix.
 *
 * ## `data-state`, chứ không phải `data-expanded`
 *
 * `.ui-accordion-trigger[data-state="open"] .ui-accordion-chevron` trong
 * `src/styles/data-display-layout.css` là thứ xoay mũi tên. RAC chỉ phát
 * `data-expanded`. `data-state` được PHÁT LẠI ở đây thay vì đi sửa selector:
 * `src/styles/` là móc CSS công khai mà consumer cũng bám vào, và một đợt đổi
 * nền không phải lý do để đổi hợp đồng DOM. `data-orientation` và `data-disabled`
 * cũng vậy.
 *
 * ## Bàn phím
 *
 * `DisclosureGroup` của RAC không có điều hướng mũi tên giữa các mục — nó để Tab
 * lo. Radix thì có, và có VÒNG (từ mục cuối ArrowDown về mục đầu), bỏ qua mục
 * `disabled`; đo được bằng chính Radix trong `disclosure-rac.test.tsx`. Hành vi
 * ấy được dựng lại ở `onKeyDown` của root: mất nó là mất, im lặng, một thứ người
 * dùng bàn phím đã quen.
 */

/**
 * Gói prop mà `render` của RAC trao lại. Nó có thêm `data-rac` — cái móc CSS
 * riêng của react-aria-components — mà kiểu JSX của React không khai báo.
 */
type RacDomProps = React.ComponentPropsWithRef<"div"> & { "data-rac"?: string };

type Orientation = "vertical" | "horizontal";

const AccordionGroupContext = React.createContext<{ orientation: Orientation }>({
  orientation: "vertical",
});

const AccordionItemContext = React.createContext<{
  orientation: Orientation;
  isDisabled: boolean;
} | null>(null);

function useAccordionItem(component: string) {
  const item = React.useContext(AccordionItemContext);
  const state = React.useContext(DisclosureStateContext);
  if (!item || !state) {
    throw new Error(`\`${component}\` phải nằm trong \`AccordionItem\`.`);
  }
  return { item, state };
}

const TRIGGER_SELECTOR = '[data-slot="accordion-trigger"]:not([disabled])';

interface AccordionBaseProps extends Omit<React.ComponentPropsWithRef<"div">, "dir"> {
  /** Trục xếp mục — đổi cặp phím mũi tên điều hướng. */
  orientation?: "vertical" | "horizontal";
  /** Chiều viết; chỉ đổi mũi tên trái/phải khi `orientation="horizontal"`. */
  dir?: "ltr" | "rtl";
  /** Khoá mọi mục. */
  disabled?: boolean;
}

interface AccordionSingleProps extends AccordionBaseProps {
  /** Chỉ một mục mở tại một thời điểm. */
  type: "single";
  /** Mục đang mở, có kiểm soát. */
  value?: string;
  /** Mục mở ban đầu khi không kiểm soát. */
  defaultValue?: string;
  /** Gọi khi mục đang mở đổi; chuỗi rỗng nghĩa là đã đóng hết. */
  onValueChange?: (value: string) => void;
  /** Cho phép đóng chính mục đang mở. Mặc định sai, như Radix. */
  collapsible?: boolean;
}

interface AccordionMultipleProps extends AccordionBaseProps {
  /** Nhiều mục mở độc lập. */
  type: "multiple";
  /** Các mục đang mở, có kiểm soát. */
  value?: string[];
  /** Các mục mở ban đầu khi không kiểm soát. */
  defaultValue?: string[];
  /** Gọi khi tập mục đang mở đổi. */
  onValueChange?: (value: string[]) => void;
}

type AccordionProps = AccordionSingleProps | AccordionMultipleProps;

/** Dạng đã xoá nhánh, chỉ dùng bên trong để khỏi phải phân nhánh mọi lần đọc. */
type AccordionAnyProps = AccordionBaseProps & {
  type: "single" | "multiple";
  value?: string | string[];
  defaultValue?: string | string[];
  onValueChange?: ((value: string) => void) & ((value: string[]) => void);
  collapsible?: boolean;
};

function toArray(value: string | string[] | undefined): string[] {
  if (value === undefined) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}

export function Accordion(accordionProps: AccordionProps) {
  const {
    type,
    value,
    defaultValue,
    onValueChange,
    collapsible,
    orientation = "vertical",
    dir,
    disabled,
    onKeyDown,
    children,
    ref,
    ...props
  } = accordionProps as AccordionAnyProps;

  const [uncontrolled, setUncontrolled] = React.useState(() => toArray(defaultValue));
  const isControlled = value !== undefined;
  const expandedKeys = new Set(isControlled ? toArray(value) : uncontrolled);

  function handleExpandedChange(keys: Set<React.Key>) {
    const next = [...keys].map(String);
    /*
     * `collapsible` sai (mặc định của Radix) nghĩa là mục đang mở không tự đóng
     * được — chỉ một mục KHÁC mới đẩy nó ra. RAC không biết luật đó, nên chặn ở đây.
     */
    if (type === "single" && !collapsible && next.length === 0) {
      return;
    }
    if (!isControlled) {
      setUncontrolled(next);
    }
    onValueChange?.(type === "multiple" ? next : ((next[0] ?? "") as string & string[]));
  }

  function moveFocus(event: React.KeyboardEvent<HTMLDivElement>) {
    const from = (event.target as HTMLElement).closest?.(TRIGGER_SELECTOR);
    if (!from) {
      return;
    }

    const horizontal = orientation === "horizontal";
    const forward = horizontal ? (dir === "rtl" ? "ArrowLeft" : "ArrowRight") : "ArrowDown";
    const backward = horizontal ? (dir === "rtl" ? "ArrowRight" : "ArrowLeft") : "ArrowUp";

    const triggers = [...event.currentTarget.querySelectorAll<HTMLElement>(TRIGGER_SELECTOR)];
    const at = triggers.indexOf(from as HTMLElement);
    if (at < 0) {
      return;
    }

    let to: number;
    if (event.key === forward) {
      to = (at + 1) % triggers.length;
    } else if (event.key === backward) {
      to = (at - 1 + triggers.length) % triggers.length;
    } else if (event.key === "Home") {
      to = 0;
    } else if (event.key === "End") {
      to = triggers.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    triggers[to].focus();
  }

  return (
    <DisclosureGroup
      allowsMultipleExpanded={type === "multiple"}
      expandedKeys={expandedKeys}
      onExpandedChange={handleExpandedChange}
      isDisabled={disabled}
      render={(racProps) => {
        const {
          className: _racClass,
          "data-rac": _rac,
          ref: racRef,
          ...rest
        } = racProps as RacDomProps;
        /*
         * `children` phải đi qua prop của `DisclosureGroup`, KHÔNG phải qua JSX
         * ở đây: `DisclosureGroupStateContext` được cắm BÊN TRONG thẻ div của
         * RAC, quanh đúng `children` ấy. Đặt con thẳng vào đây là cắt mất
         * context, và mỗi mục sẽ tưởng mình đứng một mình — `type="single"` im
         * lặng cư xử như `"multiple"`.
         */
        return (
          <div
            {...props}
            {...rest}
            ref={mergeRefs(ref, racRef)}
            dir={dir}
            data-orientation={orientation}
            onKeyDown={chain(onKeyDown, moveFocus)}
          />
        );
      }}
    >
      <AccordionGroupContext.Provider value={{ orientation }}>
        {children}
      </AccordionGroupContext.Provider>
    </DisclosureGroup>
  );
}

interface AccordionItemProps extends React.ComponentPropsWithRef<"div"> {
  /** Khoá riêng mục này. */
  disabled?: boolean;
  /** Khoá định danh của mục — khớp với `value` của `Accordion`. */
  value: string;
}

export function AccordionItem({
  className,
  disabled,
  value,
  children,
  ref,
  ...props
}: AccordionItemProps) {
  const { orientation } = React.useContext(AccordionGroupContext);
  const groupState = React.useContext(DisclosureGroupStateContext);
  const isDisabled = Boolean(disabled || groupState?.isDisabled);

  return (
    <Disclosure
      id={value}
      isDisabled={isDisabled}
      render={(racProps, { isExpanded }) => {
        const {
          className: _racClass,
          "data-rac": _rac,
          ref: racRef,
          ...rest
        } = racProps as RacDomProps;
        return (
          <div
            data-slot="accordion-item"
            className={cn("ui-accordion-item", className)}
            {...props}
            {...rest}
            ref={mergeRefs(ref, racRef)}
            data-state={isExpanded ? "open" : "closed"}
            data-disabled={isDisabled ? "" : undefined}
            data-orientation={orientation}
          >
            <AccordionItemContext.Provider value={{ orientation, isDisabled }}>
              {children}
            </AccordionItemContext.Provider>
          </div>
        );
      }}
    />
  );
}

interface AccordionTriggerProps extends React.ComponentPropsWithRef<"button"> {
  /** Mượn thẻ của con thay vì dựng `<button>` riêng. */
  asChild?: boolean;
}

export function AccordionTrigger({
  asChild,
  className,
  children,
  onClick,
  ...props
}: AccordionTriggerProps) {
  const { item, state } = useAccordionItem("AccordionTrigger");
  const trigger = useSlottedContext(ButtonContext, "trigger") as {
    id?: string;
    "aria-controls"?: string;
  } | null;
  const Comp = (asChild ? Slot : "button") as React.ElementType;
  const dataState = state.isExpanded ? "open" : "closed";
  const dataDisabled = item.isDisabled ? "" : undefined;

  return (
    <h3
      className="ui-accordion-header"
      data-orientation={item.orientation}
      data-state={dataState}
      data-disabled={dataDisabled}
    >
      <Comp
        type="button"
        id={trigger?.id}
        /* `aria-controls` chỉ khi đang mở — giống Radix. */
        aria-controls={state.isExpanded ? trigger?.["aria-controls"] : undefined}
        aria-expanded={state.isExpanded}
        data-slot="accordion-trigger"
        data-state={dataState}
        data-disabled={dataDisabled}
        data-orientation={item.orientation}
        disabled={item.isDisabled}
        className={cn("ui-accordion-trigger", className)}
        {...props}
        onClick={chain(onClick, () => {
          if (!item.isDisabled) {
            state.toggle();
          }
        })}
      >
        {children}
        <ChevronDown className="ui-accordion-chevron" aria-hidden="true" />
      </Comp>
    </h3>
  );
}

interface AccordionContentProps extends React.ComponentPropsWithRef<"div"> {
  /** Giữ nội dung trong DOM cả khi đóng. */
  forceMount?: true;
}

export function AccordionContent({
  className,
  forceMount,
  children,
  ref,
  ...props
}: AccordionContentProps) {
  const { item, state } = useAccordionItem("AccordionContent");

  return (
    <DisclosurePanel
      role="region"
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
            data-slot="accordion-content"
            className={cn("ui-accordion-content", className)}
            {...props}
            {...rest}
            ref={mergeRefs(ref, racRef)}
            data-state={state.isExpanded ? "open" : "closed"}
            data-disabled={item.isDisabled ? "" : undefined}
            data-orientation={item.orientation}
          >
            {state.isExpanded || forceMount ? (
              <div className="ui-accordion-content-inner">{children}</div>
            ) : null}
          </div>
        );
      }}
    >
      {null}
    </DisclosurePanel>
  );
}
