---
title: "Typography"
description: "Title / Paragraph / Text / Link family with shared color, weight, decoration, truncate, and copyable axes."
diataxis: reference
audience: [developer]
status: stable
last-updated: 2026-05-18
lang: en
library: "@godxjp/ui"
library_version: 3.0.0
---

# Typography

> Title / Paragraph / Text / Link family sharing a common prop surface — semantic colour, inline modifiers, truncate, and copyable affordance.

## Usage

```tsx
import { Typography } from "@godxjp/ui"

const { Title, Paragraph, Text, Link } = Typography

<Title size={2}>h2. GoDX UI · 24px / --text-2xl</Title>
<Paragraph>本文段落のサンプルです。</Paragraph>
<Text color="secondary" strong>label</Text>
<Text code>useState()</Text>
<Text copyable>kb@famgia.com</Text>
<Paragraph truncate={{ rows: 3 }}>multi-line clamp…</Paragraph>
<Link href="/docs">ドキュメント</Link>
```

## Props

### Shared surface (`Title`, `Paragraph`, `Text`, `Link`)

| Prop | Type | Default | Description |
|---|---|---|---|
| `color` | `"default" \| "secondary" \| "success" \| "warning" \| "attention" \| "info" \| "destructive"` | `"default"` | Semantic role |
| `strong` | `boolean` | `false` | Bold weight via `--font-weight-bold` |
| `italic` | `boolean` | `false` | Italic style |
| `underline` | `boolean` | `false` | Underline decoration |
| `del` | `boolean` | `false` | Line-through decoration |
| `mark` | `boolean` | `false` | Highlight pill — 山吹 (warning) tint |
| `code` | `boolean` | `false` | Render as inline `<code>` chip |
| `keyboard` | `boolean` | `false` | Render as inline `<kbd>` chip |
| `disabled` | `boolean` | `false` | Mute colour and disable interaction |
| `truncate` | `boolean \| { rows?: number }` | — | Single-line ellipsis (`true`) or multi-line clamp |
| `copyable` | `boolean \| { text?: string; onCopy?: () => void }` | `false` | Show a copy icon-button after the text |

### `Title`

| Prop | Type | Default | Description |
|---|---|---|---|
| `size` | `1 \| 2 \| 3 \| 4 \| 5` | `1` | Heading scale — renders `<h{size}>` and binds the canon font-size token (h1=`--text-4xl`, h2=`--text-2xl`, h3=`--text-xl`, h4=`--text-lg`, h5=`--text-md`) |

### `Paragraph`, `Text`, `Link`

`Paragraph` extends `ComponentProps<"p">`, `Text` extends `ComponentProps<"span">`, `Link` extends `ComponentProps<"a">`. All share the prop surface above.

Vocabulary per cardinal rule 23 §B: `size` (never `level`), `truncate` (never `ellipsis`), `copyable` (boolean / object — same shape as Tag's `closable`).

## Accessibility

- `Title` renders the appropriate `<h1>`…`<h5>` element by `size`. Keep heading levels consistent with your document outline — if the page already has an `<h1>`, prefer `size={2}` or `size={3}` for section headings.
- `Link` sets `aria-disabled` when `disabled` is true — pair with `onClick` guard in your handler to actually block navigation.
- The `copyable` affordance is a real `<button>` with `aria-label="Copy"` / `aria-label="Copied"` after a 2-second flash; clipboard access falls back silently on rejection.
- WCAG 2.1 SC 1.4.4: every size scales with the `[data-font-size]` axis (sm / base / lg / xl) via rem-based token chain — pixel literals are not used.

## Composition

```tsx
// Section heading + body + secondary footnote
<>
  <Title size={3}>規約</Title>
  <Paragraph>
    本サービスのご利用にあたっては、以下の規約に同意いただいたものとみなします。
  </Paragraph>
  <Paragraph color="secondary">最終更新: 2026-05-18</Paragraph>
</>

// Multi-line clamp for a card snippet
<Paragraph truncate={{ rows: 3 }}>
  長文の本文がここに入る。3 行で省略され、末尾に … が表示されます。
</Paragraph>

// Copyable email
<Text copyable>support@famgia.com</Text>
```

## See also

- [Link](./Label.md) — for form-control labels rather than inline anchors.
- Source: [`src/components/general/Typography.tsx`](../../../src/components/general/Typography.tsx)
