---
title: "Carousel"
description: "Image / content slide deck — compositional Carousel children, autoplay, loop, arrows, dots, vertical orientation."
diataxis: reference
audience: [developer]
status: stable
last-updated: 2026-05-18
lang: en
library: "@godxjp/ui"
library_version: 3.0.0
---

# Carousel

> Image / content slide deck. Compositional — pass `<Carousel>` children, one per slide.

The track translates by index along the configured `orientation`. Plain React + CSS `transform` — no external dependency. Autoplay pauses on hover via mouseenter / mouseleave handlers (CSS `:hover` cannot reach the JS interval).

Vocabulary follows cardinal rule 23 §B: `value` / `defaultValue` / `onValueChange` for selection state (current slide index). Never Ant's `activeKey` / `autoplaySpeed`.

## When to use Carousel vs a grid

| Need                                                         | Use                                                         |
| ------------------------------------------------------------ | ----------------------------------------------------------- |
| Browse many images / cards, one at a time, with auto-advance | **Carousel**                                                |
| See all items at once at a glance                            | [List](./List.md) `cols={N}` or a [Grid](../layout/Grid.md) |
| Single hero image without rotation                           | [Image](./Image.md)                                         |
| Long-form content with scroll-snapped sections               | Native CSS `scroll-snap-*` (no primitive needed)            |

A carousel hides content behind interaction — only reach for it when slide-by-slide attention is genuinely the right pattern. If users need to scan or compare, a grid wins.

## Usage

```tsx
import { Carousel, Carousel } from "@godxjp/ui";

<Carousel autoplay={3000}>
  <Carousel>
    <img src="/a.jpg" alt="…" />
  </Carousel>
  <Carousel>
    <img src="/b.jpg" alt="…" />
  </Carousel>
  <Carousel>
    <img src="/c.jpg" alt="…" />
  </Carousel>
</Carousel>;
```

## Props

### `Carousel`

| Prop            | Type                         | Default        | Description                                                                     |
| --------------- | ---------------------------- | -------------- | ------------------------------------------------------------------------------- |
| `value`         | `number`                     | —              | Controlled current slide index (0-based)                                        |
| `defaultValue`  | `number`                     | `0`            | Uncontrolled initial slide                                                      |
| `onValueChange` | `(index: number) => void`    | —              | Called when the active slide changes                                            |
| `autoplay`      | `number`                     | —              | Auto-advance interval in ms. Omit / `0` to disable. Pauses on hover             |
| `loop`          | `boolean`                    | `true`         | Wrap from last → first / first → last. When `false`, arrows disable at the ends |
| `arrows`        | `boolean`                    | `true`         | Show prev / next arrow buttons                                                  |
| `dots`          | `boolean`                    | `true`         | Show dot indicators                                                             |
| `orientation`   | `"horizontal" \| "vertical"` | `"horizontal"` | Stack axis                                                                      |
| `className`     | `string`                     | —              | Merged onto the `.carousel` root                                                |
| `children`      | `ReactNode`                  | —              | `<Carousel>` children                                                      |

### `Carousel`

| Prop      | Type                    | Default | Description                                                                                    |
| --------- | ----------------------- | ------- | ---------------------------------------------------------------------------------------------- |
| `...rest` | `ComponentProps<"div">` | —       | Standard `<div>` props. The slide renders as `<div role="group" aria-roledescription="slide">` |

## Accessibility

- The root carries `role="region" aria-roledescription="carousel"`; each slide carries `role="group" aria-roledescription="slide"`. The arrow buttons have `aria-label="Previous slide"` / `"Next slide"`; dot indicators have `role="tab"` and `aria-selected` per ARIA's APG carousel pattern.
- Autoplay does NOT pause on focus today — keyboard-only users moving through the page can still trigger the interval. When you autoplay, give the user a stop control nearby or set `autoplay={undefined}` and let arrows drive navigation.
- WCAG 2.1 SC 2.2.2 (Pause, Stop, Hide): respect `prefers-reduced-motion` at the consumer level — pass `autoplay={undefined}` when the media query is set.
- Slide content needs its own accessible name — images inside slides require `alt`, and non-image content should have a heading or `aria-label`.

## Composition

```tsx
// Autoplay 3s, paused on hover
<Carousel autoplay={3000}>
  {slides.map((s, i) => (
    <Carousel key={i}>{s.content}</Carousel>
  ))}
</Carousel>

// Vertical — slides translate top → bottom
<div style={{ maxWidth: 480, height: 320 }}>
  <Carousel orientation="vertical">
    {slides.map((s, i) => <Carousel key={i}>{s.content}</Carousel>)}
  </Carousel>
</div>

// No-loop with arrows disabling at ends
<Carousel loop={false}>
  {slides.map((s, i) => <Carousel key={i}>{s.content}</Carousel>)}
</Carousel>

// Dots-only navigation (arrows hidden)
<Carousel arrows={false}>
  {slides.map((s, i) => <Carousel key={i}>{s.content}</Carousel>)}
</Carousel>
```

## See also

- [Image](./Image.md) — single image with optional preview.
- [List](./List.md) with `cols={N}` — grid alternative when seeing-all-at-once matters.
- [Tour](./Tour.md) — step-by-step onboarding overlay (different intent: guidance, not browsing).
- Source: [`src/components/data-display/Carousel.tsx`](../../../src/components/data-display/Carousel.tsx)
