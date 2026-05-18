/**
 * QuickActions — topbar dropdown exposing the most-used HR / shop-manager
 * shortcuts next to the branch filter.  Plan-004 Phase 11 T11.4.
 *
 * Role-aware: HR sees the onboarding shortcut + batch approve + bulk
 * shift assign; shop_manager sees only the latter two (they cannot
 * onboard new employees).
 *
 * Mounted by both the top-level `/admin/layout.tsx` and brand-scoped
 * `/admin/[brandSlug]/layout.tsx` via the TopBar children slot.
 */

"use client";

import Link from "next/link";

import {
  Button,
  DropdownMenu,
} from "@godxjp/ui";
import { ClipboardCheck, Plus, UserPlus } from "lucide-react";

import { useMyRole } from "@/hooks/use-my-role";
import type { Role } from "@/nav/config";
import { useTranslation } from "@/providers/app-provider";

export interface QuickAction {
  key: string;
  labelKey: string;
  href: string;
  roles: Role[];
  icon: typeof Plus;
}

export const QUICK_ACTIONS: QuickAction[] = [
  {
    key: "onboarding",
    labelKey: "admin.quick.onboarding",
    href: "/admin/onboarding",
    roles: ["admin"],
    icon: UserPlus,
  },
  {
    key: "batch-approve",
    labelKey: "admin.quick.batch_approve",
    href: "/admin/approvals",
    roles: ["admin", "shop_manager"],
    icon: ClipboardCheck,
  },
  {
    key: "bulk-shift",
    labelKey: "admin.quick.bulk_shift",
    href: "/admin/shifts/calendar",
    roles: ["admin", "shop_manager"],
    icon: Plus,
  },
];

export interface QuickActionsProps {
  /** Override the resolved role — primarily for tests. */
  role?: Role | null;
}

/** Return the subset of actions visible to the given role. */
export function actionsForRole(role: Role | null): QuickAction[] {
  if (!role) return [];
  return QUICK_ACTIONS.filter((a) => a.roles.includes(role));
}

export function QuickActions({ role: roleOverride }: QuickActionsProps = {}) {
  const { t } = useTranslation();
  const detectedRole = useMyRole();
  const role = roleOverride !== undefined ? roleOverride : detectedRole;

  const actions = actionsForRole(role);

  if (actions.length === 0) return null;

  return (
    <DropdownMenu
      align="end"
      contentClassName="w-56"
      trigger={
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5"
          aria-label={t("admin.quick.trigger_label")}
          data-slot="quick-actions"
        >
          <Plus className="size-3.5" />
          <span className="hidden text-xs font-medium sm:inline">
            {t("admin.quick.trigger_label")}
          </span>
        </Button>
      }
      items={actions.map((action) => {
        const Icon = action.icon;
        return {
          key: action.key,
          label: (
            <Link href={action.href} className="flex items-center gap-2 text-sm">
              <Icon className="size-3.5" />
              {t(action.labelKey)}
            </Link>
          ),
        };
      })}
    />
  );
}
