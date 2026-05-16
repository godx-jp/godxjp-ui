import type { ComponentProps } from "react";
import { cn } from "../cn";

/**
 * AvatarStack — overlapping circular initials avatars with a `+N`
 * overflow chip. Border = `--background` to knock the avatars out of
 * the surface they sit on.
 *
 * @example
 *   <AvatarStack
 *     items={[{ id: "y", short: "YT", color: "#1e50a2", name: "Yuki" }]}
 *     max={3}
 *   />
 */
export interface AvatarStackItem {
  id: string;
  short: string;
  color: string;
  name?: string;
}

export interface AvatarStackProps extends Omit<ComponentProps<"div">, "children"> {
  items: AvatarStackItem[];
  /** Maximum number of avatars before overflow chip. Default 3. */
  max?: number;
  /** Pixel size of each avatar. Default 22. */
  size?: number;
}

export function AvatarStack({
  items,
  max = 3,
  size = 22,
  className,
  style,
  ...rest
}: AvatarStackProps) {
  const visible = items.slice(0, max);
  const overflow = Math.max(0, items.length - visible.length);
  const fontPx = Math.max(8, Math.round(size * 0.43));
  return (
    <div className={cn("avatar-stack", className)} style={style} {...rest}>
      {visible.map((item) => (
        <span
          key={item.id}
          className="avatar-stack-item"
          title={item.name ?? item.short}
          style={{ background: item.color, width: size, height: size, fontSize: fontPx }}
        >
          {item.short}
        </span>
      ))}
      {overflow > 0 && (
        <span
          className="avatar-stack-item avatar-stack-overflow"
          style={{ width: size, height: size, fontSize: fontPx }}
        >
          +{overflow}
        </span>
      )}
    </div>
  );
}
