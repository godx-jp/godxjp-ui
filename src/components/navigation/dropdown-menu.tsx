import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { Check, ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils";
import { useInertHiddenBackground } from "../general/inert-background";
import type { DropdownMenuPlacementProp } from "../../props/components/navigation.prop";

export type { DropdownMenuPlacementProp } from "../../props/components/navigation.prop";

/**
 * Ant Design `placement` → the two Radix anchors it is made of. `align` is LOGICAL in Radix
 * (`start`/`end` follow the writing direction), which is why the block-axis anchors can be offered
 * on the logical axis at no cost.
 *
 * antd's inline-side placements (`left`, `leftTop`, `rightBottom`, …) are deliberately NOT here:
 * Radix's `side` is physical, this library ships no `DirectionProvider`, and a `side="left"` menu
 * would open on the wrong edge of an RTL screen. A consumer who genuinely wants a physical inline
 * side still passes Radix's own `side` / `align`, which this component forwards untouched.
 */
const DROPDOWN_MENU_PLACEMENT: Record<
  DropdownMenuPlacementProp,
  { side: "top" | "bottom"; align: "start" | "center" | "end" }
> = {
  top: { side: "top", align: "center" },
  topStart: { side: "top", align: "start" },
  topEnd: { side: "top", align: "end" },
  bottom: { side: "bottom", align: "center" },
  bottomStart: { side: "bottom", align: "start" },
  bottomEnd: { side: "bottom", align: "end" },
};

export function DropdownMenu(props: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {
  return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />;
}

export function DropdownMenuTrigger(
  props: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>,
) {
  return <DropdownMenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />;
}

export function DropdownMenuPortal(
  props: React.ComponentProps<typeof DropdownMenuPrimitive.Portal>,
) {
  return <DropdownMenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />;
}

export function DropdownMenuGroup(props: React.ComponentProps<typeof DropdownMenuPrimitive.Group>) {
  return <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />;
}

export function DropdownMenuRadioGroup(
  props: React.ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>,
) {
  return <DropdownMenuPrimitive.RadioGroup data-slot="dropdown-menu-radio-group" {...props} />;
}

export function DropdownMenuSub(props: React.ComponentProps<typeof DropdownMenuPrimitive.Sub>) {
  return <DropdownMenuPrimitive.Sub data-slot="dropdown-menu-sub" {...props} />;
}

export const DropdownMenuContent = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content> & {
    /**
     * Ant Design `placement`, on the logical inline axis. It is pure sugar over Radix's
     * `side` + `align`, and an explicitly passed `side`/`align` still wins — so a consumer can
     * mix the two without this prop silently overruling them.
     */
    placement?: DropdownMenuPlacementProp;
    /** Ant Design `arrow` — paint the little pointer at the anchored edge (default: off). */
    arrow?: boolean;
  }
>(({ className, sideOffset = 4, placement, arrow, side, align, children, ...props }, ref) => {
  // Radix hides the app behind an open menu from assistive tech but leaves it tabbable —
  // axe `aria-hidden-focus`. See components/general/inert-background.ts.
  // Đăng ký chính phần tử content: nó mang `data-state`, và đó là tín hiệu ý định đóng mà
  // nền dựa vào để nhả `inert` NGAY, thay vì đợi hết animation thoát (gh#385).
  const contentRef = useInertHiddenBackground(ref);
  const anchor = placement ? DROPDOWN_MENU_PLACEMENT[placement] : undefined;
  return (
    <DropdownMenuPortal>
      <DropdownMenuPrimitive.Content
        ref={contentRef}
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        side={side ?? anchor?.side}
        align={align ?? anchor?.align}
        className={cn(
          "ui-dropdown-menu-content data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 origin-[var(--radix-dropdown-menu-content-transform-origin)]",
          className,
        )}
        {...props}
      >
        {children}
        {arrow ? (
          // Radix stamps its own 10×5 on the <svg>; the CSS box below overrides both from tokens,
          // so the pointer follows a service theme instead of Radix's constant.
          <DropdownMenuPrimitive.Arrow
            data-slot="dropdown-menu-arrow"
            className="ui-dropdown-menu-arrow"
          />
        ) : null}
      </DropdownMenuPrimitive.Content>
    </DropdownMenuPortal>
  );
});
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

export const DropdownMenuItem = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean;
    variant?: "default" | "destructive";
  }
>(({ className, inset, variant = "default", ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    data-slot="dropdown-menu-item"
    data-inset={inset}
    data-variant={variant}
    className={cn(
      "ui-dropdown-menu-item [&_svg:not([class*='text-'])]:text-muted-foreground",
      className,
    )}
    {...props}
  />
));
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;

export const DropdownMenuLabel = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & { inset?: boolean }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    data-slot="dropdown-menu-label"
    data-inset={inset}
    className={cn("ui-dropdown-menu-label", className)}
    {...props}
  />
));
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName;

export const DropdownMenuSeparator = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    data-slot="dropdown-menu-separator"
    className={cn("ui-dropdown-menu-separator", className)}
    {...props}
  />
));
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;

export const DropdownMenuCheckboxItem = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <DropdownMenuPrimitive.CheckboxItem
    ref={ref}
    data-slot="dropdown-menu-checkbox-item"
    className={cn("ui-dropdown-menu-checkbox-item", className)}
    checked={checked}
    {...props}
  >
    <span className="ui-dropdown-menu-indicator-slot">
      <DropdownMenuPrimitive.ItemIndicator>
        <Check className="ui-dropdown-menu-check" aria-hidden="true" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>
));
DropdownMenuCheckboxItem.displayName = DropdownMenuPrimitive.CheckboxItem.displayName;

export const DropdownMenuRadioItem = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem
    ref={ref}
    data-slot="dropdown-menu-radio-item"
    className={cn("ui-dropdown-menu-radio-item", className)}
    {...props}
  >
    {children}
  </DropdownMenuPrimitive.RadioItem>
));
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName;

export const DropdownMenuSubTrigger = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & { inset?: boolean }
>(({ className, inset, children, ...props }, ref) => (
  <DropdownMenuPrimitive.SubTrigger
    ref={ref}
    data-slot="dropdown-menu-sub-trigger"
    data-inset={inset}
    className={cn(
      "ui-dropdown-menu-sub-trigger [&_svg:not([class*='text-'])]:text-muted-foreground",
      className,
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ui-dropdown-menu-sub-trigger-icon" aria-hidden="true" />
  </DropdownMenuPrimitive.SubTrigger>
));
DropdownMenuSubTrigger.displayName = DropdownMenuPrimitive.SubTrigger.displayName;

export const DropdownMenuSubContent = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.SubContent
    ref={ref}
    data-slot="dropdown-menu-sub-content"
    className={cn(
      "ui-dropdown-menu-sub-content data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 origin-[var(--radix-dropdown-menu-content-transform-origin)]",
      className,
    )}
    {...props}
  />
));
DropdownMenuSubContent.displayName = DropdownMenuPrimitive.SubContent.displayName;

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
