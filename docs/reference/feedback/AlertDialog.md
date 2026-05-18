---
title: "AlertDialog"
diataxis: reference
library: "@godxjp/ui"
library_version: 3.0.0
component: AlertDialog
status: stable
audience: [developer, agent]
lang: en
---

# AlertDialog

> Interrupting modal for destructive or irreversible confirmations, backed by `@radix-ui/react-alert-dialog`.

## Usage

```tsx
import {
  AlertDialog,
  AlertDialog,
  AlertDialog,
  AlertDialog,
  AlertDialog,
  AlertDialog,
  AlertDialog,
  AlertDialog,
  AlertDialog,
} from "@godxjp/ui";

<AlertDialog>
  <AlertDialog asChild>
    <Button variant="danger">Delete project</Button>
  </AlertDialog>
  <AlertDialog>
    <AlertDialog>
      <AlertDialog>Delete project?</AlertDialog>
      <AlertDialog>
        This permanently removes all data. This action cannot be undone.
      </AlertDialog>
    </AlertDialog>
    <AlertDialog>
      <AlertDialog>Cancel</AlertDialog>
      <AlertDialog onClick={handleDelete}>
        Delete permanently
      </AlertDialog>
    </AlertDialog>
  </AlertDialog>
</AlertDialog>;
```

## Exports

| Export                   | Description                                     |
| ------------------------ | ----------------------------------------------- |
| `AlertDialog`            | Root                                            |
| `AlertDialog`     | Trigger element                                 |
| `AlertDialog`      | Portal                                          |
| `AlertDialog`     | Backdrop                                        |
| `AlertDialog`     | Modal panel                                     |
| `AlertDialog`      | Header layout                                   |
| `AlertDialog`      | Footer layout                                   |
| `AlertDialog`       | Modal title                                     |
| `AlertDialog` | Modal description                               |
| `AlertDialog`      | Confirm button — renders as `.btn.btn-primary`  |
| `AlertDialog`      | Cancel button — renders as `.btn.btn-secondary` |

## Accessibility

`AlertDialog` uses `@radix-ui/react-alert-dialog` which applies the `alertdialog` role
(stronger than `dialog`) — screen readers announce an alert:

- `role="alertdialog"` with `aria-modal="true"`.
- Focus moves to the first focusable element on open (typically the Cancel button).
- Escape key is intentionally blocked by default — the user must click Cancel to dismiss.
  This prevents accidental dismissal of destructive confirmations.
- `AlertDialog` wired to `aria-labelledby`. `AlertDialog` wired to `aria-describedby`.
- WCAG 2.1 SC 3.3.4 (Error Prevention): destructive actions are confirmed before execution.

## Composition

```tsx
// Controlled AlertDialog
<AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
  <AlertDialog>
    <AlertDialog>
      <AlertDialog>Revoke access?</AlertDialog>
      <AlertDialog>
        {user.name} will lose access to all projects immediately.
      </AlertDialog>
    </AlertDialog>
    <AlertDialog>
      <AlertDialog>Keep access</AlertDialog>
      <AlertDialog onClick={handleRevoke}>
        Revoke access
      </AlertDialog>
    </AlertDialog>
  </AlertDialog>
</AlertDialog>
```

## See also

- [Dialog](./Dialog.md) — non-destructive modal (Escape closes; no special role).
- [Button](../general/Button.md) — `variant="danger"` for destructive triggers.
