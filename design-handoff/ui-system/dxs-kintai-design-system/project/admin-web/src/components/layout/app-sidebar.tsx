"use client";

import { useState } from "react";

import { useParams, useRouter } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  DropdownMenu,
} from "@godxjp/ui";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ChevronsUpDown, Search, Store, Tags } from "lucide-react";

import { apiFetch } from "@/lib/api";
import type { NavGroup, NavItem } from "@/nav/config";
import { useTranslation } from "@/providers/app-provider";

import { CollapsibleNavGroup } from "./collapsible-nav-group";
import { NavBadge } from "./nav-badge";
import { NavItem as NavItemRow } from "./nav-item";

// Nav shapes live in `@/nav/config` — re-exported here so sibling modules can
// import them from the sidebar without reaching through.
export type { NavGroup, NavItem };

interface Brand {
  id: string;
  name: string;
  slug: string;
}

interface Shop {
  id: string;
  name: string;
  slug: string;
  brand_name?: string | null;
}

interface PagedResponse<T> {
  data: T[];
  meta: { current_page: number; last_page: number; per_page: number; total: number };
}

// Sidebar dropdown is a quick switcher, not a typeahead. 100 matches the
// backend's MAX_PER_PAGE — covers any small/medium org without paging UI.
const SIDEBAR_LIST_LIMIT = 100;

interface AppSidebarProps {
  brandName: string;
  brandLogo?: string;
  mode?: "brand" | "shop";
  navGroups: NavGroup[];
}

