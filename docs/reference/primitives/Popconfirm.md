---
title: "Popconfirm"
description: "Inline confirmation popover anchored to its trigger — a lightweight alternative to AlertDialog for in-flow confirm/cancel flows."
diataxis: reference
audience:
  - developer
status: draft
last-updated: 2026-05-17
lang: en
library: "@godxjp/ui"
library_version: 3.0.0
---

# Popconfirm

Inline confirmation popover anchored to its trigger. Distinct from `<AlertDialog>` / `<Dialog>` (full-screen modal for high-stakes decisions that need focus trap + scrim) — Popconfirm is the lightweight inline confirm where the trigger stays in flow and the popover anchors next to it (no overlay dim). Vocabulary per cardinal rule 23 §B: `open` / `defaultOpen` / `onOpenChange` (Radix overlay state); `placement` (anchor side).

## Import

```ts
import { Popconfirm } from "@godxjp/ui/components/primitives"
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `title *` | `ReactNode` | — | Headline question |
| `description` | `ReactNode` | — | Secondary body text |
| `confirmLabel` | `ReactNode` | `"OK"` | Confirm button label |
| `cancelLabel` | `ReactNode` | `"キャンセル"` | Cancel button label |
| `confirmVariant` | `"primary" \| "destructive"` | `"primary"` | Confirm button variant |
| `icon` | `ReactNode` | warning circle | Leading icon |
| `onConfirm` | `() => void` | — | Called when the user confirms |
| `onCancel` | `() => void` | — | Called when the user cancels |
| `open` / `defaultOpen` / `onOpenChange` | Radix overlay state | — | Controlled / uncontrolled visibility |
| `placement` | `"top" \| "right" \| "bottom" \| "left"` | `"top"` | Anchor side relative to the trigger |
| `children *` | `ReactNode` | — | Trigger element (rendered via Radix `asChild`) |

## Example

```tsx
<Popconfirm
  title="削除しますか?"
  description="このアイテムは復元できません。"
  confirmVariant="destructive"
  confirmLabel="削除"
  onConfirm={() => deleteItem()}
>
  <Button variant="destructive">削除</Button>
</Popconfirm>
```

## Related

- Story catalogue: [`Popconfirm` stories](../../../src/stories/feedback/Popconfirm.stories.tsx)
- Source: [`src/components/feedback/Popconfirm.tsx`](../../../src/components/feedback/Popconfirm.tsx)
- Cardinal rule 23 §B prop vocabulary: [`CLAUDE.md` §23.B](../../../CLAUDE.md#23)

## Status

`draft` — auto-generated stub. Detailed prop docs / accessibility notes / design rationale still to be filled in.
