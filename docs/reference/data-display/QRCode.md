---
title: "QRCode"
description: "QR code rendered as inline SVG; foreground defaults to currentColor so the code inherits theme axis flips automatically."
diataxis: reference
audience: [developer]
status: stable
last-updated: 2026-05-18
lang: en
library: "@godxjp/ui"
library_version: 3.0.0
---

# QRCode

> QR code rendered as inline SVG, one `<rect>` per dark cell — themeable via `currentColor`.

Built on the `qrcode` library to compute the module matrix; the framework renders each dark cell as a single SVG `<rect>` (no `<canvas>`, no `dangerouslySetInnerHTML`). Because the default foreground is `currentColor`, dropping a `<QRCode>` inside a dark surface flips the code automatically with the theme axis (cardinal rule 21).

## Usage

```tsx
import { QRCode } from "@godxjp/ui"

<QRCode value="https://godx.jp" />
<QRCode value="https://godx.jp" size={240} icon={<Logo />} />
```

## Props

| Prop         | Type                       | Default                   | Description                                                                                              |
| ------------ | -------------------------- | ------------------------- | -------------------------------------------------------------------------------------------------------- |
| `value`      | `string`                   | required                  | Text / URL to encode                                                                                     |
| `size`       | `number`                   | `160`                     | Output size in pixels (width === height)                                                                 |
| `errorLevel` | `"L" \| "M" \| "Q" \| "H"` | `"M"`                     | Error-correction level — `H` recovers more data when partially obscured (use with `icon`)                |
| `color`      | `string`                   | `"currentColor"`          | Foreground colour — any CSS colour. Defaults to `currentColor` so the QR follows surrounding text colour |
| `bgColor`    | `string`                   | `"transparent"`           | Background fill colour                                                                                   |
| `icon`       | `ReactNode`                | —                         | Optional centre overlay (typically a brand logo) — pair with `errorLevel="H"` for reliability            |
| `iconSize`   | `number`                   | `Math.round(size * 0.22)` | Centre overlay size in pixels                                                                            |
| `className`  | `string`                   | —                         | Merged onto the `.qrcode` span                                                                           |

## Accessibility

- The inner `<svg>` carries `role="img"` and `aria-label={value}` so screen readers announce the encoded string. If the QR encodes a long URL or sensitive token, override the visual primitive with `aria-label` via a wrapping element to surface a human-readable label instead.
- If `value` is invalid (encoder throws), the primitive renders a sized empty span with `aria-label="QR code unavailable"` rather than crashing — visible to assistive tech that the QR could not be generated.
- WCAG 2.1 SC 1.1.1 (Non-text Content): the alt-text is the encoded value by default; when that's machine-jargon (e.g. `otpauth://totp/…`), supply a clearer surrounding label so users on screen readers know what action the QR performs.
- Quiet zone (the 4-module white border specified by the QR standard) is not auto-added; place the `<QRCode>` on a contrasting surface or wrap it in a padded container if scanners reject it.

## Composition

```tsx
// Size axis
<Flex gap="large" align="center">
  <QRCode value="https://godx.jp" size={96} />
  <QRCode value="https://godx.jp" size={160} />
  <QRCode value="https://godx.jp" size={240} />
</Flex>

// Centred logo overlay — requires high error correction
<QRCode
  value="https://godx.jp"
  size={200}
  errorLevel="H"
  icon={<span style={{ fontWeight: 700, color: "var(--primary)" }}>G</span>}
/>

// Theme-token colour variants
<Flex gap="large" align="center">
  <QRCode value="https://godx.jp" color="var(--foreground)" />
  <QRCode value="https://godx.jp" color="var(--primary)" bgColor="var(--background)" />
  <QRCode value="https://godx.jp" color="var(--success)" bgColor="var(--card)" />
</Flex>
```

## See also

- [Watermark](../feedback/Watermark.md) — repeating decorative pattern (different intent: branding, not data encoding).
- Source: [`src/components/data-display/QRCode.tsx`](../../../src/components/data-display/QRCode.tsx)
