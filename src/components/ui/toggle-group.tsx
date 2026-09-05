import * as React from "react";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";

import { cn } from "../../lib/utils";
import { toggleVariants, useCounterPill, type ToggleCountFields, type ToggleProp } from "./toggle";

type ToggleGroupVariant = ToggleProp["variant"];
type ToggleGroupSize = ToggleProp["size"];

/**
 * Group-level `variant`/`size`, provided to every item (upstream shadcn pattern). An item's OWN
 * prop still wins: the item reads context only where its own value is `undefined`.
 */
const ToggleGroupContext = React.createContext<{
  variant?: ToggleGroupVariant;
  size?: ToggleGroupSize;
}>({});

export const ToggleGroup = React.forwardRef<
  React.ComponentRef<typeof ToggleGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root> & {
    variant?: ToggleGroupVariant;
    size?: ToggleGroupSize;
  }
  // No destructuring defaults: an unset prop must stay `undefined` so the emitted attribute is
  // either absent or a declared union member.
  // is NOT in the `sm | md | lg` size union — the group advertised an invalid value for its own
  // type.) The real default lives in `toggleVariants`, applied per item.
>(({ className, variant, size, children, ...props }, ref) => {
  // Stable identity — a fresh object each render would re-render every item on any parent render.
  const context = React.useMemo(() => ({ variant, size }), [variant, size]);
  return (
    <ToggleGroupPrimitive.Root
      ref={ref}
      data-slot="toggle-group"
      data-variant={variant}
      data-size={size}
      className={cn("ui-toggle-group", className)}
      {...props}
    >
      <ToggleGroupContext.Provider value={context}>{children}</ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  );
});
ToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName;

/** Same vocabulary as `Toggle` and `Button` — one counter pill for the whole library. */
export type ToggleGroupItemProp = React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item> &
  ToggleCountFields & {
    variant?: ToggleGroupVariant;
    size?: ToggleGroupSize;
  };

export type ToggleGroupItemProps = ToggleGroupItemProp;

export const ToggleGroupItem = React.forwardRef<
  React.ComponentRef<typeof ToggleGroupPrimitive.Item>,
  ToggleGroupItemProp
>(
  (
    {
      className,
      variant,
      size,
      count,
      overflowCount,
      showZero,
      countLabel,
      children,
      "aria-label": ariaLabel,
      ...props
    },
    ref,
  ) => {
    const context = React.useContext(ToggleGroupContext);
    // An explicit item prop ALWAYS wins; context fills in only where the item said nothing.
    const resolvedVariant = variant ?? context.variant;
    const resolvedSize = size ?? context.size;
    const { pill, resolvedAriaLabel } = useCounterPill({
      count,
      overflowCount,
      showZero,
      countLabel,
      ariaLabel,
    });
    return (
      <ToggleGroupPrimitive.Item
        ref={ref}
        data-slot="toggle-group-item"
        data-variant={resolvedVariant}
        data-size={resolvedSize}
        aria-label={resolvedAriaLabel}
        className={cn(toggleVariants({ variant: resolvedVariant, size: resolvedSize }), className)}
        {...props}
      >
        {children}
        {pill}
      </ToggleGroupPrimitive.Item>
    );
  },
);
ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName;
