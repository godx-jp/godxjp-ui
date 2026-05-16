import type { ComponentProps, ReactNode } from "react";
import { cn } from "../cn";

/**
 * IconRow — `20px icon | content` two-column row used by detail panels
 * and create-event dialogs. Keeps icon glyphs aligned in a tight column
 * regardless of body height.
 *
 * @example
 *   <IconRow icon={<Clock />}>
 *     <div>10:00 – 11:00</div>
 *     <div className="muted">GMT+09</div>
 *   </IconRow>
 */
export type IconRowAlign = "top" | "center";

export interface IconRowProps extends Omit<ComponentProps<"div">, "children"> {
  icon: ReactNode;
  align?: IconRowAlign;
  children?: ReactNode;
}

export function IconRow({
  icon,
  align = "top",
  className,
  children,
  ...rest
}: IconRowProps) {
  return (
    <div className={cn("icon-row", className)} data-align={align} {...rest}>
      <span className="icon-row-icon">{icon}</span>
      <div className="icon-row-body">{children}</div>
    </div>
  );
}
