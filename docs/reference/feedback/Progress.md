---
title: "Progress"
description: "Linear or circular progress indicator with semantic colour role, size variants, and custom label format."
diataxis: reference
audience: [developer]
status: stable
last-updated: 2026-05-18
lang: en
library: "@godxjp/ui"
library_version: 3.0.0
---

# Progress

> Linear or circular progress indicator. Use `line` for narrow in-page bars and `circle` for KPI tiles or upload progress.

## When to use

| Need                                         | Use                       |
| -------------------------------------------- | ------------------------- |
| Determinate bar with known percentage        | **Progress** (`line`)     |
| Determinate ring (e.g. upload, KPI tile)     | **Progress** (`circle`)   |
| Indeterminate / spinner-style busy indicator | [Spinner](./Spinner.md)   |
| Skeleton placeholder while content loads     | [Skeleton](./Skeleton.md) |

## Usage

```tsx
import { Progress } from "@godxjp/ui";

<Progress value={60} />;
```

## Props

### `Progress` (root)

Extends `Omit<ComponentProps<"div">, "color">`.

| Prop          | Type                                                             | Default     | Description                                                 |
| ------------- | ---------------------------------------------------------------- | ----------- | ----------------------------------------------------------- |
| `value`       | `number`                                                         | `0`         | Current progress value (0 – `max`)                          |
| `max`         | `number`                                                         | `100`       | Maximum value                                               |
| `variant`     | `"line" \| "circle"`                                             | `"line"`    | Visual shape — bar or ring                                  |
| `color`       | `"default" \| "info" \| "success" \| "warning" \| "destructive"` | `"default"` | Semantic colour role                                        |
| `size`        | `"small" \| "default" \| "large"`                                | `"default"` | Dimensional scale                                           |
| `showInfo`    | `boolean`                                                        | `true`      | Render the numeric label                                    |
| `strokeWidth` | `number`                                                         | `6`         | Circle stroke thickness in user units (circle variant only) |
| `format`      | `(value: number, max: number) => ReactNode`                      | —           | Custom label renderer                                       |
| `className`   | `string`                                                         | —           | Merged onto the `.progress` root                            |

## Accessibility

- Root carries `role="progressbar"` with `aria-valuenow` / `aria-valuemin` / `aria-valuemax` so screen readers announce the current progress.
- The numeric label is rendered inside `<span class="progress-info">` — visible to sighted users; AT reads the `aria-value*` attributes regardless of `showInfo`.
- When `value === max`, communicate completion through copy (e.g. wrap a [`Result`](./Result.md) component) rather than colour alone.
- WCAG 2.1 SC 1.4.11 (Non-text Contrast): semantic colour classes use `--success` / `--warning` / `--destructive` / `--info` tokens which meet 3:1 against the surface.

## Composition

```tsx
// Color sweep
<Space direction="vertical" size="middle" style={{ width: 360 }}>
  <Progress value={45} />
  <Progress value={45} color="info" />
  <Progress value={45} color="success" />
  <Progress value={45} color="warning" />
  <Progress value={45} color="destructive" />
</Space>

// Circle variant
<Progress variant="circle" value={75} />

// Custom step format
<Progress
  value={3}
  max={5}
  color="info"
  format={(v, m) => `${v}/${m} ステップ`}
/>

// Storage usage tile
<Progress
  value={85}
  color="warning"
  format={() => "42.8 / 50 GB"}
  aria-label="ストレージ使用状況"
/>
```

## See also

- [Spinner](./Spinner.md) — indeterminate busy indicator.
- [Skeleton](./Skeleton.md) — content-shape placeholder while loading.
- [Result](./Result.md) — page-level completion surface.
- Source: [`src/components/feedback/Progress.tsx`](../../../src/components/feedback/Progress.tsx)
