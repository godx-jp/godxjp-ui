---
title: "ColorPicker"
description: "Color-selection trigger + popover panel — swatch + hex label, native color canvas, hex text input, and preset swatch grid."
diataxis: reference
audience: [developer]
status: stable
last-updated: 2026-05-18
lang: en
library: "@godxjp/ui"
library_version: 3.0.0
---

# ColorPicker

> Decorative color-selection trigger + popover panel — swatch + hex label, native color canvas, hex text input, optional preset grid, optional alpha slider.

## Usage

```tsx
import { ColorPicker } from "@godxjp/ui";

<ColorPicker defaultValue="#3b82f6" />;
```

## Props

### `ColorPicker` (root)

| Prop            | Type                              | Default     | Description                                                       |
| --------------- | --------------------------------- | ----------- | ----------------------------------------------------------------- |
| `value`         | `string`                          | —           | Controlled hex value (`#rrggbb`, or `#rrggbbaa` when `showAlpha`) |
| `defaultValue`  | `string`                          | `"#3b82f6"` | Uncontrolled initial hex                                          |
| `onValueChange` | `(hex: string) => void`           | —           | Fires on every commit (canvas / hex input / preset)               |
| `presets`       | `string[]`                        | —           | Preset hex strings rendered as swatch grid                        |
| `showAlpha`     | `boolean`                         | `false`     | Show alpha range slider; value carries `aa` suffix                |
| `size`          | `"small" \| "default" \| "large"` | `"default"` | Trigger dimensional scale                                         |
| `disabled`      | `boolean`                         | `false`     | Disable interaction                                               |
| `open`          | `boolean`                         | —           | Controlled popover state                                          |
| `defaultOpen`   | `boolean`                         | `false`     | Uncontrolled initial popover state                                |
| `onOpenChange`  | `(open: boolean) => void`         | —           | Popover open / close callback                                     |
| `className`     | `string`                          | —           | Merged onto the `.colorpicker-trigger` button                     |

## Accessibility

- Trigger renders as `<button aria-label="Choose color">` carrying `aria-expanded` from the underlying Popover.
- The native `<input type="color">` canvas exposes browser-native keyboard / mouse interaction; the hex text input is a separate `<input type="text" aria-label="Hex value">`.
- Preset swatches render inside `<div role="listbox" aria-label="Preset colors">`; each swatch is `role="option"` with `aria-selected` when its hex matches the current value.
- Alpha slider, when shown, is a native `<input type="range" aria-label="Alpha channel">`.
- WCAG 2.1 SC 1.4.1 (Use of Color): the hex value is always exposed as text alongside the swatch so users not relying on color can read it.

## Composition

```tsx
const BRAND_PRESETS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#64748b",
]

// With brand presets
<ColorPicker defaultValue="#3b82f6" presets={BRAND_PRESETS} />

// With alpha channel
<ColorPicker defaultValue="#3b82f6ff" showAlpha />

// Disabled
<ColorPicker defaultValue="#64748b" disabled />
```

## See also

- [Input](./Input.md) — paired text input when a free-form hex needs validation.
- [Popover](../data-display/Popover.md) — underlying overlay primitive.
- Source: [`src/components/data-entry/ColorPicker.tsx`](../../../src/components/data-entry/ColorPicker.tsx)
