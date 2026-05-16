import type { ComponentProps, CSSProperties, MouseEvent, ReactNode } from "react";
import { cn } from "./cn";

/**
 * Tag — Ant-Design label chip.
 *
 *   <Tag>basic</Tag>
 *   <Tag color="success">done</Tag>
 *   <Tag color="oklch(56% 0.15 240)">custom hue</Tag>
 *   <Tag closable onClose={() => …}>removable</Tag>
 *   <Tag bordered={false}>borderless</Tag>
 *
 * Distinct from <Badge>: Badge is for status pills (a numeric or
 * single short word), Tag is for labels (potentially many in a row,
 * potentially closable).
 */

export type TagPresetColor =
  | "default"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "attention"
  | "primary";

export interface TagProps extends Omit<ComponentProps<"span">, "color"> {
  /** Preset hue or a custom CSS color. */
  color?: TagPresetColor | string;
  /** Show outline (default `true`). Borderless = solid-tinted background only. */
  bordered?: boolean;
  /** Show an × button. Calls `onClose`. */
  closable?: boolean;
  onClose?: (e: MouseEvent<HTMLButtonElement>) => void;
  /** Leading icon. */
  icon?: ReactNode;
}

const PRESET_VAR: Record<TagPresetColor, string> = {
  default: "var(--muted-foreground)",
  success: "var(--success)",
  warning: "var(--warning)",
  error: "var(--destructive)",
  info: "var(--info)",
  attention: "var(--attention)",
  primary: "var(--primary)",
};

function resolveHue(color: TagPresetColor | string | undefined): string {
  if (!color) return PRESET_VAR.default;
  if (color in PRESET_VAR) return PRESET_VAR[color as TagPresetColor];
  return color;
}

export function Tag({
  color,
  bordered = true,
  closable,
  onClose,
  icon,
  className,
  style,
  children,
  ...rest
}: TagProps) {
  const hue = resolveHue(color);

  const inline: CSSProperties = {
    color: hue,
    background: `color-mix(in oklch, ${hue} 14%, transparent)`,
    borderColor: bordered ? `color-mix(in oklch, ${hue} 35%, transparent)` : "transparent",
    ...style,
  };

  return (
    <span
      className={cn("tag", !bordered && "tag-borderless", className)}
      style={inline}
      {...rest}
    >
      {icon !== undefined && <span className="tag-icon">{icon}</span>}
      <span className="tag-label">{children}</span>
      {closable && (
        <button
          type="button"
          className="tag-close"
          onClick={onClose}
          aria-label="Remove tag"
        >
          ×
        </button>
      )}
    </span>
  );
}
