---
title: "Empty"
description: "Empty-state placeholder with illustration, description, and optional action slot."
diataxis: reference
audience: [developer]
status: stable
last-updated: 2026-05-18
lang: en
library: "@godxjp/ui"
library_version: 3.0.0
---

# Empty

> Empty-state placeholder for lists, tables, and panels — illustration on top, optional description, optional action slot.

## Usage

```tsx
import { Empty } from "@godxjp/ui";

<Empty />;
```

## Props

### `Empty` (root)

Extends `ComponentProps<"div">` — pass `className`, `id`, etc.

| Prop          | Type        | Default          | Description                                                             |
| ------------- | ----------- | ---------------- | ----------------------------------------------------------------------- |
| `image`       | `ReactNode` | built-in box SVG | Illustration / icon shown above the description                         |
| `description` | `ReactNode` | —                | Explanatory copy below the illustration                                 |
| `children`    | `ReactNode` | —                | Action area rendered in a `.empty-footer` slot (typically a CTA button) |

The default illustration is a 64×48 SVG box outline drawn with `currentColor` at `opacity: 0.45` so it inherits the surface's foreground tone and reads correctly on light + dark themes.

## Accessibility

- The default SVG illustration is decorative — it carries `aria-hidden="true"`. The `description` (visible `<p>`) carries the meaning.
- For interactive empty states, the `<Button>` inside `children` is keyboard-focusable by default; ensure the button's label answers "what next" (e.g. "新規申請" rather than "クリック").
- WCAG 2.1 SC 1.1.1 (Non-text Content): pass `aria-label` on the wrapping container if the empty state must be programmatically named beyond its description.

## Composition

```tsx
// Description only
<Empty description="まだ申請がありません" />

// With CTA button
<Empty description="まだ申請がありません">
  <Button
    variant="primary"
    startContent={<Plus size={14} aria-hidden />}
  >
    新規申請
  </Button>
</Empty>

// Custom illustration
<Empty
  image={<CustomIllustration />}
  description="Nothing here yet"
>
  <Button>Create one</Button>
</Empty>
```

## See also

- [Result](../feedback/Result.md) — page-level outcome surface for completion / errors.
- [Skeleton](../feedback/Skeleton.md) — loading-state placeholder.
- Source: [`src/components/data-display/Empty.tsx`](../../../src/components/data-display/Empty.tsx)
