"use client";

import { LayoutDashboard, Calendar, ClipboardList, Settings } from "lucide-react";

import type { NavGroup } from "@/components/layout/app-sidebar";
import { PageShell } from "@/components/layout/page-shell";
import { useTranslation } from "@/providers/app-provider";

export default function MeLayout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();

  const navGroups: NavGroup[] = [
    {
      label: t("nav.me.section"),
      items: [
        { title: t("nav.me.dashboard"), href: "/me/dashboard", icon: LayoutDashboard },
        { title: t("nav.me.my_shifts"), href: "/me/my-shifts", icon: Calendar },
        { title: t("nav.me.timesheet"), href: "/me/timesheet", icon: ClipboardList },
        { title: t("nav.me.settings"), href: "/me/settings", icon: Settings },
      ],
    },
  ];

  return (
    <PageShell sidebar topbar brandName="dxs-kintai" navGroups={navGroups}>
      {children}
    </PageShell>
  );
}
