"use client";

/**
 * NavBadge — red pill count next to a sidebar NavItem title. Plan-004 T3.6.
 *
 * Renders nothing when the count is 0 or still loading, so decorative
 * badges never show a stale "0". Uses the shared `@godxjp/ui` `<Badge>`
 * primitive (destructive color = red pill); truncates at 99+ to stay
 * compact in collapsed-icon sidebar mode.
 */

import { Badge } from "@godxjp/ui";

import { useBadgeCount } from "@/hooks/api/admin/use-badge-count";

interface NavBadgeProps {
  /** The `badge` identifier from the nav config (e.g. `admin.approvals.count`). */
  badge: string;
}

export function NavBadge({ badge }: NavBadgeProps) {
  const { data: count = 0 } = useBadgeCount(badge);

  if (!count) return null;

  const label = count > 99 ? "99+" : String(count);

  return (
    <Badge
      variant="default"
      color="destructive"
      className="ml-auto h-4 min-w-4 px-1.5 text-[10px] leading-none"
      data-slot="nav-badge"
    >
      {label}
    </Badge>
  );
}
