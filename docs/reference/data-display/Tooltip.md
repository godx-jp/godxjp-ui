---
title: "Tooltip"
description: "Radix-backed floating label — single Tooltip primitive with data-driven content prop OR compositional children."
diataxis: reference
audience: [developer]
status: stable
last-updated: 2026-05-18
lang: en
library: "@godxjp/ui"
library_version: 3.0.0
---

# Tooltip

> Radix-backed floating label anchored to a trigger.

One primitive, two equivalent consumption modes (per cardinal rule 31 — no parallel convenience wrappers):

- **Data-driven** — `<Tooltip content="…" placement="top">trigger</Tooltip>` auto-wires root + trigger (`asChild`) + content.
- **Compositional** — omit `content`, hand-roll `<Tooltip>` + `<Tooltip>` children for full control.

App-wide timing (`delayDuration`, `skipDelayDuration`) flows through `<GodxConfigProvider>` — the consumer never imports a separate `TooltipProvider`. Per-tooltip overrides use the `delayDuration` prop on `<Tooltip>` itself.

Styled via `.tooltip-content` in `35-badge-tag-misc.css`; reads tokens and honours every theme / accent / density / font-size axis.

## Usage

```tsx
import { Tooltip, IconButton } from "@godxjp/ui";
import { Settings } from "lucide-react";

<Tooltip content="設定" placement="bottom">
  <IconButton aria-label="Settings">
    <Settings size={16} />
  </IconButton>
</Tooltip>;
```

## Props

### `Tooltip` (root)

| Prop            | Type                                     | Default  | Description                                                                                         |
| --------------- | ---------------------------------------- | -------- | --------------------------------------------------------------------------------------------------- |
| `content`       | `ReactNode`                              | —        | Tooltip text / content. When set, auto-wires Root + Trigger + Content. Omit for compositional mode. |
| `children`      | `ReactNode`                              | required | Trigger element (data-driven) OR Radix Root children (compositional).                               |
| `placement`     | `"top" \| "right" \| "bottom" \| "left"` | `"top"`  | Anchor side (cardinal rule 23 §B vocabulary). Honoured only in data-driven mode.                    |
| `delayDuration` | `number`                                 | `200`    | Per-tooltip override of the app-wide `tooltipDelay` set on `<GodxConfigProvider>`.                  |
| `open`          | `boolean`                                | —        | Controlled visibility                                                                               |
| `defaultOpen`   | `boolean`                                | —        | Uncontrolled initial visibility                                                                     |
| `onOpenChange`  | `(open: boolean) => void`                | —        | Called when visibility changes                                                                      |

### Compositional sub-components

`Tooltip`, `Tooltip` re-export Radix primitives. `Tooltip` is the styled wrapper:

| Export           | Description                                                                                                                                                                                                  |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Tooltip` | The element that opens the tooltip on hover / focus.                                                                                                                                                         |
| `Tooltip`  | Portal (also automatically inserted inside `Tooltip`).                                                                                                                                                |
| `Tooltip` | Floating content panel — accepts every Radix `Content` prop (`side`, `sideOffset` default 4, `align`, `alignOffset`, `avoidCollisions`, `collisionPadding`, …) plus the framework's `className` composition. |

There is no exported `TooltipProvider` — app-wide timing lives on `<GodxConfigProvider>`.

## Accessibility

- Radix wires the tooltip to ARIA — the content uses `role="tooltip"` and is associated with the trigger via `aria-describedby`. Screen readers announce the tooltip when the trigger receives focus.
- Tooltips trigger on **hover AND focus** — keyboard users get the same affordance as mouse users (WCAG SC 1.4.13 Content on Hover or Focus).
- `delayDuration` defaults to 200 ms; users with `prefers-reduced-motion` get the same content without entrance animation.
- Do not put critical information in a tooltip — touch-screen users may not be able to hover. Reserve tooltips for supplementary detail.
- Tooltips on disabled controls do not appear by default (Radix limitation); wrap the disabled control in a focusable span if the tooltip must be discoverable.

## App-wide timing

The framework's `<GodxConfigProvider>` mounts a shared Radix Tooltip Provider internally. Set the open delay and the skip-delay (the window during which moving the cursor to an adjacent tooltipped element opens the next tooltip immediately) once at the root:

```tsx
<GodxConfigProvider tooltipDelay={300} tooltipSkipDelay={150}>
  <App />
</GodxConfigProvider>
```

Per-tooltip overrides flow through the `delayDuration` prop on `<Tooltip>` (data-driven mode only — compositional mode reads the Provider's timing).

## Composition

```tsx
// Four placements — data-driven mode
<Flex gap="large" align="center" style={{ padding: 80 }}>
  <Tooltip content="上に表示" placement="top">
    <Button variant="secondary">Top</Button>
  </Tooltip>
  <Tooltip content="右に表示" placement="right">
    <Button variant="secondary">Right</Button>
  </Tooltip>
  <Tooltip content="下に表示" placement="bottom">
    <Button variant="secondary">Bottom</Button>
  </Tooltip>
  <Tooltip content="左に表示" placement="left">
    <Button variant="secondary">Left</Button>
  </Tooltip>
</Flex>

// Compositional — no separate provider needed
<Tooltip>
  <Tooltip asChild>
    <Button variant="primary">Hover me</Button>
  </Tooltip>
  <Tooltip side="top" sideOffset={8}>
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <strong>カスタム本文</strong>
      <span>複数行の説明も表示できます。</span>
    </div>
  </Tooltip>
</Tooltip>
```

## See also

- [Popover](./Popover.md) — for interactive overlay content rather than read-only tooltips.
- [IconButton](./IconButton.md) — frequent pairing — icon meaning discoverable via Tooltip.
- Source: [`src/components/data-display/Tooltip.tsx`](../../../src/components/data-display/Tooltip.tsx)
