"use client";

import type { ComponentType } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { SidebarMenuButton, SidebarMenuItem } from "@godxjp/ui";

interface NavItemProps {
  title: string;
  href: string;
  icon?: ComponentType<{ className?: string }>;
  /** Right-aligned badge slot (pill with count). */
  badge?: React.ReactNode;
}

export function NavItem({ title, href, icon: Icon, badge }: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + "/");

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive} className="h-8 text-sm">
        <Link href={href}>
          {Icon && <Icon className="size-4" />}
          <span className="flex-1 truncate">{title}</span>
          {badge}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
