---
title: "PageHeader"
description: "Page chrome strip with title + subtitle + breadcrumb + actions + tabs + body slots."
diataxis: reference
audience: [developer]
status: stable
last-updated: 2026-05-18
lang: en
library: "@godxjp/ui"
library_version: 3.0.0
---

# PageHeader

> Canonical page chrome strip with six slots — `title`, `subtitle`, `breadcrumb`, `actions`, `tabs`, `body`.

## Usage

```tsx
import { PageHeader, Button } from "@godxjp/ui"

<PageHeader title="従業員シフト · カレンダー" />
```

## Props

### `PageHeader`

| Prop | Type | Default | Description |
|---|---|---|---|
| `title` | `ReactNode` | required | Primary h1 text (`.ph-h1` — 16 px / 500 weight, ellipsis truncate) |
| `subtitle` | `ReactNode` | — | Baseline-adjacent muted copy (`.sub`) |
| `breadcrumb` | `ReactNode` | — | Row above the title — auto-promotes layout to `stacked` |
| `actions` | `ReactNode` | — | Right-aligned slot (icon buttons, buttons, segmented controls) |
| `tabs` | `ReactNode` | — | Second-row tab strip (`.ph-tabs`) — auto-promotes layout to `stacked` |
| `body` | `ReactNode` | — | Third-row descriptive body (`.ph-body`) |
| `variant` | `"compact" \| "overflow" \| "stacked"` | auto | Layout variant. `compact` (1 row), `overflow` (1 row + overflow icons), `stacked` (2 rows). Auto-resolves to `stacked` when `breadcrumb` or `tabs` is present |
| `padding` | `"tight" \| "default" \| "cozy" \| "none"` | `"default"` | Internal-spacing density (shares the `<Card>` vocabulary) |
| `...rest` | `Omit<HTMLAttributes<HTMLElement>, "title">` | — | Standard `<section>` props |

The root element is a `<section>` with `.ph` plus the variant + padding classes.

## Accessibility

- The `<h1>` rendered for `title` should be the only `<h1>` on the page — semantic landmarks rely on a single top-level heading per document.
- When the `actions` slot contains icon-only controls, those controls MUST have `aria-label` (cardinal rule for `<IconButton>`). Pair recurring icons with `<SimpleTooltip>` so sighted-but-unfamiliar users discover their function.
- `breadcrumb` is decorative chrome — wrap with `<Breadcrumb>` (which renders a `<nav aria-label="Breadcrumb">`) so screen readers identify the landmark.
- `tabs` injects a second-row tab strip — pair with `<Tabs orientation="horizontal">` so the active tab is announced.

## Composition

```tsx
// With breadcrumb + actions (auto-stacks)
<PageHeader
  breadcrumb={
    <Breadcrumb>
      <BreadcrumbItem href="#">GoDX</BreadcrumbItem>
      <BreadcrumbSep />
      <BreadcrumbItem href="#">勤怠</BreadcrumbItem>
      <BreadcrumbSep />
      <BreadcrumbItem current>月次レポート</BreadcrumbItem>
    </Breadcrumb>
  }
  title="店舗別 · 月次レポート"
  actions={
    <>
      <Button size="small" variant="secondary" startContent={<Filter size={14} aria-hidden />}>
        絞り込み
      </Button>
      <Button size="small" variant="primary" startContent={<Plus size={14} aria-hidden />}>
        一括割当
      </Button>
    </>
  }
/>

// Stacked variant with a second-row tab strip
<PageHeader
  variant="stacked"
  title="店舗別 · 月次レポート"
  tabs={
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">概要</TabsTrigger>
        <TabsTrigger value="employees">従業員</TabsTrigger>
        <TabsTrigger value="settings">設定</TabsTrigger>
      </TabsList>
    </Tabs>
  }
/>
```

## See also

- [Breadcrumb](./Breadcrumb.md) — hierarchical location slot.
- [Tabs](./Tabs.md) — second-row tab strip.
- [IconButton](./IconButton.md) — `actions` slot's primary inhabitant.
- [Card](./Card.md) — shares the `padding` vocabulary.
- Source: [`src/components/data-display/PageHeader.tsx`](../../../src/components/data-display/PageHeader.tsx)
