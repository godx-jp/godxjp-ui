---
title: "SegmentedControl"
description: "Single-choice toggle group with no tab-panel — view pickers, density toggles, day/week/month switches."
diataxis: reference
audience:
  - developer
status: draft
last-updated: 2026-05-17
lang: en
library: "@godxjp/ui"
library_version: 3.0.0
---

# SegmentedControl

Single-choice toggle group with no tab-panel. Use for view pickers (day / week / month), density toggles, and similar toolbars where the choice drives a value only — not panel content (use `<Tabs>` for that). Two variants: `bar` (connected button row with hairline dividers, matches the canonical `.seg` strip) and `pill` (rounded background; active item lifts onto `--background` with a soft shadow).

## Import

```ts
import { SegmentedControl } from "@godxjp/ui/components/primitives"
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `items *` | `SegmentedControlItem[]` | — | `{ value, label, icon?, disabled? }` |
| `value` | `string` | — | Controlled selection |
| `defaultValue` | `string` | — | Uncontrolled initial selection |
| `onChange` | `(next: string) => void` | — | Called when selection changes |
| `variant` | `"bar" \| "pill"` | `"bar"` | Visual treatment |
| `size` | `"sm" \| "default"` | `"default"` | Dimensional scale |

## Example

```tsx
<SegmentedControl
  items={[
    { value: "day", label: "日" },
    { value: "week", label: "週" },
    { value: "month", label: "月" },
  ]}
  defaultValue="month"
/>
```

## Related

- Story catalogue: [`SegmentedControl` stories](../../../src/stories/data-display/SegmentedControl.stories.tsx)
- Source: [`src/components/data-display/SegmentedControl.tsx`](../../../src/components/data-display/SegmentedControl.tsx)
- Cardinal rule 23 §B prop vocabulary: [`CLAUDE.md` §23.B](../../../CLAUDE.md#23)

## Status

`draft` — auto-generated stub. Detailed prop docs / accessibility notes / design rationale still to be filled in.
