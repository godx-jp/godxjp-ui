---
title: "Timeline"
description: "Chronological event rail with three visual variants — list (vertical rail), branching (approval pipeline), feed (avatar-led social style)."
diataxis: reference
audience: [developer]
status: stable
last-updated: 2026-05-18
lang: en
library: "@godxjp/ui"
library_version: 3.0.0
---

# Timeline

> Chronological event rail with three visual variants — `list` (default), `branching`, and `feed`.

Each variant is backed by an existing CSS atom shipped with the card-sections canon:

- **`list`** — vertical rail with markers (`.tl-list` + `.tl-item`).
- **`branching`** — approval-pipeline shape with left-aligned timestamp, dot, body (`.tl-br`).
- **`feed`** — social-style avatar feed (`.tl-feed`).

Vocabulary follows cardinal rule 23 §B: `variant` (visual treatment), per-item `color` (semantic role), `current` boolean (active item). Never `mode` / `position` / `type` / `dot` synonyms.

## When to use Timeline vs Steps

| Need | Use |
|---|---|
| Chronology — a record of what happened at which time | **Timeline** |
| Progress through a finite workflow with a "current" step | [Steps](./Steps.md) |
| Single ongoing operation with percent progress | [Progress](./Progress.md) |
| Recent activity feed with avatars | **Timeline** `variant="feed"` |

Steps shows where you ARE in a defined process; Timeline shows what HAS HAPPENED so far.

## Usage

```tsx
import { Timeline, TimelineItem } from "@godxjp/ui"

<Timeline>
  <TimelineItem
    color="success"
    title="申請を提出"
    time="09:30"
    description="2026年5月10日 月曜日"
  />
  <TimelineItem
    color="success"
    title="部長確認"
    time="10:15"
    description="経理部 田中部長"
  />
  <TimelineItem
    color="primary"
    current
    title="承認待ち"
    time="進行中"
    description="役員審査 — 概ね2営業日"
  />
  <TimelineItem color="default" title="支給予定" description="承認後の月末に振込" />
  <TimelineItem color="default" title="完了" description="経費清算終了" />
</Timeline>
```

## Props

### `Timeline` (root)

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `"list" \| "branching" \| "feed"` | `"list"` | Visual treatment |
| `reverse` | `boolean` | `false` | Render items last-first |
| `pending` | `ReactNode` | — | Trailing "ongoing" marker appended after the last child |
| `className` | `string` | — | Merged onto the variant root (`.tl-list` / `.tl-br` / `.tl-feed`) |
| `children` | `ReactNode` | — | `<TimelineItem>` children |

### `TimelineItem`

| Prop | Type | Default | Description |
|---|---|---|---|
| `color` | `"default" \| "primary" \| "success" \| "warning" \| "destructive" \| "info" \| "attention"` | `"default"` | Marker semantic role |
| `current` | `boolean` | `false` | Pulsing "current" marker — visually emphasises the active item |
| `time` | `ReactNode` | — | Timestamp slot — right label in `branching`, inline `.ts` in `list` / `feed` |
| `avatar` | `ReactNode` | — | Avatar slot (used by `feed` variant) |
| `title` | `ReactNode` | — | Headline |
| `description` | `ReactNode` | — | Body text |
| `className` | `string` | — | Merged onto the per-variant item root |

## Accessibility

- `list` renders a real `<ul>` / `<li>` so screen readers announce item count.
- `branching` and `feed` render `<div>` shells (visually they're not "lists" — they're rows / cards) — pair the timeline with a heading or `<section aria-label="…">` so the chronology has a name.
- `current` is decorative; mirror the meaning in the `description` text (e.g. "承認待ち — 進行中") so non-visual users understand the workflow position.
- WCAG 2.1 SC 1.4.1 (Use of Color): the marker colour is supplemental. Always carry the semantic meaning in the `title` / `description` text — colour alone is insufficient.

## Composition

```tsx
// Branching variant — approval pipeline
<Timeline variant="branching">
  <TimelineItem color="success" time="05/08 09:30" title="申請受領"
    description="申請ID #2847 を受領しました" />
  <TimelineItem color="success" time="05/08 11:02" title="一次承認"
    description="マネージャー 山田 健 によって承認" />
  <TimelineItem color="primary" current time="05/09 14:30" title="役員審査中"
    description="財務担当 佐藤専務が確認中" />
  <TimelineItem color="attention" time="予定" title="経理処理"
    description="承認後 翌営業日" />
</Timeline>

// Feed variant — avatar-led social timeline
<Timeline variant="feed">
  <TimelineItem
    avatar={<Avatar name="田中 美香" size="sm" />}
    title="田中 美香 が新規プロジェクトを作成しました"
    time="2時間前"
    description="「2026年Q3 渋谷店リニューアル」"
  />
</Timeline>

// Reverse + trailing pending marker
<Timeline reverse pending="次の同期を待機中…">
  <TimelineItem color="success" title="データベース同期" time="08:00" />
  <TimelineItem color="success" title="バックアップ作成" time="08:15" />
</Timeline>
```

## See also

- [Steps](./Steps.md) — progress through a finite workflow with a "current" step.
- [Progress](./Progress.md) — single-operation percentage indicator.
- [List](./List.md) — non-chronological feed.
- Source: [`src/components/data-display/Timeline.tsx`](../../../src/components/data-display/Timeline.tsx)
