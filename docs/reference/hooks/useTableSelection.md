---
title: "useTableSelection"
diataxis: reference
library: "@godxjp/ui"
library_version: 4.0.0
hook: useTableSelection
status: stable
audience: [developer, agent]
lang: en
---

# useTableSelection

> Row-selection slice. Single or multiple mode, controlled or
> uncontrolled. Wires into `<Table batchActions={{ selectedRowKeys,
> onSelectedRowKeysChange }}>`.

## Usage

```tsx
import { useTableSelection } from "@godxjp/ui"

const selection = useTableSelection({ mode: "multiple" })

<Table
  batchActions={{
    selectedRowKeys: selection.selectedRowKeys,
    onSelectedRowKeysChange: selection.setSelectedRowKeys,
    actions: (
      <>
        <Button size="small" variant="outline">一括承認</Button>
        <Button size="small" variant="destructive" onClick={selection.clear}>
          却下
        </Button>
      </>
    ),
  }}
/>
```

## Options

| Option            | Type                              | Default      | Description                                         |
| ----------------- | --------------------------------- | ------------ | --------------------------------------------------- |
| `mode`            | `"single" \| "multiple"`          | `"multiple"` | `"single"` replaces previous selection on toggle    |
| `defaultSelected` | `string[]`                        | `[]`         | Initial selected keys (uncontrolled)                |
| `selected`        | `string[]`                        | —            | Controlled selection                                |
| `onChange`        | `(keys: string[]) => void`        | —            | Fires when selection changes                        |

## Returns

| Field                 | Type                            | Description                                          |
| --------------------- | ------------------------------- | ---------------------------------------------------- |
| `selectedRowKeys`     | `string[]`                      | Current selection                                    |
| `setSelectedRowKeys`  | `(keys: string[]) => void`      | Replace the entire selection                         |
| `toggle`              | `(key: string) => void`         | Toggle a single row                                  |
| `select`              | `(key: string) => void`         | Add a row (replaces in `"single"` mode)              |
| `deselect`            | `(key: string) => void`         | Remove a row                                         |
| `clear`               | `() => void`                    | Clear the selection                                  |
| `isSelected`          | `(key: string) => boolean`      | Membership check                                     |
| `count`               | `number`                        | `selectedRowKeys.length`                             |

## See also

- [`useTablePagination`](./useTablePagination.md), [`useTableViews`](./useTableViews.md), [`useTableState`](./useTableState.md).
- [`<DataTable>`](../composites/DataTable.md) — wires `selection` into `batchActions` automatically when both are provided.
