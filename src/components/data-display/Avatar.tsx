import type { ComponentProps, CSSProperties, ReactNode } from "react";
import { cn } from "../cn";

/**
 * Avatar — Ant-Design-shaped: shape + size + icon + image + initials.
 *
 *   <Avatar size="large" shape="square" src={url} />
 *   <Avatar size={48} icon={<UserOutlined />} />
 *   <Avatar shape="square" color="oklch(56% 0.15 240)">F</Avatar>
 */

export type AvatarShape = "circle" | "square";
export type AvatarSizeToken = "xs" | "sm" | "default" | "lg" | "xl";
export type AvatarSize = AvatarSizeToken | number;

export interface AvatarProps
  extends Omit<ComponentProps<"span">, "color"> {
  /** Shape — circle (default) or square (rounded-md). */
  shape?: AvatarShape;
  /** Token name (xs|sm|default|lg|xl) or pixel number. */
  size?: AvatarSize;
  /** Image URL — wins over `icon` / children. */
  src?: string;
  alt?: string;
  /** Icon slot — wins over children when `src` is unset. */
  icon?: ReactNode;
  /**
   * Display name — first two initials are rendered as the fallback
   * when no `src` / `icon` / children are passed. Mirrors the
   * design-handoff `<Avatar name="Satoshi F" />` shape (ui-kit.jsx).
   */
  name?: string;
  /**
   * Background colour — used for initials avatars to tint the bg
   * with a brand hue. Accepts any CSS colour value.
   */
  color?: string;
  /** Foreground colour override (rare; defaults follow `color`). */
  textColor?: string;
  /**
   * Variant alias for legacy callers. `brand` maps to color =
   * `var(--brand)` + textColor = `var(--primary-foreground)`.
   */
  variant?: "default" | "brand";
}

const SIZE_PX: Record<AvatarSizeToken, number> = {
  xs: 20,
  sm: 24,
  default: 28,
  lg: 36,
  xl: 48,
};

function resolveSizePx(size: AvatarSize | undefined): number {
  if (size === undefined) return SIZE_PX.default;
  if (typeof size === "number") return size;
  return SIZE_PX[size];
}

function deriveInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Avatar({
  shape = "circle",
  size,
  src,
  alt,
  icon,
  name,
  color,
  textColor,
  variant,
  className,
  style,
  children,
  ...rest
}: AvatarProps) {
  const px = resolveSizePx(size);
  const fontPx = Math.round(px * 0.42);

  const inline: CSSProperties = {
    width: `${px}px`,
    height: `${px}px`,
    fontSize: `${fontPx}px`,
    borderRadius: shape === "square" ? "var(--radius-md)" : "var(--radius-full)",
    ...style,
  };
  if (color) inline.background = color;
  if (textColor) inline.color = textColor;

  const isBrand = variant === "brand";

  return (
    <span
      className={cn("avatar", isBrand && "brand", className)}
      style={inline}
      {...rest}
    >
      {src ? (
        <img
          src={src}
          alt={alt ?? ""}
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "inherit",
            objectFit: "cover",
          }}
        />
      ) : icon !== undefined ? (
        icon
      ) : children !== undefined ? (
        children
      ) : name ? (
        deriveInitials(name)
      ) : null}
    </span>
  );
}
