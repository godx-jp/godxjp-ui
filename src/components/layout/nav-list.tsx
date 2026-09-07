"use client";

import * as React from "react";
import { cn } from "../../lib/utils";
import { SidebarItem } from "./sidebar";
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
 */
export const NavList = React.forwardRef<HTMLElement, NavListProps>(
  ({ items, activeId, label, linkComponent, onSelect, className, ...props }, ref) => (
    <nav ref={ref} aria-label={label} className={cn("ui-nav-list", className)} {...props}>
      {items.map((item) => (
        <SidebarItem
          key={item.id}
          item={item}
          active={item.id === activeId}
          linkComponent={linkComponent}
          onActivate={onSelect}
        />
      ))}
    </nav>
  ),
);
NavList.displayName = "NavList";
