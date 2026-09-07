import * as React from "react";
import { Separator as AriaSeparator } from "react-aria-components";

import { cn } from "../../lib/utils";
import type { SeparatorProp } from "../../props/components/layout.prop";

export type {
  SeparatorProp,
  SeparatorProp as SeparatorProps,
} from "../../props/components/layout.prop";

/**
 * ACCESSIBILITY — the whole point of the labelled form is that the label is ANNOUNCED, exactly
 * ONCE. Without a label the rule stays `decorative` (`role="none"`), which is right: a section
 * rule carries no information.
 *
 * SUBSTRATE — React Aria Components. Its `Separator` has no `decorative` prop: `useSeparator`
 * emits `role="separator"` unconditionally (and `aria-orientation="vertical"` on the vertical
 * rule), and it drops `children` entirely. Both are handled in the `render` override below, which
 * is RAC's supported escape hatch for owning the element: it hands us the computed DOM props and
 * the ref, and we decide what element carries them.
 */
export const Separator = React.forwardRef<HTMLDivElement, SeparatorProp>(
  (
    {
      className,
      orientation = "horizontal",
      decorative,
      label,
      labelAlign = "center",
      tone = "default",
      ...props
    },
    ref,
  ) => {
    const hasLabel = typeof label === "string" && label.trim() !== "";
    // A vertical rule has no room to be interrupted; the label is dropped rather than rendered
    // into a broken grid.
    const labelled = hasLabel && orientation === "horizontal";

    if (typeof process !== "undefined" && process.env?.NODE_ENV !== "production") {
      if (hasLabel && orientation === "vertical") {
        console.warn(
          'Separator: `label` is rendered on orientation="horizontal" only; it was ignored. ' +
            "Use a horizontal rule for a day divider / unread watermark.",
        );
      }
    }

    const isDecorative = decorative ?? !labelled;

    return (
      <AriaSeparator
        ref={ref}
        // `div`, not RAC's default `hr`: the labelled form is a three-cell grid and `hr` is void.
        elementType="div"
        data-slot="separator"
        data-orientation={orientation}
        data-tone={tone}
        data-labelled={labelled ? "" : undefined}
        data-label-align={labelled ? labelAlign : undefined}
        orientation={orientation}
        aria-label={labelled && !isDecorative ? label : undefined}
        className={cn("ui-separator", className)}
        {...props}
        render={({ role, "aria-orientation": ariaOrientation, ...domProps }) => (
          <div
            // A decorative rule leaves the accessibility tree entirely — RAC has no say in it.
            // `aria-orientation` goes with the role: it is meaningless, and prohibited, on
            // `role="none"`.
            role={isDecorative ? "none" : role}
            aria-orientation={isDecorative ? undefined : ariaOrientation}
            // RAC's `filterDOMProps` keeps only `id`, `data-*`, the labelling `aria-*` and the
            // global events. `SeparatorProp` promises the whole of `HTMLAttributes<HTMLDivElement>`,
            // so the dropped half is put back here; `domProps` still wins for everything it did
            // carry — including the ref RAC expects to land on this element.
            {...props}
            {...domProps}
          >
            {labelled ? (
              <>
                <span className="ui-separator-rule" aria-hidden="true" />
                <span className="ui-separator-label" aria-hidden={isDecorative ? undefined : true}>
                  {label}
                </span>
                <span className="ui-separator-rule" aria-hidden="true" />
              </>
            ) : null}
          </div>
        )}
      />
    );
  },
);
Separator.displayName = "Separator";
