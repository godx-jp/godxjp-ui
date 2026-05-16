---
diataxis: reference
library: "@godxjp/ui"
library_version: 3.0.0
component: Label
status: stable
audience: [developer, agent]
---

# Label

> Form label backed by `@radix-ui/react-label` for reliable `for`/`id` association.

## Usage

```tsx
import { Label, Input } from "@godxjp/ui"

<Label htmlFor="username">Username</Label>
<Input id="username" type="text" />
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `htmlFor` | `string` | — | ID of the associated input element |
| `...rest` | `ComponentPropsWithoutRef<typeof LabelPrimitive.Root>` | — | All Radix Label + standard HTML props |

## Accessibility

- Uses `@radix-ui/react-label` which avoids the `for`/`id` association pitfalls of the native `<label>` element when labels and inputs are not DOM siblings.
- Clicking the label focuses the associated input — standard browser behavior preserved.
- WCAG 2.1 SC 1.3.1 (Info and Relationships): every `Input`, `Select`, `Checkbox`, and `Switch` MUST have a programmatically associated `Label`.
- Do not use `aria-label` as a substitute — `Label` provides visible text and programmatic association together.

## Composition

```tsx
// Vertical stack (most common)
<div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-1)" }}>
  <Label htmlFor="email">Email address</Label>
  <Input id="email" type="email" />
</div>

// Checkbox with label
import { Checkbox } from "@godxjp/ui"
<div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)" }}>
  <Checkbox id="terms" />
  <Label htmlFor="terms">I accept the terms</Label>
</div>
```

## See also

- [Input](./Input.md)
- [Checkbox](./Checkbox.md)
- [Switch](./Switch.md)
- [Select](./Select.md)
