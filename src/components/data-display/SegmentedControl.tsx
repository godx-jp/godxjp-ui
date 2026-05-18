import {
  forwardRef,
  useCallback,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
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

import type { SizeProp } from "../../props";

export type SegmentedControlVariant = "bar" | "pill";
/** Subset of the shared `SizeProp` — SegmentedControl only ships the
 *  two compact-side rungs in practice (no `"large"` design canon yet). */
export type SegmentedControlSize = Exclude<SizeProp, "large">;
export type SegmentedControlOrientation = "horizontal" | "vertical";

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
  /** Axis of the radiogroup — controls Arrow-key direction for the
   * roving-tabindex pattern (per WAI-ARIA APG radiogroup). */
  orientation?: SegmentedControlOrientation;
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
  orientation = "horizontal",
  className,
  ...rest
}: SegmentedControlProps<V>) {
  const [internal, setInternal] = useState<V | undefined>(
    defaultValue ?? items[0]?.value,
  );
  const active = controlled ?? internal;
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const select = useCallback(
    (next: V) => {
      if (controlled === undefined) setInternal(next);
      onChange?.(next);
    },
    [controlled, onChange],
  );

  // WAI-ARIA APG roving-tabindex: only the checked item is in the
  // page Tab order; Arrow keys roam between items in the group.
  // If the active value is disabled / missing, fall back to the
  // first enabled item so the group is always reachable via Tab.
  const enabledIndices = items.reduce<number[]>((acc, item, i) => {
    if (!item.disabled) acc.push(i);
    return acc;
  }, []);
  const activeIndex = items.findIndex((it) => it.value === active);
  const tabStopIndex =
    activeIndex >= 0 && !items[activeIndex]?.disabled
      ? activeIndex
      : (enabledIndices[0] ?? -1);

  const moveFocus = useCallback(
    (currentIndex: number, direction: 1 | -1) => {
      const enabled = enabledIndices;
      if (enabled.length === 0) return;
      const currentSlot = enabled.indexOf(currentIndex);
      const nextSlot =
        currentSlot === -1
          ? 0
          : (currentSlot + direction + enabled.length) % enabled.length;
      const nextIndex = enabled[nextSlot]!;
      const nextItem = items[nextIndex]!;
      itemRefs.current[nextIndex]?.focus();
      select(nextItem.value);
    },
    [enabledIndices, items, select],
  );

  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLButtonElement>, index: number) => {
      const forwardKey = orientation === "vertical" ? "ArrowDown" : "ArrowRight";
      const backwardKey = orientation === "vertical" ? "ArrowUp" : "ArrowLeft";
      if (event.key === forwardKey) {
        event.preventDefault();
        moveFocus(index, 1);
      } else if (event.key === backwardKey) {
        event.preventDefault();
        moveFocus(index, -1);
      } else if (event.key === "Home") {
        event.preventDefault();
        const first = enabledIndices[0];
        if (first !== undefined) {
          itemRefs.current[first]?.focus();
          select(items[first]!.value);
        }
      } else if (event.key === "End") {
        event.preventDefault();
        const last = enabledIndices[enabledIndices.length - 1];
        if (last !== undefined) {
          itemRefs.current[last]?.focus();
          select(items[last]!.value);
        }
      } else if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        const current = items[index];
        if (current && !current.disabled) select(current.value);
      }
    },
    [enabledIndices, items, moveFocus, orientation, select],
  );

  const rootClass =
    variant === "pill" ? "tabs-pills" : "segmented";

  return (
    <div
      role="radiogroup"
      aria-orientation={orientation}
      className={cn(
        rootClass,
        size === "small" && "segmented-small",
        className,
      )}
      {...rest}
    >
      {items.map((item, index) => {
        const isActive = item.value === active;
        const itemClass =
          variant === "pill" ? "tabs-pill" : "segmented-item";
        const isTabStop = index === tabStopIndex;
        return (
          <button
            key={item.value}
            ref={(node) => {
              itemRefs.current[index] = node;
            }}
            type="button"
            role="radio"
            aria-checked={isActive}
            data-state={isActive ? "active" : "inactive"}
            disabled={item.disabled}
            tabIndex={isTabStop ? 0 : -1}
            className={itemClass}
            onClick={() => !item.disabled && select(item.value)}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >
            {item.icon}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
