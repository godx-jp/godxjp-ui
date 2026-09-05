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
 * The label rides the same optical step as the mark. `--font-size-sm` IS `--font-size-base`, so
 * the four distinct steps of the type scale below `xl` are `2xs · xs · sm · lg` — the ladder skips
 * the alias rather than repeating a size.
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
 * Activity — the official AMBIENT-motion primitive: a continuous, unbounded "something is
 * happening right now, elsewhere". Every interval, stagger, offset, size and colour reads a DS
 * token (`--activity-interval`, `--activity-stagger-step`, `--activity-mark-offset`,
 * `--activity-color`, …), so a service retunes the whole ambient feel from its theme.
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
