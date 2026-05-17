---
title: "Tooltip"
description: "Radix-backed floating label anchored to a trigger — compositional Tooltip/TooltipTrigger/TooltipContent OR convenience SimpleTooltip wrapper."
diataxis: reference
audience: [developer]
status: stable
last-updated: 2026-05-18
lang: en
library: "@godxjp/ui"
library_version: 3.0.0
---

# Tooltip

> Radix-backed floating label anchored to a trigger — compositional and convenience surfaces both available.

Two surfaces:

- **Compositional** — `<TooltipProvider><Tooltip><TooltipTrigger>…<TooltipContent>…</TooltipContent></Tooltip></TooltipProvider>` mirrors `@radix-ui/react-tooltip` verbatim for full control.
- **Convenience** — `<SimpleTooltip title="…">child</SimpleTooltip>` wires provider + root + trigger (`asChild`) + content for the common case.

Styled via `.tooltip-content` in `35-badge-tag-misc.css`; reads tokens and honours every theme / accent / density / font-size axis.

## Usage

```tsx
import { SimpleTooltip, IconButton } from "@godxjp/ui"
import { Settings } from "lucide-react"

<SimpleTooltip title="設定" placement="bottom">
  <IconButton aria-label="Settings"><Settings size={16} /></IconButton>
</SimpleTooltip>
```

## Props

### `SimpleTooltip`

| Prop | Type | Default | Description |
|---|---|---|---|
| `title` | `ReactNode` | required | Tooltip text / content |
| `children` | `ReactNode` | required | Trigger element (wrapped via Radix `asChild`) |
| `placement` | `"top" \| "right" \| "bottom" \| "left"` | `"top"` | Anchor side |
| `delayDuration` | `number` | `200` | Open / close delay in ms |
| `open` | `boolean` | — | Controlled visibility |
| `defaultOpen` | `boolean` | — | Uncontrolled initial visibility |
| `onOpenChange` | `(open: boolean) => void` | — | Called when visibility changes |

### Compositional surface

`TooltipProvider`, `Tooltip`, `TooltipTrigger`, `TooltipPortal` are direct re-exports of the matching Radix primitives. `TooltipContent` accepts everything `@radix-ui/react-tooltip`'s `Content` accepts (`side`, `sideOffset`, `align`, `alignOffset`, `avoidCollisions`, `collisionPadding`, …) plus the framework's `className` composition.

| Export | Description |
|---|---|
| `TooltipProvider` | Required ancestor — sets `delayDuration` and other defaults |
| `Tooltip` | Root |
| `TooltipTrigger` | The element that opens the tooltip on hover / focus |
| `TooltipPortal` | Portal (also automatically inserted inside `TooltipContent`) |
| `TooltipContent` | Floating content panel — accepts `side`, `sideOffset` (default 4), `className` |

Vocabulary per cardinal rule 23 §B: `placement` is the positional-anchor name shared with Popover (`top` / `right` / `bottom` / `left`); `open` / `defaultOpen` / `onOpenChange` is the Radix-canonical overlay-visibility vocabulary.

## Accessibility

- Radix wires the tooltip to ARIA — the content uses `role="tooltip"` and is associated with the trigger via `aria-describedby`. Screen readers announce the tooltip when the trigger receives focus.
- Tooltips trigger on **hover AND focus** — keyboard users get the same affordance as mouse users (WCAG SC 1.4.13 Content on Hover or Focus).
- `delayDuration` defaults to 200 ms; users with `prefers-reduced-motion` get the same content without entrance animation.
- Do not put critical information in a tooltip — touch-screen users may not be able to hover. Reserve tooltips for supplementary detail.
- Tooltips on disabled controls do not appear by default (Radix limitation); wrap the disabled control in a focusable span if the tooltip must be discoverable.

## Composition

```tsx
// Four placements
<Flex gap="large" align="center" style={{ padding: 80 }}>
  <SimpleTooltip title="上に表示" placement="top">
    <Button variant="secondary">Top</Button>
  </SimpleTooltip>
  <SimpleTooltip title="右に表示" placement="right">
    <Button variant="secondary">Right</Button>
  </SimpleTooltip>
  <SimpleTooltip title="下に表示" placement="bottom">
    <Button variant="secondary">Bottom</Button>
  </SimpleTooltip>
  <SimpleTooltip title="左に表示" placement="left">
    <Button variant="secondary">Left</Button>
  </SimpleTooltip>
</Flex>

// Compositional with custom content
<TooltipProvider delayDuration={150}>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button variant="primary">Hover me</Button>
    </TooltipTrigger>
    <TooltipContent side="top" sideOffset={8}>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <strong>カスタム本文</strong>
        <span>複数行の説明も表示できます。</span>
      </div>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

## See also

- [Popover](./Popover.md) — for interactive overlay content rather than read-only tooltips.
- [IconButton](./IconButton.md) — frequent pairing — icon meaning discoverable via Tooltip.
- Source: [`src/components/data-display/Tooltip.tsx`](../../../src/components/data-display/Tooltip.tsx)
