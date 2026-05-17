---
title: "IconButton"
description: "Square icon-only button with secondary / ghost / primary variants and sm / default / lg sizes."
diataxis: reference
audience:
  - developer
status: draft
last-updated: 2026-05-17
lang: en
library: "@godxjp/ui"
library_version: 3.0.0
---

# IconButton

Square button with icon-only content. Maps to the canonical `.icon-btn` family in `shell.css` (32 × 32 box, `--radius-sm`, hairline border + `--background` fill by default). Three variants — `secondary` (default), `ghost` (transparent / borderless), `primary` (filled brand). `aria-label` is required for accessibility — icon-only controls must carry a discoverable name.

## Import

```ts
import { IconButton } from "@godxjp/ui/components/primitives"
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `"secondary" \| "ghost" \| "primary"` | `"secondary"` | Visual treatment |
| `size` | `"sm" \| "default" \| "lg"` | `"default"` | 28 / 32 / 36 px box |
| `asChild` | `boolean` | `false` | Render via Radix Slot (e.g. wrap a router `<Link>`) |
| `aria-label *` | `string` | — | Accessible name (required for icon-only controls) |
| `children` | `ReactNode` | — | Icon node |
| `...rest` | `ComponentProps<"button">` | — | Standard `<button>` props |

## Example

```tsx
<IconButton aria-label="戻る"><ArrowLeft size={14} /></IconButton>
<IconButton variant="ghost" aria-label="More"><MoreHorizontal size={16} /></IconButton>
<IconButton variant="primary" size="lg" aria-label="Save"><Check size={18} /></IconButton>
```

## Related

- Story catalogue (within PageHeader): [`PageHeader` stories](../../../src/stories/data-display/PageHeader.stories.tsx)
- Source: [`src/components/data-display/IconButton.tsx`](../../../src/components/data-display/IconButton.tsx)
- Cardinal rule 23 §B prop vocabulary: [`CLAUDE.md` §23.B](../../../CLAUDE.md#23)

## Status

`draft` — auto-generated stub. Detailed prop docs / accessibility notes / design rationale still to be filled in.
