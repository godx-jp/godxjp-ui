import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown, ChevronUp } from "lucide-react"
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from "react"
import { cn } from "../cn"

/**
 * Select — Radix-backed dropdown field. Trigger uses `.input` + `.select-trigger`;
 * list uses `.select-content` / `.select-item` from tokens.css.
 */
export const Select = SelectPrimitive.Root
export const SelectGroup = SelectPrimitive.Group
export const SelectValue = SelectPrimitive.Value
export const SelectIcon = SelectPrimitive.Icon
export const SelectPortal = SelectPrimitive.Portal

export const SelectTrigger = forwardRef<
  ElementRef<typeof SelectPrimitive.Trigger>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(function SelectTrigger({ className, children, ...rest }, ref) {
  return (
    <SelectPrimitive.Trigger ref={ref} className={cn("input", "select-trigger", className)} {...rest}>
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown
          className="muted"
          aria-hidden
          style={{ width: "var(--spacing-4)", height: "var(--spacing-4)", flexShrink: 0 }}
        />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
})

export const SelectContent = forwardRef<
  ElementRef<typeof SelectPrimitive.Content>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(function SelectContent({ className, children, position = "popper", sideOffset = 4, ...rest }, ref) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        className={cn("select-content", className)}
        position={position}
        sideOffset={sideOffset}
        {...rest}
      >
        <SelectScrollUpButton>
          <ChevronUp
            aria-hidden
            style={{ width: "var(--spacing-4)", height: "var(--spacing-4)" }}
          />
        </SelectScrollUpButton>
        <SelectPrimitive.Viewport className="select-viewport">{children}</SelectPrimitive.Viewport>
        <SelectScrollDownButton>
          <ChevronDown
            aria-hidden
            style={{ width: "var(--spacing-4)", height: "var(--spacing-4)" }}
          />
        </SelectScrollDownButton>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
})

export const SelectLabel = forwardRef<
  ElementRef<typeof SelectPrimitive.Label>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(function SelectLabel({ className, ...rest }, ref) {
  return <SelectPrimitive.Label ref={ref} className={cn("select-label", className)} {...rest} />
})

export const SelectItem = forwardRef<
  ElementRef<typeof SelectPrimitive.Item>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(function SelectItem({ className, children, ...rest }, ref) {
  return (
    <SelectPrimitive.Item ref={ref} className={cn("select-item", className)} {...rest}>
      <span className="select-item-indicator">
        <SelectPrimitive.ItemIndicator>
          <Check style={{ width: "var(--spacing-4)", height: "var(--spacing-4)" }} aria-hidden />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
})

export const SelectSeparator = forwardRef<
  ElementRef<typeof SelectPrimitive.Separator>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(function SelectSeparator({ className, ...rest }, ref) {
  return <SelectPrimitive.Separator ref={ref} className={cn("select-separator", className)} {...rest} />
})

export const SelectScrollUpButton = forwardRef<
  ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(function SelectScrollUpButton({ className, ...rest }, ref) {
  return <SelectPrimitive.ScrollUpButton ref={ref} className={cn("select-scroll-btn", className)} {...rest} />
})

export const SelectScrollDownButton = forwardRef<
  ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(function SelectScrollDownButton({ className, ...rest }, ref) {
  return <SelectPrimitive.ScrollDownButton ref={ref} className={cn("select-scroll-btn", className)} {...rest} />
})
