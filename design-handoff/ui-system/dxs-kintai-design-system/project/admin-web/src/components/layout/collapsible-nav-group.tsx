"use client";

/**
 * CollapsibleNavGroup — plan-004 T3.5.
 *
 * Wraps a sidebar group (label row + children) in a Radix-backed
 * `<Collapsible>` from `@godxjp/ui`. Expand state persists per-user in
 * localStorage under `nav_group_expanded:{label}`.
 *
 * Non-collapsed groups (those without `collapsedByDefault`) render a static
 * label — we only opt into the collapsible widget when the nav config marks
 * the group as collapsible-by-default, to keep frequently-used groups
 * (Today, Attendance) always visible without an extra click.
 */

import { useEffect, useState } from "react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
} from "@godxjp/ui";
import { ChevronDown } from "lucide-react";

interface CollapsibleNavGroupProps {
  label: string;
  /** Default-open vs default-collapsed. Persisted state overrides this. */
  defaultOpen: boolean;
  /** Stable storage key — typically the group label (i18n key, not rendered). */
  storageKey: string;
  children: React.ReactNode;
}

/**
 * Read persisted expand state once on mount. SSR returns default-open to
 * match hydration; the client effect reconciles with localStorage.
 */
function readPersistedOpen(storageKey: string, defaultOpen: boolean): boolean {
  if (typeof window === "undefined") return defaultOpen;
  try {
    const raw = window.localStorage.getItem(`nav_group_expanded:${storageKey}`);
    if (raw === "1") return true;
    if (raw === "0") return false;
  } catch {
    // localStorage may throw in privacy modes — fall through to default.
  }
  return defaultOpen;
}

export function CollapsibleNavGroup({
  label,
  defaultOpen,
  storageKey,
  children,
}: CollapsibleNavGroupProps) {
  // Hydrate from localStorage on mount. Using an initializer function keeps
  // the first render SSR-safe (defaultOpen) — a useEffect then syncs with
  // any persisted override.
  const [open, setOpen] = useState<boolean>(defaultOpen);

  useEffect(() => {
    const persisted = readPersistedOpen(storageKey, defaultOpen);
    if (persisted !== defaultOpen) setOpen(persisted);
    // Only on mount — storageKey/defaultOpen are effectively static per
    // group instance.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    try {
      window.localStorage.setItem(`nav_group_expanded:${storageKey}`, next ? "1" : "0");
    } catch {
      // ignore — preference will fall back to defaultOpen next mount.
    }
  };

  return (
    <Collapsible open={open} onOpenChange={handleOpenChange} className="group/collapsible">
      <SidebarGroup className="py-1" data-slot="collapsible-nav-group">
        <SidebarGroupLabel asChild className="h-6 px-3 text-xs">
          <CollapsibleTrigger className="flex w-full items-center justify-between">
            <span>{label}</span>
            <ChevronDown className="text-muted-foreground size-3 transition-transform duration-200 group-data-[state=closed]/collapsible:-rotate-90" />
          </CollapsibleTrigger>
        </SidebarGroupLabel>
        <CollapsibleContent>
          <SidebarMenu className="gap-0.5 px-1.5">{children}</SidebarMenu>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );
}
