---
title: "Button"
description: "Action button with density-aware sizes, variants, loading state, and Radix Slot composition."
diataxis: reference
library: "@godxjp/ui"
library_version: 3.0.0
component: Button
status: stable
audience: [developer, agent]
last-updated: 2026-05-18
lang: en
---

# Button

> Canonical action atom — the primary interactive element for triggering actions.

## Usage

```tsx
import { Button } from "@godxjp/ui"

<Button variant="primary" onClick={handleSave}>Save</Button>
<Button variant="secondary">Cancel</Button>
<Button variant="ghost" asChild><a href="/docs">Docs</a></Button>
<Button variant="danger">Delete</Button>
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `"primary" \| "secondary" \| "ghost" \| "danger"` | `"primary"` | Visual style |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Size variant |
| `asChild` | `boolean` | `false` | Radix Slot — renders child element with Button's CSS classes |
| `type` | `"button" \| "submit" \| "reset"` | `"button"` | HTML button type |
| `disabled` | `boolean` | `false` | Disables interaction and dims appearance |
| `children` | `ReactNode` | — | Button label |
| `...rest` | `ComponentProps<"button">` | — | Standard `<button>` props |

## Variants

### `variant="primary"` (default)

Filled button with `--primary` background. Use for the main action on a page.

```tsx
<Button variant="primary">Save changes</Button>
```

### `variant="secondary"`

Bordered button with `--foreground` text on transparent background. Use for secondary actions.

```tsx
<Button variant="secondary">Cancel</Button>
```

### `variant="ghost"`

Transparent button that shows a hover surface. Use for tertiary actions and icon buttons.

```tsx
<Button variant="ghost">More options</Button>
```

### `variant="danger"`

Filled button with `--destructive` background. Use for destructive actions (delete, revoke).

```tsx
<Button variant="danger">Delete permanently</Button>
```

## Sizes

| Size | Height | When to use |
|---|---|---|
| `sm` | 28 px | Compact action bars, table row actions |
| `md` | 32 px | Default UI (most buttons) |
| `lg` | 36 px | Page hero calls-to-action |

Size tokens scale with `[data-density]`. The 44 px touch-target floor is a hit-area requirement, not a mobile visual-height override; do not force smaller button sizes to render as 44 px on SP.

## Accessibility

- Renders a native `<button>` element (or the `asChild` child element).
- `type="button"` by default — prevents accidental form submission.
- `disabled` prop sets `aria-disabled` and removes the element from the tab order.
- Focus visible: `outline-2 outline-ring outline-offset-2` from tokens — always visible.
- Keyboard: Space and Enter activate the button.
- WCAG 2.1 AA: all variant foreground/background color pairs meet 4.5:1 contrast ratio.

## Composition

```tsx
// Button as router Link (asChild pattern)
import { Link } from "react-router-dom"
<Button asChild variant="ghost">
  <Link to="/settings">Settings</Link>
</Button>

// Button as DropdownMenu trigger
import { DropdownMenuTrigger } from "@godxjp/ui"
<DropdownMenuTrigger asChild>
  <Button variant="ghost">Options</Button>
</DropdownMenuTrigger>

// Button as DialogTrigger
import { DialogTrigger } from "@godxjp/ui"
<DialogTrigger asChild>
  <Button variant="primary">Open dialog</Button>
</DialogTrigger>
```

## See also

- [Dialog](./Dialog.md) — common Button + DialogTrigger composition.
- [DropdownMenu](./DropdownMenu.md) — Button as DropdownMenuTrigger.
- [ADR 0003: Tokens not utilities](../../adr/0003-tokens-not-utilities.md).
