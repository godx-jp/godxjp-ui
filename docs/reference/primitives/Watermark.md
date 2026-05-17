---
title: "Watermark"
description: "Repeating SVG-tile overlay for confidential / draft / preview / personal-copy regions; theme-aware via currentColor."
diataxis: reference
audience: [developer]
status: stable
last-updated: 2026-05-18
lang: en
library: "@godxjp/ui"
library_version: 3.0.0
---

# Watermark

> Repeating SVG-tile overlay applied as a background image to a wrapper element. Use to mark a region as confidential / draft / preview / personal copy.

Theme-aware: the SVG draws with `fill='currentColor'` and the wrapper reads `color: var(--muted-foreground)`, so light / dark / accent axes flow through without per-instance overrides.

## Usage

```tsx
import { Watermark, Card, CardHeader, CardTitle, CardSubtitle, CardBody } from "@godxjp/ui"

<Watermark content="Famgia · Confidential" style={{ padding: 24 }}>
  <Card style={{ width: 480 }}>
    <CardHeader>
      <CardTitle>5月度 勤怠サマリー</CardTitle>
      <CardSubtitle>確定前のドラフトです</CardSubtitle>
    </CardHeader>
    <CardBody>
      <p>承認: 山田 太郎</p>
      <p>合計勤務時間: 168h 30m</p>
      <p>残業: 12h 45m</p>
    </CardBody>
  </Card>
</Watermark>
```

## Props

### `Watermark` (root)

Extends `Omit<ComponentProps<"div">, "content">`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `content` | `string \| string[]` | — | Single line or multi-line text. Empty → no watermark drawn |
| `rotate` | `number` | `-22` | Rotation of each tile in degrees |
| `gap` | `[number, number]` | `[120, 80]` | Tile gap `[x, y]` in pixels |
| `fontSize` | `number` | `14` | Text font-size in pixels |
| `fontFamily` | `string` | inherited | Override the inherited system font stack |
| `opacity` | `number` | `0.12` | Tile opacity 0 – 1 |
| `children` | `ReactNode` | — | The protected content rendered above the tiles |

## Accessibility

- The watermark is purely decorative — it does NOT communicate meaning to assistive tech. The protected content underneath remains fully accessible.
- When the watermark conveys legal status ("CONFIDENTIAL", "DRAFT"), repeat the wording in the surrounding copy (e.g. a [`CardSubtitle`](./Card.md)) so screen readers and copy-paste workflows preserve the meaning.
- WCAG 2.1 SC 1.4.3 (Contrast): the `0.12` default opacity is intentionally low — it MUST NOT obscure the underlying text. The wrapper inherits `--muted-foreground` so both light and dark themes meet the contrast floor for the content beneath.

## Composition

```tsx
// Multi-line personal copy
<Watermark
  content={["田中 美咲", "famgia@example.com", "2026/05/17"]}
  style={{ padding: 24, minHeight: 320 }}
>
  <Card style={{ width: 480 }}>
    <CardHeader>
      <CardTitle>個人配布資料</CardTitle>
      <CardSubtitle>本資料は閲覧者本人のみが利用できます</CardSubtitle>
    </CardHeader>
    <CardBody>
      <p>所有者ごとに透かしを焼き込んでから配布します。</p>
    </CardBody>
  </Card>
</Watermark>

// Sparse, large tiles
<Watermark
  content="DRAFT"
  gap={[200, 140]}
  fontSize={22}
  style={{ padding: 24, minHeight: 320, width: 640 }}
>
  {/* … */}
</Watermark>

// Dense, small tiles
<Watermark
  content="©"
  gap={[40, 40]}
  fontSize={10}
  style={{ padding: 24, minHeight: 240, width: 480 }}
>
  {/* … */}
</Watermark>
```

## See also

- [Card](./Card.md) — typical content wrapper rendered underneath.
- Source: [`src/components/feedback/Watermark.tsx`](../../../src/components/feedback/Watermark.tsx)
