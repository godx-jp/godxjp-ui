---
title: "Tree"
description: "Standalone hierarchical view — recursive expand / collapse, optional checkboxes, optional connector lines."
diataxis: reference
audience: [developer]
status: stable
last-updated: 2026-05-18
lang: en
library: "@godxjp/ui"
library_version: 3.0.0
---

# Tree

> Standalone hierarchical view (no popover) — sibling of [TreeSelect](./TreeSelect.md). Renders inline; useful for org charts, file explorers, and category navigators where the tree IS the surface.

## When to use

| Need | Use |
|---|---|
| Tree inline (org chart, file explorer) | **Tree** |
| Tree inside a popover trigger | [TreeSelect](./TreeSelect.md) |
| Fixed-depth nested columns | [Cascader](./Cascader.md) |

## Usage

```tsx
import { Tree, type TreeNode } from "@godxjp/ui"

const ORG_TREE: TreeNode[] = [
  {
    key: "company",
    title: "ファミギア株式会社",
    children: [
      {
        key: "eng",
        title: "エンジニアリング本部",
        children: [
          { key: "fe", title: "フロントエンドチーム" },
          { key: "be", title: "バックエンドチーム" },
        ],
      },
    ],
  },
]

<Tree
  treeData={ORG_TREE}
  defaultExpandedKeys={["company", "eng"]}
  defaultValue="fe"
/>
```

## Props

### `Tree` (root)

| Prop | Type | Default | Description |
|---|---|---|---|
| `treeData` | `TreeNode[]` | required | Recursive tree of nodes |
| `value` | `string \| string[]` | — | Controlled selection — string for single, array for multiple |
| `defaultValue` | `string \| string[]` | `[]` | Uncontrolled initial selection |
| `onValueChange` | `(value: string \| string[]) => void` | — | Fires on selection change |
| `multiple` | `boolean` | `false` | Multi-select mode |
| `defaultExpandedKeys` | `string[]` | `[]` | Initially-expanded node keys |
| `expandedKeys` | `string[]` | — | Controlled expansion state |
| `onExpandedKeysChange` | `(keys: string[]) => void` | — | Fires when expand / collapse toggles |
| `checkable` | `boolean` | `false` | Render `<Checkbox>` per row — implies `multiple` |
| `showLine` | `boolean` | `false` | Render dashed connector lines between depths |
| `className` | `string` | — | Merged onto the root `<ul class="tree">` |

### `TreeNode`

| Field | Type | Description |
|---|---|---|
| `key` | `string` | Unique node identifier |
| `title` | `ReactNode` | Display content for the row |
| `icon` | `ReactNode` | Optional leading icon |
| `disabled` | `boolean` | Non-selectable, non-expandable when `true` |
| `selectable` | `boolean` | `false` to disable selection but keep expansion |
| `children` | `TreeNode[]` | Recursive children |

## Accessibility

- Root renders as `<ul role="tree">` with each row as `<li role="treeitem">`. Selection state mirrors to `aria-selected`; expansion state mirrors to `aria-expanded`; per-node disable mirrors to `aria-disabled`.
- Each toggle button carries `aria-label="Expand"` / `"Collapse"` so screen readers announce the action.
- When `checkable` is set, the underlying [`Checkbox`](./Checkbox.md) provides keyboard activation; clicking the row body also toggles selection.
- WCAG 2.1 SC 4.1.2 (Name, Role, Value): `aria-selected` and `aria-expanded` make the row state programmatically determinable.

## Composition

```tsx
// File-explorer pattern with connector lines + per-row icons
const FILE_TREE: TreeNode[] = [
  {
    key: "src",
    title: "src",
    icon: <Folder size={14} />,
    children: [
      {
        key: "components",
        title: "components",
        icon: <Folder size={14} />,
        children: [
          { key: "btn", title: "Button.tsx", icon: <FileText size={14} /> },
          { key: "input", title: "Input.tsx", icon: <FileText size={14} /> },
        ],
      },
    ],
  },
]

<Tree
  treeData={FILE_TREE}
  showLine
  defaultExpandedKeys={["src", "components"]}
  defaultValue="btn"
/>

// Multi-select with checkboxes
<Tree
  treeData={ORG_TREE}
  checkable
  defaultExpandedKeys={["company", "eng", "design"]}
  defaultValue={["fe", "ui"]}
/>
```

## See also

- [TreeSelect](./TreeSelect.md) — tree-shaped popover trigger.
- [Cascader](./Cascader.md) — fixed-depth column navigation alternative.
- [Checkbox](./Checkbox.md) — used internally when `checkable` is set.
- Source: [`src/components/data-display/Tree.tsx`](../../../src/components/data-display/Tree.tsx)
