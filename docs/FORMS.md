# Forms — react-hook-form + Zod 4 (mandatory)

All forms in admin apps **must** use:

| Package               | Version | Role                 |
| --------------------- | ------- | -------------------- |
| `react-hook-form`     | ^7.76   | Form state           |
| `zod`                 | ^4.4    | Schema validation    |
| `@hookform/resolvers` | ^5.2    | `zodResolver` bridge |

Import from `@godxjp/ui/form` — **never** call `useForm()` without `zodResolver`.

## Quick start

```tsx
import { z } from "zod";
import { useZodForm, FormRoot, FormFieldControl } from "@godxjp/ui/form";
import { Input } from "@godxjp/ui/data-entry";
import { Button } from "@godxjp/ui/general";

const schema = z.object({
  name: z.string().min(1, "Bắt buộc"),
  email: z.string().email("Email không hợp lệ"),
});

type Values = z.infer<typeof schema>;

export function CreateCustomerForm({ onSubmit }: { onSubmit: (v: Values) => void }) {
  const form = useZodForm(schema, { defaultValues: { name: "", email: "" } });

  return (
    <FormRoot form={form} onSubmit={onSubmit}>
      <FormFieldControl name="name" label="Tên" required>
        {(field) => <Input {...field} value={String(field.value ?? "")} />}
      </FormFieldControl>
      <FormFieldControl name="email" label="Email" required>
        {(field) => <Input {...field} type="email" value={String(field.value ?? "")} />}
      </FormFieldControl>
      <Button type="submit">Lưu</Button>
    </FormRoot>
  );
}
```

## API

| Export             | Prop type                                 | Purpose                                |
| ------------------ | ----------------------------------------- | -------------------------------------- |
| `useZodForm`       | `ZodSchemaProp` + `UseZodFormOptionsProp` | Hook — injects zodResolver             |
| `FormRoot`         | `FormRootProp`                            | FormProvider + `<form onSubmit>`       |
| `FormFieldControl` | `FormFieldControlProp`                    | Controller + FormField + error display |

## Forbidden

- ❌ `useForm()` without Zod resolver
- ❌ `useState` for form field values in admin pages
- ❌ Manual validation with `if (!email.includes('@'))`
- ❌ Yup, Valibot, or other schema libraries
- ❌ Uncontrolled forms without schema

## App dependencies

Each app `package.json` must include:

```json
{
  "dependencies": {
    "react-hook-form": "^7.76.0",
    "zod": "^4.4.3",
    "@hookform/resolvers": "^5.2.2"
  }
}
```

Peer-enforced by `@godxjp/ui`.

## Server error bags — `Form errors` + `FormField name` + `<FormErrors />`

Server-driven forms (Inertia's `useForm`) return a Laravel error bag whose keys may include
**hidden/derived fields** (`action_mode`, `page`, a source-record id) that no visible field can
display — without a summary the submit fails silently. Pass the WHOLE bag once and let fields
claim their own keys:

```tsx
import { Form, FormErrors, FormField, Input } from "@godxjp/ui/data-entry";
import { useForm } from "@inertiajs/react";

const form = useForm({ customer_nm: "", action_mode: "regist" });

<Form asChild layout="horizontal" labelWidth={140} errors={form.errors}>
  <form onSubmit={submit}>
    <FormErrors />
    <FormField name="customer_nm" label="顧客名" required>
      <Input
        value={form.data.customer_nm}
        onChange={(e) => form.setData("customer_nm", e.target.value)}
      />
    </FormField>
  </form>
</Form>;
```

- A `FormField name="…"` resolves its message from `errors[name]` automatically (an explicit
  `error` prop wins; a `string[]` entry surfaces its FIRST message — `$errors->first()`), and
  **claims** the key.
- `<FormErrors />` renders only the **unclaimed** remainder as a destructive `Alert`
  (`role="alert"`, localized default title) — and nothing when every entry is claimed.
- Never hand-filter the bag per page; that except-list is exactly what this mechanism removes.
- `FormFieldControl` forwards its `name`, so `FormRoot` + adapter fields claim their keys too;
  give `<FormErrors errors={form.errors} />` the bag explicitly when there is no surrounding
  `Form errors`.

### Sibling Forms — one bag over several Card+Form sections

An edit screen split into several sibling `Card` + `Form` sections still has ONE server bag.
Wrap the region in `FormErrorsProvider` instead of passing `errors` to each Form — a Form
**without** its own `errors` joins the surrounding registry, so claims from every section
subtract from the same `<FormErrors />`:

```tsx
import { Form, FormErrors, FormErrorsProvider, FormField, Input } from "@godxjp/ui/data-entry";

<FormErrorsProvider errors={form.errors}>
  <FormErrors />
  <Card>
    <Form layout="horizontal" labelWidth={170}>
      <FormField name="customer_nm" label="顧客名">
        …
      </FormField>
    </Form>
  </Card>
  <Card>
    <Form layout="horizontal" labelWidth={170}>
      <FormField name="mail_subject" label="件名">
        …
      </FormField>
    </Form>
  </Card>
</FormErrorsProvider>;
```

A nested Form **with** its own `errors` starts a new registry that shadows the provider — its
claims and messages stay inside it (use this for an embedded sub-form with a separate bag).
