---
title: "Form"
description: "Thin wrapper over react-hook-form + the canonical Field label/help composition (shadcn/ui pattern)."
diataxis: reference
audience:
  - developer
status: draft
last-updated: 2026-05-17
lang: en
library: "@godxjp/ui"
library_version: 3.0.0
---

# Form

Thin wrapper over `react-hook-form` + the canonical `<Field>` label/help composition (shadcn/ui pattern). `<Form>` mounts a `FormProvider`; `<FormField>` binds one `useController` slot to a `<Field>` group and renders label, control, and help/error lines through a render-prop. Validation is delegated to any `@hookform/resolvers` adapter (Zod / Yup / Valibot / Joi / …).

## Import

```ts
import { Form, FormField } from "@godxjp/ui/components/primitives"
```

## Props

### `Form`

| Prop | Type | Default | Description |
|---|---|---|---|
| `form *` | `UseFormReturn<T>` | — | Result of `useForm()` — caller-owned |
| `onSubmit` | `(values: T) => void \| Promise<void>` | — | Receives typed values after the resolver passes |
| `...rest` | `Omit<ComponentProps<"form">, "onSubmit">` | — | Standard `<form>` props |

### `FormField`

| Prop | Type | Default | Description |
|---|---|---|---|
| `name *` | `FieldPath<TFieldValues>` | — | Field path string |
| `label` | `ReactNode` | — | Renders inside `<FieldLabel>` |
| `description` | `ReactNode` | — | Renders inside `<FieldHelp>` when no error |
| `required` | `boolean` | `false` | Marks the field required (asterisk in label) |
| `children *` | `(field: FormFieldRenderArg) => ReactNode` | — | Render-prop yielding `{ value, onChange, onBlur, name, ref, error, invalid }` |

## Example

```tsx
const form = useForm<FormValues>({
  resolver,
  defaultValues: { name: "", email: "" },
  mode: "onTouched",
})

return (
  <Form<FormValues> form={form} onSubmit={(values) => console.log(values)}>
    <FormField<FormValues, "name"> name="name" label="氏名" required>
      {({ value, onChange, onBlur, name, invalid }) => (
        <Input
          id={name}
          name={name}
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
```

## Related

- Story catalogue: [`Form` stories](../../../src/stories/data-entry/Form.stories.tsx)
- Source: [`src/components/data-entry/Form.tsx`](../../../src/components/data-entry/Form.tsx)
- Cardinal rule 23 §B prop vocabulary: [`CLAUDE.md` §23.B](../../../CLAUDE.md#23)

## Status

`draft` — auto-generated stub. Detailed prop docs / accessibility notes / design rationale still to be filled in.
