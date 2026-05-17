---
title: "How to add a locale to your service"
diataxis: how-to
library: "@godxjp/ui"
library_version: 3.0.0
last-updated: 2026-05-17
audience: [developer]
lang: en
status: published
---

# How to add a locale to your service

**When to use:** Your service needs translations in a namespace beyond the base dictionary, or you are supporting a language not in the base four (ja / en / vi / fil).

**Prerequisites:** `@godxjp/ui` installed. `initI18n()` called in `main.tsx`.

---

## Steps

### Add a service-specific namespace

1. Call `i18n.addResourceBundle` after `initI18n()` returns:

   ```tsx
   // src/main.tsx
   import "@godxjp/ui/tailwind.css"
   import { initI18n } from "@godxjp/ui/i18n"
   import i18n from "@godxjp/ui/i18n"

   initI18n()

   // Add service-specific keys for each supported locale.
   i18n.addResourceBundle("ja",  "my-svc", { title: "マイサービス", dashboard: "ダッシュボード" })
   i18n.addResourceBundle("en",  "my-svc", { title: "My Service",  dashboard: "Dashboard" })
   i18n.addResourceBundle("vi",  "my-svc", { title: "Dịch vụ",     dashboard: "Bảng điều khiển" })
   i18n.addResourceBundle("fil", "my-svc", { title: "Aking Serbisyo", dashboard: "Dashboard" })
   ```

2. Use the namespace in your components:

   ```tsx
   import { useTranslation } from "react-i18next"

   function PageTitle() {
     const { t } = useTranslation("my-svc")
     return <h1>{t("title")}</h1>
   }
   ```

### Add a new BCP 47 locale

The base four locales are `ja`, `en`, `vi`, `fil`. To add a new one (for example Korean `ko`):

1. Register the locale in `initI18n` by passing resources directly — you do NOT modify `@godxjp/ui` source unless you are contributing the locale to the framework upstream:

   ```tsx
   import i18n from "@godxjp/ui/i18n"

   // Register Korean as a new language in the shared i18next instance.
   i18n.addResourceBundle("ko", "translation", {
     brand:  { forge: "GoDX Forge" },
     common: { search: "검색", save: "저장", cancel: "취소" },
     // … mirror all top-level keys from ja.ts
   })
   ```

2. Add a `ko` entry to your own namespace:

   ```tsx
   i18n.addResourceBundle("ko", "my-svc", { title: "내 서비스" })
   ```

3. Allow users to select Korean via `useTweaks`:

   ```tsx
   const { setTweak } = useTweaks()
   // … in a locale selector:
   setTweak("locale", "ko" as GodxLocale)
   ```

   Note: `GodxLocale` is typed as the four built-in locales. If you add a fifth locale, you will need to cast. The `useTweaks` hook does not restrict what value is stored in `tweaks.locale`.

---

## What if it fails?

| Symptom | Cause | Fix |
|---|---|---|
| Keys render as raw strings (e.g. `"my-svc.title"`) | Namespace not registered before first render | Call `i18n.addResourceBundle` before any component mounts |
| Korean locale not selectable in TweaksPanel | TweaksPanel hard-codes `SUPPORTED_LOCALES` | Add a custom locale switcher in your service; TweaksPanel covers only the base four |
| Fallback to Japanese | Locale key missing in `ko` bundle | Add the missing key to the Korean resource bundle |

---

## Related

- [Reference: i18n](../reference/i18n.md)
- [ADR 0004: i18next singleton shared](../adr/0004-i18next-singleton-shared.md)
