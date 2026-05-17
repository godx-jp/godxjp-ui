import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import { cn } from "../cn";

/**
 * Spinner — small inline circular loading indicator.
 *
 * Renders the canonical `.spinner` family from shell.css. Uses
 * `border-top-color: var(--info)` rotation; respects
 * `prefers-reduced-motion` via the keyframe declaration in CSS.
 *
 * Size mapping:
 *   - `sm`      → 10px (inline with `.help` lines)
 *   - `md`      → 12px (default, inline with `.input` suffix slot)
 *   - `lg`      → 16px (inline with `.btn` content)
 *
 * The `tone` prop selects a semantic role: `info` (default), `muted`,
 * `primary`, `success`, `warning`, `destructive`. Each tone re-targets
 * `border-top-color` to the matching semantic variable via the
 * `.spinner-tone-*` class.
 *
 * @example
 *   <Spinner />
 *   <Spinner size="large" tone="primary" aria-label="Saving…" />
 */

export type SpinnerSize = "sm" | "md" | "lg";
export type SpinnerTone =
  | "info"
  | "muted"
  | "primary"
  | "success"
  | "warning"
  | "destructive";

export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  /** 10 / 12 / 16 px — defaults to `md`. */
  size?: SpinnerSize;
  /** Color role for the rotating arc; defaults to `info`. */
  tone?: SpinnerTone;
  /** Accessible label. When omitted, falls back to `aria-hidden`. */
  "aria-label"?: string;
}

const SIZE_CLASS: Record<SpinnerSize, string> = {
  sm: "spinner-sm",
  md: "",
  lg: "spinner-lg",
};

const TONE_CLASS: Record<SpinnerTone, string> = {
  info: "",
  muted: "spinner-tone-muted",
  primary: "spinner-tone-primary",
  success: "spinner-tone-success",
  warning: "spinner-tone-warning",
  destructive: "spinner-tone-destructive",
};

export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(
  function Spinner(
    { size = "md", tone = "info", className, role, ...rest },
    ref,
  ) {
    const label = rest["aria-label"];
    const ariaProps = label
      ? { role: role ?? "status", "aria-label": label }
      : { "aria-hidden": true as const };
    return (
      <span
        ref={ref}
        className={cn(
          "spinner",
          SIZE_CLASS[size],
          TONE_CLASS[tone],
          className,
        )}
        {...ariaProps}
        {...rest}
      />
    );
  },
);
