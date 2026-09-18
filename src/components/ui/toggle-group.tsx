import * as React from "react";
import {
  ToggleButton,
  ToggleButtonGroup,
  ToggleGroupStateContext,
  type ToggleButtonGroupProps,
  type ToggleButtonProps,
} from "react-aria-components";

import { cn } from "../../lib/utils";
import {
  restoreDomProps,
  toggleVariants,
  useCounterPill,
  type ToggleCountFields,
  type ToggleProp,
} from "./toggle";

type ToggleGroupVariant = ToggleProp["variant"];
type ToggleGroupSize = ToggleProp["size"];
type ToggleGroupShape = ToggleProp["shape"];

/**
 * Group-level `variant`/`size`/`shape`, provided to every item (upstream shadcn pattern). An
 * item's OWN prop still wins: the item reads context only where its own value is `undefined`.
 * `shape` joins the other two because the row is where the decision is made — a tag-filter panel
 * is a row of pill chips, not one pill among squares (gh#734).
 */
const ToggleGroupContext = React.createContext<{
  variant?: ToggleGroupVariant;
  size?: ToggleGroupSize;
  shape?: ToggleGroupShape;
}>({});

type ToggleGroupBaseProp = Omit<React.ComponentPropsWithoutRef<"div">, "defaultValue" | "dir"> & {
  variant?: ToggleGroupVariant;
  size?: ToggleGroupSize;
  shape?: ToggleGroupShape;
  /** Disable every item at once — RAC `isDisabled`. */
  disabled?: boolean;
  /** Which way the arrow keys walk the group. */
  orientation?: "horizontal" | "vertical";
  /**
   * Writing direction. It still lands on the DOM node, but React Aria reads the direction it
   * navigates by from the ambient locale (`I18nProvider`), NOT from this attribute — where Radix
   * read this prop directly. An RTL app must set the locale, not just `dir`.
   */
  dir?: "ltr" | "rtl";
  /**
   * Accepted for source compatibility with the Radix era, where it wrapped arrow-key focus around
   * the ends. React Aria's toolbar navigation stops at the ends and has no equivalent switch, so
   * this prop no longer changes anything.
   */
  loop?: boolean;
};

/**
 * `type` is the discriminant, exactly as it was under Radix: `"single"` reports the one selected
 * value as a string (`""` once it is deselected), `"multiple"` reports an array. React Aria models
 * both as `selectionMode` + a `Set` of keys — that Set is built and unpacked here so the public
 * shape stays a string / an array of strings.
 */
type ToggleGroupSingleProp = ToggleGroupBaseProp & {
  type: "single";
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
};

type ToggleGroupMultipleProp = ToggleGroupBaseProp & {
  type: "multiple";
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
};

type ToggleGroupProp = ToggleGroupSingleProp | ToggleGroupMultipleProp;

/** `""` is Radix's "nothing selected" for a single group; RAC's is an empty Set. */
function toSelectedKeys(value: string | string[] | undefined): Set<string> | undefined {
  if (value == null) {
    return undefined;
  }
  if (Array.isArray(value)) {
    return new Set(value);
  }
  return new Set(value === "" ? [] : [value]);
}

export const ToggleGroup = React.forwardRef<HTMLDivElement, ToggleGroupProp>(
  // No destructuring defaults: an unset prop must stay `undefined` so the emitted attribute is
  // either absent or a declared union member.
  // is NOT in the `sm | md | lg` size union — the group advertised an invalid value for its own
  // type.) The real default lives in `toggleVariants`, applied per item.
  (
    {
      className,
      variant,
      size,
      shape,
      children,
      type,
      value,
      defaultValue,
      onValueChange,
      disabled,
      loop: _loop,
      ...props
    },
    ref,
  ) => {
    // Stable identity — a fresh object each render would re-render every item on any parent render.
    const context = React.useMemo(() => ({ variant, size, shape }), [variant, size, shape]);
    const selectedKeys = React.useMemo(() => toSelectedKeys(value), [value]);
    const defaultSelectedKeys = React.useMemo(() => toSelectedKeys(defaultValue), [defaultValue]);
    const handleSelectionChange = (keys: Set<React.Key>) => {
      const next = [...keys].map(String);
      if (type === "single") {
        onValueChange?.(next[0] ?? "");
      } else {
        onValueChange?.(next);
      }
    };
    return (
      <ToggleButtonGroup
        ref={ref}
        data-slot="toggle-group"
        data-variant={variant}
        data-size={size}
        data-shape={shape}
        className={cn("ui-toggle-group", className)}
        {...(props as Omit<ToggleButtonGroupProps, "children" | "className">)}
        selectionMode={type}
        selectedKeys={selectedKeys}
        defaultSelectedKeys={defaultSelectedKeys}
        onSelectionChange={handleSelectionChange}
        isDisabled={disabled}
        render={(domProps) => (
          <div {...props} {...domProps} tabIndex={props.tabIndex ?? domProps.tabIndex} />
        )}
      >
        <ToggleGroupContext.Provider value={context}>{children}</ToggleGroupContext.Provider>
      </ToggleButtonGroup>
    );
  },
);
ToggleGroup.displayName = "ToggleGroup";

/** Same vocabulary as `Toggle` and `Button` — one counter pill for the whole library. */
export type ToggleGroupItemProp = Omit<React.ComponentPropsWithoutRef<"button">, "value"> &
  ToggleCountFields & {
    /**
     * This item's key in the group's value. React Aria calls it `id` (the key it stores in
     * `selectedKeys`); the public spelling stays `value`, as it was under Radix.
     */
    value: string;
    variant?: ToggleGroupVariant;
    size?: ToggleGroupSize;
    shape?: ToggleGroupShape;
  };

export type ToggleGroupItemProps = ToggleGroupItemProp;

export const ToggleGroupItem = React.forwardRef<HTMLButtonElement, ToggleGroupItemProp>(
  (
    {
      className,
      variant,
      size,
      shape,
      count,
      overflowCount,
      showZero,
      countLabel,
      children,
      "aria-label": ariaLabel,
      value,
      disabled,
      ...props
    },
    ref,
  ) => {
    const context = React.useContext(ToggleGroupContext);
    // An explicit item prop ALWAYS wins; context fills in only where the item said nothing.
    const resolvedVariant = variant ?? context.variant;
    const resolvedSize = size ?? context.size;
    const resolvedShape = shape ?? context.shape;
    const { pill, resolvedAriaLabel } = useCounterPill({
      count,
      overflowCount,
      showZero,
      countLabel,
      ariaLabel,
    });
    // The selection lives in RAC's group state; `data-state` — what the CSS reads — is rendered
    // from it rather than from a second copy kept here.
    const groupState = React.useContext(ToggleGroupStateContext);
    const isPressed = groupState?.selectedKeys.has(value) ?? false;
    return (
      <ToggleButton
        ref={ref}
        data-slot="toggle-group-item"
        data-state={isPressed ? "on" : "off"}
        data-variant={resolvedVariant}
        data-size={resolvedSize}
        data-shape={resolvedShape}
        aria-label={resolvedAriaLabel}
        className={cn(
          toggleVariants({ variant: resolvedVariant, size: resolvedSize, shape: resolvedShape }),
          className,
        )}
        {...(props as Omit<ToggleButtonProps, "children" | "className">)}
        id={value}
        isDisabled={disabled}
        render={(domProps) => restoreDomProps(props, domProps)}
      >
        {children}
        {pill}
      </ToggleButton>
    );
  },
);
ToggleGroupItem.displayName = "ToggleGroupItem";
