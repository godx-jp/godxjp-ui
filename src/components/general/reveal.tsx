import { cloneElement, isValidElement } from "react";
import type { ReactElement } from "react";

import { cn } from "../../lib/utils";
import type { RevealProp } from "../../props/components/general.prop";

export type { RevealProp, RevealProp as RevealProps } from "../../props/components/general.prop";

/**
 * Reveal — the official entrance-motion primitive (staggered fade-up). Content animates in on mount
 * reading the DS motion tokens (`--duration-slow`, `--ease-emphasized`, `--reveal-distance`), so a
 * consumer never hand-rolls `@keyframes` + `.app-reveal`/`.d1..d6`. `delay` is a stagger ordinal
 * (`0..6`) — an index into the `--reveal-stagger-step` ladder, never a raw ms — so a column of rows
 * cascades in. Under `prefers-reduced-motion` the animation is dropped entirely: content renders in
 * its final position, fully visible, with no layout shift (CSS `@media` guard in motion.css).
 *
 * Pure/server-safe: no hooks, no effects. Pass `asChild` to merge the reveal onto the single child
 * element (no wrapper `<div>`) when an extra box would break a grid/flex layout.
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
