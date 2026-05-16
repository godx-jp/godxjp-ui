---
diataxis: reference
library: "@godxjp/ui"
library_version: 3.0.0
hook: useTweaks
status: stable
audience: [developer, agent]
---

# useTweaks

> Persistent display-settings state — density, theme, tenant, locale, sidebar-collapsed.

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
  density: "compact" | "default" | "comfortable"
  theme: "light" | "dark"
  tenant: string           // matches a [data-tenant] CSS selector
  locale: GodxLocale       // "ja" | "en" | "vi" | "fil"
  sidebarCollapsed: boolean
}
```

### Density type

```ts
type Density = "compact" | "default" | "comfortable"
```

### Theme type

```ts
type Theme = "light" | "dark"
```

## Behavior

### Persistence

State is persisted to `localStorage` under the key `"godx.tweaks"` (changed from `"forge.tweaks"` in v3). On first load after a v2→v3 upgrade, the key is not found and state falls back to the defaults listed below.

| Key | Default |
|---|---|
| `density` | `"default"` |
| `theme` | `"light"` |
| `tenant` | `"godx"` |
| `locale` | `"ja"` (or browser navigator language prefix) |
| `sidebarCollapsed` | `false` |

### HTML attribute synchronisation

Every `setTweak` call triggers a `useEffect` that writes the new value to the `<html>` element's `data-*` attributes:

| Tweak key | HTML attribute |
|---|---|
| `theme` | `data-theme` |
| `density` | `data-density` |
| `tenant` | `data-tenant` |
| `locale` | `lang` |

This happens synchronously in the effect — CSS custom properties scoped to `[data-tenant]`, `[data-theme]`, and `[data-density]` update on the same render tick.

### Locale forwarding

When `locale` changes, `useTweaks` calls `i18n.changeLanguage(locale)` to update the shared i18next instance, and also writes to `localStorage["godx.locale"]`.

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

- [TweaksPanel](../shell/TweaksPanel.md) — visual UI for all tweaks.
- [How-to: Customise density](../../how-to/customise-density.md).
- [Reference: i18n](../i18n.md) — how locale interacts with i18next.
