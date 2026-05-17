---
title: "Field"
description: "Label + control + help vertical group — compositional primitive with Field.Label / Field.Help / Field.Count / Field.RowHelp sub-atoms."
diataxis: reference
audience:
  - developer
status: draft
last-updated: 2026-05-17
lang: en
library: "@godxjp/ui"
library_version: 3.0.0
---

# Field

Label + control + help vertical group, matching the canonical `.field` atom from the dxs-kintai design canon. Compositional API: `<Field>` is the vertical container; `Field.Label`, `Field.Help`, `Field.Count`, and `Field.RowHelp` are structural sub-atoms. Tone variants on `Field.Help` (`error`, `warn`, `info`, `success`) re-target the help line through `.help.err` / `.help.warn` / `.help.info` / `.help.ok` modifiers.

## Import

```ts
import { Field } from "@godxjp/ui/components/primitives"
```

## Props

### `Field`

| Prop | Type | Default | Description |
|---|---|---|---|
| `children *` | `ReactNode` | — | Label, control, help atoms |
| `...rest` | `HTMLAttributes<HTMLDivElement>` | — | Standard `<div>` props |

### `Field.Label`

| Prop | Type | Default | Description |
|---|---|---|---|
| `required` | `boolean` | `false` | Append a red asterisk |
| `optional` | `boolean` | `false` | Append a "(任意)" marker |
| `info` | `ReactNode` | — | Inline help icon — typically a tooltip handle |
| `extra` | `ReactNode` | — | Trailing slot at the right edge (e.g. "Forgot password?") |

## Example

```tsx
<Field>
  <Field.Label>従業員コード</Field.Label>
  <Input placeholder="EMP-0001" />
  <Field.Help>英数字 4–8 文字で入力してください。</Field.Help>
</Field>
```

## Related

- Story catalogue: [`Field` stories](../../../src/stories/data-entry/Field.stories.tsx)
- Source: [`src/components/data-entry/Field.tsx`](../../../src/components/data-entry/Field.tsx)
- Cardinal rule 23 §B prop vocabulary: [`CLAUDE.md` §23.B](../../../CLAUDE.md#23)

## Status

`draft` — auto-generated stub. Detailed prop docs / accessibility notes / design rationale still to be filled in.
