---
diataxis: reference
library: "@godxjp/ui"
library_version: 3.0.0
component: TweaksPanel
status: stable
audience: [developer, agent]
---

# TweaksPanel

> Right-side settings drawer that exposes density, theme, tenant, locale, and sidebar-collapsed toggles.

## Usage

```tsx
import { TweaksPanel } from "@godxjp/ui/components/shell"

<TweaksPanel open={tweaksOpen} onOpenChange={setTweaksOpen} />
```

`TweaksPanel` reads and writes state via `useTweaks` internally — no state props needed.

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `open` | `boolean` | required | Controlled open state |
| `onOpenChange` | `(open: boolean) => void` | required | Called when the panel opens or closes |

## Layout slots

The panel renders three sections:

1. **Display** — density (compact / default / comfortable) and theme (light / dark) radio groups, plus sidebar-collapsed toggle.
2. **Product** — tenant select dropdown (built-in `PRODUCTS` list).
3. **Locale** — language radio group (ja / en / vi / fil).

## Default behavior

- State is persisted to `localStorage` via `useTweaks` under the key `"godx.tweaks"`.
- Changes to `theme`, `density`, `tenant`, and `locale` are reflected on `<html>` attributes immediately.
- The locale change is forwarded to the shared i18next instance — the UI re-renders translated strings without a page reload.
- The panel slides in from the right (uses Radix Dialog, not Sheet, for accessibility).

## Accessibility

- `role="dialog"` with `aria-modal="true"`.
- Panel title is visually rendered as `t("tweaks.title")` and announced as the dialog label.
- Escape closes the panel.
- Focus is trapped while open.
- The density + language radio groups use `aria-pressed` on segment buttons.
- WCAG 2.1 SC 4.1.2 (Name, Role, Value): all interactive controls have accessible names.

## See also

- [Reference: useTweaks](../hooks/useTweaks.md) — the state hook used internally.
- [Topbar](./Topbar.md) — opens TweaksPanel via `onTweaksOpen` callback.
- [How-to: Customise density](../../how-to/customise-density.md).
