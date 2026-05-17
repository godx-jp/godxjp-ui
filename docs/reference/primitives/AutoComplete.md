---
title: "AutoComplete"
description: "Combobox-backed text input with filtered suggestions; free-text typing always allowed, optional commit on blur via `allowCustomValue`."
diataxis: reference
audience:
  - developer
status: draft
last-updated: 2026-05-17
lang: en
library: "@godxjp/ui"
library_version: 3.0.0
---

# AutoComplete

Combobox-backed text input with filtered suggestions. Thin wrapper over `Combobox*` (cmdk + Radix Popover). Free-text typing is always allowed; selecting a suggestion COMMITS that option's `value` via `onValueChange`. With `allowCustomValue`, blurring while the typed text does not match any option commits the typed text as the value.

## Import

```ts
import { AutoComplete } from "@godxjp/ui/components/primitives"
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `options *` | `AutoCompleteOption[]` | — | `{ value, label, disabled? }` |
| `value` | `string` | — | Controlled committed value |
| `defaultValue` | `string` | — | Uncontrolled initial value |
| `onValueChange` | `(value: string) => void` | — | Called when an option is committed |
| `placeholder` | `string` | — | Placeholder text |
| `size` | `"small" \| "default" \| "large"` | `"default"` | Dimensional scale |
| `allowCustomValue` | `boolean` | `false` | Commit typed text even when no option matches |
| `disabled` | `boolean` | `false` | Disable interaction |
| `open` / `defaultOpen` / `onOpenChange` | Radix overlay state | — | Controlled / uncontrolled popover state |

## Example

```tsx
const [value, setValue] = useState("")

return (
  <AutoComplete
    options={employees}
    value={value}
    onValueChange={setValue}
    placeholder="従業員を検索…"
  />
)
```

## Related

- Story catalogue: [`AutoComplete` stories](../../../src/stories/data-entry/AutoComplete.stories.tsx)
- Source: [`src/components/data-entry/AutoComplete.tsx`](../../../src/components/data-entry/AutoComplete.tsx)
- Cardinal rule 23 §B prop vocabulary: [`CLAUDE.md` §23.B](../../../CLAUDE.md#23)

## Status

`draft` — auto-generated stub. Detailed prop docs / accessibility notes / design rationale still to be filled in.
