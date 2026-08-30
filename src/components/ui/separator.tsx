import * as React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";

import { cn } from "../../lib/utils";
import type { SeparatorProp } from "../../props/components/layout.prop";

export type {
  SeparatorProp,
  SeparatorProp as SeparatorProps,
} from "../../props/components/layout.prop";

/**
 * Separator — a tokenized horizontal/vertical rule, optionally INTERRUPTED by a localized label
 * (gh#308): a message stream's day divider, a "new messages" unread watermark, an auth
 * conjunction. Before #308 the only labelled rule in the library was the auth-scoped
 * `AuthDivider`, so a chat stream had to either misuse it (inheriting the `--auth-shell-divider-*`
 * type ramp) or hand-roll a `<div>` grid; `AuthDivider` is now a thin preset over this.
 *
 * ACCESSIBILITY — the whole point of the labelled form is that the label is ANNOUNCED, exactly
 * ONCE. Without a label the rule stays `decorative` (Radix emits `role="none"`), which is right:
 * a section rule carries no information. With a label the default flips to `decorative={false}`,
 * so Radix emits a real `role="separator"` (plus `aria-orientation` when vertical, which is what
 * the ARIA default already implies for horizontal), the label string becomes the separator's
 * accessible NAME via `aria-label`, and the visible label node is `aria-hidden` — otherwise the
 * same string would be announced twice, once as the name and again as the content. A consumer who
 * explicitly passes `decorative` still wins; when they force `decorative` on a labelled rule the
 * name is dropped (a `role="none"` element may not carry one) and the visible text is left in the
 * tree instead, so it is still read once and never as a nameless blank rule.
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
      <SeparatorPrimitive.Root
        ref={ref}
        data-slot="separator"
        data-orientation={orientation}
        data-tone={tone}
        data-labelled={labelled ? "" : undefined}
        data-label-align={labelled ? labelAlign : undefined}
        orientation={orientation}
        decorative={isDecorative}
        aria-label={labelled && !isDecorative ? label : undefined}
        className={cn("ui-separator", className)}
        {...props}
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
      </SeparatorPrimitive.Root>
    );
  },
);
Separator.displayName = "Separator";
