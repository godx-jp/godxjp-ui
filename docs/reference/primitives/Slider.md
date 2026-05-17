---
title: "Slider"
description: "Radix-backed range input — single-handle by default, dual-handle when `range` is set; optional tick marks; horizontal or vertical."
diataxis: reference
audience: [developer]
status: stable
last-updated: 2026-05-18
lang: en
library: "@godxjp/ui"
library_version: 3.0.0
---

# Slider

> Radix-backed range input. Single-handle by default; setting `range` flips to dual-handle with `[min, max]` value pairs.

## Usage

```tsx
import { Slider } from "@godxjp/ui"

<div style={{ width: 320 }}>
  <Slider defaultValue={30} />
</div>
```

## Props

### `Slider` (root)

Extends `ComponentPropsWithoutRef<typeof SliderPrimitive.Root>` (Radix) — the props below override or specialise that surface.

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `number \| [number, number]` | — | Controlled value — scalar single, tuple for `range` |
| `defaultValue` | `number \| [number, number]` | `min` / `[min, max]` | Uncontrolled initial value |
| `onValueChange` | `(value: number \| [number, number]) => void` | — | Fires on every commit (drag, keyboard, click) |
| `min` | `number` | `0` | Lower bound |
| `max` | `number` | `100` | Upper bound |
| `step` | `number` | `1` | Increment per keyboard arrow / drag tick |
| `range` | `boolean` | `false` | Render two thumbs; value becomes `[number, number]` |
| `disabled` | `boolean` | `false` | Disable interaction |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` | Track axis |
| `marks` | `SliderMark[]` | — | Optional tick labels along the track |
| `className` | `string` | — | Merged onto the Radix root |

### `SliderMark`

| Field | Type | Description |
|---|---|---|
| `value` | `number` | Tick position on the track |
| `label` | `ReactNode` | Optional label rendered under / beside the tick |

## Accessibility

- Built on `@radix-ui/react-slider` — each thumb is a real `<span role="slider">` with `aria-valuenow` / `aria-valuemin` / `aria-valuemax`.
- Keyboard: arrow keys nudge by `step`; `Page Up` / `Page Down` jump by 10× step; `Home` / `End` jump to min / max.
- Vertical orientation reverses the arrow mapping (`Up` increments, `Down` decrements).
- Marks are decorative — the slider remains operable without them.
- WCAG 2.1 SC 1.4.11 (Non-text Contrast): the thumb + track derive from `--primary` + `--secondary` semantic tokens and meet 3:1 against the page background.

## Composition

```tsx
// Range with constraints
<Slider range defaultValue={[20, 80]} />

// Marked steps from 0 to 100
<Slider
  defaultValue={40}
  min={0}
  max={100}
  step={10}
  marks={[
    { value: 0, label: "0%" },
    { value: 25, label: "25%" },
    { value: 50, label: "50%" },
    { value: 75, label: "75%" },
    { value: 100, label: "100%" },
  ]}
/>

// Vertical with labels
<div style={{ height: 200 }}>
  <Slider
    orientation="vertical"
    defaultValue={60}
    marks={[
      { value: 0, label: "低" },
      { value: 50, label: "中" },
      { value: 100, label: "高" },
    ]}
  />
</div>

// Controlled
function Controlled() {
  const [value, setValue] = useState<number | [number, number]>(35)
  return (
    <Flex vertical gap="small" style={{ width: 320 }}>
      <Slider value={value} onValueChange={setValue} />
      <code className="mono" style={{ fontSize: "var(--text-xs)" }}>
        {JSON.stringify(value)}
      </code>
    </Flex>
  )
}
```

## See also

- [Rate](./Rate.md) — discrete star-rating alternative.
- [InputNumber](./Input.md) — numeric text input when free-typing is preferred.
- Source: [`src/components/data-entry/Slider.tsx`](../../../src/components/data-entry/Slider.tsx)
