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

| Export              | Prop type                                 | Purpose                                       |
| ------------------- | ----------------------------------------- | --------------------------------------------- |
| `useZodForm`        | `ZodSchemaProp` + `UseZodFormOptionsProp` | Hook — injects zodResolver                    |
| `FormRoot`          | `FormRootProp`                            | FormProvider + `<form onSubmit>` + layout     |
| `FormFieldControl`  | `FormFieldControlProp`                    | Controller + FormField + error display        |
| `FormFieldArray`    | `FormFieldArrayProp`                      | Repeating rows on RHF's `useFieldArray`       |
| `useFormWatch`      | —                                         | Subscribe to one field (antd `Form.useWatch`) |
| `useFormInstance`   | —                                         | The RHF instance, without prop-drilling       |
| `useFormSubmitting` | —                                         | Submit in flight (both paths)                 |
| `useFormDisabled`   | —                                         | Form-level `disabled`, for the action row     |

### `FormRoot` — form-level knobs

`onSubmit` runs only after validation passes (antd `onFinish`). Everything else is optional:

| Prop                                                              | antd                    | Notes                                                                                    |
| ----------------------------------------------------------------- | ----------------------- | ---------------------------------------------------------------------------------------- |
| `onSubmitFailed(errors)`                                          | `onFinishFailed`        | RHF error tree; the first invalid field is focused regardless                            |
| `onSubmitError(error)`                                            | —                       | Optional error callback; rejected submissions show localized feedback and retain values  |
| `onReset`                                                         | —                       | A native `<Button type="reset">` restores `defaultValues`; this runs after               |
| `scrollToFirstError`                                              | `scrollToFirstError`    | Default `true`; centres the field row, honours `prefers-reduced-motion`                  |
| `disabled`                                                        | Form `disabled`         | Disables fields and submission; values remain in state. Buttons read `useFormDisabled()` |
| `layout` `labelWidth` `controlWidth` `labelAlign` `collapseBelow` | `layout` `labelCol` …   | Renders the `Form` layout shell (see the spacing note below)                             |
| `density` / `requiredMark`                                        | `size` / `requiredMark` | Forwarded to the same shell                                                              |
| `errors`                                                          | —                       | Server error bag; fields claim their keys, `<FormErrors />` shows the rest               |

> **Spacing.** A bare `FormRoot` stacks its children with `ui-stack-md`. Passing ANY layout prop
> switches it to the `Form` shell, whose `--form-block-gap` owns the spacing instead — the two are
> never combined, so a form does not silently gain double gaps when a `layout` is added.

`columns` renders a responsive grid inside the form. Duplicate submissions are ignored until the current attempt settles. Reset returns the form to its defaults.

### `FormFieldControl` — field-level knobs

| Prop                                      | antd                | Notes                                                                |
| ----------------------------------------- | ------------------- | -------------------------------------------------------------------- |
| `disabled`                                | Item `disabled`     | Defaults to `FormRoot disabled`; `false` re-enables one field        |
| `dependencies`                            | `dependencies`      | Re-validate this field when another changes (after the first submit) |
| `getValueFromEvent`                       | `getValueFromEvent` | Replaces the built-in DOM-event / raw-value detection                |
| `normalize`                               | `normalize`         | Transform before storing; return `previousValue` to REJECT a change  |
| `help`                                    | `help`              | Shown instead of the resolved validation message                     |
| `validateStatus` `hasFeedback` `feedback` | same                | Forwarded to `FormField` — the in-flight remote-check state          |
| `preserve`                                | `preserve`          | `false` unregisters the value when the field unmounts                |

The binding includes both native `onChange` and godx-ui `onValueChange`; spreading it onto Input, Textarea or Select updates the same store. Native fields do not emit the shared callback twice. IDs are unique across sibling forms. Per-field layout, label/control width, label addons and column spans are forwarded to FormField.

