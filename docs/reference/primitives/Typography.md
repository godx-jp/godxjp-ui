---
title: "Typography"
description: "Title / Paragraph / Text / Link family with shared color, weight, decoration, truncate, and copyable axes."
diataxis: reference
audience:
  - developer
status: draft
last-updated: 2026-05-17
lang: en
library: "@godxjp/ui"
library_version: 3.0.0
---

# Typography

Title / Paragraph / Text / Link primitive family. Four members share a common prop surface: `color`, `strong`, `italic`, `underline`, `del`, `mark`, `code`, `keyboard`, `disabled`, `copyable`, `truncate`. `Title` accepts `size` 1–5 — sizes follow the canon heading mapping declared in `theme.css` (`1` = `--text-4xl`, `2` = `--text-2xl`, `3` = `--text-xl`, `4` = `--text-lg`, `5` = `--text-md`). Per cardinal rule 23 §B no Ant-named props leak in: `truncate` (never `ellipsis`), `size` (never `level`).

## Import

```ts
import { Typography } from "@godxjp/ui/components/primitives"

const { Title, Paragraph, Text, Link } = Typography
```

## Props (shared surface)

| Prop | Type | Default | Description |
|---|---|---|---|
| `color` | `"default" \| "secondary" \| "success" \| "warning" \| "attention" \| "info" \| "destructive"` | `"default"` | Semantic role |
| `strong` | `boolean` | `false` | Bold weight via `--font-weight-bold` |
| `italic` / `underline` / `del` / `mark` / `code` / `keyboard` | `boolean` | `false` | HTML5 semantic inline modifiers |
| `truncate` | `boolean \| { rows?: number }` | — | Single-line or multi-line clamp with ellipsis |
| `copyable` | `boolean \| { text?: string; onCopy?: () => void }` | `false` | Show a copy icon-button after the text |
| `disabled` | `boolean` | `false` | Mute color and disable interaction |

### `Title`-only

| Prop | Type | Default | Description |
|---|---|---|---|
| `size` | `1 \| 2 \| 3 \| 4 \| 5` | `1` | Heading scale (h1=4xl, h2=2xl, h3=xl, h4=lg, h5=md) |

## Example

```tsx
<Title size={2}>h2. GoDX UI · 24px / --text-2xl</Title>
<Paragraph>本文段落のサンプルです。</Paragraph>
<Text color="secondary" strong>label</Text>
<Text copyable>kb@famgia.com</Text>
<Link href="/docs">ドキュメント</Link>
```

## Related

- Story catalogue: [`Typography` stories](../../../src/stories/general/Typography.stories.tsx)
- Source: [`src/components/general/Typography.tsx`](../../../src/components/general/Typography.tsx)
- Cardinal rule 23 §B prop vocabulary: [`CLAUDE.md` §23.B](../../../CLAUDE.md#23)

## Status

`draft` — auto-generated stub. Detailed prop docs / accessibility notes / design rationale still to be filled in.
