import { mergeRefs } from "@react-aria/utils";
import * as React from "react";

import { useInView, useMediaQuery } from "../../lib/hooks";
import { cn } from "../../lib/utils";
import type { RevealProp } from "../../props/components/general.prop";

export type { RevealProp, RevealProp as RevealProps } from "../../props/components/general.prop";

/**
 * Reveal — the official entrance-motion primitive (staggered fade-up). `delay` is a stagger
 * ordinal (`0..6`) — an index into the `--reveal-stagger-step` ladder, never a raw ms — so a
 * column of rows cascades in.
 *
 * `on="view"` moves the TRIGGER to the viewport (gh#829). It is one prop rather than a second
 * component because everything else is identical: the same keyframes, the same tokens, the same
 * reduced-motion contract.
 *
 * ## The observer gates the ANIMATION, never the VISIBILITY
 *
 * `.ui-reveal`'s resting state in `styles/motion.css` is the finished, fully visible one. The
 * hidden state is written here, as `data-reveal-state="out"`, and ONLY once this component is
 * mounted in a browser that has an `IntersectionObserver` and has measured the element as still
 * outside the viewport. Everything else — the server render, jsdom, a browser without the API,
 * and `prefers-reduced-motion: reduce`, under which no observer is attached at all — renders the
 * content exactly as it will finally look.
 */
export const Reveal = React.forwardRef<HTMLDivElement, RevealProp>(function Reveal(
  {
    children,
    delay = 0,
    on = "mount",
    once = true,
    amount = "some",
    asChild = false,
    className,
    ...props
  },
  ref,
) {
  const localRef = React.useRef<HTMLDivElement>(null);
  // Reduced motion does not merely stop the animation — it takes the observer out of the picture,
  // so there is no state in which this element can be hidden.
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const observing = on === "view" && !reduceMotion;
  const inView = useInView(localRef, { enabled: observing, once, amount });

  const shared = {
    "data-slot": "reveal",
    "data-reveal-delay": delay > 0 ? String(delay) : undefined,
    "data-reveal-on": on === "view" ? "view" : undefined,
    "data-reveal-state": observing ? (inView ? "in" : "out") : undefined,
  };

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<{
      className?: string;
      ref?: React.Ref<HTMLDivElement>;
    }>;
    return React.cloneElement(child, {
      ...shared,
      ...props,
      // React 19 passes `ref` through `cloneElement` like any other prop, which is what `asChild`
      // promises — the observer measures the child's own box, not a wrapper's.
      ref: mergeRefs(ref, localRef, child.props.ref),
      className: cn("ui-reveal", child.props.className, className),
    });
  }

  return (
    <div
      {...shared}
      {...props}
      ref={mergeRefs(ref, localRef)}
      className={cn("ui-reveal", className)}
    >
      {children}
    </div>
  );
});
