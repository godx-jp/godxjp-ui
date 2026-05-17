---
title: "Collapse"
description: "Accordion-style expandable panel group — single or multi-open, with default / ghost / outlined visual variants."
diataxis: reference
audience:
  - developer
status: draft
last-updated: 2026-05-17
lang: en
library: "@godxjp/ui"
library_version: 3.0.0
---

# Collapse

Accordion-style expandable panel group. Compositional via `<CollapsePanel>` children. Vocabulary per cardinal rule 23 §B: `value` / `defaultValue` / `onValueChange` for expansion state (string for single, `string[]` for multi); `multiple` boolean; `variant` for visual treatment; `size` for dimensional scale. Never Ant's `activeKey` / `accordion` / `bordered`.

## Import

```ts
import { Collapse, CollapsePanel } from "@godxjp/ui/components/primitives"
```

## Props (`Collapse`)

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `string \| string[]` | — | Controlled expanded panel key(s) |
| `defaultValue` | `string \| string[]` | — | Uncontrolled initial expansion |
| `onValueChange` | `(value: string \| string[]) => void` | — | Called when expansion changes |
| `multiple` | `boolean` | `false` | Allow multiple panels open simultaneously |
| `variant` | `"default" \| "ghost" \| "outlined"` | `"default"` | Visual treatment |
| `size` | `"small" \| "default" \| "large"` | `"default"` | Dimensional scale |
| `disabled` | `boolean` | `false` | Disable every panel |

## Example

```tsx
<Collapse defaultValue="q1">
  <CollapsePanel value="q1" title="godx-adminとは何ですか？">
    <p>godx-adminは、開発者ワークスペース・プロジェクト管理・サンドボックス起動を統合した社内プラットフォームです。</p>
  </CollapsePanel>
  <CollapsePanel value="q2" title="サンドボックスは何分で起動しますか？">
    <p>新規サンドボックス作成は通常1〜2分程度です。</p>
  </CollapsePanel>
</Collapse>
```

## Related

- Story catalogue: [`Collapse` stories](../../../src/stories/data-display/Collapse.stories.tsx)
- Source: [`src/components/data-display/Collapse.tsx`](../../../src/components/data-display/Collapse.tsx)
- Cardinal rule 23 §B prop vocabulary: [`CLAUDE.md` §23.B](../../../CLAUDE.md#23)

## Status

`draft` — auto-generated stub. Detailed prop docs / accessibility notes / design rationale still to be filled in.
