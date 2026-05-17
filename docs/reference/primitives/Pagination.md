---
title: "Pagination"
description: "Page jumper with first/prev/next/last, ellipsis collapsing, optional total label, and small/default sizes."
diataxis: reference
audience:
  - developer
status: draft
last-updated: 2026-05-17
lang: en
library: "@godxjp/ui"
library_version: 3.0.0
---

# Pagination

Page jumper. `total` + `pageSize` derive the page count; `value` (or `defaultValue`) selects which page is active (1-based, consistent with display semantics). Vocabulary per cardinal rule 23 §B: `value` / `defaultValue` / `onValueChange`; `size` (`small` / `default`); `variant` (`default` / `simple` — simple shows only `‹ N/M ›` without per-page buttons); `justify` reused from Flex.

## Import

```ts
import { Pagination } from "@godxjp/ui/components/primitives"
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `total *` | `number` | — | Total number of items |
| `pageSize` | `number` | `10` | Items per page |
| `value` | `number` | — | Controlled current page (1-based) |
| `defaultValue` | `number` | `1` | Uncontrolled initial page |
| `onValueChange` | `(page: number) => void` | — | Called when the page changes |
| `size` | `"small" \| "default"` | `"default"` | Dimensional scale |
| `variant` | `"default" \| "simple"` | `"default"` | Full button row or compact `‹ N/M ›` |
| `justify` | `"start" \| "center" \| "end" \| "between"` | — | Horizontal alignment (reuses Flex `justify`) |
| `showTotal` | `boolean \| ((total, range) => ReactNode)` | `false` | Render the total-row label |
| `siblings` | `number` | `1` | Number of sibling pages around current |
| `disabled` | `boolean` | `false` | Disable interaction |

## Example

```tsx
<Pagination total={120} pageSize={10} defaultValue={3} />
<Pagination total={2481} pageSize={50} defaultValue={5} showTotal />
```

## Related

- Story catalogue: [`Pagination` stories](../../../src/stories/navigation/Pagination.stories.tsx)
- Source: [`src/components/navigation/Pagination.tsx`](../../../src/components/navigation/Pagination.tsx)
- Cardinal rule 23 §B prop vocabulary: [`CLAUDE.md` §23.B](../../../CLAUDE.md#23)

## Status

`draft` — auto-generated stub. Detailed prop docs / accessibility notes / design rationale still to be filled in.
