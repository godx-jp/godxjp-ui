---
title: "Card"
description: "Single-component surface container with header, body, footer, tone, accent, and padding props."
diataxis: reference
library: "@godxjp/ui"
library_version: 3.0.0
component: Card
status: stable
audience: [developer, agent]
last-updated: 2026-05-18
lang: en
---

# Card

> Surface container rendered through one `Card` component.

## Usage

```tsx
import { Card } from "@godxjp/ui";

<Card
  title="Pull requests"
  subtitle="Open / merged this week"
  footer="Updated 5 minutes ago"
>
  {/* table, chart, list, etc. */}
</Card>;
```

## Exports

| Export      | Description           |
| ----------- | --------------------- |
| `Card`      | Single card component |
| `CardProps` | Props for `Card`      |

## Props

| Prop        | Type                                       | Description                              |
| ----------- | ------------------------------------------ | ---------------------------------------- |
| `title`     | `ReactNode`                                | Header title                             |
| `subtitle`  | `ReactNode`                                | Header secondary text below the title    |
| `kicker`    | `ReactNode`                                | Small label above the title              |
| `meta`      | `ReactNode`                                | Right-aligned header metadata            |
| `extra`     | `ReactNode`                                | Right-aligned header action/status slot  |
| `children`  | `ReactNode`                                | Body content                             |
| `footer`    | `ReactNode`                                | Footer with divider and muted background |
| `actions`   | `ReactNode`                                | Right-aligned footer action bar          |
| `padding`   | `"tight" \| "default" \| "cozy" \| "none"` | Card padding density                     |
| `tone`      | `"default" \| "muted" \| "outline-only"`   | Surface tone                             |
| `accent`    | semantic accent                            | Left edge or featured ring               |
| `band`      | semantic band                              | Top color strip                          |
| `hoverable` | `boolean`                                  | Border/shadow hover affordance           |

## Patterns

```tsx
<Card title="Open issues" subtitle="Across all projects">
  <Statistic value={42} />
</Card>

<Card
  title="Deployments"
  meta="3 running"
  extra={<Badge color="success">Healthy</Badge>}
  actions={<Button size="small">Open</Button>}
>
  <List items={deployments} />
</Card>
```

## Accessibility

- `title` renders as the card heading. Keep surrounding page heading levels coherent.
- If the card has no visible title, give the card an accessible name with `aria-label` or `aria-labelledby`.
