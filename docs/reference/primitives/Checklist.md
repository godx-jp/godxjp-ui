---
title: "Checklist"
description: "Vertical list of pass/fail rules with per-row icon (password rules, validation summaries, completion lists)."
diataxis: reference
audience:
  - developer
status: draft
last-updated: 2026-05-17
lang: en
library: "@godxjp/ui"
library_version: 3.0.0
---

# Checklist

Vertical list of pass/fail rules with a per-row icon (check / x by default). Each `item.ok` value drives the tone (`true` → success / `false` → destructive / `null` → neutral / pending) and selects the default icon. Common uses: password-rule hints, validation summaries, "tasks completed" lists, capability matrices.

## Import

```ts
import { Checklist } from "@godxjp/ui/components/primitives"
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `items *` | `ChecklistItem[]` | — | Rows to render |
| `iconSize` | `number` | `11` | Icon size in pixels |
| `...rest` | `HTMLAttributes<HTMLUListElement>` | — | Standard `<ul>` props |

### `ChecklistItem`

| Field | Type | Description |
|---|---|---|
| `ok *` | `boolean \| null` | `true` → ok / success, `false` → bad / destructive, `null` → neutral / pending |
| `label *` | `ReactNode` | Row text |
| `icon` | `ReactNode` | Override the default check / x icon |
| `hint` | `ReactNode` | Optional trailing muted hint text |

## Example

```tsx
<Checklist
  items={[
    { ok: true, label: "8 文字以上" },
    { ok: true, label: "大文字・小文字を含む" },
    { ok: false, label: "記号 (! @ # …) を 1 つ以上" },
    { ok: null, label: "辞書語を含まない" },
  ]}
/>
```

## Related

- Story catalogue: [`Checklist` stories](../../../src/stories/data-entry/Checklist.stories.tsx)
- Source: [`src/components/data-entry/Checklist.tsx`](../../../src/components/data-entry/Checklist.tsx)
- Cardinal rule 23 §B prop vocabulary: [`CLAUDE.md` §23.B](../../../CLAUDE.md#23)

## Status

`draft` — auto-generated stub. Detailed prop docs / accessibility notes / design rationale still to be filled in.
