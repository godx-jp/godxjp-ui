import type { ComponentProps, ReactNode } from "react"
import { cn } from "../cn"

/**
 * Badge — status pill / chip.
 *
 * Renders the canonical `.chip` class family from the dxs-kintai
 * design system (comp-badges.html). Two appearance modes per
 * SKILL.md:
 *
 *   • `appearance="soft"` (default) — translucent role tint. Use for
 *     transient state — 申請中 (in review), draft, pending.
 *   • `appearance="solid"`         — full role color. Use for terminal
 *     state — 承認済 (approved), 却下 (rejected).
 *   • `appearance="outline"`       — hairline border only.
 *
 * Variants map to semantic roles:
 *
 * - `success`  — 若竹  task completed, healthy
 * - `warning`  — 山吹  needs attention, not yet broken
 * - `info`     — 群青  neutral state callout
 * - `error`    — 茜    failed / blocked (emits `chip-destructive`)
 * - `attention`— 朱    pending, awaiting input (prefer over `error`
 *                       for non-destructive alerts per SKILL.md)
 * - `primary`  — brand action
 * - `neutral`  — grey  default chrome (omitted variant suffix; base
 *                       `.chip` styling)
 * - `outline`  — empty hairline only (rare; same as
 *                       `appearance="outline"` with no role)
 *
 * @example
 *   <Badge variant="success" dot>Healthy</Badge>          // soft (default)
 *   <Badge variant="success" appearance="solid">承認済</Badge>
 *   <Badge variant="destructive" appearance="solid">却下</Badge>
 *   <Badge variant="attention" dot>遅刻</Badge>
 */
export type BadgeVariant =
  | "primary"
  | "success"
  | "warning"
  | "info"
  | "destructive"
  | "attention"
  | "neutral"
  | "outline"

export type BadgeAppearance = "soft" | "solid" | "outline"

export interface BadgeProps extends ComponentProps<"span"> {
  variant?: BadgeVariant
  appearance?: BadgeAppearance
  /** When true renders a colored dot before the label. */
  dot?: boolean
  children?: ReactNode
}

// `<Badge variant>` → canonical chip-role class.
const VARIANT_CLASS: Record<BadgeVariant, string | null> = {
  primary: "chip-primary",
  success: "chip-success",
  warning: "chip-warning",
  info: "chip-info",
  destructive: "chip-destructive",
  attention: "chip-attention",
  // Neutral = base `.chip` (no role suffix).
  neutral: null,
  outline: "chip-outline",
}

export function Badge({
  variant = "neutral",
  appearance = "soft",
  dot = true,
  className,
  children,
  ...rest
}: BadgeProps) {
  const variantClass = VARIANT_CLASS[variant]
  const isOutline = variant === "outline" || appearance === "outline"

  return (
    <span
      className={cn(
        "chip",
        variantClass,
        appearance === "soft" && !isOutline && "chip-soft",
        className,
      )}
      {...rest}
    >
      {dot && <span className="dot" aria-hidden />}
      {children}
    </span>
  )
}
