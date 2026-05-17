---
title: "Spinner"
description: "Small inline circular loading indicator with size and semantic-tone variants."
diataxis: reference
audience:
  - developer
status: draft
last-updated: 2026-05-17
lang: en
library: "@godxjp/ui"
library_version: 3.0.0
---

# Spinner

Small inline circular loading indicator. Renders the canonical `.spinner` family from `shell.css`; uses `border-top-color` rotation and respects `prefers-reduced-motion` via the keyframe declaration. Use inside Button, Input suffix, or help text. For full-region loading, prefer Skeleton.

## Import

```ts
import { Spinner } from "@godxjp/ui/components/primitives"
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | 10 / 12 / 16 px |
| `tone` | `"info" \| "muted" \| "primary" \| "success" \| "warning" \| "destructive"` | `"info"` | Color role for the rotating arc |
| `aria-label` | `string` | — | Accessible label. When omitted, falls back to `aria-hidden` |
| `...rest` | `HTMLAttributes<HTMLSpanElement>` | — | Standard `<span>` props |

## Example

```tsx
<Spinner size="lg" tone="primary" aria-label="Saving…" />
```

## Related

- Story catalogue: [`Spinner` stories](../../../src/stories/feedback/Spin.stories.tsx)
- Source: [`src/components/feedback/Spinner.tsx`](../../../src/components/feedback/Spinner.tsx)
- Cardinal rule 23 §B prop vocabulary: [`CLAUDE.md` §23.B](../../../CLAUDE.md#23)

## Status

`draft` — auto-generated stub. Detailed prop docs / accessibility notes / design rationale still to be filled in.