export function AppSidebar({ brandName, mode = "brand", navGroups }: AppSidebarProps) {
  const router = useRouter();
  const { t } = useTranslation();
  // Active brand slug comes from the URL, not from the display name. The
  // previous implementation compared `brandName === b.slug` which was always
  // false (display name vs slug).
  const params = useParams<{ brandSlug?: string; shopSlug?: string }>();
  const activeBrandSlug = params.brandSlug;
  const activeShopSlug = params.shopSlug;

  // Lazy: don't hit /me/brands and /me/shops on every page render. The
  // dropdown is only opened occasionally (when switching workspace), so we
  // defer the fetch until the user has opened it once. Once `hasOpened` flips
  // true, react-query keeps the result cached for `staleTime` so subsequent
  // opens (and other pages) reuse it without refetching.
  const [hasOpened, setHasOpened] = useState(false);

  const { data: brandsResp } = useQuery({
    queryKey: ["me", "brands", "sidebar"],
    queryFn: () =>
      apiFetch<PagedResponse<Brand>>(`/api/v1/me/brands?per_page=${SIDEBAR_LIST_LIMIT}`),
    enabled: hasOpened,
    staleTime: 5 * 60 * 1000,
  });

  const { data: shopsResp } = useQuery({
    queryKey: ["me", "shops", "sidebar"],
    queryFn: () => apiFetch<PagedResponse<Shop>>(`/api/v1/me/shops?per_page=${SIDEBAR_LIST_LIMIT}`),
    enabled: hasOpened,
    staleTime: 5 * 60 * 1000,
  });

  const brands = brandsResp?.data ?? [];
  const shops = shopsResp?.data ?? [];
  const brandTotal = brandsResp?.meta.total ?? 0;
  const shopTotal = shopsResp?.meta.total ?? 0;
  const hasMore = brandTotal > brands.length || shopTotal > shops.length;

  return (
    <Sidebar collapsible="icon" className="border-r">
      {/* Header: Context Switcher (replaces static logo) */}
      <SidebarHeader className="flex h-12 items-center border-b px-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu
              align="start"
              contentClassName="w-60"
              onOpenChange={(open) => {
                if (open && !hasOpened) setHasOpened(true);
              }}
              trigger={
                <SidebarMenuButton className="h-9 w-full justify-between">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className="bg-primary text-primary-foreground flex size-5 shrink-0 items-center justify-center rounded text-[10px] font-bold">
                      {brandName.charAt(0).toUpperCase()}
                    </div>
                    <span className="truncate text-sm font-semibold">{brandName}</span>
                  </div>
                  <ChevronsUpDown className="text-muted-foreground size-3.5 shrink-0" />
                </SidebarMenuButton>
              }
              items={[
                ...(brands.length > 0
                  ? [
                      {
                        key: "brands-label",
                        type: "label" as const,
                        label: (
                          <div className="flex items-center gap-1.5 px-2 py-1.5">
                            <Tags className="text-muted-foreground size-3" />
                            <span className="text-muted-foreground text-[10px] font-semibold uppercase tracking-widest">
                              {t("select_context.brands")}
                            </span>
                            {brandTotal > brands.length && (
                              <span className="text-muted-foreground ml-auto text-[10px]">
                                {brands.length} / {brandTotal}
                              </span>
                            )}
                          </div>
                        ),
                      },
                      ...brands.map((b) => {
                        const isActive = activeBrandSlug === b.slug && mode === "brand";
                        return {
                          key: `brand-${b.slug}`,
                          onSelect: () => router.push(`/admin/${b.slug}`),
                          label: (
                            <>
                              <div className="bg-primary text-primary-foreground flex size-5 shrink-0 items-center justify-center rounded text-[10px] font-bold">
                                {b.name.charAt(0)}
                              </div>
                              <span className={isActive ? "font-medium" : ""}>{b.name}</span>
                              {isActive && <span className="text-primary ml-auto text-xs">●</span>}
                            </>
                          ),
                        };
                      }),
                      ...(shops.length > 0
                        ? [{ key: "brand-shop-separator", type: "separator" as const }]
                        : []),
                    ]
                  : []),
                ...(shops.length > 0
                  ? [
                      {
                        key: "shops-label",
                        type: "label" as const,
                        label: (
                          <div className="flex items-center gap-1.5 px-2 py-1.5">
                            <Store className="text-muted-foreground size-3" />
                            <span className="text-muted-foreground text-[10px] font-semibold uppercase tracking-widest">
                              {t("select_context.shops")}
                            </span>
                            {shopTotal > shops.length && (
                              <span className="text-muted-foreground ml-auto text-[10px]">
                                {shops.length} / {shopTotal}
                              </span>
                            )}
                          </div>
                        ),
                      },
                      ...shops.map((s) => {
                        const isActive = activeShopSlug === s.slug && mode === "shop";
                        return {
                          key: `shop-${s.slug}`,
                          onSelect: () => router.push(`/shop/${s.slug}/dashboard`),
                          label: (
                            <>
                              <div className="bg-muted text-muted-foreground flex size-5 shrink-0 items-center justify-center rounded">
                                <Store className="size-3" />
                              </div>
                              <span className={isActive ? "font-medium" : ""}>{s.name}</span>
                              {s.brand_name && (
                                <span className="text-muted-foreground ml-auto text-[10px]">
                                  {s.brand_name}
                                </span>
                              )}
                            </>
                          ),
                        };
                      }),
                    ]
                  : []),
                ...(hasMore ? [{ key: "more-separator", type: "separator" as const }] : []),
                {
                  key: "search",
                  onSelect: () => router.push("/select-context"),
                  label: (
                    <>
                      <Search className="size-3.5" />
                      <span>{t("select_context.search_placeholder")}</span>
                      <ArrowRight className="text-muted-foreground ml-auto size-3.5" />
                    </>
                  ),
                },
              ]}
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent className="py-1">
        {navGroups.map((group) => {
          const rows = group.items.map((item) => (
            <NavItemRow
              key={item.href}
              title={item.title}
              href={item.href}
              icon={item.icon}
              badge={item.badge ? <NavBadge badge={item.badge} /> : undefined}
            />
          ));

          // Groups that default to collapsed wrap in CollapsibleNavGroup so
          // the user can expand on demand + persist the preference. Always-
          // expanded groups stay as a plain SidebarGroup — no extra DOM +
          // no click required to reach frequent items.
          if (group.collapsedByDefault) {
            return (
              <CollapsibleNavGroup
                key={group.label}
                label={group.label}
                defaultOpen={false}
                storageKey={group.label}
              >
                {rows}
              </CollapsibleNavGroup>
            );
          }

          return (
            <SidebarGroup key={group.label} className="py-1">
              <SidebarGroupLabel className="h-6 px-3 text-xs">{group.label}</SidebarGroupLabel>
              <SidebarMenu className="gap-0.5 px-1.5">{rows}</SidebarMenu>
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      {/* No footer — user menu is in TopBar */}
    </Sidebar>
  );
}
