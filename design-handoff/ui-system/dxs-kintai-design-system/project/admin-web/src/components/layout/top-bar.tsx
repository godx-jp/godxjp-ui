"use client";

import {
  Avatar,
  AvatarFallback,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  SidebarTrigger,
} from "@godxjp/ui";
import { Languages, LogOut, Monitor, Moon, Settings, Sun, User } from "lucide-react";

import type { LocaleCode } from "@/i18n";
import { logout } from "@/lib/auth";
import { useLocale, useTheme, useTranslation } from "@/providers/app-provider";

import { BranchFilterConnected } from "./branch-filter-connected";
import { QuickActions } from "./quick-actions";

const themeIcons = {
  light: Sun,
  dark: Moon,
  system: Monitor,
} as const;

interface TopBarProps {
  brandName?: string;
  mode?: "brand" | "shop";
  userName?: string;
  userEmail?: string;
  children?: React.ReactNode;
}

export function TopBar({
  brandName,
  mode = "brand",
  userName = "User",
  userEmail = "",
  children,
}: TopBarProps) {
  const { locale, setLocale, locales } = useLocale();
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();

  const cycleTheme = () => {
    const order = ["light", "dark", "system"] as const;
    const next = order[(order.indexOf(theme) + 1) % order.length];
    setTheme(next);
  };

  const initials = userName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const ThemeIcon = themeIcons[theme];

  return (
    <header className="flex h-12 shrink-0 items-center border-b px-3">
      <SidebarTrigger className="-ml-1 size-7" />
      <div className="bg-border mx-2 h-4 w-px" />

      {brandName && <span className="text-sm font-medium">{brandName}</span>}

      {/* Branch filter — plan-004 T4.3. Self-hides outside /admin and for
          users with no accessible shops. Positioned before the right-hand
          action cluster so admin's "set scope for today" action is reachable
          on arrival without clicking into a nested menu. */}
      <div className="ml-4 flex items-center gap-2">
        <BranchFilterConnected />
        {/* plan-004 T11.4 — role-aware quick action launcher. Self-hides
            when the resolved role has zero visible actions (e.g. employee
            or unresolved role). */}
        <QuickActions />
      </div>

      <div className="ml-auto flex items-center gap-0.5">
        {children}

        {/* Language Switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="size-8 p-0">
              <Languages className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              {(Object.keys(locales) as LocaleCode[]).map((loc) => (
                <DropdownMenuItem key={loc} onClick={() => setLocale(loc)} className="h-7 text-sm">
                  <span className={locale === loc ? "font-medium" : ""}>{locales[loc]}</span>
                  {locale === loc && (
                    <span className="text-muted-foreground ml-auto text-xs">
                      {loc.toUpperCase()}
                    </span>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme Toggle */}
        <Button variant="ghost" size="sm" className="size-8 p-0" onClick={cycleTheme}>
          <ThemeIcon className="size-4" />
        </Button>

        <div className="bg-border mx-1 h-4 w-px" />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 gap-2 px-2">
              <Avatar className="size-6">
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
              <div className="hidden items-start sm:flex sm:flex-col">
                <span className="max-w-[120px] truncate text-xs font-medium">{userName}</span>
                {userEmail && (
                  <span className="text-muted-foreground max-w-[120px] truncate text-[10px]">
                    {userEmail}
                  </span>
                )}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="py-1.5">
                <div className="text-sm font-medium">{userName}</div>
                {userEmail && <div className="text-muted-foreground text-xs">{userEmail}</div>}
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem className="h-7 text-sm">
                <User className="size-3.5" />
                {t("common.profile")}
              </DropdownMenuItem>
              <DropdownMenuItem className="h-7 text-sm">
                <Settings className="size-3.5" />
                {t("common.settings")}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem className="text-destructive h-7 text-sm" onClick={logout}>
                <LogOut className="size-3.5" />
                {t("common.logout")}
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
