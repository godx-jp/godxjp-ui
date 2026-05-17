---
title: "QRCode"
description: "QR code rendered as inline SVG; foreground defaults to currentColor so the QR inherits theme axis flips automatically."
diataxis: reference
audience:
  - developer
status: draft
last-updated: 2026-05-17
lang: en
library: "@godxjp/ui"
library_version: 3.0.0
---

# QRCode

Render a QR code as inline SVG. Uses the `qrcode` library to compute the matrix (no canvas / no `dangerouslySetInnerHTML`); each dark cell becomes one `<rect>`. Foreground colour defaults to `currentColor` so the QR theme follows the surrounding text colour (cardinal rule 21 — theme axis flows naturally). Optional centre `icon` overlay (typically a brand logo).

## Import

```ts
import { QRCode } from "@godxjp/ui/components/primitives"
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `value *` | `string` | — | Text / URL to encode |
| `size` | `number` | `160` | Output size in pixels |
| `errorLevel` | `"L" \| "M" \| "Q" \| "H"` | `"M"` | Error-correction level |
| `color` | `string` | `currentColor` | Foreground colour |
| `bgColor` | `string` | `transparent` | Background colour |
| `icon` | `ReactNode` | — | Centre overlay (logo) |
| `iconSize` | `number` | `22% of size` | Icon size in px |

## Example

```tsx
<QRCode value="https://godx.jp" />
<QRCode value="https://godx.jp" size={240} icon={<Logo />} />
```

## Related

- Story catalogue: [`QRCode` stories](../../../src/stories/data-display/QRCode.stories.tsx)
- Source: [`src/components/data-display/QRCode.tsx`](../../../src/components/data-display/QRCode.tsx)
- Cardinal rule 23 §B prop vocabulary: [`CLAUDE.md` §23.B](../../../CLAUDE.md#23)

## Status

`draft` — auto-generated stub. Detailed prop docs / accessibility notes / design rationale still to be filled in.
