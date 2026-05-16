---
diataxis: reference
library: "@godxjp/ui"
library_version: 3.0.0
component: Input
status: stable
audience: [developer, agent]
---

# Input / Textarea

> Text input and multi-line textarea atoms wired to the `.input` token class.

## Usage

```tsx
import { Input, Textarea } from "@godxjp/ui"

<Input type="text" placeholder="Search…" />
<Input type="email" aria-label="Email address" />
<Textarea rows={4} placeholder="Description…" />
```

## Input props

| Prop | Type | Default | Description |
|---|---|---|---|
| `type` | `string` | `"text"` | HTML input type (`text`, `email`, `password`, `number`, etc.) |
| `ref` | `Ref<HTMLInputElement>` | — | Forward ref — wire `react-hook-form` or focus management |
| `aria-invalid` | `boolean \| "true" \| "false"` | — | Set to `"true"` when the field has a validation error |
| `...rest` | `ComponentProps<"input">` | — | All standard `<input>` props |

## Textarea props

| Prop | Type | Default | Description |
|---|---|---|---|
| `rows` | `number` | — | Number of visible text lines |
| `ref` | `Ref<HTMLTextAreaElement>` | — | Forward ref |
| `...rest` | `TextareaHTMLAttributes<HTMLTextAreaElement>` | — | All standard `<textarea>` props |

## Accessibility

- Both `Input` and `Textarea` use `forwardRef` so consumers can attach refs for focus management.
- Always pair with a `<Label>` (use the `Label` component) — the `for`/`id` association makes the field accessible to screen readers.
- `aria-invalid="true"` adds the error state styling from tokens and announces the error to screen readers; combine with `aria-describedby` pointing to an error message.
- WCAG 2.1 AA: `--input` background and `--foreground` text meet 4.5:1 contrast ratio.
- WCAG SC 1.3.5 (Identify Input Purpose): use `autocomplete` attributes on form fields collecting personal data.

## Composition with react-hook-form

```tsx
import { useForm } from "react-hook-form"
import { Input, Label } from "@godxjp/ui"

function LoginForm() {
  const { register, formState: { errors } } = useForm()

  return (
    <form>
      <Label htmlFor="email">Email</Label>
      <Input
        id="email"
        type="email"
        aria-invalid={!!errors.email}
        aria-describedby={errors.email ? "email-error" : undefined}
        {...register("email", { required: true })}
      />
      {errors.email && (
        <p id="email-error" style={{ color: "var(--destructive)", fontSize: "var(--text-xs)" }}>
          Email is required.
        </p>
      )}
    </form>
  )
}
```

## See also

- [Label](./Label.md) — always pair Input with Label.
- [Select](./Select.md) — dropdown alternative to text input.
- [Combobox](./Combobox.md) — searchable select.
