---
title: "Cascader"
description: "Nested-column navigation — Popover with horizontal columns; clicking a non-leaf expands the next column, clicking a leaf commits the path."
diataxis: reference
audience: [developer]
status: stable
last-updated: 2026-05-18
lang: en
library: "@godxjp/ui"
library_version: 3.0.0
---

# Cascader

> Nested-column navigation — each level lists options as a vertical column; clicking a non-leaf expands the next column to the right; clicking a leaf commits the full path of values.

## When to use

| Need | Use |
|---|---|
| Hierarchical data — fixed depth, columns make depth visible | **Cascader** |
| Tree-shaped options inside a popover (recursive nesting) | [TreeSelect](./TreeSelect.md) |
| Tree-shaped options rendered inline (no popover) | [Tree](./Tree.md) |
| Flat fixed list, no nesting | [Select](./Select.md) |

## Usage

```tsx
import { useState } from "react"
import { Cascader, type CascaderOption } from "@godxjp/ui"

const prefectureTree: CascaderOption[] = [
  {
    value: "tokyo",
    label: "東京都",
    children: [
      {
        value: "shibuya",
        label: "渋谷区",
        children: [
          { value: "shibuya-1", label: "渋谷1丁目" },
          { value: "ebisu", label: "恵比寿" },
        ],
      },
    ],
  },
]

function PrefecturePicker() {
  const [path, setPath] = useState<string[]>([])
  return (
    <Cascader
      options={prefectureTree}
      value={path}
      onValueChange={(next) => setPath(next)}
      placeholder="都道府県 → 市区 → 町名"
    />
  )
}
```

## Props

### `Cascader` (root)

| Prop | Type | Default | Description |
|---|---|---|---|
| `options` | `CascaderOption[]` | required | Recursive tree of options |
| `value` | `string[]` | — | Controlled path of values from root to leaf |
| `defaultValue` | `string[]` | `[]` | Uncontrolled initial path |
| `onValueChange` | `(path: string[], leafOption: CascaderOption) => void` | — | Fires on leaf commit |
| `placeholder` | `string` | `"Select"` | Trigger text when no path is selected |
| `size` | `"small" \| "default" \| "large"` | `"default"` | Trigger dimensional scale |
| `disabled` | `boolean` | `false` | Disable interaction |
| `open` | `boolean` | — | Controlled popover state |
| `defaultOpen` | `boolean` | `false` | Uncontrolled initial popover state |
| `onOpenChange` | `(open: boolean) => void` | — | Popover open / close callback |
| `showFullPath` | `boolean` | `true` | Render full breadcrumb (`A / B / C`) vs leaf-only |
| `className` | `string` | — | Merged onto the `.cascader-trigger` button |

### `CascaderOption`

| Field | Type | Description |
|---|---|---|
| `value` | `string` | Path segment value |
| `label` | `string` | Display text for this level |
| `disabled` | `boolean` | Non-selectable when `true` |
| `children` | `CascaderOption[]` | Optional children — presence drives the chevron and column expansion |

## Accessibility

- Trigger button carries `role="combobox"` + `aria-expanded` so assistive tech recognises the popover affordance.
- Columns render as nested `<ul role="group">` inside a `role="tree"` panel; each option is `role="treeitem"` with `aria-expanded` reflecting child-column visibility.
- `aria-disabled` is set when an option carries `disabled`.
- WCAG 2.1 SC 2.4.7 (Focus Visible): the underlying Radix `Popover` traps focus inside the panel and restores it to the trigger on close.

## Composition

```tsx
// Leaf-only display + value tracker
function CategoryPicker() {
  const [path, setPath] = useState<string[]>(["electronics", "smartphones"])
  return (
    <Flex vertical gap="small" style={{ maxWidth: 320 }}>
      <Cascader
        options={productCategories}
        value={path}
        onValueChange={(next) => setPath(next)}
        showFullPath={false}
        placeholder="カテゴリ"
      />
      <span style={{ fontSize: "var(--text-xs)", color: "var(--muted-foreground)" }}>
        Leaf only: <code className="mono">{JSON.stringify(path)}</code>
      </span>
    </Flex>
  )
}
```

## See also

- [TreeSelect](./TreeSelect.md) — tree-shaped popover variant.
- [Tree](./Tree.md) — inline (no-popover) hierarchical view.
- [Select](./Select.md) — flat-list dropdown alternative.
- Source: [`src/components/data-entry/Cascader.tsx`](../../../src/components/data-entry/Cascader.tsx)
