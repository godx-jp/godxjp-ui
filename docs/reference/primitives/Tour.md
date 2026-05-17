---
title: "Tour"
description: "Multi-step product walkthrough — overlays the viewport, highlights a target with a popover callout, advances step-by-step."
diataxis: reference
audience:
  - developer
status: draft
last-updated: 2026-05-17
lang: en
library: "@godxjp/ui"
library_version: 3.0.0
---

# Tour

Multi-step product walkthrough. Overlays the viewport, highlights a target with a popover callout, advances step-by-step. v1 uses a single semi-transparent mask (no true cutout) and positions the callout near the target's bounding rect (or page-centre when `placement="center"`). Vocabulary per cardinal rule 23 §B: `open` / `defaultOpen` / `onOpenChange` (Radix-style visibility); `current` / `defaultCurrent` / `onCurrentChange` (active step); `placement` (positional anchor).

## Import

```ts
import { Tour } from "@godxjp/ui/components/primitives"
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `steps *` | `TourStep[]` | — | `{ target?, title, description?, placement? }` |
| `open` / `defaultOpen` / `onOpenChange` | Radix overlay state | — | Controlled / uncontrolled visibility |
| `current` | `number` | — | Controlled step index (0-based) |
| `defaultCurrent` | `number` | `0` | Uncontrolled initial step |
| `onCurrentChange` | `(step: number) => void` | — | Called when the step changes |
| `onFinish` | `() => void` | — | Called when the user clicks Finish on the last step |
| `onClose` | `() => void` | — | Called when the user dismisses (Skip / Esc) |
| `labels` | `TourLabels` | `{ prev, next, finish, skip }` | Override button strings |

## Example

```tsx
<Tour
  defaultOpen
  steps={[
    { target: "#new-btn", title: "新規作成", description: "ここから新規申請を作成できます" },
    { target: "#filter", title: "絞り込み" },
    { title: "完了", description: "これで基本操作は完了です", placement: "center" },
  ]}
/>
```

## Related

- Story catalogue: [`Tour` stories](../../../src/stories/data-display/Tour.stories.tsx)
- Source: [`src/components/data-display/Tour.tsx`](../../../src/components/data-display/Tour.tsx)
- Cardinal rule 23 §B prop vocabulary: [`CLAUDE.md` §23.B](../../../CLAUDE.md#23)

## Status

`draft` — auto-generated stub. Detailed prop docs / accessibility notes / design rationale still to be filled in.
