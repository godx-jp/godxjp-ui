---
title: "Steps"
description: "Wizard / progress indicator with horizontal or vertical orientation; each step carries title, description, and an optional icon."
diataxis: reference
audience:
  - developer
status: draft
last-updated: 2026-05-17
lang: en
library: "@godxjp/ui"
library_version: 3.0.0
---

# Steps

Wizard / progress indicator. Reuses `.steps-h` (horizontal) and `.steps-v` (vertical) CSS atoms from `shell.css` — both ported from the dxs-kintai design canon. Vocabulary per cardinal rule 23 §B: `orientation` (axis of stack); `current` (number, 0-based active index); per-step `color` (semantic role mapping — replaces Ant's `status` enum).

## Import

```ts
import { Steps, Step } from "@godxjp/ui/components/primitives"
```

## Props (`Steps`)

| Prop | Type | Default | Description |
|---|---|---|---|
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` | Axis |
| `current` | `number` | `0` | Zero-based index of the in-progress step |

## Props (`Step`)

| Prop | Type | Default | Description |
|---|---|---|---|
| `title` | `ReactNode` | — | Step title |
| `description` | `ReactNode` | — | Step description |
| `icon` | `ReactNode` | index / check | Override icon for the node |
| `color` | `"default" \| "primary" \| "success" \| "info" \| "warning" \| "destructive"` | — | Override colour for the node |

## Example

```tsx
<Steps current={2}>
  <Step title="情報入力" description="5/14 09:22" />
  <Step title="確認" description="5/14 09:24" />
  <Step title="承認待ち" description="進行中" />
  <Step title="支払い" description="—" />
  <Step title="完了" description="—" />
</Steps>
```

## Related

- Story catalogue: [`Steps` stories](../../../src/stories/navigation/Steps.stories.tsx)
- Source: [`src/components/navigation/Steps.tsx`](../../../src/components/navigation/Steps.tsx)
- Cardinal rule 23 §B prop vocabulary: [`CLAUDE.md` §23.B](../../../CLAUDE.md#23)

## Status

`draft` — auto-generated stub. Detailed prop docs / accessibility notes / design rationale still to be filled in.
