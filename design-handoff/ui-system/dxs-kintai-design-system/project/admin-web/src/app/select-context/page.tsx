"use client";

import { useEffect, useMemo, useState } from "react";

import { useRouter } from "next/navigation";

import {
  Avatar,
  AvatarFallback,
  Button,
  Card,
  CardSection,
  Card,
  CardTitleText,
  DropdownMenu,
  Input,
  Skeleton,
} from "@godxjp/ui";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Languages, LogOut, Search, Store, Tags } from "lucide-react";

import type { LocaleCode } from "@/i18n";
import { apiFetch } from "@/lib/api";
import { logout } from "@/lib/auth";
import { useLocale, useTranslation } from "@/providers/app-provider";

interface Brand {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  logo_url?: string | null;
}

interface Shop {
  id: string;
  name: string;
  slug: string;
  brand_name?: string | null;
}

interface PageMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface ContextResponse {
  user: { id: string; name: string; email: string };
  brand_count: number;
  shop_count: number;
}

interface PagedResponse<T> {
  data: T[];
  meta: PageMeta;
}

// Search-result page size. Small on purpose: results are typeahead-style and
// the user is meant to refine their query, not scroll a giant list.
const SEARCH_LIMIT = 10;

// Idle suggestion size when no search is active. Just enough to bootstrap
// users with a small org without forcing them to type. Caps the request at a
// fixed N rows regardless of how many brands/shops exist server-side.
const IDLE_LIMIT = 8;

function useDebouncedValue<T>(value: T, delayMs = 250): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

