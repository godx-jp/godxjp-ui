---
title: "IconButton"
description: "Square icon-only button with secondary / ghost / primary variants and sm / default / lg sizes."
diataxis: reference
audience: [developer]
status: stable
last-updated: 2026-05-18
lang: en
library: "@godxjp/ui"
library_version: 3.0.0
---

# IconButton

> Square button with icon-only content — secondary (default), ghost, and primary variants at 28 / 32 / 36 px.

## When to use IconButton vs Button

| Need | Use |
|---|---|
| A control whose label is text | **Button** |
| A control whose label is an icon only (with `aria-label`) | **IconButton** |
| An icon alongside a text label | **Button** with `startContent` |

IconButton maps to the canonical `.icon-btn` family in `shell.css` — a 32 × 32 box at `default`, `--radius-sm`, hairline border + `--background` fill for `secondary`. `aria-label` is mandatory because there is no visible text.

## Usage

```tsx
import { IconButton } from "@godxjp/ui"
import { ArrowLeft, MoreHorizontal, Check } from "lucide-react"

<IconButton aria-label="戻る"><ArrowLeft size={14} /></IconButton>
<IconButton variant="ghost" aria-label="More"><MoreHorizontal size={16} /></IconButton>
<IconButton variant="primary" size="lg" aria-label="Save"><Check size={18} /></IconButton>
```

## Props

### `IconButton`

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `"secondary" \| "ghost" \| "primary"` | `"secondary"` | Visual treatment |
| `size` | `"sm" \| "default" \| "lg"` | `"default"` | 28 / 32 / 36 px box |
| `asChild` | `boolean` | `false` | Render via Radix Slot (e.g. wrap a router `<Link>`) |
| `type` | `"button" \| "submit" \| "reset"` | `"button"` | HTML button type |
| `aria-label` | `string` | — | **Required** accessible name for the icon-only control |
| `children` | `ReactNode` | — | Icon node (typically a `lucide-react` icon) |
| `...rest` | `Omit<ComponentProps<"button">, "children">` | — | Standard `<button>` props |

## Accessibility

- **Always pass an accessible name** via one of `aria-label`, `aria-labelledby`, or `title`. Icon-only controls are unintelligible to screen readers without one.
- **Dev-mode warning**: when none of those three is supplied, the primitive emits a single `console.warn` per mount in non-production builds (`process.env.NODE_ENV !== "production"`). Production bundles strip the check at build time. The warning text:

  > `[@godxjp/ui] <IconButton> is missing an accessible name. Pass aria-label, aria-labelledby, or title …`

  This is a developer aid; TypeScript types intentionally keep the props optional because React's HTML types do, but treat the warning as a build-blocker for the consuming app.
- Renders a native `<button>` (or the `asChild` child element). Focus visible uses the framework's outline ring via tokens.
- Keyboard: Space and Enter activate the control.
- WCAG 2.1 SC 2.5.5 (Target Size): at `default` (32 px) and `sm` (28 px) the box is below the 44 × 44 px touch-target floor. On mobile layouts where touch is primary, prefer `size="lg"` or include an expanded touch area via padding.
- WCAG 2.1 SC 1.1.1: pair with a `<Tooltip>` when the icon meaning is not universally clear so sighted-but-unfamiliar users can still discover the function.

## Composition

```tsx
// IconButton as router Link (asChild pattern)
import { Link } from "react-router-dom"
<IconButton asChild aria-label="Settings">
  <Link to="/settings"><Settings size={16} /></Link>
</IconButton>

// IconButton inside a Tooltip
<Tooltip content="設定">
  <IconButton aria-label="Settings"><Settings size={16} /></IconButton>
</Tooltip>

// IconButton inside a PageHeader actions slot
<PageHeader
  title="月次レポート"
  actions={
    <>
      <IconButton variant="ghost" aria-label="絞り込み"><Filter size={14} /></IconButton>
      <IconButton variant="ghost" aria-label="ダウンロード"><Download size={14} /></IconButton>
    </>
  }
/>
```

## See also

- [Button](./Button.md) — text-labelled action atom.
- [Tooltip](./Tooltip.md) — common pairing for icon meaning.
- [PageHeader](./PageHeader.md) — primary host for IconButton stacks.
- Source: [`src/components/data-display/IconButton.tsx`](../../../src/components/data-display/IconButton.tsx)
