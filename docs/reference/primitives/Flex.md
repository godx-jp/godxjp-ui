---
title: "Flex"
description: "Flexbox container with prop-driven config (direction, gap, justify, align, wrap)."
diataxis: reference
audience:
  - developer
status: draft
last-updated: 2026-05-17
lang: en
library: "@godxjp/ui"
library_version: 3.0.0
---

# Flex

Flexbox container with prop-driven config. Replaces ad-hoc `<div className="flex items-center gap-2 …">` patterns. Prop names mirror Ant Design's `<Flex>` API (`vertical`, `gap`, `justify`, `align`, `wrap`); values map onto CSS flex via tokens (`small` / `middle` / `large` → `--spacing-2 / -3 / -4`). Purely structural — no size / variant / color axes.

## Import

```ts
import { Flex } from "@godxjp/ui/components/primitives"
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `vertical` | `boolean` | `false` | Stack direction — `false` = horizontal row, `true` = vertical column |
| `gap` | `number \| "small" \| "middle" \| "large"` | — | Gap between children. Token name or pixel number |
| `justify` | `"start" \| "end" \| "center" \| "space-between" \| "space-around" \| "space-evenly"` | — | Main-axis alignment |
| `align` | `"start" \| "end" \| "center" \| "stretch" \| "baseline"` | — | Cross-axis alignment |
| `wrap` | `boolean \| "nowrap" \| "wrap" \| "wrap-reverse"` | `false` | Wrap mode |
| `flex` | `string \| number` | — | `flex` value for the container itself (rare — usually parent sets it) |
| `...rest` | `ComponentProps<"div">` | — | Standard `<div>` props |

## Example

```tsx
<Flex gap="middle">
  <Box label="A" /><Box label="B" /><Box label="C" />
</Flex>
```

## Related

- Story catalogue: [`Flex` stories](../../../src/stories/layout/Flex.stories.tsx)
- Source: [`src/components/layout/Flex.tsx`](../../../src/components/layout/Flex.tsx)
- Cardinal rule 23 §B prop vocabulary: [`CLAUDE.md` §23.B](../../../CLAUDE.md#23)

## Status

`draft` — auto-generated stub. Detailed prop docs / accessibility notes / design rationale still to be filled in.