export default function SelectContextPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { locale, setLocale, locales } = useLocale();

  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput.trim(), 250);
  const isSearching = search.length > 0;
  const limit = isSearching ? SEARCH_LIMIT : IDLE_LIMIT;

  // Profile + counts. One row from the user table + two COUNT(*)s. Cheap.
  const { data: ctx } = useQuery({
    queryKey: ["me", "context"],
    queryFn: () => apiFetch<ContextResponse>("/api/v1/me/context"),
  });

  // Brand search. The query key includes `search` so React Query treats each
  // search term as a distinct cache entry, and `keepPreviousData` keeps the
  // old results on screen while the new query is in flight (no flicker).
  const { data: brandsResp, isFetching: brandsFetching } = useQuery({
    queryKey: ["me", "brands", search, limit],
    queryFn: () => {
      const qs = new URLSearchParams({ per_page: String(limit) });
      if (search) qs.set("search", search);
      return apiFetch<PagedResponse<Brand>>(`/api/v1/me/brands?${qs}`);
    },
    placeholderData: keepPreviousData,
  });

  const { data: shopsResp, isFetching: shopsFetching } = useQuery({
    queryKey: ["me", "shops", search, limit],
    queryFn: () => {
      const qs = new URLSearchParams({ per_page: String(limit) });
      if (search) qs.set("search", search);
      return apiFetch<PagedResponse<Shop>>(`/api/v1/me/shops?${qs}`);
    },
    placeholderData: keepPreviousData,
  });

  const brands = brandsResp?.data ?? [];
  const shops = shopsResp?.data ?? [];
  const brandTotal = brandsResp?.meta.total ?? 0;
  const shopTotal = shopsResp?.meta.total ?? 0;
  const isFetching = brandsFetching || shopsFetching;
  const hasAnyResult = brands.length > 0 || shops.length > 0;
  const showEmpty = isSearching && !isFetching && !hasAnyResult;
  const showOnboardingEmpty =
    !isSearching && ctx !== undefined && ctx.brand_count === 0 && ctx.shop_count === 0;

  const user = ctx?.user;
  const initials = useMemo(
    () =>
      (user?.name ?? "?")
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase(),
    [user?.name],
  );

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      <div className="absolute right-4 top-4 flex items-center gap-1">
        <DropdownMenu
          align="end"
          trigger={
            <Button variant="ghost" size="sm" className="size-8 p-0">
              <Languages className="size-4" />
            </Button>
          }
          items={(Object.keys(locales) as LocaleCode[]).map((loc) => ({
            key: loc,
            onSelect: () => setLocale(loc),
            label: (
              <>
                <span className={locale === loc ? "font-medium" : ""}>{locales[loc]}</span>
                {locale === loc && (
                  <span className="text-muted-foreground ml-auto text-xs">
                    {loc.toUpperCase()}
                  </span>
                )}
              </>
            ),
          }))}
        />

        <Button
          variant="ghost"
          size="sm"
          className="size-8 p-0"
          onClick={() => logout()}
          title={t("common.logout")}
        >
          <LogOut className="size-4" />
        </Button>
      </div>

      <div className="w-full max-w-lg space-y-6 py-12">
        <div className="flex flex-col items-center gap-3 text-center">
          {user && (
            <div className="bg-muted/30 flex items-center gap-2 rounded-full border py-1 pl-1 pr-3">
              <Avatar className="size-7">
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start leading-tight">
                <span className="text-xs font-medium">{user.name}</span>
                <span className="text-muted-foreground text-[10px]">{user.email}</span>
              </div>
            </div>
          )}
          <div>
            <h1 className="text-lg font-semibold">{t("select_context.title")}</h1>
            <p className="text-muted-foreground text-sm">{t("select_context.description")}</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="relative">
            <Search className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
            <Input
              type="search"
              // autoFocus is intentional UX: select-context is the post-login
              // landing page — every user immediately filters to find their
              // brand/tenant. Without focus, every login would require an extra
              // click.
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t("select_context.search_placeholder")}
              className="pl-9"
            />
          </div>
          {ctx && (
            <p className="text-muted-foreground px-1 text-[11px]">
              {t("select_context.search_hint", {
                brand_count: ctx.brand_count,
                shop_count: ctx.shop_count,
              })}
            </p>
          )}
        </div>

        {!ctx && (
          <div className="space-y-2">
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        )}

        {ctx && brands.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide">
              <Tags className="size-3.5" />
              {t("select_context.brands")}
              {brandTotal > brands.length && (
                <span className="ml-auto normal-case tracking-normal">
                  {brands.length} / {brandTotal}
                </span>
              )}
            </h2>
            <div className="grid gap-2">
              {brands.map((brand) => (
                <Card
                  key={brand.slug}
                  className="hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => router.push(`/admin/${brand.slug}`)}
                >
                  <CardSection className="flex items-center gap-3 p-3">
                    <div className="bg-primary text-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-md text-sm font-bold">
                      {brand.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{brand.name}</div>
                      {brand.description && (
                        <div className="text-muted-foreground text-xs">{brand.description}</div>
                      )}
                    </div>
                  </CardSection>
                </Card>
              ))}
            </div>
          </div>
        )}

        {ctx && shops.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide">
              <Store className="size-3.5" />
              {t("select_context.shops")}
              {shopTotal > shops.length && (
                <span className="ml-auto normal-case tracking-normal">
                  {shops.length} / {shopTotal}
                </span>
              )}
            </h2>
            <div className="grid gap-2">
              {shops.map((shop) => (
                <Card
                  key={shop.slug}
                  className="hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => router.push(`/shop/${shop.slug}/dashboard`)}
                >
                  <CardSection className="flex items-center gap-3 p-3">
                    <div className="bg-muted flex size-8 shrink-0 items-center justify-center rounded-md text-sm font-medium">
                      <Store className="size-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">{shop.name}</div>
                      {shop.brand_name && (
                        <div className="text-muted-foreground text-xs">{shop.brand_name}</div>
                      )}
                    </div>
                  </CardSection>
                </Card>
              ))}
            </div>
          </div>
        )}

        {showEmpty && (
          <p className="text-muted-foreground text-center text-sm">
            {t("select_context.no_results")}
          </p>
        )}

        {showOnboardingEmpty && (
          <Card>
            <Card>
              <CardTitleText className="text-sm">{t("select_context.no_workspaces")}</CardTitleText>
            </Card>
            <CardSection>
              <p className="text-muted-foreground text-sm">
                {t("select_context.no_workspaces_description")}
              </p>
            </CardSection>
          </Card>
        )}
      </div>
    </div>
  );
}
