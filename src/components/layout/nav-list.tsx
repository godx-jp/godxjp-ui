"use client";

import * as React from "react";
import { cn } from "../../lib/utils";
import { NavGroup, SidebarItem } from "./sidebar";
import type { NavListProp } from "../../props/components/layout.prop";

export type { NavListProp };

export type NavListProps = NavListProp;

/**
 * NavList — a vertical route navigation that is NOT shell furniture (gh#374).
 *
 * `Sidebar` owns the app's primary rail and renders into `AppShell`'s grid, so it cannot be nested
 * in a page. The settings-nav shape — a column of links beside the pane they drive, one of them
 * current — had no primitive, which left every consumer hand-rolling rows out of `Button`s with the
 * current one encoded as a variant swap: no `aria-current`, no icon column, a different invention
 * per app.
 *
 * This is the SAME row as the rail, deliberately: it composes `SidebarItem`, so icon slot, label,
 * badge, active tokens and `aria-current="page"` are one implementation shared by both, and a
 * consumer that already learnt `SidebarItemProp` / `linkComponent` for the rail knows this too.
 * Only the container differs — a `<nav>` landmark instead of the shell's grid area, and no
 * collapsed rail (a page-level nav has no rail to collapse into).
 *
 * `item.children` is part of that shared row shape, and it is rendered through the rail's OWN
 * `NavGroup` (gh#815). It used to be dropped: `items` mapped straight to `SidebarItem`, so a
 * nested group type-checked, rendered as a single flat row, and its children vanished with no
 * error and no warning. A grouped settings nav — アカウント / セキュリティ / 通知 / 請求 — is the
 * canonical use of this component, and it took one `NavList` per group wrapped in
 * `SidebarSection`, i.e. N `<nav>` landmarks where the page has one navigation. Now it is one
 * `NavList`, one landmark, and the group opens itself whenever the route lands on a descendant.
 */
export const NavList = React.forwardRef<HTMLElement, NavListProps>(
  ({ items, activeId, label, linkComponent, onSelect, className, ...props }, ref) => (
    <nav ref={ref} aria-label={label} className={cn("ui-nav-list", className)} {...props}>
      {items.map((item) =>
        item.children && item.children.length > 0 ? (
          <NavGroup
            key={item.id}
            item={item}
            activeId={activeId ?? ""}
            linkComponent={linkComponent}
            onSelect={onSelect}
          />
        ) : (
          <SidebarItem
            key={item.id}
            item={item}
            active={item.id === activeId}
            linkComponent={linkComponent}
            onActivate={onSelect}
          />
        ),
      )}
    </nav>
  ),
);
NavList.displayName = "NavList";
