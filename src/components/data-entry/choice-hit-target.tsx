import * as React from "react";
import { VisuallyHidden } from "react-aria-components";

/**
 * THE PAINTED BOX OF A CHOICE CONTROL IS ITS OWN HIT TARGET (gh#476).
 *
 * react-aria-components renders the real `<input>` inside a `VisuallyHidden` span, and that span
 * carries its geometry as an INLINE style: `position:absolute; width:1px; height:1px;
 * clip:rect(0 0 0 0); clip-path:inset(50%)`, pinned at the label's top-left. The thing a user
 * sees and aims at is the `<label>` wrapped around it, so every pointer landing on the control
 * hits the LABEL, and the input's own hit area is a 13x13 box at a different origin than the
 * 16x16 one that is painted.
 *
 * Measured on `data-entry-checkbox` before this helper existed: of 49 points scanned across the
 * box, **0** reached the input, 46 reached the label; Playwright `check()` / `uncheck()` without
 * `force` timed out on `<label data-slot="checkbox"> intercepts pointer events`, the same check a
 * browser applies to a real pointer. `force: true` passed, which is the tell: the control is
 * functional, it is simply covered.
 *
 * An inline style can only be beaten with `!important`, so the WRAPPER is replaced instead of
 * fought. The `render` prop hands over the DOM children react-aria built; the VisuallyHidden
 * element among them becomes a `.ui-choice-input` span that control.css sizes to the painted box.
 * The `<input>` itself — its props, its ref, its keyboard handling, its place in the a11y tree —
 * is passed through untouched, so this is a geometry change and nothing else.
 */
export function withOwnHitTarget(children: React.ReactNode): React.ReactNode {
  return React.Children.map(children, (child) =>
    React.isValidElement(child) && child.type === VisuallyHidden ? (
      <span data-slot="choice-input" className="ui-choice-input">
        {(child.props as { children?: React.ReactNode }).children}
      </span>
    ) : (
      child
    ),
  );
}
