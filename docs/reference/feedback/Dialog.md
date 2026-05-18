---
title: "Dialog"
description: "Single-component modal overlay backed by Radix Dialog."
diataxis: reference
library: "@godxjp/ui"
library_version: 3.0.0
component: Dialog
status: stable
audience: [developer, agent]
last-updated: 2026-05-18
lang: en
---

# Dialog

> Modal overlay backed by `@radix-ui/react-dialog` with focus trap and ARIA modal semantics.

## Usage

```tsx
import { Dialog } from "@godxjp/ui";

<Dialog
  trigger={<Button>Open dialog</Button>}
  title="Confirm action"
  description="This action cannot be undone."
  footer={
    <>
      <Button variant="secondary" onClick={() => setOpen(false)}>
        Cancel
      </Button>
      <Button variant="danger" onClick={handleConfirm}>
        Delete
      </Button>
    </>
  }
>
  <p>Are you sure you want to proceed?</p>
</Dialog>;
```

## Exports

| Export        | Description                      |
| ------------- | -------------------------------- |
| `Dialog`      | Single-component modal wrapper   |
| `DialogProps` | Props for the `Dialog` component |

## Props

| Prop           | Type                      | Default  | Description                                   |
| -------------- | ------------------------- | -------- | --------------------------------------------- |
| `open`         | `boolean`                 | —        | Controlled open state                         |
| `onOpenChange` | `(open: boolean) => void` | —        | Called when open state changes                |
| `defaultOpen`  | `boolean`                 | `false`  | Uncontrolled initial open state               |
| `trigger`      | `ReactNode`               | —        | Trigger element rendered with Radix `asChild` |
| `title`        | `ReactNode`               | required | Modal title wired to `aria-labelledby`        |
| `description`  | `ReactNode`               | —        | Modal description wired to `aria-describedby` |
| `children`     | `ReactNode`               | —        | Body content                                  |
| `footer`       | `ReactNode`               | —        | Footer actions                                |
| `form`         | `FormHTMLAttributes`      | —        | Wraps header, body, and footer in one form    |
| `contentProps` | `Content props`           | —        | Rare escape hatch for Radix content props     |
| `className`    | `string`                  | —        | Extra class for the dialog panel              |

## Accessibility

- `Dialog` renders Radix content with `role="dialog"` and `aria-modal="true"`.
- Focus is trapped inside the dialog when open — keyboard cannot reach content behind.
- Escape closes the dialog.
- `title` is wired to `aria-labelledby` automatically by Radix.
- `description` is wired to `aria-describedby` automatically when provided.
- On close, focus returns to the element that opened the dialog.
- WCAG 2.1 SC 1.4.3 + 4.11: content and interactive elements inside the dialog meet contrast requirements.

## Composition

```tsx
// Controlled dialog
const [open, setOpen] = useState(false)

<Dialog
  open={open}
  onOpenChange={setOpen}
  title="Edit issue title"
  form={{ onSubmit: handleSubmit }}
  footer={<Button type="submit">Save</Button>}
>
  <Input defaultValue={issue.title} />
</Dialog>
```

## See also

- [AlertDialog](./AlertDialog.md) — for destructive confirmations (stronger ARIA pattern).
- [Sheet](./Sheet.md) — slide-in panel variant.
- [Button](../general/Button.md) — common trigger / action primitive.
