---
title: "Radio"
description: "Radix-backed single-select group — data-driven (options) or compositional (children)."
diataxis: reference
audience:
  - developer
status: draft
last-updated: 2026-05-17
lang: en
library: "@godxjp/ui"
library_version: 3.0.0
---

# Radio

Radix-backed single-select group. Compositional (`<Radio value="…" />` children) OR data-driven (`options`) per cardinal rule 23 §A. Vocabulary per cardinal rule 23 §B: `value` / `defaultValue` / `onValueChange` — Radix-canonical selection. Visual contract lives in `.radio-group`, `.radio-root`, `.radio-indicator` in `shell.css`; state flows via Radix `data-state="checked"`.

## Import

```ts
import { Radio, RadioGroup } from "@godxjp/ui/components/primitives"
```

## Props (`RadioGroup`)

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `string` | — | Controlled selected value |
| `defaultValue` | `string` | — | Uncontrolled initial value |
| `onValueChange` | `(value: string) => void` | — | Called when selection changes |
| `options` | `RadioOption[]` | — | `{ value, label, disabled? }` — data-driven items |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` | Axis of stack |
| `size` | `"small" \| "default" \| "large"` | `"default"` | Dimensional scale |
| `disabled` | `boolean` | `false` | Disable the whole group |
| `name` | `string` | — | Native form name |

## Example

```tsx
<RadioGroup
  defaultValue="weekly"
  options={[
    { value: "daily", label: "毎日" },
    { value: "weekly", label: "毎週" },
    { value: "monthly", label: "毎月" },
  ]}
/>
```

## Related

- Story catalogue: [`Radio` stories](../../../src/stories/data-entry/Radio.stories.tsx)
- Source: [`src/components/data-entry/Radio.tsx`](../../../src/components/data-entry/Radio.tsx)
- Cardinal rule 23 §B prop vocabulary: [`CLAUDE.md` §23.B](../../../CLAUDE.md#23)

## Status

`draft` — auto-generated stub. Detailed prop docs / accessibility notes / design rationale still to be filled in.
