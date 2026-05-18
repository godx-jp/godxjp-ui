---
title: "Field"
description: "Label + control + help vertical group — compositional primitive with Field.Label / Field.Help / Field.Count / Field.RowHelp sub-atoms."
diataxis: reference
audience: [developer]
status: stable
last-updated: 2026-05-18
lang: en
library: "@godxjp/ui"
library_version: 3.0.0
---

# Field

> Label + control + help vertical group — compositional primitive with `Field.Label`, `Field.Help`, `Field.Count`, and `Field.RowHelp` sub-atoms.

## Usage

```tsx
import { Field } from "@godxjp/ui";
import { Input } from "@godxjp/ui";

<Field>
  <Field.Label>従業員コード</Field.Label>
  <Input placeholder="EMP-0001" />
  <Field.Help>英数字 4–8 文字で入力してください。</Field.Help>
</Field>;
```

## Props

### `Field` (root)

| Prop       | Type                             | Default  | Description                                      |
| ---------- | -------------------------------- | -------- | ------------------------------------------------ |
| `children` | `ReactNode`                      | required | Label, control, and help atoms in document order |
| `...rest`  | `HTMLAttributes<HTMLDivElement>` | —        | Standard `<div>` props                           |

### `Field.Label`

| Prop            | Type                                    | Default    | Description                                               |
| --------------- | --------------------------------------- | ---------- | --------------------------------------------------------- |
| `required`      | `boolean`                               | `false`    | Append a red asterisk (`<span class="req">*</span>`)      |
| `optional`      | `boolean`                               | `false`    | Append an "(任意)" marker                                 |
| `optionalLabel` | `ReactNode`                             | `"(任意)"` | Override the optional badge text                          |
| `info`          | `ReactNode`                             | —          | Inline help icon slot — typically a tooltip handle        |
| `extra`         | `ReactNode`                             | —          | Trailing slot at the right edge (e.g. "Forgot password?") |
| `...rest`       | `LabelHTMLAttributes<HTMLLabelElement>` | —          | Standard `<label>` props (`htmlFor`, `id`, …)             |

### `Field.Help`

| Prop      | Type                                                    | Default     | Description                   |
| --------- | ------------------------------------------------------- | ----------- | ----------------------------- |
| `tone`    | `"default" \| "info" \| "warn" \| "error" \| "success"` | `"default"` | Explicit tone selector        |
| `error`   | `boolean`                                               | `false`     | Shortcut for `tone="error"`   |
| `warning` | `boolean`                                               | `false`     | Shortcut for `tone="warn"`    |
| `info`    | `boolean`                                               | `false`     | Shortcut for `tone="info"`    |
| `success` | `boolean`                                               | `false`     | Shortcut for `tone="success"` |
| `icon`    | `ReactNode`                                             | —           | Leading icon slot             |
| `...rest` | `HTMLAttributes<HTMLDivElement>`                        | —           | Standard `<div>` props        |

### `Field.Count`

| Prop      | Type                             | Default  | Description                                                |
| --------- | -------------------------------- | -------- | ---------------------------------------------------------- |
| `current` | `number`                         | required | Current character / item count                             |
| `max`     | `number`                         | —        | Maximum; renders as `current / max`                        |
| `warnAt`  | `number`                         | `0.9`    | Threshold (0–1) above which the count flips to "warn" tone |
| `...rest` | `HTMLAttributes<HTMLDivElement>` | —        | Standard `<div>` props                                     |

### `Field.RowHelp`

A `<div class="row-help">` wrapper that lays help + count on one row. Accepts standard `HTMLAttributes<HTMLDivElement>`.

## Accessibility

- `Field.Label` renders a real `<label>` — pair with `htmlFor` matching the control's `id` so screen readers associate the label with its input.
- Help text under the control gets read after the field value; use `aria-describedby` on the control when an error message must be announced explicitly.
- The `required` asterisk is decorative; communicate the requirement to assistive tech via the control's `required`/`aria-required` attribute.
- WCAG 2.1 SC 3.3.1 (Error Identification): pair `Field.Help` with `tone="error"` and `<Input aria-invalid="true" aria-describedby="<help-id>">` so the error is programmatically associated with the control.

## Composition

```tsx
// Required field with info hint
<Field>
  <Field.Label required info={<Info size={12} aria-hidden />}>
    メールアドレス
  </Field.Label>
  <Input type="email" placeholder="user@example.com" />
  <Field.Help>ログイン ID として使用します</Field.Help>
</Field>

// Help line + character count on one row
<Field>
  <Field.Label optional>早退理由</Field.Label>
  <Textarea rows={3} />
  <Field.RowHelp>
    <Field.Help>承認者のみ閲覧可</Field.Help>
    <Field.Count current={182} max={200} />
  </Field.RowHelp>
</Field>

// Error state
<Field>
  <Field.Label required>パスワード</Field.Label>
  <Input type="password" aria-invalid="true" aria-describedby="pw-err" />
  <Field.Help id="pw-err" error>8 文字以上にしてください。</Field.Help>
</Field>
```

## See also

- [Form](./Form.md) — `<Form>` binds react-hook-form controllers to Field automatically.
- [Input](./Input.md) — the most common control inside a Field.
- [Label](./Label.md) — standalone label without the help/count surface.
- Source: [`src/components/data-entry/Field.tsx`](../../../src/components/data-entry/Field.tsx)
