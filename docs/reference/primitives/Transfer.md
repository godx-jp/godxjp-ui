---
title: "Transfer"
description: "Dual list-box — items move from the source column to the target column via arrow buttons."
diataxis: reference
audience:
  - developer
status: draft
last-updated: 2026-05-17
lang: en
library: "@godxjp/ui"
library_version: 3.0.0
---

# Transfer

Dual list-box. Items in the left ("source") column move to the right ("target") column via arrow buttons; `value` tracks the keys currently on the right. Vocabulary per cardinal rule 23 §B: `value` / `defaultValue` / `onValueChange` (Radix-style — not Ant's `targetKeys`); `size`; `disabled`.

## Import

```ts
import { Transfer } from "@godxjp/ui/components/primitives"
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `dataSource *` | `TransferItem[]` | — | Items shown across both columns (`{ key, label, disabled? }`) |
| `value` | `string[]` | — | Keys currently on the right ("target") column |
| `defaultValue` | `string[]` | `[]` | Uncontrolled initial right column |
| `onValueChange` | `(value: string[]) => void` | — | Called when the right column changes |
| `titles` | `[ReactNode, ReactNode]` | `["", ""]` | Headers `[left, right]` |
| `size` | `"small" \| "default" \| "large"` | `"default"` | Dimensional scale |
| `showSearch` | `boolean` | `false` | Render a search box above each column |
| `disabled` | `boolean` | `false` | Disable the whole control |

## Example

```tsx
const [chosen, setChosen] = useState<string[]>(["suzuki"])

return (
  <Transfer
    dataSource={employees}
    value={chosen}
    onValueChange={setChosen}
    titles={["利用可能", "アサイン済み"]}
  />
)
```

## Related

- Story catalogue: [`Transfer` stories](../../../src/stories/data-entry/Transfer.stories.tsx)
- Source: [`src/components/data-entry/Transfer.tsx`](../../../src/components/data-entry/Transfer.tsx)
- Cardinal rule 23 §B prop vocabulary: [`CLAUDE.md` §23.B](../../../CLAUDE.md#23)

## Status

`draft` — auto-generated stub. Detailed prop docs / accessibility notes / design rationale still to be filled in.
