import * as React from "react";

import { cn } from "../../lib/utils";
import { withoutSlot } from "../../lib/without-slot";
import type { StepTransitionProp } from "../../props/components/general.prop";

export type {
  StepTransitionDirectionProp,
  StepTransitionProp,
  StepTransitionProp as StepTransitionProps,
} from "../../props/components/general.prop";

/**
 * Upper bound on how long an outgoing step may stay painted. The layer is normally dropped on its
 * own `animationend`; this covers an environment that never fires one (no CSS animation support,
 * a hidden tab, jsdom), so a stale step can never linger. Generously above the token duration.
 */
const EXIT_FALLBACK_MS = 1000;

type Exiting = { key: string; node: React.ReactNode; direction: string };

/**
 * StepTransition — exit + enter between the steps of a multi-step flow. Both layers share one grid
 * cell, so the box is as tall as the taller step while they cross and nothing below it jumps. The
 * outgoing layer is the SAME instance as the step it was (same key), re-rendered with its last
 * children — its state survives the exit — inert and hidden from assistive
 * technology; the incoming one is the live children, keyed by `value` so it mounts fresh (form
 * state of the previous step does not leak into the next).
 */
export const StepTransition = React.forwardRef<HTMLDivElement, StepTransitionProp>(
  function StepTransition({ value, direction = "forward", children, className, ...props }, ref) {
    // The step on screen and its last rendered children, kept in STATE so a change of `value` is
    // seen DURING the render that carries it ("adjusting state while rendering"): the outgoing
    // step's key is still in the tree for that render, so React keeps its instance — state and
    // DOM — instead of unmounting it and mounting a copy for the exit.
    const [shown, setShown] = React.useState<{
      value: string | number;
      children: React.ReactNode;
    }>({ value, children });
    const [exiting, setExiting] = React.useState<Exiting | null>(null);
    const [moved, setMoved] = React.useState(false);
    if (shown.value !== value) {
      setExiting({ key: String(shown.value), node: shown.children, direction });
      setMoved(true);
      setShown({ value, children });
    } else if (shown.children !== children) {
      // Same step, new content: remember it as what this step last showed.
      setShown({ value, children });
    }

    React.useEffect(() => {
      if (!exiting) return;
      const timer = window.setTimeout(() => setExiting(null), EXIT_FALLBACK_MS);
      return () => window.clearTimeout(timer);
    }, [exiting]);

    return (
      <div
        ref={ref}
        data-slot="step-transition"
        data-direction={direction === "backward" ? "backward" : undefined}
        className={cn("ui-step-transition", className)}
        {...withoutSlot(props)}
      >
        {exiting ? (
          <div
            // The SAME key the step had while current: React keeps that instance, so the outgoing
            // step leaves with its live state (a typed value, a scroll position) instead of
            // re-mounting from its initial props for the exit.
            key={`step-${exiting.key}`}
            data-slot="step-transition-layer"
            data-state="exit"
            data-direction={exiting.direction === "backward" ? "backward" : undefined}
            className="ui-step-transition-layer"
            aria-hidden="true"
            inert
            onAnimationEnd={(event) => {
              if (event.target === event.currentTarget) setExiting(null);
            }}
          >
            {exiting.node}
          </div>
        ) : null}
        <div
          key={`step-${String(value)}`}
          data-slot="step-transition-layer"
          data-state={moved ? "enter" : undefined}
          data-direction={direction === "backward" ? "backward" : undefined}
          className="ui-step-transition-layer"
        >
          {children}
        </div>
      </div>
    );
  },
);
StepTransition.displayName = "StepTransition";
