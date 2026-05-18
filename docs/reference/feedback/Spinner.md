---
title: "Spinner"
description: "Small inline circular loading indicator with size and semantic-tone variants."
diataxis: reference
audience: [developer]
status: stable
last-updated: 2026-05-18
lang: en
library: "@godxjp/ui"
library_version: 3.0.0
---

# Spinner

> Small inline circular loading indicator — for Button content, Input suffix, and help-text slots.

## When to use Spinner vs Skeleton

| Need                                                        | Use          |
| ----------------------------------------------------------- | ------------ |
| Inline indication (a control or single value is loading)    | **Spinner**  |
| Region / list / card placeholder while initial data fetches | **Skeleton** |

Spinner renders the canonical `.spinner` family from `shell.css`; uses `border-top-color` rotation and respects `prefers-reduced-motion` via the keyframe declaration.

## Usage

```tsx
import { Spinner } from "@godxjp/ui"

<Spinner />
<Spinner size="lg" tone="primary" aria-label="Saving…" />
```

## Props

### `Spinner`

| Prop         | Type                                                                        | Default  | Description                                                                                 |
| ------------ | --------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------- |
| `size`       | `"sm" \| "md" \| "lg"`                                                      | `"md"`   | 10 / 12 / 16 px diameter                                                                    |
| `tone`       | `"info" \| "muted" \| "primary" \| "success" \| "warning" \| "destructive"` | `"info"` | Colour role for the rotating arc                                                            |
| `aria-label` | `string`                                                                    | —        | Accessible label. When omitted, the element falls back to `aria-hidden` (purely decorative) |
| `...rest`    | `HTMLAttributes<HTMLSpanElement>`                                           | —        | Standard `<span>` props                                                                     |

### Sizes

| Size | Diameter | Typical context                         |
| ---- | -------- | --------------------------------------- |
| `sm` | 10 px    | Inline with `.help` lines               |
| `md` | 12 px    | Default — inline with Input suffix slot |
| `lg` | 16 px    | Inline with Button content              |

## Accessibility

- When `aria-label` is set, the element renders `role="status"` with the label — assistive tech announces the loading state.
- When `aria-label` is omitted, the element is `aria-hidden="true"` — use this only when nearby text already communicates the loading state (e.g. `"保存中… <Spinner />"`).
- Animation respects `prefers-reduced-motion` via the keyframe declaration in `shell.css` — vestibular-sensitive users see a non-animated indicator.
- WCAG SC 2.2.2 (Pause, Stop, Hide): the spinner is a transient indicator (< 5 s typical), not auto-updating content. For long-running operations (> 5 s) augment with a progress percentage via `<Progress>`.

## Composition

```tsx
// Inside a Button — disabled while saving
<Button variant="primary" disabled>
  <Spinner size="sm" aria-label="保存中" />
  保存中…
</Button>

// Inline next to a label
<Flex gap="small" align="center">
  <span>同期中</span>
  <Spinner size="sm" tone="muted" aria-hidden />
</Flex>

// Replacing a value while data resolves
<Statistic
  title="本日の出勤者"
  value={isLoading ? "—" : count}
  suffix={isLoading ? <Spinner size="sm" tone="muted" aria-hidden /> : null}
/>
```

## See also

- [Skeleton](./Skeleton.md) — region placeholder for initial data load.
- [Progress](./Progress.md) — long-running operations with a percentage.
- [Button](../general/Button.md) — common host for inline Spinner.
- Source: [`src/components/feedback/Spinner.tsx`](../../../src/components/feedback/Spinner.tsx)
