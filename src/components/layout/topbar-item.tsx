import * as React from "react";
import { Slot } from "../../lib/slot";

import { cn } from "../../lib/utils";
import type { TopbarItemProp } from "../../props/components/layout.prop";

export type {
  TopbarItemProp,
  TopbarItemProp as TopbarItemProps,
} from "../../props/components/layout.prop";

/**
 * TopbarItem — one interactive cell of a {@link Topbar} slot, shaped like part of the bar.
 *
 * Full bar height, the bar's own hover surface, and the focus mark hosted INSIDE the cell (a
 * full-bleed cell has nothing outside itself to ring, and the bar clips its own overflow). All of
 * that lives in `.ui-topbar-item`; this component only picks the element and the classes.
 *
 * `ui-focus-ring` is the ONE focus source (styles/focus-ring.css) — the cell hosts whatever that
 * file resolves, including nothing at all while the `--focus-outline` switch ships off.
 */
export const TopbarItem = React.forwardRef<HTMLButtonElement, TopbarItemProp>(function TopbarItem(
  {
    asChild = false,
    className,
    type,
    hideBelow,
    icon,
    iconHideFrom,
    labelHideBelow,
    badge,
    badgeTone,
    children,
    ...props
  },
  ref,
) {
  const Comp = asChild ? Slot : "button";
  // The count pill is OVERLAID on the glyph rather than placed beside it, so a bar whose end
  // cluster is `flex: 0 0 auto` keeps its width when the count crosses a digit boundary
  // (gh#398). Empty string is treated as absent, exactly like the Sidebar row's own badge.
  // Ignored under `asChild`: Slot borrows the child's single element and has nowhere to put a
  // sibling — the same rule `Button`'s `count` follows.
  const showBadge = !asChild && badge !== undefined && badge !== "";
  // The glyph goes in a box the CELL owns, so it keeps the bar's step however the consumer wraps
  // it (gh#712). Under `asChild` the box goes INSIDE the borrowed element, ahead of that element's
  // own children (gh#726): the element is still the cell, so `.ui-topbar-item-icon svg` sizes the
  // glyph the same way and `.ui-topbar-item > svg` never has to reach past a direct child.
  const iconNode =
    icon !== undefined && icon !== null && icon !== false ? (
      <span
        data-slot="topbar-item-icon"
        className="ui-topbar-item-icon"
        // Decorative, so dropping it at a breakpoint takes no accessible name with it.
        data-hide-from={iconHideFrom}
      >
        {icon}
      </span>
    ) : null;
  // The label box exists ONLY when a breakpoint asks for one, so a cell without `labelHideBelow`
  // renders the node it always has. Below the step the label is VISUALLY hidden, never
  // `display: none`: it is the cell's accessible name, and an icon-only cell still needs one.
  const labelOf = (label: React.ReactNode) =>
    labelHideBelow === undefined || label === undefined || label === null || label === false ? (
      label
    ) : (
      <span
        data-slot="topbar-item-label"
        className="ui-topbar-item-label"
        data-hide-below={labelHideBelow}
      >
        {label}
      </span>
    );
  // Under `asChild` the slot and the label box are injected into the ONE child element, which
  // stays the rendered root and still receives every prop Slot merges onto it. Anything that is
  // not a single valid element goes to Slot untouched, so it fails exactly the way every other
  // `asChild` in this library does — Button's included — rather than in a way of its own.
  const slotted =
    asChild &&
    (iconNode !== null || labelHideBelow !== undefined) &&
    React.isValidElement<{ children?: React.ReactNode }>(children)
      ? React.cloneElement(children, undefined, iconNode, labelOf(children.props.children))
      : children;
  const badgeNode = showBadge ? (
    <span
      data-slot="topbar-item-badge"
      className="ui-topbar-item-badge"
      // Absent when the tone is the default, so a cell that never sets it renders the same node.
      data-tone={badgeTone === "destructive" ? "destructive" : undefined}
    >
      {badge}
    </span>
  ) : null;
  return (
    <Comp
      ref={ref}
      data-slot="topbar-item"
      data-hide-below={hideBelow}
      className={cn("ui-topbar-item ui-focus-ring", className)}
      // A bare `<button>` inside a form defaults to `type="submit"`; under `asChild` the child owns
      // its own element and must not be handed a `type` it may not accept (an `<a>`, a `<div>`).
      type={asChild ? undefined : (type ?? "button")}
      {...props}
    >
      {asChild ? (
        slotted
      ) : (
        <>
          {iconNode}
          {labelOf(children)}
          {badgeNode}
        </>
      )}
    </Comp>
  );
});
