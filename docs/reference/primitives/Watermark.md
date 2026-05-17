---
title: "Watermark"
description: "Repeating SVG-tile overlay for confidential / draft / preview / personal-copy regions; theme-aware via currentColor."
diataxis: reference
audience:
  - developer
status: draft
last-updated: 2026-05-17
lang: en
library: "@godxjp/ui"
library_version: 3.0.0
---

# Watermark

Repeating SVG-pattern overlay applied as a CSS background-image on a wrapper element. Theme-aware: the SVG uses `fill='currentColor'`, and the wrapper sets `color: var(--muted-foreground)` so dark / light / accent axes flow through without per-instance overrides. Use for confidential, draft, preview, or personal-copy regions.

## Import

```ts
import { Watermark } from "@godxjp/ui/components/primitives"
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `content` | `string \| string[]` | — | Single line or multi-line text. Empty → no watermark drawn |
| `rotate` | `number` | `-22` | Rotation in degrees |
| `gap` | `[number, number]` | `[120, 80]` | Tile gap `[x, y]` in px |
| `fontSize` | `number` | `14` | Font size in pixels |
| `fontFamily` | `string` | inherited | Font family |
| `opacity` | `number` | `0.12` | Opacity 0–1 |
| `children` | `ReactNode` | — | Wrapped content |

## Example

```tsx
<Watermark content="Famgia · Confidential" style={{ padding: 24 }}>
  <Card>
    <CardHeader>
      <CardTitle>5月度 勤怠サマリー</CardTitle>
    </CardHeader>
    <CardBody>…</CardBody>
  </Card>
</Watermark>
```

## Related

- Story catalogue: [`Watermark` stories](../../../src/stories/feedback/Watermark.stories.tsx)
- Source: [`src/components/feedback/Watermark.tsx`](../../../src/components/feedback/Watermark.tsx)
- Cardinal rule 23 §B prop vocabulary: [`CLAUDE.md` §23.B](../../../CLAUDE.md#23)

## Status

`draft` — auto-generated stub. Detailed prop docs / accessibility notes / design rationale still to be filled in.
