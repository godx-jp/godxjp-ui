---
title: "Slider"
description: "Radix-backed range input — single-handle by default, dual-handle when `range` is set; optional tick marks."
diataxis: reference
audience:
  - developer
status: draft
last-updated: 2026-05-17
lang: en
library: "@godxjp/ui"
library_version: 3.0.0
---

# Slider

Radix-backed range input. Single-handle by default; `range` flips to dual-handle (value is a `[number, number]` tuple). Vocabulary per cardinal rule 23 §B: `value` / `defaultValue` / `onValueChange` (Radix-canonical selection). Visual contract lives in `.slider`, `.slider-track`, `.slider-range`, `.slider-thumb` in `shell.css`; vertical variant flips dimensions via `data-orientation="vertical"`.

## Import

```ts
import { Slider } from "@godxjp/ui/components/primitives"
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `number \| [number, number]` | — | Controlled value (scalar for single-handle, tuple for `range`) |
| `defaultValue` | `number \| [number, number]` | — | Uncontrolled initial value |
| `onValueChange` | `(value: number \| [number, number]) => void` | — | Called when the value changes |
| `min` / `max` / `step` | `number` | `0` / `100` / `1` | HTML range standards |
| `range` | `boolean` | `false` | Dual-handle mode |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` | Axis |
| `marks` | `SliderMark[]` | — | Optional tick labels along the track |
| `disabled` | `boolean` | `false` | Disable interaction |

## Example

```tsx
<Slider defaultValue={30} />
<Slider range defaultValue={[20, 80]} />
```

## Related

- Story catalogue: [`Slider` stories](../../../src/stories/data-entry/Slider.stories.tsx)
- Source: [`src/components/data-entry/Slider.tsx`](../../../src/components/data-entry/Slider.tsx)
- Cardinal rule 23 §B prop vocabulary: [`CLAUDE.md` §23.B](../../../CLAUDE.md#23)

## Status

`draft` — auto-generated stub. Detailed prop docs / accessibility notes / design rationale still to be filled in.
