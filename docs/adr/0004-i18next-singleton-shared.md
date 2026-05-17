---
diataxis: adr
library: "@godxjp/ui"
library_version: 3.0.0
adr: "0004"
title: Ship a pre-configured i18next singleton instead of an i18n interface
status: accepted
date: 2026-01-14
last-updated: 2026-05-17
audience: [developer]
lang: en
---

# ADR 0004 — Ship a pre-configured i18next singleton instead of an i18n interface

## Status

Accepted.

---

## Context

`@godxjp/ui` ships shell components (Sidebar, Topbar, TweaksPanel,
CommandPalette, ProductSwitcher, ProjectSwitcher) that display user-facing
strings. Those strings must be localised across the four mandatory locales:
`ja`, `en`, `vi`, `fil`.

The team considered three approaches to i18n:

1. **No built-in i18n** — Consumer injects strings as props. Every consuming
   service authors its own translation pipeline. Shell components accumulate a
   large required-prop surface area; any new label is a breaking change.

2. **i18n abstraction interface** — `@godxjp/ui` declares a `GodxI18n`
   interface; the consumer implements it using whatever i18n library they
   choose (i18next, react-intl, Lingui, etc.). Consumers pass the
   implementation to a context provider.

3. **Pre-configured i18next singleton** — `@godxjp/ui` ships `initI18n()`
   which sets up an i18next instance with the four mandatory locales'
   base dictionary pre-loaded. Consumers call `initI18n()` once in `main.tsx`
   and extend via `i18n.addResourceBundle(locale, namespace, dict)`.

Approach 1 produces unworkable prop sprawl as the shell grows. Approach 2
requires consumers to learn a bespoke interface, provides no base dictionary,
and makes `useTweaks`'s locale-forwarding logic impossible to implement
without accessing the consumer's i18n instance. Approach 3 commits to
i18next as the mechanism but provides a ready-to-run setup with zero
consumer configuration for the base use case.

The team evaluated whether committing to i18next was acceptable:

- i18next is the most widely deployed i18n library in the React ecosystem.
- i18next-browser-languagedetector provides standard locale detection
  (localStorage → navigator → fallback).
- `react-i18next` provides `useTranslation` hook that consuming components
  already know.
- The singleton model is common in the React ecosystem (cf. React Router
  context, TanStack Query client).

---

## Decision

`@godxjp/ui` ships a pre-configured i18next singleton.

- `initI18n()` in `src/i18n/index.ts` is the canonical entry point. It
  initialises i18next with:
  - Detection order: `localStorage["godx.locale"]` → `navigator.language`
    prefix → `"ja"` fallback.
  - `SUPPORTED_LOCALES = ["ja", "en", "vi", "fil"]` — mandatory coverage.
  - `load: "languageOnly"` — drops BCP 47 subtags.
  - `interpolation.escapeValue: false` — React handles XSS.
  - The full base dictionary (brand, nav, shell, tweaks, kpi, common,
    workspace, pdca, issue namespaces) pre-loaded for all four locales.
- `initI18n()` must be called exactly once, before `createRoot(…).render(…)`.
- Consumers extend via `i18n.addResourceBundle(locale, "my-svc", dict)` for
  service-specific namespaces.
- `useTweaks` calls `i18n.changeLanguage(locale)` when the locale tweak
  changes, keeping the singleton synchronized with the density/theme/tenant
  state store.

One i18next instance governs the whole SPA. There is no per-component
i18n provider.

---

## Consequences

**Positive:**

- Consuming services get four-locale coverage for shell UI strings at zero
  configuration cost.
- `useTweaks` and `initI18n` compose naturally: the hook owns locale state;
  the singleton is the language-switch target.
- The `useTranslation` API from `react-i18next` is already familiar to the
  team; no new API to learn.
- Adding a new supported locale to `@godxjp/ui` automatically makes it
  available to all consumers without per-service changes.

**Negative / constraints:**

- `@godxjp/ui` commits to i18next as the mechanism. A consuming service that
  already uses Lingui or react-intl cannot use `@godxjp/ui`'s base dictionary
  directly.
- `initI18n()` must not be called more than once per page. Multiple imports
  from separate entry points are safe (i18next is idempotent) but calling
  the wrapper function twice is a code smell caught at review.
- Service-specific namespaces must be registered after `initI18n()` completes.
  Registering before causes a key-not-found flash on first render.

**Neutral:**

- The deprecated `ForgeLocale` type alias and `FORGE_LOCALE_STORAGE_KEY`
  constant are maintained through v3.x for backwards compatibility (per the
  deprecation policy in ADR-0001 and the versioning explanation).
- SSR: i18next initialises synchronously; the singleton is safe to call on
  the server, but `i18next-browser-languagedetector` falls back to the `"ja"`
  default (no `localStorage` or `navigator` on the server).

---

## See also

- [Reference: i18n](../reference/i18n.md) — full API reference for `initI18n`,
  constants, and `addResourceBundle`.
- [How-to: Add a locale](../how-to/add-locale.md) — adding a fifth locale.
- [Reference: Hooks — useTweaks](../reference/hooks/useTweaks.md) — locale
  forwarding behavior.
