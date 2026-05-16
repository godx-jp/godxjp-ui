---
diataxis: reference
library: "@godxjp/ui"
library_version: 3.0.0
component: Badge
status: stable
audience: [developer, agent]
---

# Badge

> Status pill with a colored dot and label, mapping a semantic role to a brand color.

## Usage

```tsx
import { Badge } from "@godxjp/ui"

<Badge variant="success" dot>Healthy</Badge>
<Badge variant="error">Failed</Badge>
<Badge variant="attention">Pending</Badge>
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `"success" \| "warning" \| "info" \| "error" \| "attention" \| "neutral" \| "outline"` | `"neutral"` | Semantic role — maps to a brand color |
| `dot` | `boolean` | `false` | Renders a colored dot before the label |
| `children` | `ReactNode` | — | Badge label text |
| `...rest` | `ComponentProps<"span">` | — | Standard `<span>` props |

## Variants

| Variant | Brand color | When to use |
|---|---|---|
| `success` | 若竹 bamboo green | Task completed, service healthy |
| `warning` | 山吹 mountain-yellow | Needs attention, not yet broken |
| `info` | 群青 ultramarine | Neutral-state callout |
| `error` | 茜 madder red | Failed, blocked |
| `attention` | 朱 vermilion | Pending, awaiting input |
| `neutral` | Grey | Default chrome, uncategorised |
| `outline` | Hairline border only | Minimal emphasis |

## Accessibility

- Renders a native `<span>` — screen readers announce the text content.
- The colored `dot` span uses `aria-hidden="true"` — purely decorative.
- WCAG 2.1 AA: all variant colors meet 4.5:1 contrast ratio against `--card` background (verified by axe-core in CI).
- Do not use color alone to convey state — always include a text label.

## Composition

```tsx
// Badge inside a table cell with an icon
<Badge variant="success" dot>
  <span aria-label="Deployed">Deployed</span>
</Badge>

// Inline with text
<p>
  Status: <Badge variant="warning">Degraded</Badge>
</p>
```

## See also

- [tokens.md](../tokens.md) — `--success`, `--warning`, `--error`, `--attention` token values.
- [BRAND.md](../../BRAND.md) — wa-iro palette rules (do not use decorative palette for status badges).
