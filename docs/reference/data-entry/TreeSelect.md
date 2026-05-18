---
title: "TreeSelect"
description: "Tree-structured select with single and multiple selection."
diataxis: reference
library: "@godxjp/ui"
library_version: 3.0.0
component: TreeSelect
status: stable
audience: [developer, agent]
last-updated: 2026-05-18
lang: en
---

# TreeSelect

> Tree-shaped Select rendered in a Popover.

## Usage

```tsx
import { TreeSelect } from "@godxjp/ui";

<TreeSelect
  placeholder="Select category"
  options={[
    {
      value: "sales",
      label: "Sales",
      children: [{ value: "inside-sales", label: "Inside sales" }],
    },
  ]}
/>;
```

## Types

```ts
interface TreeSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  children?: TreeSelectOption[];
}
```

## Props

| Prop               | Type                                  | Default    | Description                        |
| ------------------ | ------------------------------------- | ---------- | ---------------------------------- |
| `options`          | `TreeSelectOption[]`                  | required   | Tree option nodes                  |
| `value`            | `string \| string[]`                  | —          | Controlled value                   |
| `defaultValue`     | `string \| string[]`                  | —          | Initial uncontrolled value         |
| `onValueChange`    | `(value: string \| string[]) => void` | —          | Selection change handler           |
| `multiple`         | `boolean`                             | `false`    | Enables checkbox multi-select      |
| `placeholder`      | `string`                              | `"Select"` | Trigger placeholder                |
| `size`             | `"small" \| "default" \| "large"`     | `default`  | Trigger size                       |
| `disabled`         | `boolean`                             | `false`    | Disables the trigger               |
| `open`             | `boolean`                             | —          | Controlled popover state           |
| `defaultOpen`      | `boolean`                             | —          | Initial uncontrolled popover state |
| `onOpenChange`     | `(open: boolean) => void`             | —          | Popover state change handler       |
| `defaultExpandAll` | `boolean`                             | `false`    | Expands every node on first render |
| `className`        | `string`                              | —          | Trigger class name                 |

## See Also

- [Tree](../data-display/Tree.md) — inline tree surface.
- [Cascader](./Cascader.md) — fixed-depth column navigation.
- [Select](./Select.md) — flat select.
