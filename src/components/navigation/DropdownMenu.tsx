import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { type ComponentPropsWithoutRef, type ReactNode } from "react"
import { cn } from "../cn"

export interface DropdownMenuOption {
  key: string
  label?: ReactNode
  onSelect?: ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item>["onSelect"]
  disabled?: boolean
  variant?: "default" | "destructive"
  shortcut?: ReactNode
  type?: "item" | "label" | "separator"
}

export interface DropdownMenuProps
  extends Omit<ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Root>, "children"> {
  trigger: ReactNode
  items: DropdownMenuOption[]
  align?: ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>["align"]
  sideOffset?: number
  contentClassName?: string
}

export function DropdownMenu({
  trigger,
  items,
  align,
  sideOffset = 6,
  contentClassName,
  ...rootProps
}: DropdownMenuProps) {
  return (
    <DropdownMenuPrimitive.Root {...rootProps}>
      <DropdownMenuPrimitive.Trigger asChild>{trigger}</DropdownMenuPrimitive.Trigger>
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          align={align}
          sideOffset={sideOffset}
          className={cn("dropdown-menu-content", contentClassName)}
        >
          {items.map((item) => {
            if (item.type === "separator") {
              return (
                <DropdownMenuPrimitive.Separator
                  key={item.key}
                  className="dropdown-menu-separator"
                />
              )
            }
            if (item.type === "label") {
              return (
                <DropdownMenuPrimitive.Label
                  key={item.key}
                  className="dropdown-menu-label"
                >
                  {item.label}
                </DropdownMenuPrimitive.Label>
              )
            }
            return (
              <DropdownMenuPrimitive.Item
                key={item.key}
                disabled={item.disabled}
                onSelect={item.onSelect}
                className="dropdown-menu-item"
                data-variant={item.variant === "destructive" ? "destructive" : undefined}
              >
                {item.label}
                {item.shortcut && (
                  <span className="dropdown-menu-shortcut">{item.shortcut}</span>
                )}
              </DropdownMenuPrimitive.Item>
            )
          })}
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  )
}
