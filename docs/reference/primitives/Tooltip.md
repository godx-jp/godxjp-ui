---
title: "Tooltip"
description: "Radix-backed floating label anchored to a trigger — compositional Tooltip/TooltipTrigger/TooltipContent OR convenience SimpleTooltip wrapper."
diataxis: reference
audience:
  - developer
status: draft
last-updated: 2026-05-17
lang: en
library: "@godxjp/ui"
library_version: 3.0.0
---

# Tooltip

Radix-backed floating label anchored to a trigger. Two surfaces: compositional (`<TooltipProvider><Tooltip><TooltipTrigger>…<TooltipContent>…</TooltipContent></Tooltip></TooltipProvider>` — mirrors Radix verbatim for full control) and convenience (`<SimpleTooltip title="…">child</SimpleTooltip>` — wires provider + root + trigger (`asChild`) + content for the common case). Styled via `.tooltip-content` in `35-badge-tag-misc.css`; reads tokens and honours every axis (cardinal rule 21).

## Import

```ts
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
  SimpleTooltip,
} from "@godxjp/ui/components/primitives"
```

## Props (`SimpleTooltip`)

| Prop | Type | Default | Description |
|---|---|---|---|
| `title *` | `ReactNode` | — | Tooltip text / content |
| `children *` | `ReactNode` | — | Trigger element |
| `placement` | `"top" \| "right" \| "bottom" \| "left"` | `"top"` | Anchor side |
| `delayDuration` | `number` | `200` | Open / close delay in ms |
| `open` / `defaultOpen` / `onOpenChange` | Radix overlay state | — | Controlled / uncontrolled visibility |

## Example

```tsx
<SimpleTooltip title="設定" placement="bottom">
  <IconButton aria-label="Settings"><Settings size={16} /></IconButton>
</SimpleTooltip>
```

## Related

- Story catalogue: [`Tooltip` stories](../../../src/stories/data-display/Tooltip.stories.tsx)
- Source: [`src/components/data-display/Tooltip.tsx`](../../../src/components/data-display/Tooltip.tsx)
- Cardinal rule 23 §B prop vocabulary: [`CLAUDE.md` §23.B](../../../CLAUDE.md#23)

## Status

`draft` — auto-generated stub. Detailed prop docs / accessibility notes / design rationale still to be filled in.
