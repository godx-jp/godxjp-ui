import * as PopoverPrimitive from "@radix-ui/react-popover"
import { Command } from "cmdk"
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ElementRef,
} from "react"
import { cn } from "./cn"

export { Popover as Combobox, PopoverAnchor as ComboboxAnchor, PopoverTrigger as ComboboxTrigger } from "./Popover"

type PopoverContentProps = ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
type CommandRootProps = ComponentPropsWithoutRef<typeof Command>

export type ComboboxContentProps = PopoverContentProps &
  Omit<CommandRootProps, "children" | "className"> & {
    /** Applied to the inner cmdk `Command` root. */
    commandClassName?: string
  }

/**
 * Popover surface wrapping cmdk `Command`. Renders `Command` as the only
 * child of `PopoverContent` — put `ComboboxInput`, `ComboboxList`, etc.
 * inside.
 */
export const ComboboxContent = forwardRef<
  ElementRef<typeof PopoverPrimitive.Content>,
  ComboboxContentProps
>(function ComboboxContent(
  {
    children,
    className,
    align = "start",
    sideOffset = 4,
    commandClassName,
    shouldFilter,
    filter,
    value,
    defaultValue,
    onValueChange,
    loop,
    label,
    vimBindings,
    disablePointerSelection,
    ...contentProps
  },
  ref,
) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        className={cn("popover-content", "combobox-content", className)}
        {...contentProps}
      >
        <Command
          className={cn("combobox-command", commandClassName)}
          shouldFilter={shouldFilter}
          filter={filter}
          value={value}
          defaultValue={defaultValue}
          onValueChange={onValueChange}
          loop={loop}
          label={label}
          vimBindings={vimBindings}
          disablePointerSelection={disablePointerSelection}
        >
          {children}
        </Command>
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  )
})

export const ComboboxInput = forwardRef<
  ElementRef<typeof Command.Input>,
  ComponentPropsWithoutRef<typeof Command.Input>
>(function ComboboxInput({ className, ...props }, ref) {
  return (
    <Command.Input
      ref={ref}
      className={cn("input", "combobox-input", className)}
      {...props}
    />
  )
})

export const ComboboxList = forwardRef<
  ElementRef<typeof Command.List>,
  ComponentPropsWithoutRef<typeof Command.List>
>(function ComboboxList({ className, ...props }, ref) {
  return (
    <Command.List
      ref={ref}
      className={cn("combobox-list", className)}
      {...props}
    />
  )
})

export const ComboboxItem = forwardRef<
  ElementRef<typeof Command.Item>,
  ComponentPropsWithoutRef<typeof Command.Item>
>(function ComboboxItem({ className, ...props }, ref) {
  return (
    <Command.Item
      ref={ref}
      className={cn("combobox-item", className)}
      {...props}
    />
  )
})

export const ComboboxEmpty = forwardRef<
  ElementRef<typeof Command.Empty>,
  ComponentPropsWithoutRef<typeof Command.Empty>
>(function ComboboxEmpty({ className, ...props }, ref) {
  return (
    <Command.Empty
      ref={ref}
      className={cn("combobox-empty", className)}
      {...props}
    />
  )
})
