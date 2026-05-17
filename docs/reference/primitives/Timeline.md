---
title: "Timeline"
description: "Chronological event rail with three visual variants — list (vertical rail), branching (approval pipeline), feed (avatar-led social style)."
diataxis: reference
audience:
  - developer
status: draft
last-updated: 2026-05-17
lang: en
library: "@godxjp/ui"
library_version: 3.0.0
---

# Timeline

Chronological event rail. Three visual variants, each backed by an existing CSS atom shipped with the dxs-kintai card canon: `list` (default vertical rail with markers, `.tl-list` + `.tl-item`); `branching` (approval-pipeline shape with left-aligned timestamp, dot, body, `.tl-br`); `feed` (social-style avatar feed, `.tl-feed`). Vocabulary per cardinal rule 23 §B: `variant` (visual treatment); per-item `color` (semantic role); `current` boolean (marks the active item); never `mode` / `position` / `type` / `dot` synonyms.

## Import

```ts
import { Timeline, TimelineItem } from "@godxjp/ui/components/primitives"
```

## Props (`Timeline`)

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `"list" \| "branching" \| "feed"` | `"list"` | Visual variant |
| `reverse` | `boolean` | `false` | Render items last-first |
| `pending` | `ReactNode` | — | "Ongoing" item rendered after the last child |

## Props (`TimelineItem`)

| Prop | Type | Default | Description |
|---|---|---|---|
| `color` | `"default" \| "primary" \| "success" \| "warning" \| "destructive" \| "info" \| "attention"` | `"default"` | Marker colour |
| `current` | `boolean` | `false` | Marks the active item |
| `time` | `ReactNode` | — | Timestamp slot |
| `title` | `ReactNode` | — | Headline |
| `description` | `ReactNode` | — | Body text |
| `avatar` | `ReactNode` | — | Avatar (used by `feed` variant) |

## Example

```tsx
<Timeline>
  <TimelineItem color="success" title="申請を提出" time="09:30" description="2026年5月10日 月曜日" />
  <TimelineItem color="primary" current title="承認待ち" time="09:32" />
  <TimelineItem title="支払い" time="—" />
</Timeline>
```

## Related

- Story catalogue: [`Timeline` stories](../../../src/stories/data-display/Timeline.stories.tsx)
- Source: [`src/components/data-display/Timeline.tsx`](../../../src/components/data-display/Timeline.tsx)
- Cardinal rule 23 §B prop vocabulary: [`CLAUDE.md` §23.B](../../../CLAUDE.md#23)

## Status

`draft` — auto-generated stub. Detailed prop docs / accessibility notes / design rationale still to be filled in.