**There is no `rules` prop, by design.** react-hook-form ignores per-field register rules whenever a
`resolver` is set, and `useZodForm` always sets one — a `rules` prop would silently do nothing.
antd's `rules` is the Zod schema here, including the cross-field case:

```tsx
const schema = z
  .object({ password: z.string().min(8), confirm: z.string() })
  .refine((v) => v.confirm === v.password, { path: ["confirm"], message: "Mật khẩu không khớp" });
```

Pair that refinement with `dependencies={["password"]}` on the `confirm` field so editing the
password re-runs it.

## Dynamic rows — `FormFieldArray` (antd `Form.List`)

`FormFieldArray` is react-hook-form's `useFieldArray`, so rows keep their identity across
insert/remove/move instead of being re-keyed by index. Each row hands back its dotted path prefix;
build the child field name from it and nested validation lands on the right row.

```tsx
import { FormFieldArray, FormFieldControl, FormRoot, useZodForm } from "@godxjp/ui/form";

const schema = z.object({
  contacts: z.array(z.object({ email: z.string().email() })).min(1, "Cần ít nhất một liên hệ"),
});
type Values = z.infer<typeof schema>;

<FormFieldArray<Values, "contacts"> name="contacts">
  {({ fields, append, remove, move, error, disabled }) => (
    <>
      {error && (
        <Alert tone="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {fields.map((row, position) => (
        <Card key={row.key} variant="outline">
          <CardContent>
            <FormFieldControl<Values> name={`${row.name}.email`} label={`Liên hệ ${position + 1}`}>
              {(field) => <Input {...field} value={String(field.value ?? "")} />}
            </FormFieldControl>
            <Button type="button" variant="destructive" onClick={() => remove(row.index)}>
              Xoá
            </Button>
          </CardContent>
        </Card>
      ))}
      <Button
        type="button"
        variant="outline"
        disabled={disabled}
        onClick={() => append({ email: "" })}
      >
        Thêm liên hệ
      </Button>
    </>
  )}
</FormFieldArray>;
```

- `row.key` is RHF's stable id — use it as the React key, **never** the index.
- `row.index` is the live position; pass it to `remove`/`move`, not the render position.
- `error` is the ARRAY-level message (a `.min(1)` on the array itself), not a row's.
- Also available: `prepend`, `insert`, `swap`, `replace`.
- react-hook-form path only — a server-driven `adapter` owns its own collection state.

## Watching a value — `useFormWatch`

```tsx
const plan = useFormWatch<Values>("plan"); // one field
const all = useFormWatch<Values>(); // every value
```

Returns `unknown` (the same contract as the render-prop `value`) — narrow at the call site. It
works on BOTH paths: react-hook-form's `useWatch`, or the adapter's `getValue`/`getValues`.

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
  `Form errors` — or pass the bag straight to `FormRoot errors`, which provides the same registry.
- An adapter may implement the optional `reset()`, which `FormRoot` calls for a native
  `<Button type="reset">`, so the reset button behaves identically on both paths.

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

### Multipart uploads and Inertia visits

For a form that submits files together, use `<Upload name="attachments[]" pastable />`.
The uploader appends staged local files during the native `formdata` event, including
files selected by dropping or pasting. Completed media uploads remain the responsibility
of `collectUploadCommitActions`.

For an endpoint that redirects back after each uploaded file, connect the reusable
Inertia bridge. Errors retain the local file for retry; removing or cancelling a file
cancels its visit. Each request runs asynchronously so selecting another file does not
silently cancel an unrelated upload.

```tsx
import { inertiaUpload } from "@godxjp/ui/inertia";
import { Upload } from "@godxjp/ui/data-entry";

<Upload
  value={items}
  onValueChange={(next) => setItems(next.filter((item) => item.status !== "done"))}
  onUpload={inertiaUpload(
    (file, callbacks) => router.post(uploadUrl, { file }, { ...callbacks, preserveScroll: true }),
    t("upload.failed"),
  )}
  pastable
/>;
```
