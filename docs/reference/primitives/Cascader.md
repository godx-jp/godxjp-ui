---
title: "Cascader"
description: "Nested column navigation — Popover with horizontal columns; clicking a non-leaf expands the next column, clicking a leaf commits the path."
diataxis: reference
audience:
  - developer
status: draft
last-updated: 2026-05-17
lang: en
library: "@godxjp/ui"
library_version: 3.0.0
---

# Cascader

Nested column navigation. Renders a Popover whose body is a horizontal row of vertical columns; each column lists the options at that depth. Clicking a non-leaf expands the next column to the right; clicking a leaf commits the path of values. Vocabulary per cardinal rule 23 §B: `value` / `defaultValue` / `onValueChange` (Radix-style selection — the path is `string[]`; callback also receives the leaf option).

## Import

```ts
import { Cascader } from "@godxjp/ui/components/primitives"
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `options *` | `CascaderOption[]` | — | Recursive tree (`{ value, label, disabled?, children? }`) |
| `value` | `string[]` | — | Controlled path |
| `defaultValue` | `string[]` | — | Uncontrolled initial path |
| `onValueChange` | `(path: string[], leafOption: CascaderOption) => void` | — | Called when a leaf is committed |
| `placeholder` | `string` | `"Select"` | Trigger placeholder |
| `size` | `"small" \| "default" \| "large"` | `"default"` | Dimensional scale |
| `showFullPath` | `boolean` | `true` | Display the full path breadcrumb in the trigger |
| `disabled` | `boolean` | `false` | Disable interaction |
| `open` / `defaultOpen` / `onOpenChange` | Radix overlay state | — | Controlled / uncontrolled popover state |

## Example

```tsx
<Cascader
  options={prefectureTree}
  placeholder="地域を選択"
  onValueChange={(path) => console.log(path)}
/>
```

## Related

- Story catalogue: [`Cascader` stories](../../../src/stories/data-entry/Cascader.stories.tsx)
- Source: [`src/components/data-entry/Cascader.tsx`](../../../src/components/data-entry/Cascader.tsx)
- Cardinal rule 23 §B prop vocabulary: [`CLAUDE.md` §23.B](../../../CLAUDE.md#23)

## Status

`draft` — auto-generated stub. Detailed prop docs / accessibility notes / design rationale still to be filled in.
