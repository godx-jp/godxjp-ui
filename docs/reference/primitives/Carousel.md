---
title: "Carousel"
description: "Image / content slide deck — compositional CarouselSlide children, autoplay, loop, arrows, dots, vertical orientation."
diataxis: reference
audience:
  - developer
status: draft
last-updated: 2026-05-17
lang: en
library: "@godxjp/ui"
library_version: 3.0.0
---

# Carousel

Image / content slide deck. Compositional: pass `<CarouselSlide>` children, one per slide. The track translates by index along the configured `orientation`. Plain React + CSS transform — no external dep. Autoplay pauses on hover (mouseenter / mouseleave handlers; CSS `:hover` cannot reach JS). Vocabulary per cardinal rule 23 §B: `value` / `defaultValue` / `onValueChange` for selection state (current slide index); never Ant's `activeKey` / `autoplaySpeed`.

## Import

```ts
import { Carousel, CarouselSlide } from "@godxjp/ui/components/primitives"
```

## Props (`Carousel`)

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `number` | — | Controlled current slide index (0-based) |
| `defaultValue` | `number` | `0` | Uncontrolled initial slide |
| `onValueChange` | `(index: number) => void` | — | Called when the slide changes |
| `autoplay` | `number` | — | Auto-advance interval in ms. Omit / `0` to disable |
| `loop` | `boolean` | `true` | Wrap from last → first / first → last |
| `arrows` | `boolean` | `true` | Show prev / next arrows |
| `dots` | `boolean` | `true` | Show dot indicators |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` | Stack axis |

## Example

```tsx
<Carousel autoplay={3000}>
  <CarouselSlide><img src="/a.jpg" alt="…" /></CarouselSlide>
  <CarouselSlide><img src="/b.jpg" alt="…" /></CarouselSlide>
  <CarouselSlide><img src="/c.jpg" alt="…" /></CarouselSlide>
</Carousel>
```

## Related

- Story catalogue: [`Carousel` stories](../../../src/stories/data-display/Carousel.stories.tsx)
- Source: [`src/components/data-display/Carousel.tsx`](../../../src/components/data-display/Carousel.tsx)
- Cardinal rule 23 §B prop vocabulary: [`CLAUDE.md` §23.B](../../../CLAUDE.md#23)

## Status

`draft` — auto-generated stub. Detailed prop docs / accessibility notes / design rationale still to be filled in.
