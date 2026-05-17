import {
  forwardRef,
  useCallback,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "../cn";

/**
 * SegmentedControl — single-choice toggle group with no tab-panel.
 *
 * Mirrors the canonical `.seg` strip from
 * `K:comp-pageheader.html:21-24` (day / week / month-style switch).
 * Tabs already covers the case where a switch drives panel content;
 * SegmentedControl is the bare button-row variant for toolbars, view
 * pickers, density toggles, and other "just pick one" UIs without
 * panel composition.
 *
 * Two visual variants:
 *
 *   - `bar`  → connected button row with hairline dividers between
 *              items (matches `.seg`; `.seg button + button` border).
 *              Default; matches the page-header reference.
 *   - `pill` → rounded background, active item lifts onto `--background`
 *              with a soft shadow. Matches `.tabs-pills` from Tabs.
 *
 * Controlled or uncontrolled. Pass `items` as an array of
 * `{ value, label, icon?, disabled? }` or compose `<SegmentedControl>`
 * with `<SegmentedItem>` children directly.
 *
 * @example
 *   <SegmentedControl
 *     items={[
 *       { value: "day", label: "日" },
 *       { value: "week", label: "週" },
 *       { value: "month", label: "月" },
 *     ]}
 *     defaultValue="month"
 *   />
 *
 * @example with icons + controlled state
 *   <SegmentedControl
 *     value={view}
 *     onChange={setView}
 *     variant="pill"
 *     items={[
 *       { value: "grid", label: "Grid", icon: <LayoutGrid size={13} /> },
 *       { value: "list", label: "List", icon: <List size={13} /> },
 *     ]}
 *   />
 */

export type SegmentedControlVariant = "bar" | "pill";
export type SegmentedControlSize = "sm" | "default";

export interface SegmentedControlItem<V extends string = string> {
  value: V;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
}

export interface SegmentedControlProps<V extends string = string>
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  items: SegmentedControlItem<V>[];
  value?: V;
  defaultValue?: V;
  onChange?: (next: V) => void;
  variant?: SegmentedControlVariant;
  size?: SegmentedControlSize;
  /** Accessible name for the group — falls back to a generic role label. */
  "aria-label"?: string;
}

export function SegmentedControl<V extends string = string>({
  items,
  value: controlled,
  defaultValue,
  onChange,
  variant = "bar",
  size = "default",
  className,
  ...rest
}: SegmentedControlProps<V>) {
  const [internal, setInternal] = useState<V | undefined>(
    defaultValue ?? items[0]?.value,
  );
  const active = controlled ?? internal;

  const select = useCallback(
    (next: V) => {
      if (controlled === undefined) setInternal(next);
      onChange?.(next);
    },
    [controlled, onChange],
  );

  const rootClass =
    variant === "pill" ? "tabs-pills" : "segmented";

  return (
    <div
      role="radiogroup"
      className={cn(
        rootClass,
        size === "sm" && "segmented-sm",
        className,
      )}
      {...rest}
    >
      {items.map((item) => {
        const isActive = item.value === active;
        const itemClass =
          variant === "pill" ? "tabs-pill" : "segmented-item";
        return (
          <button
            key={item.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            data-state={isActive ? "active" : "inactive"}
            disabled={item.disabled}
            className={itemClass}
            onClick={() => !item.disabled && select(item.value)}
          >
            {item.icon}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * SegmentedControlButton — escape-hatch when consumers want to compose
 * items manually instead of passing `items`. Pair with
 * `<SegmentedControl items={…} />` only when the typed item-array shape
 * is too rigid.
 */
export interface SegmentedControlButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

export const SegmentedControlButton = forwardRef<
  HTMLButtonElement,
  SegmentedControlButtonProps
>(
  function SegmentedControlButton(
    { className, active, type = "button", children, ...rest },
    ref,
  ) {
    return (
      <button
        ref={ref}
        role="radio"
        aria-checked={active ?? false}
        data-state={active ? "active" : "inactive"}
        type={type}
        className={cn("segmented-item", className)}
        {...rest}
      >
        {children}
      </button>
    );
  },
);
