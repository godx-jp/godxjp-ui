---
title: "Popconfirm"
description: "Inline confirmation popover anchored to its trigger — a lightweight alternative to AlertDialog for in-flow confirm/cancel flows."
diataxis: reference
audience: [developer]
status: stable
last-updated: 2026-05-18
lang: en
library: "@godxjp/ui"
library_version: 3.0.0
---

# Popconfirm

> Inline confirmation popover anchored to its trigger. The trigger stays in flow; the popover anchors next to it; there is no overlay dim.

Built on top of [Popover](./Popover.md): the trigger renders via Radix `asChild`, and the popover body holds a title, optional description, optional leading icon, plus Cancel / Confirm buttons. The default icon colour matches `confirmVariant` — amber `--warning` for `"primary"`, red `--destructive` for `"destructive"`.

Vocabulary follows cardinal rule 23 §B: `open` / `defaultOpen` / `onOpenChange` (Radix overlay state), `placement` (anchor side), `title` / `description` / `icon` slots, `confirmVariant` (Button `variant` value).

## When to use Popconfirm vs AlertDialog vs Dialog

| Need | Use |
|---|---|
| Reversible / low-stakes action — "Delete this filter?" inline next to the row | **Popconfirm** |
| Destructive irreversible action that needs full attention — "Delete project. This cannot be undone." | [AlertDialog](./AlertDialog.md) |
| Generic modal with rich content, custom buttons, multi-step flow | [Dialog](./Dialog.md) |
| Quick toast / status notice with no user input | [Toaster](./Toaster.md) |

Popconfirm is the lightweight confirm: the popover stays anchored to the trigger so the user keeps context. AlertDialog interrupts the page with a scrim and focus trap — escalate to it when the consequences justify the friction.

## Usage

```tsx
import { Popconfirm, Button } from "@godxjp/ui"

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

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `title` | `ReactNode` | required | Headline question |
| `description` | `ReactNode` | — | Secondary body text |
| `confirmLabel` | `ReactNode` | `"OK"` | Confirm button label |
| `cancelLabel` | `ReactNode` | `"キャンセル"` | Cancel button label |
| `confirmVariant` | `"primary" \| "destructive"` | `"primary"` | Confirm button variant — `destructive` also flips the icon colour to `--destructive` |
| `icon` | `ReactNode` | warning circle | Leading icon slot |
| `onConfirm` | `() => void` | — | Called when the user clicks Confirm (popover closes automatically) |
| `onCancel` | `() => void` | — | Called when the user clicks Cancel (popover closes automatically) |
| `open` | `boolean` | — | Controlled visibility |
| `defaultOpen` | `boolean` | `false` | Uncontrolled initial visibility |
| `onOpenChange` | `(open: boolean) => void` | — | Called when visibility changes |
| `placement` | `"top" \| "right" \| "bottom" \| "left"` | `"top"` | Popover anchor side |
| `children` | `ReactNode` | required | Trigger element (rendered via Radix `asChild`) |
| `className` | `string` | — | Merged onto `.popconfirm` content |

## Accessibility

- Inherits Radix Popover's a11y: the content has `role="dialog"`, focus is trapped while open, Esc closes.
- The trigger MUST be a single focusable element (button, link). Passing a `<div>` or fragment breaks `asChild` requirements.
- The default icon is `aria-hidden`; meaning is carried in the `title` text. Pair a destructive action with `confirmVariant="destructive"` AND copy that makes the consequence explicit ("復元できません" / "Cannot be undone").
- WCAG 2.1 SC 3.3.4 (Error Prevention): for irreversible actions, escalate to [AlertDialog](./AlertDialog.md) — Popconfirm's inline pattern is too easy to dismiss accidentally for high-stakes flows.

## Composition

```tsx
// Custom labels — approve / go back
<Popconfirm title="申請を承認しますか?" confirmLabel="承認" cancelLabel="戻る"
            onConfirm={() => approve()}>
  <Button variant="primary">承認</Button>
</Popconfirm>

// Minimal — title-only
<Popconfirm title="続行しますか?" onConfirm={() => proceed()}>
  <Button variant="primary">続行</Button>
</Popconfirm>

// Controlled — parent owns open state
function ControlledConfirm() {
  const [open, setOpen] = useState(false)
  return (
    <Popconfirm
      open={open}
      onOpenChange={setOpen}
      title="この変更を保存しますか?"
      onConfirm={() => { save(); setOpen(false) }}
      onCancel={() => setOpen(false)}
    >
      <Button variant="primary" onClick={() => setOpen(true)}>保存</Button>
    </Popconfirm>
  )
}
```

## See also

- [AlertDialog](./AlertDialog.md) — modal for irreversible / high-stakes confirmations.
- [Dialog](./Dialog.md) — generic modal with custom content.
- [Popover](./Popover.md) — underlying primitive without the confirm scaffolding.
- Source: [`src/components/feedback/Popconfirm.tsx`](../../../src/components/feedback/Popconfirm.tsx)
