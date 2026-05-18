---
title: "Statistic"
description: "KPI tile with title, value, optional prefix/suffix, precision, and locale-aware grouping."
diataxis: reference
audience: [developer]
status: stable
last-updated: 2026-05-18
lang: en
library: "@godxjp/ui"
library_version: 3.0.0
---

# Statistic

> KPI tile — title + headline number with optional prefix, suffix, decimal precision, and locale grouping.

## Usage

```tsx
import { Statistic, Card } from "@godxjp/ui"

<Card padding="default">
  <Statistic title="本日の出勤者" value={42} />
</Card>
<Card padding="default">
  <Statistic title="月次売上" value={1284560} prefix="¥" />
</Card>
<Card padding="default">
  <Statistic title="出勤率" value={96.8} precision={1} suffix="%" />
</Card>
```

## Props

### `Statistic` (root)

| Prop             | Type                                               | Default  | Description                                                      |
| ---------------- | -------------------------------------------------- | -------- | ---------------------------------------------------------------- |
| `title`          | `ReactNode`                                        | —        | Caption above the value                                          |
| `value`          | `number \| string`                                 | required | The headline value. Strings (e.g. `"—"`) bypass formatting       |
| `precision`      | `number`                                           | —        | Decimal places when `value` is a number                          |
| `prefix`         | `ReactNode`                                        | —        | Prepended to the value (`¥`, currency icon, …)                   |
| `suffix`         | `ReactNode`                                        | —        | Appended to the value (`%`, `/mo`, `+`, …)                       |
| `groupSeparator` | `boolean`                                          | `true`   | Locale-aware thousands grouping via `Intl.NumberFormat`          |
| `formatter`      | `(value: number \| string) => ReactNode`           | —        | Custom format function. Overrides `precision` + `groupSeparator` |
| `align`          | `"left" \| "right" \| "center"`                    | `"left"` | Text alignment for the tile                                      |
| `valueSize`      | `number`                                           | —        | Override font-size of the value in pixels                        |
| `...rest`        | `Omit<ComponentProps<"div">, "title" \| "prefix">` | —        | Standard `<div>` props                                           |

## Accessibility

- Renders a plain `<div>` group — screen readers read `title` then the number in document order.
- For comparative views (year-over-year, period deltas), pair the Statistic with a `<Tag color="success">` or `<Badge>` rather than encoding the delta in the value itself — colour-only signals fail WCAG SC 1.4.1 (Use of Color).
- When the value is a placeholder string (`"—"`, `"loading"`), include an `aria-label` on the wrapper or pair with a `<Spinner aria-label="…">` so assistive tech announces the loading state.

## Composition

```tsx
// KPI row inside a dashboard
<Flex gap="middle" wrap>
  <Card padding="default">
    <Statistic title="月次売上" value={1284560} prefix="¥" />
  </Card>
  <Card padding="default">
    <Statistic title="出勤率" value={96.8} precision={1} suffix="%" />
  </Card>
  <Card padding="default">
    <Statistic title="新規申請" value={12} suffix="+" />
  </Card>
</Flex>

// Locale-aware currency via formatter
<Statistic
  title="月次売上"
  value={1284560}
  formatter={(v) =>
    typeof v === "number"
      ? new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY" }).format(v)
      : v
  }
/>
```

## See also

- [Card](./Card.md) — typical wrapper for KPI grids.
- [Tag](./Tag.md) — pair for delta / status indication.
- Source: [`src/components/data-display/Statistic.tsx`](../../../src/components/data-display/Statistic.tsx)
