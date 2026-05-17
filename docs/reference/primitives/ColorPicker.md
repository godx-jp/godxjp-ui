---
title: "ColorPicker"
description: "Color-selection trigger + popover panel — swatch + hex label, native color canvas, hex text input, and preset swatch grid."
diataxis: reference
audience:
  - developer
status: draft
last-updated: 2026-05-17
lang: en
library: "@godxjp/ui"
library_version: 3.0.0
---

# ColorPicker

Decorative color-selection trigger + popover panel. The trigger is a `.colorpicker-trigger` button (swatch + hex label); the popover hosts a native `<input type="color">` canvas plus a hex text input + preset swatch grid. Vocabulary per cardinal rule 23 §B: `value` / `defaultValue` / `onValueChange` (Radix-style state — hex string with optional `#rrggbbaa` when `showAlpha` is true); `size` matches Input; `open` / `defaultOpen` / `onOpenChange` for the popover.

## Import

```ts
import { ColorPicker } from "@godxjp/ui/components/primitives"
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `string` | — | Controlled hex (`#rrggbb` or `#rrggbbaa`) |
| `defaultValue` | `string` | — | Uncontrolled initial hex |
| `onValueChange` | `(hex: string) => void` | — | Called when the colour changes |
| `presets` | `string[]` | — | Preset swatches shown in the popover |
| `showAlpha` | `boolean` | `false` | Toggle alpha slider (value includes `#rrggbbaa`) |
| `size` | `"small" \| "default" \| "large"` | `"default"` | Dimensional scale |
| `disabled` | `boolean` | `false` | Disable interaction |
| `open` / `defaultOpen` / `onOpenChange` | Radix overlay state | — | Controlled / uncontrolled popover state |

## Example

```tsx
<ColorPicker defaultValue="#3b82f6" presets={["#ef4444", "#10b981", "#f59e0b"]} />
```

## Related

- Story catalogue: [`ColorPicker` stories](../../../src/stories/data-entry/ColorPicker.stories.tsx)
- Source: [`src/components/data-entry/ColorPicker.tsx`](../../../src/components/data-entry/ColorPicker.tsx)
- Cardinal rule 23 §B prop vocabulary: [`CLAUDE.md` §23.B](../../../CLAUDE.md#23)

## Status

`draft` — auto-generated stub. Detailed prop docs / accessibility notes / design rationale still to be filled in.
