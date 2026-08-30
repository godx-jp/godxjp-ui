import * as React from "react";

import { cn } from "../../lib/utils";
import { Text } from "./typography";
import type { ActivityProp } from "../../props/components/general.prop";
import type { SizeProp, TextSizeProp } from "../../props/vocabulary";

export type {
  ActivityProp,
  ActivityProp as ActivityProps,
} from "../../props/components/general.prop";

/**
 * The label rides the same optical step as the mark. `--font-size-sm` IS `--font-size-base`, so the
 * four distinct steps of the type scale below `xl` are `2xs · xs · sm · lg` — the ladder skips the
 * alias rather than repeating a size. Mirrors `--activity-font-size-*` in tokens/components.
 */
const LABEL_SIZE: Record<SizeProp, TextSizeProp> = {
  xs: "2xs",
  sm: "xs",
  md: "sm",
  lg: "lg",
};

/** The mark, per variant. Always `aria-hidden` — an animation announces nothing. */
function ActivityMark({ variant }: { variant: NonNullable<ActivityProp["variant"]> }) {
  if (variant === "pulse") return <span className="ui-activity-pulse" />;
  if (variant === "bar") {
    return (
      <span className="ui-activity-bar">
        <span className="ui-activity-bar-segment" />
      </span>
    );
  }
  return (
    <>
      <span className="ui-activity-dot" />
      <span className="ui-activity-dot" />
      <span className="ui-activity-dot" />
    </>
  );
}

/**
 * Activity — the official AMBIENT-motion primitive: a continuous, unbounded "something is happening
 * right now, elsewhere". The LOOP counterpart to `Reveal`'s one-shot entrance, so a consumer never
 * hand-rolls a looping `@keyframes` + its own `prefers-reduced-motion` guard. Every interval,
 * stagger, offset, size and colour reads a DS token (`--activity-interval`,
 * `--activity-stagger-step`, `--activity-mark-offset`, `--activity-color`, …), so a service retunes
 * the whole ambient feel from its theme.
 *
 * NOT `Skeleton` (content is LOADING — it hard-codes `aria-busy` + an unconditional live region, so
 * reusing it for a typing indicator tells every screen reader the region is busy for as long as
 * anyone is typing). NOT `Button loading` (THIS ACTION is in flight, on a control).
 * `Activity` means: someone is typing, a sync is running, a response is streaming, a recording is
 * live — indefinitely, and not here.
 *
 * ACCESSIBILITY — the half consumers get wrong, owned here:
 * - The mark is decorative and always `aria-hidden`; the `label` (or `children`) carries the
 *   meaning, so the indicator is never animation-only.
 * - `announce` defaults to `false` and then emits NO live region at all. An ambient indicator
 *   flickers on and off with every socket event; a live region there re-announces continuously.
 *   `announce="polite"` wraps ONLY the label in one `aria-live="polite" aria-atomic="true"` region.
 * - No `aria-busy`: activity elsewhere does not make THIS region busy, and `aria-busy` would
 *   suppress the surrounding content's own updates.
 * - Not focusable, not a tab stop, no pointer affordance — it is a status mark, not a control.
 * - Under `prefers-reduced-motion: reduce` the loop is dropped and every mark falls back to a
 *   DESIGNED resting state (three solid dots / a solid pulse mark / a bar segment parked at the
 *   reading-start), never to nothing, with no layout shift (WCAG 2.2 SC 2.3.3 and SC 2.2.2).
 *
 * Copy is consumer-owned and localized — pass a `t()`-translated `label`, and derive
 * "N people are typing" from `Intl.PluralRules`. The library never invents the string.
 *
 * Pure/server-safe: no hooks, no effects, no timers — the loop is CSS.
 */
export const Activity = React.forwardRef<HTMLSpanElement, ActivityProp>(function Activity(
  {
    variant = "dots",
    size = "sm",
    tone = "muted",
    label,
    announce = false,
    children,
    className,
    ...props
  },
  ref,
) {
  const hasChildren = children !== undefined && children !== null && children !== false;
  const visible = hasChildren ? children : label;
  // `label` alongside `children` becomes the sr-only description rather than being dropped —
  // "always folded into the accessible content". Never an `aria-label`: this root is a generic
  // <span> with no role, where `aria-label` is prohibited (and axe flags it).
  const describedOnly = hasChildren && label !== undefined && label !== null ? label : undefined;

  const text =
    visible === undefined || visible === null ? null : (
      <Text as="span" size={LABEL_SIZE[size]} tone={tone} className="ui-activity-label">
        {visible}
      </Text>
    );

  const description =
    describedOnly === undefined ? null : (
      <span data-slot="activity-description" className="sr-only">
        {describedOnly}
      </span>
    );

  const body = (
    <>
      {text}
      {description}
    </>
  );

  return (
    <span
      ref={ref}
      data-slot="activity"
      data-variant={variant}
      data-size={size}
      data-tone={tone}
      className={cn("ui-activity", className)}
      {...props}
    >
      <span className="ui-activity-mark" data-slot="activity-mark" aria-hidden="true">
        <ActivityMark variant={variant} />
      </span>
      {announce === "polite" ? (
        // The region wraps ONLY the label and is atomic, so a change is announced once as a whole.
        // It is rendered even while empty so a label that arrives later is heard — an inserted
        // region is not reliably announced. The mark stays outside it.
        <span aria-live="polite" aria-atomic="true" data-slot="activity-live">
          {body}
        </span>
      ) : (
        body
      )}
    </span>
  );
});
