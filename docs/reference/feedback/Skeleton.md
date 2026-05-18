---
title: "Skeleton"
diataxis: reference
library: "@godxjp/ui"
library_version: 3.0.0
component: Skeleton
status: stable
audience: [developer, agent]
lang: en
---

# Skeleton

> Loading placeholder that pulses to indicate pending content.

## Usage

```tsx
import { Skeleton } from "@godxjp/ui";

{
  isLoading ? (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  ) : (
    <Content />
  );
}
```

## Props

| Prop        | Type                             | Default | Description                                         |
| ----------- | -------------------------------- | ------- | --------------------------------------------------- |
| `className` | `string`                         | —       | Width and height must be set here — no default size |
| `...rest`   | `HTMLAttributes<HTMLDivElement>` | —       | Standard div props                                  |

## Behavior

- The `.skeleton` CSS class applies a muted background with an animated pulse.
- `aria-hidden` is always set — the placeholder is hidden from screen readers.
- Size must be set by the consumer via `className` (e.g., `h-4 w-full` or inline style).
- The pulse animation respects `@media (prefers-reduced-motion: reduce)` — the pulse stops and the element shows a static muted color instead.

## Accessibility

- `aria-hidden="true"` — the element is removed from the accessibility tree.
- Screen readers see nothing during loading. If the loading state is long, add a visible or SR-only loading message:

  ```tsx
  <>
    <span className="sr-only">Loading project list…</span>
    <Skeleton className="h-40 w-full" />
  </>
  ```

- WCAG 2.1 SC 2.3.3 (Animation from Interactions): the pulse animation is driven by CSS, not JavaScript, and stops when `prefers-reduced-motion` is set.

## Composition

```tsx
// Card skeleton
<Card>
  <Card title="PLACEHOLDER">
    <Skeleton className="h-5 w-32" />

  <div className="card-body">
    <Skeleton className="h-4 w-full mb-2" />
    <Skeleton className="h-4 w-5/6 mb-2" />
    <Skeleton className="h-4 w-4/6" />
  </div>
</Card>
```

## See also

- [Card](../data-display/Card.md) — typical wrapping context.
