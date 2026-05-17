---
title: "Tree"
description: "Standalone hierarchical view (no popover) — sibling of TreeSelect, useful for org charts, file explorers, and category navigators."
diataxis: reference
audience:
  - developer
status: draft
last-updated: 2026-05-17
lang: en
library: "@godxjp/ui"
library_version: 3.0.0
---

# Tree

Standalone hierarchical view. Sibling of `<TreeSelect>` — same recursive shape, but renders inline (not in a dropdown). Useful for org charts, file explorers, and category navigators where the tree IS the surface. Vocabulary per cardinal rule 23 §B: `value` / `defaultValue` / `onValueChange` (single = `string`, multiple = `string[]`); `multiple` boolean (never `mode="multiple"`); `expandedKeys` / `defaultExpandedKeys` / `onExpandedKeysChange`.

## Import

```ts
import { Tree } from "@godxjp/ui/components/primitives"
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `treeData *` | `TreeNode[]` | — | Recursive tree (`{ key, title, icon?, disabled?, children? }`) |
| `value` | `string \| string[]` | — | Selected key(s) |
| `defaultValue` | `string \| string[]` | — | Uncontrolled initial selection |
| `onValueChange` | `(value: string \| string[]) => void` | — | Called when selection changes |
| `multiple` | `boolean` | `false` | Allow multi-select |
| `defaultExpandedKeys` | `string[]` | — | Initially-expanded node keys |
| `expandedKeys` / `onExpandedKeysChange` | controlled expansion | — | Controlled expansion state |
| `checkable` | `boolean` | `false` | Render checkboxes (implies `multiple`) |
| `showLine` | `boolean` | `false` | Render dashed indent guides |

## Example

```tsx
<Tree
  treeData={[
    { key: "eng", title: "エンジニアリング", children: [
      { key: "fe", title: "Frontend" },
      { key: "be", title: "Backend" },
    ]},
  ]}
  defaultExpandedKeys={["eng"]}
/>
```

## Related

- Story catalogue: [`Tree` stories](../../../src/stories/data-display/Tree.stories.tsx)
- Source: [`src/components/data-display/Tree.tsx`](../../../src/components/data-display/Tree.tsx)
- Cardinal rule 23 §B prop vocabulary: [`CLAUDE.md` §23.B](../../../CLAUDE.md#23)

## Status

`draft` — auto-generated stub. Detailed prop docs / accessibility notes / design rationale still to be filled in.
