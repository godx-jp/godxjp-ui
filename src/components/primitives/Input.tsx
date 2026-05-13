import { forwardRef, type ComponentProps, type TextareaHTMLAttributes } from "react"
import { cn } from "./cn"

/**
 * Input — text input atom. Maps to `.input` in tokens.css.
 *
 * Forward-ref so consumers can wire `react-hook-form` / focus
 * management without escaping the design tokens.
 */
export interface InputProps extends ComponentProps<"input"> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, type = "text", ...rest },
  ref,
) {
  return <input ref={ref} type={type} className={cn("input", className)} {...rest} />
})

/** Textarea — uses `.input` for shape, leaves height auto. */
export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, ...rest },
  ref,
) {
  return <textarea ref={ref} className={cn("input", className)} {...rest} />
})
