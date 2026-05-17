---
title: "Transfer"
description: "Dual list-box — items move between a source column and a target column via arrow buttons."
diataxis: reference
audience: [developer]
status: stable
last-updated: 2026-05-18
lang: en
library: "@godxjp/ui"
library_version: 3.0.0
---

# Transfer

> Dual list-box. Items in the left ("source") column move to the right ("target") column via arrow buttons; `value` tracks the keys currently on the right.

## Usage

```tsx
import { useState } from "react"
import { Transfer, type TransferItem } from "@godxjp/ui"

const employees: TransferItem[] = [
  { key: "yamada", label: "山田 太郎 / エンジニア" },
  { key: "suzuki", label: "鈴木 花子 / デザイナー" },
  { key: "tanaka", label: "田中 一郎 / プロダクト" },
]

function MemberPicker() {
  const [chosen, setChosen] = useState<string[]>(["suzuki"])
  return (
    <Transfer
      dataSource={employees}
      value={chosen}
      onValueChange={setChosen}
      titles={["利用可能", "アサイン済み"]}
    />
  )
}
```

## Props

### `Transfer` (root)

| Prop | Type | Default | Description |
|---|---|---|---|
| `dataSource` | `TransferItem[]` | required | Full pool of items — split between left and right by `value` |
| `value` | `string[]` | — | Controlled keys currently on the right column |
| `defaultValue` | `string[]` | `[]` | Uncontrolled initial right-column keys |
| `onValueChange` | `(value: string[]) => void` | — | Fires when an item is moved |
| `titles` | `[ReactNode, ReactNode]` | `["", ""]` | Headers for `[left, right]` columns |
| `size` | `"small" \| "default" \| "large"` | `"default"` | Dimensional scale of rows + search input |
| `disabled` | `boolean` | `false` | Disable the whole control |
| `showSearch` | `boolean` | `false` | Render a search input above each column |
| `searchPlaceholder` | `string` | — | Placeholder text for the search inputs |
| `renderItem` | `(item: TransferItem) => ReactNode` | — | Custom label renderer; defaults to `item.label` |
| `className` | `string` | — | Merged onto the `.transfer` root |

Vocabulary per cardinal rule 23 §B: the chosen-set is `value` (Radix-style) — NEVER `targetKeys` (Ant alias for the same concept).

### `TransferItem`

| Field | Type | Description |
|---|---|---|
| `key` | `string` | Unique identifier — appears in `value` |
| `label` | `ReactNode` | Display content for the row |
| `disabled` | `boolean` | Row cannot be moved when `true` |

## Accessibility

- Each row carries `aria-disabled` when the row or whole control is disabled.
- Move buttons render via [`IconButton`](./IconButton.md) with `aria-label="Move right"` / `"Move left"` so screen readers announce the action.
- Checkbox state is provided by the underlying [`Checkbox`](./Checkbox.md) primitive — keyboard activation works on each row.
- Column titles include a running count (e.g. `アサイン済み (3)`) plus the selected-vs-total when an item is ticked (`(1/3)`) — visible feedback for both pointer and keyboard users.
- WCAG 2.1 SC 2.4.6 (Headings and Labels): the per-column header text identifies each column's purpose.

## Composition

```tsx
// With per-column search
<Transfer
  dataSource={employees}
  defaultValue={["tanaka"]}
  titles={["メンバー一覧", "プロジェクト参加"]}
  showSearch
  searchPlaceholder="名前で検索"
/>

// Disabled, read-only display
<Transfer
  dataSource={employees}
  defaultValue={["yamada", "suzuki"]}
  titles={["利用可能", "アサイン済み"]}
  disabled
/>
```

## See also

- [Checkbox](./Checkbox.md) — per-row toggle primitive.
- [Select](./Select.md) — simpler dropdown alternative for single-pick from a fixed list.
- Source: [`src/components/data-entry/Transfer.tsx`](../../../src/components/data-entry/Transfer.tsx)
