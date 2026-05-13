import type { ComponentProps } from "react"
import { cn } from "./cn"

/**
 * Avatar — round chip with initials or an image. Maps to `.avatar`
 * + `.avatar.brand` in tokens.css.
 *
 * @example
 *   <Avatar>PT</Avatar>
 *   <Avatar variant="brand">G</Avatar>
 */
export interface AvatarProps extends ComponentProps<"span"> {
  variant?: "default" | "brand"
  /** Optional image url; falls back to children (initials) when missing. */
  src?: string
  alt?: string
}

export function Avatar({
  variant = "default",
  src,
  alt,
  className,
  children,
  ...rest
}: AvatarProps) {
  return (
    <span className={cn("avatar", variant === "brand" && "brand", className)} {...rest}>
      {src ? <img src={src} alt={alt ?? ""} style={{ width: "100%", height: "100%", borderRadius: "inherit", objectFit: "cover" }} /> : children}
    </span>
  )
}
