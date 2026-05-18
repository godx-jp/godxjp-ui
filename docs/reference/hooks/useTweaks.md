---
title: "useTweaks"
diataxis: reference
library: "@godxjp/ui"
library_version: 3.0.0
hook: useTweaks
status: stable
audience: [developer, agent]
lang: en
---

# useTweaks

> Persistent theme-axis state — theme, accent, density, font-size,
> locale, sidebar-collapsed.

Mirrors the four canonical theme axes specified in
[01 — theme axes](../../specs/01-theme-axes.md). Per cardinal
rule 19 there is no `tenant` axis — accent is the single
brand-color dimension.

## Signature

```ts
import { useTweaks } from "@godxjp/ui/hooks"

const { tweaks, setTweak, setTweaks } = useTweaks()
```

## Returns

| Field | Type | Description |
|---|---|---|
| `tweaks` | `Tweaks` | Current settings snapshot |
| `setTweak` | `<K extends keyof Tweaks>(key: K, value: Tweaks[K]) => void` | Update a single tweak key |
| `setTweaks` | `(updater: (prev: Tweaks) => Tweaks) => void` | Replace the entire tweaks object |

### Tweaks type

```ts
type Tweaks = {
  theme: "light" | "dark"
  accent: string                          // one of the canonical six palettes OR a consumer-registered slug
  density: "compact" | "default" | "comfortable"
  fontSize: "sm" | "base" | "lg" | "xl"
  locale: GodxLocale                      // "ja" | "en" | "vi" | "fil"
  sidebarCollapsed: boolean
}
```

## Behavior

### Persistence

State is persisted to `localStorage` under per-axis keys:

| Axis | Storage key |
|---|---|
| `theme` | `godx:theme` |
| `accent` | `godx:accent` |
| `density` | `godx:density` |
| `fontSize` | `godx:font-size` |
| `locale` | `godx:locale` |

Defaults:

| Key | Default |
|---|---|
| `theme` | `"light"` (or `prefers-color-scheme` if no stored value) |
| `accent` | `"blue"` |
| `density` | `"default"` |
| `fontSize` | `"base"` |
| `locale` | `"ja"` (or browser navigator language prefix) |
| `sidebarCollapsed` | `false` |

### HTML attribute synchronisation

Every `setTweak` call triggers a `useEffect` that writes the new value to the `<html>` element's `data-*` attributes:

| Tweak key | HTML attribute |
|---|---|
| `theme` | `data-theme` |
| `accent` | `data-accent` |
| `density` | `data-density` |
| `fontSize` | `data-font-size` |
| `locale` | `lang` |

This happens synchronously in the effect — CSS custom properties
scoped to `[data-theme]`, `[data-accent]`, `[data-density]`, and
`html[data-font-size]` update on the same render tick.

### Locale forwarding

When `locale` changes, `useTweaks` calls `i18n.changeLanguage(locale)` to update the shared i18next instance, and also writes to `localStorage["godx:locale"]`.

### SSR safety

`loadInitial()` checks `typeof window === "undefined"` and returns defaults if called in a server-side context.

### Storage errors

All `localStorage` reads and writes are wrapped in `try/catch`. Private browsing mode or storage-disabled environments silently fall back to in-memory defaults.

## Example

```tsx
import { useTweaks } from "@godxjp/ui/hooks"

function DensityToggle() {
  const { tweaks, setTweak } = useTweaks()

  return (
    <div>
      <span>Density: {tweaks.density}</span>
      <button onClick={() => setTweak("density", "compact")}>Compact</button>
      <button onClick={() => setTweak("density", "default")}>Default</button>
      <button onClick={() => setTweak("density", "comfortable")}>Comfortable</button>
    </div>
  )
}
```

## See also

- [01 — theme axes](../../specs/01-theme-axes.md) — binding rule for the axes this hook drives.
- [TweaksPanel](../shell/TweaksPanel.md) — visual UI for all tweaks.
- [How-to: Customise density](../../how-to/customise-density.md).
- [Reference: i18n](../i18n.md) — how locale interacts with i18next.
