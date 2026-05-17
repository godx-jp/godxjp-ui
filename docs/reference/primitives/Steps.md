---
title: "Steps"
description: "Wizard / progress indicator with horizontal or vertical orientation; each step carries title, description, and an optional icon."
diataxis: reference
audience: [developer]
status: stable
last-updated: 2026-05-18
lang: en
library: "@godxjp/ui"
library_version: 3.0.0
---

# Steps

> Wizard / progress indicator — sequence of titled nodes with an active index, in horizontal or vertical orientation.

## Usage

```tsx
import { Steps, Step } from "@godxjp/ui"

<Steps current={2}>
  <Step title="情報入力" description="5/14 09:22" />
  <Step title="確認" description="5/14 09:24" />
  <Step title="承認待ち" description="進行中" />
  <Step title="支払い" description="—" />
  <Step title="完了" description="—" />
</Steps>
```

## Props

### `Steps`

| Prop | Type | Default | Description |
|---|---|---|---|
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` | Axis of stack |
| `current` | `number` | `0` | Zero-based index of the in-progress step. Steps before are marked `done`, after are `dis` (disabled) |
| `...rest` | `Omit<ComponentProps<"ol">, "color">` | — | Standard `<ol>` props |

### `Step`

| Prop | Type | Default | Description |
|---|---|---|---|
| `title` | `ReactNode` | — | Step title |
| `description` | `ReactNode` | — | Step description (shown below in vertical / inline in horizontal) |
| `icon` | `ReactNode` | index number / check | Override the node icon (default: index for current/upcoming, check for done) |
| `...rest` | `Omit<ComponentProps<"li">, "title">` | — | Standard `<li>` props |

Vocabulary per cardinal rule 23 §B: `orientation` (axis of stack), `current` (number, active index).

Visual state is locked to the dxs-kintai canon (`comp-card.html` §F6) and derived from the index ↔ `current` comparison:

| State | Token chain |
|---|---|
| `done` (index `<` current) | `--success` ring + check icon |
| `cur` (index `===` current) | `--primary` ring + index number |
| future (index `>` current) | `--border` ring + `--muted-foreground` text |

There is no per-step `color` override prop — the colour chain is a non-negotiable progress contract. If a consumer needs a different semantic colour for a step, the right primitive is `<Timeline>` (event log) rather than `<Steps>` (wizard progress).

## Accessibility

- Root renders `<ol>` with `aria-orientation` reflecting `orientation` — assistive tech reads steps as an ordered list.
- The active step sets `aria-current="step"` so screen readers announce the user's position.
- Each `<li>` carries its title and description in document order — no extra ARIA needed for the labels.
- Done steps render a checkmark icon; the icon is decorative — the "done" state is communicated by document order and the active-step indicator.

## Composition

```tsx
// Vertical wizard with multi-line descriptions
<Steps orientation="vertical" current={2}>
  <Step
    title="会社情報を入力"
    description="基本情報 · 締め日 · 通貨を設定済み"
  />
  <Step
    title="従業員をインポート"
    description="38 名 · CSV から一括登録"
  />
  <Step
    title="シフトテンプレートを作成"
    description="早番 / 遅番 / 通し のパターンを定義します"
  />
  <Step
    title="給与連携を設定"
    description="freee · マネーフォワードと接続"
  />
</Steps>

// Custom icon
<Steps current={1}>
  <Step title="支払い" icon={<CreditCard size={14} />} />
  <Step title="確認" icon={<CheckCircle size={14} />} />
  <Step title="完了" icon={<Check size={14} />} />
</Steps>
```

## See also

- [Timeline](./Timeline.md) — for historical event lists rather than progress.
- [Progress](./Progress.md) — for continuous (percentage) progress instead of discrete steps.
- Source: [`src/components/navigation/Steps.tsx`](../../../src/components/navigation/Steps.tsx)
