---
title: "Form"
description: "Thin wrapper over react-hook-form + the canonical Field label/help composition (shadcn/ui pattern)."
diataxis: reference
audience: [developer]
status: stable
last-updated: 2026-05-18
lang: en
library: "@godxjp/ui"
library_version: 3.0.0
---

# Form

> Thin wrapper over `react-hook-form` plus the canonical `<Field>` label/help composition (shadcn/ui pattern).

`<Form>` mounts a `FormProvider`; `<FormField>` binds one `useController` slot to a `<Field>` group and renders label, control, and help / error lines through a render-prop. Validation is delegated to any `@hookform/resolvers` adapter (Zod / Yup / Valibot / Joi / …).

## Usage

```tsx
import { useForm } from "react-hook-form"
import { Form, FormField, Input, Button } from "@godxjp/ui"

interface FormValues {
  name: string
  email: string
}

function RegistrationForm() {
  const form = useForm<FormValues>({
    resolver,
    defaultValues: { name: "", email: "" },
    mode: "onTouched",
  })
  return (
    <Form<FormValues>
      form={form}
      onSubmit={(values) => console.log("submit", values)}
      style={{ display: "grid", gap: "var(--spacing-3)", maxWidth: 360 }}
    >
      <FormField<FormValues, "name"> name="name" label="氏名" required>
        {({ value, onChange, onBlur, name, invalid }) => (
          <Input
            id={name}
            name={name}
            placeholder="山田 太郎"
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            status={invalid ? "error" : "default"}
          />
        )}
      </FormField>
      <Button type="submit" variant="primary">登録</Button>
    </Form>
  )
}
```

## Props

### `Form<T>`

| Prop | Type | Default | Description |
|---|---|---|---|
| `form` | `UseFormReturn<T>` | required | Result of `useForm()` — caller-owned |
| `onSubmit` | `(values: T) => void \| Promise<void>` | — | Receives typed values after the resolver passes |
| `...rest` | `Omit<ComponentProps<"form">, "onSubmit">` | — | Standard `<form>` props (`className`, `style`, …) |

The element is always `<form noValidate>` — validation is delegated to react-hook-form's resolver rather than the browser's native constraint validation.

### `FormField<TFieldValues, TName>`

| Prop | Type | Default | Description |
|---|---|---|---|
| `name` | `FieldPath<TFieldValues>` | required | Typed field path |
| `label` | `ReactNode` | — | Rendered inside `<FieldLabel>` |
| `description` | `ReactNode` | — | Rendered inside `<FieldHelp>` when no error |
| `required` | `boolean` | `false` | Marks the field required (asterisk in label) |
| `helpTone` | `"default" \| "info" \| "warn" \| "error" \| "success"` | auto | Override the help-line tone (defaults to "error" when invalid) |
| `children` | `(field: FormFieldRenderArg) => ReactNode` | required | Render-prop yielding `{ value, onChange, onBlur, name, ref, error, invalid }` |

### `FormItem`

A generic `<div class="field">` wrapper for layouts where `<FormField>`'s default `<Field>` shape is not enough. Accepts `HTMLAttributes<HTMLDivElement>`.

### `useFormContext`

Re-exported from `react-hook-form` for consumers that need access to the typed form context outside a `FormField` render-prop.

Vocabulary per cardinal rule 23 §B: the render-prop yields `{ value, onChange, onBlur, name, ref, error, invalid }` — not Ant's `rules` / `validateStatus` / `wrapperCol`.

## Accessibility

- The wrapped `<form noValidate>` lets react-hook-form own validation timing — the form does not submit until the resolver passes.
- Each `FormField` renders a real `<label htmlFor={name}>` via `Field.Label`; pass the same `name` as the control's `id` for the screen-reader association.
- Errors render automatically via `<FieldHelp tone="error">`; consumers should still set `aria-invalid` on the control inside the render-prop so assistive tech announces the invalid state.
- Submit failures should be communicated visibly AND announced — pair the form with a top-of-form `<Alert color="destructive">` when more than one field errors.

## Composition

```tsx
// Hand-rolled resolver for a Zod-free example
const resolver: Resolver<FormValues> = async (values) => {
  const errors: Record<string, { type: string; message: string }> = {}
  if (!values.email) errors.email = { type: "required", message: "メールアドレスは必須です" }
  return { values: Object.keys(errors).length ? {} : values, errors }
}

// Real apps typically use Zod
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const schema = z.object({
  name: z.string().min(1, "名前は必須です"),
  email: z.string().email("有効なメールアドレスを入力してください"),
})

const form = useForm<z.infer<typeof schema>>({
  resolver: zodResolver(schema),
})
```

## See also

- [Field](./Field.md) — the underlying label/help composition.
- [Input](./Input.md), [InputNumber](./Input.md), [Checkbox](./Checkbox.md) — common controls inside `FormField`.
- Source: [`src/components/data-entry/Form.tsx`](../../../src/components/data-entry/Form.tsx)
