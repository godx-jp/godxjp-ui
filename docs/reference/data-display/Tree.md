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

> Standalone hierarchical view (no popover) — sibling of [TreeSelect](../data-entry/TreeSelect.md). Renders inline; useful for org charts, file explorers, and category navigators where the tree IS the surface.

## When to use

| Need                                   | Use                                       |
| -------------------------------------- | ----------------------------------------- |
| Tree inline (org chart, file explorer) | **Tree**                                  |
| Tree inside a popover trigger          | [TreeSelect](../data-entry/TreeSelect.md) |
| Fixed-depth nested columns             | [Cascader](../data-entry/Cascader.md)     |

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

| Prop                   | Type                                        | Default  | Description                                                                 |
| ---------------------- | ------------------------------------------- | -------- | --------------------------------------------------------------------------- |
| `treeData`             | `TreeNode[]`                                | required | Recursive tree of nodes                                                     |
| `value`                | `string \| string[]`                        | —        | Controlled selection — string for single, array for multiple                |
| `defaultValue`         | `string \| string[]`                        | `[]`     | Uncontrolled initial selection                                              |
| `onValueChange`        | `(value: string \| string[]) => void`       | —        | Fires on selection change                                                   |
| `multiple`             | `boolean`                                   | `false`  | Multi-select mode                                                           |
| `defaultExpandedKeys`  | `string[]`                                  | `[]`     | Initially-expanded node keys                                                |
| `expandedKeys`         | `string[]`                                  | —        | Controlled expansion state                                                  |
| `onExpandedKeysChange` | `(keys: string[]) => void`                  | —        | Fires when expand / collapse toggles                                        |
| `checkable`            | `boolean`                                   | `false`  | Render `<Checkbox>` per row — implies `multiple`                            |
| `showLine`             | `boolean`                                   | `false`  | Render dashed connector lines between depths                                |
| `density`              | `"compact" \| "default" \| "comfortable"`   | —        | Local row spacing override; omit to inherit the page density                |
| `renderItem`           | `(state: TreeRenderItemState) => ReactNode` | —        | Overrides row icon + label content while keeping the React Aria tree engine |
| `className`            | `string`                                    | —        | Merged onto the root `<div class="tree">`                                   |

### `TreeRenderItemState`

| Field         | Type       | Description                        |
| ------------- | ---------- | ---------------------------------- |
| `node`        | `TreeNode` | Current tree node                  |
| `isExpanded`  | `boolean`  | Whether this item is expanded      |
| `isSelected`  | `boolean`  | Whether this item is selected      |
| `isDisabled`  | `boolean`  | Whether this item is disabled      |
| `hasChildren` | `boolean`  | Whether this item has child nodes  |
| `level`       | `number`   | 1-based tree depth from React Aria |

### `TreeNode`

| Field        | Type         | Description                                     |
| ------------ | ------------ | ----------------------------------------------- |
| `key`        | `string`     | Unique node identifier                          |
| `title`      | `ReactNode`  | Display content for the row                     |
| `icon`       | `ReactNode`  | Optional leading icon                           |
| `disabled`   | `boolean`    | Non-selectable, non-expandable when `true`      |
| `selectable` | `boolean`    | `false` to disable selection but keep expansion |
| `children`   | `TreeNode[]` | Recursive children                              |

## Accessibility

- Tree is backed by `react-aria-components` `Tree`, which provides ARIA tree roles, keyboard navigation, selection, expansion, disabled handling, and typeahead.
- Consumers customize row content with `renderItem`; they do not compose a separate public `TreeItem` component.
- When `checkable` is set, React Aria's selection checkbox slot is rendered beside the row content.
- WCAG 2.1 SC 4.1.2 (Name, Role, Value): React Aria owns the row roles and state attributes so selection and expansion are programmatically determinable.

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
  density="compact"
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

// Custom row content
<Tree
  treeData={FILE_TREE}
  defaultExpandedKeys={["src", "components"]}
  renderItem={({ node, level }) => (
    <>
      {node.icon}
      <span>{node.title}</span>
      <span>L{level}</span>
    </>
  )}
/>
```

## See also

- [TreeSelect](../data-entry/TreeSelect.md) — tree-shaped popover trigger.
- [Cascader](../data-entry/Cascader.md) — fixed-depth column navigation alternative.
- [Checkbox](../data-entry/Checkbox.md) — used internally when `checkable` is set.
- Source: [`src/components/data-display/Tree.tsx`](../../../src/components/data-display/Tree.tsx)
