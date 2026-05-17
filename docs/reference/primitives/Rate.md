---
title: "Rate"
description: "Star-rating primitive — read-write or read-only, allow-half precision, custom icon slot."
diataxis: reference
audience:
  - developer
status: draft
last-updated: 2026-05-17
lang: en
library: "@godxjp/ui"
library_version: 3.0.0
---

# Rate

Star-rating primitive (decorative input). The rendered row uses Lucide `Star` filled vs hollow (and `StarHalf` when `allowHalf` resolves to a 0.5 fraction). When a custom `icon` is provided, the custom node is reused for filled / hollow alike with `data-filled` driving the color via CSS. Vocabulary per cardinal rule 23 §B: `value` / `defaultValue` / `onValueChange` (Radix-style); `size`; `disabled`, `readOnly` (matches Input); `icon` slot (never Ant's `character`).

## Import

```ts
import { Rate } from "@godxjp/ui/components/primitives"
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `number` | — | Controlled rating |
| `defaultValue` | `number` | `0` | Uncontrolled initial rating |
| `onValueChange` | `(value: number) => void` | — | Called when the rating changes |
| `count` | `number` | `5` | Max number of stars |
| `allowHalf` | `boolean` | `false` | Left-half-click commits a 0.5 step |
| `icon` | `ReactNode` | `<Star />` | Custom icon node |
| `size` | `"small" \| "default" \| "large"` | `"default"` | Dimensional scale |
| `disabled` | `boolean` | `false` | Disable interaction |
| `readOnly` | `boolean` | `false` | Display-only (no hover effect) |

## Example

```tsx
<Rate defaultValue={3.5} allowHalf />
```

## Related

- Story catalogue: [`Rate` stories](../../../src/stories/data-entry/Rate.stories.tsx)
- Source: [`src/components/data-entry/Rate.tsx`](../../../src/components/data-entry/Rate.tsx)
- Cardinal rule 23 §B prop vocabulary: [`CLAUDE.md` §23.B](../../../CLAUDE.md#23)

## Status

`draft` — auto-generated stub. Detailed prop docs / accessibility notes / design rationale still to be filled in.
