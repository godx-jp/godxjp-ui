import type { ComponentProps, ReactNode } from "react"
import { cn } from "./cn"

/**
 * Badge — status pill with a colored dot + label.
 *
 * Renders the canonical `.badge` class from `@godxjp/ui/tokens` so the
 * visual layer is mastered in CSS (not Tailwind utilities). All six
 * variants map onto a semantic role from the brand bible:
 *
 * - `success`  — 若竹  task completed, healthy
 * - `warning`  — 山吹  needs attention, not yet broken
 * - `info`     — 群青  neutral state callout
 * - `error`    — 茜    failed / blocked
 * - `attention`— 朱    pending, awaiting input
 * - `neutral`  — grey  default chrome
 * - `outline`  — empty hairline only (rare)
 *
 * @example
 *   <Badge variant="success" dot>Healthy</Badge>
 *   <Badge variant="error">Failed</Badge>
 */
export type BadgeVariant =
  | "success"
  | "warning"
  | "info"
  | "error"
  | "attention"
  | "neutral"
  | "outline"

export interface BadgeProps extends ComponentProps<"span"> {
  variant?: BadgeVariant
  /** When true renders a colored dot before the label. */
  dot?: boolean
  children?: ReactNode
}

export function Badge({
  variant = "neutral",
  dot = true,
  className,
  children,
  ...rest
}: BadgeProps) {
  return (
    <span className={cn("badge", `badge-${variant}`, className)} {...rest}>
      {dot && <span className="dot" aria-hidden />}
      {children}
    </span>
  )
}
