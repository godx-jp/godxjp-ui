import { forwardRef, type ComponentProps, type ReactNode } from "react";
import { cn } from "../cn";
import type { FeedbackColorProp } from "../../props";

/**
 * Progress — linear or circular progress indicator.
 *
 * Vocabulary (per cardinal rule 23 §B — concept-first):
 *  - `value` / `max` — Radix-style numeric state (matches Tabs/Select).
 *  - `variant`       — `line` (default) or `circle`.
 *  - `color`         — semantic role (`default` / `info` / `success` /
 *                      `warning` / `destructive`).
 *  - `size`          — dimensional scale (`small` / `default` / `large`).
 *  - `showInfo`      — render the numeric label (default `true`).
 *  - `strokeWidth`   — circle stroke thickness in user units (default 6).
 *  - `format`        — custom label renderer; receives `(value, max)`.
 *
 * Line variant reuses the canonical `.prog` atom from
 * `shell/75-card-atoms.css`; circle variant renders an SVG sweep with
 * `currentColor` so the outer `.progress-color-*` class drives the
 * arc colour. ARIA: `role="progressbar"` + `aria-valuenow/min/max`.
 */

export type ProgressVariant = "line" | "circle";
/** Alias of the shared `FeedbackColorProp` — same shape as
 *  AlertColor / ResultColor; kept as a named export for back-compat. */
export type ProgressColor = FeedbackColorProp;
export type ProgressSize = "small" | "default" | "large";

export interface ProgressProps extends Omit<ComponentProps<"div">, "color"> {
  /** Current progress value (0 – `max`). Defaults to 0. */
  value?: number;
  /** Maximum value. Defaults to 100. */
  max?: number;
  /** Visual shape — line bar or circular sweep. */
  variant?: ProgressVariant;
  /** Semantic colour role. */
  color?: ProgressColor;
  /** Dimensional scale. */
  size?: ProgressSize;
  /** Render the numeric label (defaults to true). */
  showInfo?: boolean;
  /** Circle stroke thickness (defaults to 6). */
  strokeWidth?: number;
  /** Custom label renderer. */
  format?: (value: number, max: number) => ReactNode;
}

const COLOR_CLASS: Record<ProgressColor, string> = {
  default: "",
  info: "progress-color-info",
  success: "progress-color-success",
  warning: "progress-color-warning",
  destructive: "progress-color-destructive",
};

const SIZE_CLASS: Record<ProgressSize, string> = {
  small: "progress-size-small",
  default: "",
  large: "progress-size-large",
};

function clampPct(value: number, max: number): number {
  if (max <= 0) return 0;
  const pct = (value / max) * 100;
  if (pct < 0) return 0;
  if (pct > 100) return 100;
  return pct;
}

export const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  function Progress(
    {
      value = 0,
      max = 100,
      variant = "line",
      color = "default",
      size = "default",
      showInfo = true,
      strokeWidth = 6,
      format,
      className,
      ...rest
    },
    ref,
  ) {
    const pct = clampPct(value, max);
    const label: ReactNode = format
      ? format(value, max)
      : `${Math.round(pct)}%`;

    if (variant === "circle") {
      const r = 50 - strokeWidth / 2;
      const c = 2 * Math.PI * r;
      const dashOffset = c * (1 - pct / 100);
      return (
        <div
          ref={ref}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          className={cn(
            "progress progress-circle",
            COLOR_CLASS[color],
            SIZE_CLASS[size],
            className,
          )}
          {...rest}
        >
          <svg viewBox="0 0 100 100" aria-hidden="true">
            <circle
              cx={50}
              cy={50}
              r={r}
              stroke="var(--secondary)"
              strokeWidth={strokeWidth}
              fill="none"
            />
            <circle
              cx={50}
              cy={50}
              r={r}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={c}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
            />
          </svg>
          {showInfo ? <span className="progress-info">{label}</span> : null}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        className={cn(
          "progress progress-line",
          COLOR_CLASS[color],
          SIZE_CLASS[size],
          className,
        )}
        {...rest}
      >
        <div className="prog">
          <i style={{ width: `${pct}%` }} />
        </div>
        {showInfo ? <span className="progress-info">{label}</span> : null}
      </div>
    );
  },
);
