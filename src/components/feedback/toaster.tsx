import { forwardRef } from "react"
import {
  Toaster as SonnerToaster,
  toast,
  type ToastClassnames,
  type ToasterProps,
} from "sonner"
import { cn } from "../cn"

export { toast }
export type { ToasterProps }

const DEFAULT_TOAST_CLASSNAMES: ToastClassnames = {
  toast: "toast",
  title: "toast-title",
  description: "toast-description",
  loader: "toast-loader",
  closeButton: "toast-close",
  cancelButton: "btn btn-secondary btn-sm toast-btn",
  actionButton: "btn btn-primary btn-sm toast-btn",
  success: "toast toast--success",
  error: "toast toast--error",
  info: "toast toast--info",
  warning: "toast toast--warning",
  loading: "toast toast--loading",
  default: "toast toast--default",
  content: "toast-content",
  icon: "toast-icon",
}

function mergeToastClassNames(override?: ToastClassnames): ToastClassnames {
  if (!override) return DEFAULT_TOAST_CLASSNAMES
  const keys = new Set([
    ...Object.keys(DEFAULT_TOAST_CLASSNAMES),
    ...Object.keys(override),
  ] as (keyof ToastClassnames)[])
  const out: ToastClassnames = {}
  for (const key of keys) {
    const base = DEFAULT_TOAST_CLASSNAMES[key]
    const over = override[key]
    if (over !== undefined || base !== undefined) {
      out[key] = cn(base, over)
    }
  }
  return out
}

/**
 * Toast host — wraps `sonner` with token classes (`tokens.css` + optional
 * `sonner.css` import). Defaults to `toastOptions.unstyled` so visuals
 * come from `.toast*` atoms, not sonner’s default gray theme.
 */
export const Toaster = forwardRef<HTMLElement, ToasterProps>(function Toaster(
  { toastOptions, className, ...props },
  ref,
) {
  return (
    <SonnerToaster
      ref={ref}
      className={cn("toaster", className)}
      toastOptions={{
        unstyled: true,
        ...toastOptions,
        classNames: mergeToastClassNames(toastOptions?.classNames),
      }}
      {...props}
    />
  )
})
