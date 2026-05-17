---
title: "Checklist"
description: "Vertical list of pass/fail rules with per-row icon — password rules, validation summaries, completion lists."
diataxis: reference
audience: [developer]
status: stable
last-updated: 2026-05-18
lang: en
library: "@godxjp/ui"
library_version: 3.0.0
---

# Checklist

> Vertical list of pass/fail rules with per-row icon — read-only progress / validation surface.

## When to use

| Need | Use |
|---|---|
| Read-only display of rule pass/fail state | **Checklist** |
| Interactive single-toggle (boolean) | [Checkbox](./Checkbox.md) |
| Interactive multi-select group | [Checkbox](./Checkbox.md) (CheckboxGroup) |

Checklist is documentation, not input. For interactive multi-select with form submission, use `Checkbox` / `CheckboxGroup`.

## Usage

```tsx
import { Checklist } from "@godxjp/ui"

<div style={{ maxWidth: 320 }}>
  <Checklist
    items={[
      { ok: true, label: "8 文字以上" },
      { ok: true, label: "大文字・小文字を含む" },
      { ok: false, label: "記号 (! @ # …) を 1 つ以上" },
      { ok: null, label: "辞書語を含まない" },
    ]}
  />
</div>
```

## Props

### `Checklist` (root)

Extends `HTMLAttributes<HTMLUListElement>` — pass `className`, `id`, `aria-*`, etc.

| Prop | Type | Default | Description |
|---|---|---|---|
| `items` | `ChecklistItem[]` | required | Rows to render |
| `iconSize` | `number` | `11` | Default check / x icon size in px |

### `ChecklistItem`

| Field | Type | Description |
|---|---|---|
| `ok` | `boolean \| null` | `true` → success / `false` → destructive / `null` → neutral |
| `label` | `ReactNode` | Row text |
| `icon` | `ReactNode` | Override the default check / x icon |
| `hint` | `ReactNode` | Optional trailing muted text |

## Accessibility

- Renders a native `<ul>` with each rule as `<li>`; default icons are decorative SVGs (no `aria-label`) — the label text carries the meaning.
- `ok` is decorative (drives the row tone via the `ok` / `bad` CSS class). For programmatic state, pair with `aria-describedby` from the source control or wrap inside a `<Field>` group.
- WCAG 2.1 SC 1.4.1 (Use of Color): each row's pass / fail state is conveyed by both the icon AND the colour tone, so users not relying on colour can still parse pass / fail.

## Composition

```tsx
// All rules passed — success state
<Checklist
  items={[
    { ok: true, label: "8 文字以上" },
    { ok: true, label: "大文字・小文字を含む" },
    { ok: true, label: "記号 (! @ # …) を 1 つ以上" },
    { ok: true, label: "辞書語を含まない" },
  ]}
/>

// Mixed state with custom pending icon + hints
<Checklist
  items={[
    { ok: true, label: "シフト提出", hint: "5/12 完了" },
    {
      ok: null,
      label: "店長承認待ち",
      icon: <Clock size={11} aria-hidden />,
      hint: "5/14 期限",
    },
    { ok: false, label: "残業申請の上限超過", hint: "再申請が必要" },
  ]}
/>
```

## See also

- [Checkbox](./Checkbox.md) — interactive single-toggle / multi-select alternative.
- [Field](./Field.md) — wrap a Checklist with a label + help group when used under a form control.
- Source: [`src/components/data-entry/Checklist.tsx`](../../../src/components/data-entry/Checklist.tsx)
