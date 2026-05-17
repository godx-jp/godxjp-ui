---
title: "Statistic"
description: "Ant-Design KPI tile with title, value, prefix/suffix slots, and numeric formatting hooks."
diataxis: reference
audience:
  - developer
status: draft
last-updated: 2026-05-17
lang: en
library: "@godxjp/ui"
library_version: 3.0.0
---

# Statistic

Ant-Design-shaped KPI tile. Three slots: `title` (micro-caption above the value), `value` with optional `prefix` / `suffix`, and `precision` / `formatter` for numeric formatting. Locale-aware grouping defaults on via `Intl.NumberFormat`. All visual values flow through `.statistic-*` classes — stories don't restyle.

## Import

```ts
import { Statistic } from "@godxjp/ui/components/primitives"
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `title` | `ReactNode` | — | Micro-caption above the value |
| `value *` | `number \| string` | — | The headline number / text |
| `precision` | `number` | — | Decimal places (when value is a number) |
| `prefix` | `ReactNode` | — | Prepended to value (e.g. `¥`, icon) |
| `suffix` | `ReactNode` | — | Appended to value (e.g. `%`, `/mo`) |
| `groupSeparator` | `boolean` | `true` | Use `Intl.NumberFormat` grouping |
| `formatter` | `(value: number \| string) => ReactNode` | — | Custom format function; overrides `precision` + `groupSeparator` |
| `align` | `"left" \| "right" \| "center"` | `"left"` | Tile text alignment |
| `valueSize` | `number` | — | Font size of the value in px |

## Example

```tsx
<Card padding="default">
  <Statistic title="本日の出勤者" value={42} />
</Card>
```

## Related

- Story catalogue: [`Statistic` stories](../../../src/stories/data-display/Statistic.stories.tsx)
- Source: [`src/components/data-display/Statistic.tsx`](../../../src/components/data-display/Statistic.tsx)
- Cardinal rule 23 §B prop vocabulary: [`CLAUDE.md` §23.B](../../../CLAUDE.md#23)

## Status

`draft` — auto-generated stub. Detailed prop docs / accessibility notes / design rationale still to be filled in.
