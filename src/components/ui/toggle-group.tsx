import * as React from "react";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";

import { cn } from "../../lib/utils";
import { toggleVariants, type ToggleProps } from "./toggle";

type ToggleGroupVariant = ToggleProps["variant"];
type ToggleGroupSize = ToggleProps["size"];

/**
 * Group-level `variant`/`size`, provided to every item (upstream shadcn pattern).
 *
 * Without this the group could only stamp `data-variant`/`data-size` on the ROOT — attributes no
 * rule consumed — so `<ToggleGroup size="lg">` painted nothing and a consumer had to repeat the
 * prop on every single item. An item's OWN prop still wins: the item reads context only where its
 * own value is `undefined`.
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
  // either absent or a declared union member. (It used to default to the literal "default", which
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

export const ToggleGroupItem = React.forwardRef<
  React.ComponentRef<typeof ToggleGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item> & {
    variant?: ToggleGroupVariant;
    size?: ToggleGroupSize;
  }
>(({ className, variant, size, ...props }, ref) => {
  const context = React.useContext(ToggleGroupContext);
  // An explicit item prop ALWAYS wins; context fills in only where the item said nothing.
  const resolvedVariant = variant ?? context.variant;
  const resolvedSize = size ?? context.size;
  return (
    <ToggleGroupPrimitive.Item
      ref={ref}
      data-slot="toggle-group-item"
      data-variant={resolvedVariant}
      data-size={resolvedSize}
      className={cn(toggleVariants({ variant: resolvedVariant, size: resolvedSize }), className)}
      {...props}
    />
  );
});
ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName;
