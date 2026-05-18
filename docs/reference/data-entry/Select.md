---
title: "Select"
description: "Single-select dropdown field. Radix-backed by default; `searchable` flips to a cmdk + Popover variant with a filter input."
diataxis: reference
library: "@godxjp/ui"
library_version: 4.0.0
component: Select
status: stable
audience: [developer, agent]
last-updated: 2026-05-18
lang: en
---

# Select

> Single-select dropdown rendered through one `Select` component.
> Pass `searchable` for a filterable variant (former `Combobox`).

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

## Searchable variant

For lists where Radix's built-in typeahead is not enough (~50+ options),
pass `searchable`. The component renders a cmdk-backed filter input above
the list. Value semantics stay the same — `value` must be one of
`options[i].value`. Free-text commit is not supported (use
[AutoComplete](./AutoComplete.md) for that).

```tsx
<Select
  searchable
  options={countries}
  value={country}
  onValueChange={setCountry}
  placeholder="Choose a country"
  searchPlaceholder="Search…"
  emptyLabel="No matches"
/>
```

Async data loads through the same prop surface:

```tsx
<Select
  searchable
  open={open}
  onOpenChange={setOpen}
  options={items}
  loading={loading}
  loadingLabel="Loading…"
  emptyLabel="No matches"
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

| Prop                     | Type                      | Description                                                        |
| ------------------------ | ------------------------- | ------------------------------------------------------------------ |
| `options`                | `SelectOptions`           | Required option list                                               |
| `placeholder`            | `ReactNode`               | Placeholder when empty                                             |
| `value` / `defaultValue` | `string`                  | Controlled / uncontrolled selected value                           |
| `onValueChange`          | `(value: string) => void` | Selection callback                                                 |
| `disabled`               | `boolean`                 | Disables the field                                                 |
| `triggerClassName`       | `string`                  | Extra class for the trigger                                        |
| `contentClassName`       | `string`                  | Extra class for the dropdown surface                               |
| `searchable`             | `boolean`                 | Render the cmdk + Popover variant with a filter input              |
| `searchPlaceholder`      | `string`                  | Search input placeholder (searchable mode only)                    |
| `emptyLabel`             | `ReactNode`               | Shown when filter matches nothing (searchable mode only)           |
| `loading`                | `boolean`                 | Render a disabled loading row instead of options (searchable only) |
| `loadingLabel`           | `ReactNode`               | Loading row text (default `"Loading…"`)                            |

## Accessibility

- Default (non-searchable) mode wraps Radix Select for focus / keyboard /
  ARIA — typeahead is built in (press a letter while open to jump to the
  matching item).
- `searchable` mode renders a Popover containing a cmdk Command. The
  search input is an `<input type="text">` with arrow-key navigation
  through filtered items; Enter selects, Escape closes.
- Pair with `Label` or pass `aria-label` when no visible label exists.

## Migration from Combobox

The standalone `Combobox` primitive was merged into `<Select searchable>`
at v4.0.0. The shape is the same; rename the import and toggle the flag:

```diff
- import { Combobox } from "@godxjp/ui";
+ import { Select } from "@godxjp/ui";

- <Combobox
-   options={employees}
-   triggerLabel="Select employee"
-   placeholder="Search by name"
-   emptyLabel="No matches"
-   value={value}
-   onValueChange={setValue}
- />
+ <Select
+   searchable
+   options={employees}
+   placeholder="Select employee"
+   searchPlaceholder="Search by name"
+   emptyLabel="No matches"
+   value={value}
+   onValueChange={setValue}
+ />
```

Notes:

- `triggerLabel` → `placeholder` (Select-canonical).
- `placeholder` (search input) → `searchPlaceholder` to avoid the
  overload with trigger placeholder.
- `value` is now controlled-or-uncontrolled the same way Radix Select
  is — `defaultValue` works too.
