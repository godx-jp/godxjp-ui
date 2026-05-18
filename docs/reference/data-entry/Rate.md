---
title: "Rate"
description: "Star-rating primitive — read-write or read-only, half-step precision, custom icon slot."
diataxis: reference
audience: [developer]
status: stable
last-updated: 2026-05-18
lang: en
library: "@godxjp/ui"
library_version: 3.0.0
---

# Rate

> Star-rating primitive — click a star to commit a value (1–5 by default); `allowHalf` enables 0.5-step precision via left-half-click.

## Usage

```tsx
import { Rate } from "@godxjp/ui";

<Rate defaultValue={3} />;
```

## Props

### `Rate` (root)

| Prop            | Type                              | Default     | Description                                                                                    |
| --------------- | --------------------------------- | ----------- | ---------------------------------------------------------------------------------------------- |
| `value`         | `number`                          | —           | Controlled value (0 – `count`)                                                                 |
| `defaultValue`  | `number`                          | `0`         | Uncontrolled initial value                                                                     |
| `onValueChange` | `(value: number) => void`         | —           | Fires on click                                                                                 |
| `count`         | `number`                          | `5`         | Number of stars rendered                                                                       |
| `allowHalf`     | `boolean`                         | `false`     | Enable 0.5-step precision (left-half click)                                                    |
| `icon`          | `ReactNode`                       | —           | Override the default `Star` icon. Per cardinal rule 23 §B vocabulary — NEVER Ant's `character` |
| `size`          | `"small" \| "default" \| "large"` | `"default"` | Star dimensional scale                                                                         |
| `disabled`      | `boolean`                         | `false`     | Disable interaction                                                                            |
| `readOnly`      | `boolean`                         | `false`     | Display-only (no hover effect)                                                                 |
| `className`     | `string`                          | —           | Merged onto the `.rate` root                                                                   |

## Accessibility

- Root carries `role="radiogroup" aria-label="Rating"`; each star is a real `<button role="radio" aria-checked={…}>` with `aria-label="N of count"` so screen readers announce position + total.
- Keyboard: each star receives focus via Tab; `Enter` / `Space` commits.
- Hover preview is purely visual (driven by `data-filled` / `data-half`) — screen-reader output is unaffected.
- `disabled` and `readOnly` both suppress hover commits; `readOnly` keeps the buttons focusable so AT can still announce the current value.
- WCAG 2.1 SC 1.4.1 (Use of Color): pair the Rate with adjacent text (e.g. `4.5 / 5`) so the value is not communicated by star fill alone.

## Composition

```tsx
// Half-step rating, controlled
<Rate defaultValue={3.5} allowHalf />

// Read-only product rating with text annotation
<Flex gap="small" style={{ alignItems: "center" }}>
  <Rate value={4.5} allowHalf readOnly />
  <span
    style={{
      fontSize: "var(--text-sm)",
      color: "var(--muted-foreground)",
    }}
  >
    4.5 / 5
  </span>
</Flex>

// Custom icon — heart for "favourite" semantics
<div style={{ color: "var(--destructive)" }}>
  <Rate
    defaultValue={4}
    icon={<Heart fill="currentColor" strokeWidth={1.5} aria-hidden />}
  />
</div>
```

## See also

- [Slider](./Slider.md) — continuous range alternative when ratings need finer granularity.
- [Radio](./Radio.md) — single-select group when options are categorical, not ordinal.
- Source: [`src/components/data-entry/Rate.tsx`](../../../src/components/data-entry/Rate.tsx)
