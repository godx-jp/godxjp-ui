// useTweaks — shared client state for the design system's Tweaks panel.
//
// Mirrors the design prototype `useTweaks` hook (tweaks-panel.jsx). Each
// tweak is persisted to localStorage so reloads keep the user's chosen
// density / theme / tenant / sidebar-collapsed setting. Locale is owned
// by i18next (see src/i18n/index.ts) but exposed through this hook so
// the Tweaks UI has a single dispatcher.
import { useCallback, useEffect, useState } from "react";
import i18n, { GODX_LOCALE_STORAGE_KEY, type GodxLocale } from "../i18n";
import { PRODUCTS, type ForgeProduct } from "../data/products";

export type Density = "compact" | "default" | "comfortable";
export type Theme = "light" | "dark";

export type Tweaks = {
  density: Density;
  theme: Theme;
  tenant: string;
  locale: GodxLocale;
  sidebarCollapsed: boolean;
};

const STORAGE_KEY = "godx.tweaks";

const DEFAULTS: Tweaks = {
  density: "default",
  theme: "light",
  tenant: "godx",
  locale: "ja",
  sidebarCollapsed: false,
};

function loadInitial(): Tweaks {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const stored = raw ? (JSON.parse(raw) as Partial<Tweaks>) : {};
    const detected = (i18n.language?.slice(0, 2) || "ja") as GodxLocale;
    return {
      ...DEFAULTS,
      ...stored,
      locale: (stored.locale ?? detected) as GodxLocale,
    };
  } catch {
    return DEFAULTS;
  }
}

export function useTweaks() {
  const [tweaks, setTweaks] = useState<Tweaks>(loadInitial);

  // Persist every change to localStorage.
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tweaks));
    } catch {
      /* Storage may be disabled (private mode). Silently degrade. */
    }
  }, [tweaks]);

  // Reflect tweaks onto <html> so the design tokens (CSS custom
  // properties scoped to [data-tenant=…], [data-theme=…], [data-density=…])
  // pick up the change without rerunning React.
  useEffect(() => {
    const html = document.documentElement;
    html.dataset.theme = tweaks.theme;
    html.dataset.density = tweaks.density;
    html.dataset.tenant = tweaks.tenant;
    html.lang = tweaks.locale;
  }, [tweaks.theme, tweaks.density, tweaks.tenant, tweaks.locale]);

  // Forward locale changes to i18next so the UI re-renders strings.
  useEffect(() => {
    if (i18n.language?.slice(0, 2) !== tweaks.locale) {
      void i18n.changeLanguage(tweaks.locale);
      try {
        window.localStorage.setItem(GODX_LOCALE_STORAGE_KEY, tweaks.locale);
      } catch {
        /* ignore */
      }
    }
  }, [tweaks.locale]);

  const setTweak = useCallback(<K extends keyof Tweaks>(key: K, value: Tweaks[K]) => {
    setTweaks((prev) => ({ ...prev, [key]: value }));
  }, []);

  return { tweaks, setTweak, setTweaks } as const;
}

export const PRODUCT_OPTIONS = PRODUCTS.map((p) => ({ value: p.tenant, label: p.name }));
