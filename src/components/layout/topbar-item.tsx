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
  { asChild = false, className, type, hideBelow, badge, badgeTone, children, ...props },
  ref,
) {
  const Comp = asChild ? Slot : "button";
  // The count pill is OVERLAID on the glyph rather than placed beside it, so a bar whose end
  // cluster is `flex: 0 0 auto` keeps its width when the count crosses a digit boundary
  // (gh#398). Empty string is treated as absent, exactly like the Sidebar row's own badge.
  // Ignored under `asChild`: Slot borrows the child's single element and has nowhere to put a
  // sibling — the same rule `Button`'s `count` follows.
  const showBadge = !asChild && badge !== undefined && badge !== "";
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
        children
      ) : (
        <>
          {children}
          {badgeNode}
        </>
      )}
    </Comp>
  );
});
