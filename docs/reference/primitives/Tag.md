---
title: "Tag"
description: "Ant-Design label chip with preset semantic colours, custom hex/oklch hues, optional close button, and leading icon slot."
diataxis: reference
audience:
  - developer
status: draft
last-updated: 2026-05-17
lang: en
library: "@godxjp/ui"
library_version: 3.0.0
---

# Tag

Ant-Design label chip. Distinct from `<Badge>` — Badge anchors a status pill (a number or a single short word); Tag labels collections (often many in a row, optionally closable). Preset `color` snaps to a semantic CSS variable (`var(--success)` etc.); custom CSS strings (`oklch(56% 0.15 240)`) are accepted too.

## Import

```ts
import { Tag } from "@godxjp/ui/components/primitives"
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `color` | `"default" \| "primary" \| "success" \| "warning" \| "error" \| "info" \| "attention" \| string` | `"default"` | Preset semantic colour or any CSS colour string |
| `bordered` | `boolean` | `true` | Show outline. `false` = solid-tinted background only |
| `closable` | `boolean` | `false` | Show an × button |
| `onClose` | `(e: MouseEvent<HTMLButtonElement>) => void` | — | Called when × is clicked |
| `icon` | `ReactNode` | — | Leading icon |
| `...rest` | `Omit<ComponentProps<"span">, "color">` | — | Standard `<span>` props |

## Example

```tsx
<Tag color="success">done</Tag>
<Tag color="warning" icon={<Star size={12} />}>featured</Tag>
<Tag closable onClose={() => remove("alpha")}>alpha</Tag>
```

## Related

- Story catalogue: [`Tag` stories](../../../src/stories/data-display/Tag.stories.tsx)
- Source: [`src/components/data-display/Tag.tsx`](../../../src/components/data-display/Tag.tsx)
- Cardinal rule 23 §B prop vocabulary: [`CLAUDE.md` §23.B](../../../CLAUDE.md#23)

## Status

`draft` — auto-generated stub. Detailed prop docs / accessibility notes / design rationale still to be filled in.
