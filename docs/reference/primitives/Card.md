---
title: "Card"
diataxis: reference
library: "@godxjp/ui"
library_version: 3.0.0
component: Card
status: stable
audience: [developer, agent]
lang: en
---

# Card

> Surface container for grouped content — the canonical GoDX content block.

## Usage

```tsx
import { Card, CardHeader, CardTitle, CardSubtitle, CardContent } from "@godxjp/ui"

<Card>
  <CardHeader>
    <CardTitle>Pull requests</CardTitle>
    <CardSubtitle>Open / merged this week</CardSubtitle>
  </CardHeader>
  <CardContent>
    {/* table, chart, list, etc. */}
  </CardContent>
</Card>
```

## Exports

| Export | Element | CSS class |
|---|---|---|
| `Card` | `<div>` | `.card` |
| `CardHeader` | `<div>` | `.card-header` |
| `CardTitle` | `<h3>` | `.card-title` |
| `CardSubtitle` | `<p>` | `.card-subtitle` |
| `CardContent` | `<div>` | (no class — pass-through wrapper) |

## Props

Each sub-component accepts all standard HTML attributes for its element type plus `className` for extension.

| Component | Extra props |
|---|---|
| `Card` | `ComponentProps<"div">` |
| `CardHeader` | `ComponentProps<"div">` |
| `CardTitle` | `ComponentProps<"h3">` |
| `CardSubtitle` | `CardSubtitleProps` extends `ComponentProps<"p">` |
| `CardContent` | `ComponentProps<"div">` |

## Accessibility

- `CardTitle` renders an `<h3>`. Ensure heading levels are correct in your document outline — if the card is inside a section that already uses `<h2>`, the title is semantically correct at `h3`.
- `CardContent` is a plain `<div>` — annotate it with `aria-label` or `aria-labelledby` if the card's purpose is not clear from context.
- Background token `--card` ensures sufficient contrast from `--card-foreground` in both light and dark modes.

## Composition

```tsx
// KPI card with icon and delta
<Card>
  <CardHeader>
    <CardTitle>Open issues</CardTitle>
    <CardSubtitle>Across all projects</CardSubtitle>
  </CardHeader>
  <CardContent>
    <div className="kpi">
      <span className="kpi-value">42</span>
      <span className="kpi-delta">+3 since yesterday</span>
    </div>
  </CardContent>
</Card>

// Table card
<Card>
  <CardHeader>
    <CardTitle>Deployments</CardTitle>
  </CardHeader>
  <CardContent>
    <Table>…</Table>
  </CardContent>
</Card>
```

## See also

- [Table](./Table.md) — frequent Card composition.
- [tokens.md](../tokens.md) — `--card`, `--card-foreground`, `--card-header-border` values.
