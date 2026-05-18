---
title: "Collapse"
description: "Accordion-style expandable panel group — single or multi-open, with default / ghost / outlined visual variants."
diataxis: reference
audience: [developer]
status: stable
last-updated: 2026-05-18
lang: en
library: "@godxjp/ui"
library_version: 3.0.0
---

# Collapse

> Accordion panel group. Single-open by default; pass `multiple` for parallel expansion.

Compositional — render `<Collapse value="…" title="…">` children. The framework owns expanded-state via React context; each panel reads `aria-expanded` and renders / hides its content region. The chevron rotates via `data-state="open"` on the panel root.

Vocabulary follows cardinal rule 23 §B: `value` / `defaultValue` / `onValueChange` for expansion state (string for single, `string[]` for multi); `multiple` boolean; `variant` for visual treatment; `size` for dimensional scale. Never Ant's `activeKey` / `accordion` / `bordered`.

## When to use Collapse vs Card

| Need                                                             | Use                                                             |
| ---------------------------------------------------------------- | --------------------------------------------------------------- |
| FAQ / settings panels — many sections, only a few open at a time | **Collapse**                                                    |
| Always-visible content with a header and body                    | [Card](./Card.md) with `title`                                  |
| Tabbed switching between mutually exclusive content              | [Tabs](../navigation/Tabs.md)                                   |
| Modal / sheet-style detail surface                               | [Dialog](../feedback/Dialog.md) / [Sheet](../feedback/Sheet.md) |

If the section title NEEDS to be tappable to reveal content, that's Collapse. If the title is decorative and the body is always shown, that's Card.

## Usage

```tsx
import { Collapse, Collapse } from "@godxjp/ui";

<Collapse defaultValue="q1">
  <Collapse value="q1" title="godx-adminとは何ですか？">
    <p>godx-adminは開発者向け統合プラットフォームです。</p>
  </Collapse>
  <Collapse value="q2" title="サンドボックスは何分で起動しますか？">
    <p>通常 1〜2 分程度です。</p>
  </Collapse>
</Collapse>;
```

## Props

### `Collapse` (root)

| Prop            | Type                                  | Default     | Description                                                                                          |
| --------------- | ------------------------------------- | ----------- | ---------------------------------------------------------------------------------------------------- |
| `value`         | `string \| string[]`                  | —           | Controlled expanded panel key(s). String for single, `string[]` for multi                            |
| `defaultValue`  | `string \| string[]`                  | —           | Uncontrolled initial expansion                                                                       |
| `onValueChange` | `(value: string \| string[]) => void` | —           | Called when expansion changes. Returns `string` when `multiple=false`, `string[]` otherwise          |
| `multiple`      | `boolean`                             | `false`     | Allow multiple panels open simultaneously                                                            |
| `variant`       | `"default" \| "ghost" \| "outlined"`  | `"default"` | Visual treatment — default has dividers; ghost is unbounded; outlined adds an outer border per panel |
| `size`          | `"small" \| "default" \| "large"`     | `"default"` | Dimensional scale                                                                                    |
| `disabled`      | `boolean`                             | `false`     | Disable every panel (overrides per-panel `disabled`)                                                 |
| `className`     | `string`                              | —           | Merged onto `.collapse-root`                                                                         |
| `children`      | `ReactNode`                           | —           | `<Collapse>` children                                                                           |

### `Collapse`

| Prop       | Type        | Default  | Description                                                               |
| ---------- | ----------- | -------- | ------------------------------------------------------------------------- |
| `value`    | `string`    | required | Panel key — referenced by `Collapse.value` / `defaultValue`               |
| `title`    | `ReactNode` | required | Trigger label                                                             |
| `extra`    | `ReactNode` | —        | Right-aligned slot inside the trigger header (e.g. a tag, a status badge) |
| `disabled` | `boolean`   | `false`  | Disable this panel only                                                   |
| `children` | `ReactNode` | —        | Body content (rendered when expanded)                                     |

## Accessibility

- The trigger renders as a real `<button type="button">` with `aria-expanded`, `aria-controls`, and `disabled` reflecting state — keyboard navigation and screen reader announcement come for free.
- The content region uses `role="region"` and `id="collapse-content-<value>"` paired with `aria-controls` on the trigger.
- The chevron icon is `aria-hidden`; the rotated state is decorative.
- WCAG 2.1 SC 2.1.1 (Keyboard): Tab to focus a trigger, Space / Enter to toggle. Disabled panels skip tab navigation per the native `<button disabled>` semantics.

## Composition

```tsx
// Multi-open mode
<Collapse multiple defaultValue={["q1", "q2"]}>
  {FAQ.map((q) => (
    <Collapse key={q.value} value={q.value} title={q.title}>
      <p>{q.body}</p>
    </Collapse>
  ))}
</Collapse>

// Variants
<Collapse variant="ghost" defaultValue="q1">…</Collapse>
<Collapse variant="outlined" defaultValue="q1">
  {FAQ.map((q) => (
    <Collapse key={q.value} value={q.value} title={q.title} extra={<span>必読</span>}>
      <p>{q.body}</p>
    </Collapse>
  ))}
</Collapse>

// Controlled
function ControlledCollapse() {
  const [open, setOpen] = useState<string>("q1")
  return (
    <Collapse value={open} onValueChange={(v) => setOpen(v as string)}>
      <Collapse value="q1" title="Question 1">…</Collapse>
      <Collapse value="q2" title="Question 2">…</Collapse>
    </Collapse>
  )
}
```

## See also

- [Tabs](../navigation/Tabs.md) — mutually exclusive section switching.
- [Card](./Card.md) — always-visible card with header.
- [Tree](./Tree.md) — nested expandable hierarchies.
- Source: [`src/components/data-display/Collapse.tsx`](../../../src/components/data-display/Collapse.tsx)
