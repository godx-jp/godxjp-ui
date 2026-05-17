---
title: "Empty"
description: "Empty-state placeholder with illustration, description, and optional action slot."
diataxis: reference
audience:
  - developer
status: draft
last-updated: 2026-05-17
lang: en
library: "@godxjp/ui"
library_version: 3.0.0
---

# Empty

Ant-Design-shaped empty-state placeholder. Three slots: `image` (illustration / icon — defaults to a built-in box SVG), `description` (explanatory copy), and `children` (action area, typically a CTA button). All visual values pinned to design tokens via the `.empty-*` class family in `shell.css`.

## Import

```ts
import { Empty } from "@godxjp/ui/components/primitives"
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `image` | `ReactNode` | built-in box SVG | Illustration / icon at the top |
| `description` | `ReactNode` | — | Text below the image |
| `children` | `ReactNode` | — | Action area below description (typically a button) |
| `...rest` | `ComponentProps<"div">` | — | Standard `<div>` props |

## Example

```tsx
<Empty description="まだ申請がありません">
  <Button variant="primary">新規申請</Button>
</Empty>
```

## Related

- Story catalogue: [`Empty` stories](../../../src/stories/data-display/Empty.stories.tsx)
- Source: [`src/components/data-display/Empty.tsx`](../../../src/components/data-display/Empty.tsx)
- Cardinal rule 23 §B prop vocabulary: [`CLAUDE.md` §23.B](../../../CLAUDE.md#23)

## Status

`draft` — auto-generated stub. Detailed prop docs / accessibility notes / design rationale still to be filled in.
