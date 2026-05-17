---
title: "Checkbox"
diataxis: reference
library: "@godxjp/ui"
library_version: 3.0.0
component: Checkbox
status: stable
audience: [developer, agent]
lang: en
---

# Checkbox

> Tri-state checkbox backed by `@radix-ui/react-checkbox` — supports checked, unchecked, and indeterminate states.

## Usage

```tsx
import { Checkbox } from "@godxjp/ui"

<Checkbox defaultChecked>利用規約に同意する</Checkbox>
```

Pass the label as `children` — the primitive wraps the box + label in
a single `<label>` so clicking the text toggles the checkbox (Ant
canonical pattern). For advanced layouts (table cell with header
elsewhere) omit children and wire `aria-label` / `aria-labelledby`
yourself.

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `ReactNode` | — | Label text. When set, primitive wraps box + text in a single `<label>`. Omit for box-only mode. |
| `checked` | `boolean \| "indeterminate"` | — | Controlled state |
| `onCheckedChange` | `(checked: boolean \| "indeterminate") => void` | — | Called when state changes |
| `defaultChecked` | `boolean` | `false` | Uncontrolled default |
| `disabled` | `boolean` | `false` | Disables interaction |
| `name` | `string` | — | Form field name |
| `value` | `string` | `"on"` | Form value when checked |
| `className` | `string` | — | Merged onto the OUTER `<label>` when `children` is set, or onto the box otherwise. |
| `boxClassName` | `string` | — | Merged onto the inner box (only honoured when `children` is set). |
| `...rest` | `ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>` | — | All Radix Checkbox props |

## States

| State | Visual | Use case |
|---|---|---|
| `false` (unchecked) | Empty square | Default |
| `true` (checked) | Square with checkmark | Selected |
| `"indeterminate"` | Square with minus | "Select all" parent when only some children are selected |

## Accessibility

- Renders `role="checkbox"` with `aria-checked` (including `"mixed"` for indeterminate).
- Space key toggles the checkbox.
- Always pair with a `<Label>` using `htmlFor` / `id`.
- WCAG 2.1 SC 1.4.11 (Non-text Contrast): the checkbox border and checkmark glyph meet 3:1 non-text contrast.

## Composition

```tsx
// "Select all" with indeterminate state
function IssueCheckboxes({ issues }: { issues: Issue[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const allSelected = selected.size === issues.length
  const someSelected = selected.size > 0 && !allSelected

  return (
    <div>
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
        <Checkbox
          id="select-all"
          checked={allSelected ? true : someSelected ? "indeterminate" : false}
          onCheckedChange={(v) =>
            setSelected(v === true ? new Set(issues.map((i) => i.id)) : new Set())
          }
        />
        <Label htmlFor="select-all">Select all</Label>
      </div>
      {issues.map((issue) => (
        <div key={issue.id} style={{ display: "flex", gap: "0.5rem" }}>
          <Checkbox
            id={issue.id}
            checked={selected.has(issue.id)}
            onCheckedChange={(v) => {
              const next = new Set(selected)
              v ? next.add(issue.id) : next.delete(issue.id)
              setSelected(next)
            }}
          />
          <Label htmlFor={issue.id}>{issue.title}</Label>
        </div>
      ))}
    </div>
  )
}
```

## See also

- [Switch](./Switch.md) — for boolean on/off settings (not lists).
- [Label](./Label.md) — required pairing.
