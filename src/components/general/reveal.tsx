import { cloneElement, isValidElement } from "react";
import type { ReactElement } from "react";

import { cn } from "../../lib/utils";
import type { RevealProp } from "../../props/components/general.prop";

export type { RevealProp, RevealProp as RevealProps } from "../../props/components/general.prop";

/**
 * Reveal — the official entrance-motion primitive (staggered fade-up). `delay` is a stagger
 * ordinal (`0..6`) — an index into the `--reveal-stagger-step` ladder, never a raw ms — so a
 * column of rows cascades in.
 */
export function Reveal({ children, delay = 0, asChild = false, className, ...props }: RevealProp) {
  const shared = {
    "data-slot": "reveal",
    "data-reveal-delay": delay > 0 ? String(delay) : undefined,
  };

  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<{ className?: string }>;
    return cloneElement(child, {
      ...shared,
      ...props,
      className: cn("ui-reveal", child.props.className, className),
    });
  }

  return (
    <div {...shared} {...props} className={cn("ui-reveal", className)}>
      {children}
    </div>
  );
}
