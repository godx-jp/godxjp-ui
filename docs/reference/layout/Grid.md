---
title: "Grid"
description: "Fixed-column or template-driven CSS Grid layout primitive."
diataxis: reference
library: "@godxjp/ui"
library_version: 3.0.0
component: Grid
status: stable
audience: [developer, agent]
last-updated: 2026-05-18
lang: en
---

# Grid

> Thin wrapper around CSS Grid for fixed-column and template-driven layouts.

## Usage

```tsx
import { Grid } from "@godxjp/ui";

<Grid cols={3} gap="middle">
  <Card>One</Card>
  <Card>Two</Card>
  <Card>Three</Card>
</Grid>;
```

## Props

| Prop        | Type                                       | Default | Description                                              |
| ----------- | ------------------------------------------ | ------- | -------------------------------------------------------- |
| `cols`      | `number \| string`                         | —       | Equal column count or raw `grid-template-columns` string |
| `rows`      | `number \| string`                         | —       | Equal row count or raw `grid-template-rows` string       |
| `gap`       | `number \| "small" \| "middle" \| "large"` | —       | Gap between grid cells                                   |
| `columnGap` | `number \| "small" \| "middle" \| "large"` | —       | Horizontal gap override                                  |
| `rowGap`    | `number \| "small" \| "middle" \| "large"` | —       | Vertical gap override                                    |
| `...rest`   | `ComponentProps<"div">`                    | —       | Native div props                                         |

## See Also

- [Flex](./Flex.md) — one-dimensional layout.
- [Masonry](./Masonry.md) — staggered column flow.
