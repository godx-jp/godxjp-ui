---
title: "List"
description: "Header + items + optional footer surface — data-driven (dataSource + renderItem) or compositional (ListItem children); grid mode via cols."
diataxis: reference
audience:
  - developer
status: draft
last-updated: 2026-05-17
lang: en
library: "@godxjp/ui"
library_version: 3.0.0
---

# List

Header + items + optional footer surface. Two consumption modes: data-driven (`dataSource` + `renderItem`) or compositional (`<ListItem>` children inline). Vocabulary per cardinal rule 23 §B: `size` for dimensional scale; `bordered` boolean for surface treatment; `cols` for grid mode (column count). Never Ant's `itemLayout` / `grid` object — `cols` is the one knob.

## Import

```ts
import { List, ListItem } from "@godxjp/ui/components/primitives"
```

## Props (`List`)

| Prop | Type | Default | Description |
|---|---|---|---|
| `dataSource` | `T[]` | — | Data array (required for data-driven mode) |
| `renderItem` | `(item: T, index: number) => ReactNode` | — | Render fn per datum |
| `header` | `ReactNode` | — | Optional header content |
| `footer` | `ReactNode` | — | Optional footer (e.g. pagination) |
| `title` | `ReactNode` | — | Heading above the list |
| `empty` | `ReactNode` | `"No data"` | Empty state when `dataSource` is empty |
| `size` | `"small" \| "default" \| "large"` | `"default"` | Dimensional scale |
| `bordered` | `boolean` | `false` | Wrap in a bordered surface |
| `split` | `boolean` | `bordered` | Show dividers between items |
| `loading` | `boolean` | `false` | Render a loading placeholder |
| `cols` | `number` | — | Grid mode — number of columns |

## Example

```tsx
<List
  title="社員一覧"
  dataSource={employees}
  renderItem={(emp) => (
    <ListItem
      avatar={<Avatar src={emp.photo} />}
      title={emp.name}
      description={emp.role}
    />
  )}
/>
```

## Related

- Story catalogue: [`List` stories](../../../src/stories/data-display/List.stories.tsx)
- Source: [`src/components/data-display/List.tsx`](../../../src/components/data-display/List.tsx)
- Cardinal rule 23 §B prop vocabulary: [`CLAUDE.md` §23.B](../../../CLAUDE.md#23)

## Status

`draft` — auto-generated stub. Detailed prop docs / accessibility notes / design rationale still to be filled in.
