---
title: "PageHeader"
description: "Page chrome strip with title + subtitle + breadcrumb + actions + tabs + body slots."
diataxis: reference
audience:
  - developer
status: draft
last-updated: 2026-05-17
lang: en
library: "@godxjp/ui"
library_version: 3.0.0
---

# PageHeader

Canonical page chrome strip with `title`, `subtitle`, `breadcrumb`, `actions`, `tabs`, and `body` slots. The `variant` prop (`compact` / `overflow` / `stacked`) selects the layout; passing `breadcrumb` or `tabs` auto-promotes `compact` to `stacked`. Atomic CSS classes (`.ph`, `.ph-bar`, `.ph-title`, `.ph-actions`, `.ph-tabs`, `.ph-body`) live in `shell.css`.

## Import

```ts
import { PageHeader } from "@godxjp/ui/components/primitives"
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `title *` | `ReactNode` | — | Primary h1 text |
| `subtitle` | `ReactNode` | — | Baseline-adjacent muted copy |
| `breadcrumb` | `ReactNode` | — | Row above the title (auto-stacks layout) |
| `actions` | `ReactNode` | — | Right-aligned slot (icon buttons, buttons, segmented controls) |
| `tabs` | `ReactNode` | — | Second-row tab strip (`.ph-tabs`) |
| `body` | `ReactNode` | — | Third-row descriptive body |
| `variant` | `"compact" \| "overflow" \| "stacked"` | `"compact"` | Layout variant |
| `padding` | `"tight" \| "default" \| "cozy" \| "none"` | `"default"` | Internal-spacing density (shares Card vocabulary) |

## Example

```tsx
<PageHeader
  title="従業員シフト · カレンダー"
  subtitle="月単位の一括割当"
  actions={<Button size="small">＋ 一括割当</Button>}
/>
```

## Related

- Story catalogue: [`PageHeader` stories](../../../src/stories/data-display/PageHeader.stories.tsx)
- Source: [`src/components/data-display/PageHeader.tsx`](../../../src/components/data-display/PageHeader.tsx)
- Cardinal rule 23 §B prop vocabulary: [`CLAUDE.md` §23.B](../../../CLAUDE.md#23)

## Status

`draft` — auto-generated stub. Detailed prop docs / accessibility notes / design rationale still to be filled in.
