import * as React from "react";

import { cn } from "../../lib/utils";
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
 * outgoing layer is a SNAPSHOT of the last rendered children, inert and hidden from assistive
 * technology; the incoming one is the live children, keyed by `value` so it mounts fresh (form
 * state of the previous step does not leak into the next).
 */
export const StepTransition = React.forwardRef<HTMLDivElement, StepTransitionProp>(
  function StepTransition({ value, direction = "forward", children, className, ...props }, ref) {
    const last = React.useRef<{ value: string | number; children: React.ReactNode }>({
      value,
      children,
    });
    const [exiting, setExiting] = React.useState<Exiting | null>(null);
    const [moved, setMoved] = React.useState(false);

    // Before paint: when the step changed, keep what was on screen as the outgoing layer.
    React.useLayoutEffect(() => {
      if (last.current.value !== value) {
        setExiting({
          key: String(last.current.value),
          node: last.current.children,
          direction,
        });
        setMoved(true);
      }
      last.current = { value, children };
    }, [value, children, direction]);

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
        {...props}
      >
        {exiting ? (
          <div
            key={`exit-${exiting.key}`}
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
