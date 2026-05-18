---
title: "Masonry"
description: "Staggered column-flow layout primitive."
diataxis: reference
library: "@godxjp/ui"
library_version: 3.0.0
component: Masonry
status: stable
audience: [developer, agent]
last-updated: 2026-05-18
lang: en
---

# Masonry

> Staggered column flow for cards with uneven heights.

## Usage

```tsx
import { Masonry, MasonryItem } from "@godxjp/ui";

<Masonry cols={3} gap="middle">
  <MasonryItem>
    <Card>Short</Card>
  </MasonryItem>
  <MasonryItem>
    <Card>Taller content</Card>
  </MasonryItem>
</Masonry>;
```

## Props

### `Masonry`

| Prop      | Type                                       | Default  | Description               |
| --------- | ------------------------------------------ | -------- | ------------------------- |
| `cols`    | `number`                                   | `3`      | Number of columns         |
| `gap`     | `number \| "small" \| "middle" \| "large"` | `middle` | Gap between columns/items |
| `...rest` | `ComponentProps<"div">`                    | —        | Native div props          |

### `MasonryItem`

| Prop      | Type                    | Default | Description      |
| --------- | ----------------------- | ------- | ---------------- |
| `...rest` | `ComponentProps<"div">` | —       | Native div props |

## See Also

- [Grid](./Grid.md) — fixed-column CSS Grid.
- [Flex](./Flex.md) — one-dimensional layout.
