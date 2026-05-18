---
title: "AutoComplete"
description: "Combobox-backed text input with case-insensitive suggestion filtering and optional free-text commit."
diataxis: reference
audience: [developer]
status: stable
last-updated: 2026-05-18
lang: en
library: "@godxjp/ui"
library_version: 3.0.0
---

# AutoComplete

> Combobox-backed text input — type to filter suggestions; pick to commit the option's `value`.

Thin wrapper over the `Combobox*` primitives (cmdk + Radix Popover). Free-text typing is always allowed; selecting a suggestion commits that option's `value` via `onValueChange`. With `allowCustomValue`, typed text that does not match any option still commits on blur — useful when the suggestion list is a hint, not a constraint.

## When to use

See [Select](./Select.md) for the canonical decision table. In short:

| Need                                                 | Use                       |
| ---------------------------------------------------- | ------------------------- |
| Search / filter input above the list                 | [Combobox](./Combobox.md) |
| Free-text typing in addition to filtered suggestions | **AutoComplete**          |
| Fixed list, no search                                | [Select](./Select.md)     |
| Hierarchical / nested options                        | [Cascader](./Cascader.md) |

## Usage

```tsx
import { useState } from "react";
import { AutoComplete, type AutoCompleteOption } from "@godxjp/ui";

const employees: AutoCompleteOption[] = [
  { value: "tanaka-misaki", label: "田中 美咲" },
  { value: "sato-kenji", label: "佐藤 健治" },
  { value: "suzuki-rina", label: "鈴木 莉奈" },
];

function NameInput() {
  const [value, setValue] = useState("");
  return (
    <div style={{ maxWidth: 280 }}>
      <AutoComplete
        options={employees}
        value={value}
        onValueChange={setValue}
        placeholder="名前を入力"
      />
    </div>
  );
}
```

## Props

### `AutoComplete` (root)

| Prop               | Type                              | Default     | Description                                           |
| ------------------ | --------------------------------- | ----------- | ----------------------------------------------------- |
| `options`          | `AutoCompleteOption[]`            | required    | Filterable suggestion list                            |
| `value`            | `string`                          | —           | Controlled selected `value` (the option slug)         |
| `defaultValue`     | `string`                          | —           | Uncontrolled initial value                            |
| `onValueChange`    | `(value: string) => void`         | —           | Fires on typing AND on selection                      |
| `placeholder`      | `string`                          | —           | Input placeholder                                     |
| `size`             | `"small" \| "default" \| "large"` | `"default"` | Input dimensional scale                               |
| `disabled`         | `boolean`                         | `false`     | Disable interaction                                   |
| `open`             | `boolean`                         | —           | Controlled popover state                              |
| `defaultOpen`      | `boolean`                         | `false`     | Uncontrolled initial popover state                    |
| `onOpenChange`     | `(open: boolean) => void`         | —           | Popover open / close callback                         |
| `allowCustomValue` | `boolean`                         | `false`     | Commit typed text on blur even when no option matches |
| `className`        | `string`                          | —           | Merged onto the underlying `<input class="input">`    |

### `AutoCompleteOption`

| Field      | Type      | Description                                          |
| ---------- | --------- | ---------------------------------------------------- |
| `value`    | `string`  | Committed value (typically a slug)                   |
| `label`    | `string`  | Display text rendered in the input + option row      |
| `disabled` | `boolean` | Optional — when `true`, the option is non-selectable |

## Accessibility

- Renders a native `<input role="combobox" aria-expanded={open} aria-autocomplete="list">` — assistive tech announces both the typed text and the suggestion list state.
- Keyboard: arrow keys cycle suggestions, `Enter` commits, `Escape` closes the popover without committing.
- Focus stays on the input even when the popover opens — selecting an option does not steal focus.
- Disabled options carry `aria-disabled="true"` and are skipped during arrow-key navigation (cmdk default).
- WCAG 2.1 SC 4.1.3 (Status Messages): the popover content uses Radix's portalled `role="listbox"` so suggestions are announced in-flow.

## Composition

```tsx
// Controlled with custom-value commit
function NameOrAdHocInput() {
  const [value, setValue] = useState("");
  return (
    <Flex vertical gap="small" style={{ maxWidth: 320 }}>
      <AutoComplete
        options={employees}
        value={value}
        onValueChange={setValue}
        allowCustomValue
        placeholder="社員名 or 自由入力"
      />
      <span
        style={{ fontSize: "var(--text-xs)", color: "var(--muted-foreground)" }}
      >
        Current value: <code className="mono">{JSON.stringify(value)}</code>
      </span>
    </Flex>
  );
}
```

## See also

- [Combobox](./Combobox.md) — underlying primitive without the free-text commit shortcut.
- [Select](./Select.md) — fixed-list dropdown with the canonical decision table.
- [Cascader](./Cascader.md) — nested-column variant for hierarchical data.
- Source: [`src/components/data-entry/AutoComplete.tsx`](../../../src/components/data-entry/AutoComplete.tsx)
