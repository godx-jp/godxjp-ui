---
title: "Progress"
description: "Linear or circular progress indicator with semantic colour role, size, and custom label format."
diataxis: reference
audience:
  - developer
status: draft
last-updated: 2026-05-17
lang: en
library: "@godxjp/ui"
library_version: 3.0.0
---

# Progress

Linear or circular progress indicator. Use line for narrow in-page bars and circle for KPI tiles or upload progress. Line variant reuses the canonical `.prog` atom from `shell/75-card-atoms.css`; circle variant renders an SVG sweep with `currentColor` so the outer `.progress-color-*` class drives the arc colour. ARIA: `role="progressbar"` + `aria-valuenow/min/max`.

## Import

```ts
import { Progress } from "@godxjp/ui/components/primitives"
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `number` | `0` | Current progress value (0 – `max`) |
| `max` | `number` | `100` | Maximum value |
| `variant` | `"line" \| "circle"` | `"line"` | Visual shape |
| `color` | `"default" \| "info" \| "success" \| "warning" \| "destructive"` | `"default"` | Semantic colour role |
| `size` | `"small" \| "default" \| "large"` | `"default"` | Dimensional scale |
| `showInfo` | `boolean` | `true` | Render the numeric label |
| `strokeWidth` | `number` | `6` | Circle stroke thickness (user units) |
| `format` | `(value: number, max: number) => ReactNode` | — | Custom label renderer |

## Example

```tsx
<Progress value={60} />
<Progress variant="circle" value={75} color="success" />
```

## Related

- Story catalogue: [`Progress` stories](../../../src/stories/feedback/Progress.stories.tsx)
- Source: [`src/components/feedback/Progress.tsx`](../../../src/components/feedback/Progress.tsx)
- Cardinal rule 23 §B prop vocabulary: [`CLAUDE.md` §23.B](../../../CLAUDE.md#23)

## Status

`draft` — auto-generated stub. Detailed prop docs / accessibility notes / design rationale still to be filled in.
