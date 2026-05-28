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
