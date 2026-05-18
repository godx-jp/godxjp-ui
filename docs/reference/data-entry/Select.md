---
title: "Select"
description: "Single-component Radix-backed dropdown field driven by an options array."
diataxis: reference
library: "@godxjp/ui"
library_version: 3.0.0
component: Select
status: stable
audience: [developer, agent]
last-updated: 2026-05-18
lang: en
---

# Select

> Dropdown field rendered through one `Select` component.

## Usage

```tsx
import { Select } from "@godxjp/ui";

<Select
  placeholder="Select status…"
  options={[
    { value: "open", label: "Open" },
    { value: "in-progress", label: "In progress" },
    { value: "done", label: "Done" },
  ]}
/>;
```

## Grouped Options

```tsx
<Select
  placeholder="Select priority…"
  options={[
    {
      label: "High priority",
      options: [
        { value: "critical", label: "Critical" },
        { value: "high", label: "High" },
      ],
    },
    {
      label: "Normal",
      options: [
        { value: "medium", label: "Medium" },
        { value: "low", label: "Low" },
      ],
    },
  ]}
/>
```

## Exports

| Export              | Description                     |
| ------------------- | ------------------------------- |
| `Select`            | Single dropdown field component |
| `SelectProps`       | Props for `Select`              |
| `SelectOption`      | Leaf option type                |
| `SelectOptionGroup` | Grouped option type             |
| `SelectOptions`     | Option array type               |

## Props

| Prop                     | Type                      | Description                              |
| ------------------------ | ------------------------- | ---------------------------------------- |
| `options`                | `SelectOptions`           | Required option list                     |
| `placeholder`            | `ReactNode`               | Placeholder when empty                   |
| `value` / `defaultValue` | `string`                  | Controlled / uncontrolled selected value |
| `onValueChange`          | `(value: string) => void` | Selection callback                       |
| `disabled`               | `boolean`                 | Disables the field                       |
| `triggerClassName`       | `string`                  | Extra class for the trigger              |
| `contentClassName`       | `string`                  | Extra class for the dropdown surface     |

## Accessibility

- Backed by Radix Select for focus management and keyboard navigation.
- Pair with `Label` or pass `aria-label` when no visible label exists.
