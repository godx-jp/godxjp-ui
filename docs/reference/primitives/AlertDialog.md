---
diataxis: reference
library: "@godxjp/ui"
library_version: 3.0.0
component: AlertDialog
status: stable
audience: [developer, agent]
---

# AlertDialog

> Interrupting modal for destructive or irreversible confirmations, backed by `@radix-ui/react-alert-dialog`.

## Usage

```tsx
import {
  AlertDialog, AlertDialogTrigger, AlertDialogContent,
  AlertDialogHeader, AlertDialogFooter,
  AlertDialogTitle, AlertDialogDescription,
  AlertDialogAction, AlertDialogCancel,
} from "@godxjp/ui"

<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="danger">Delete project</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Delete project?</AlertDialogTitle>
      <AlertDialogDescription>
        This permanently removes all data. This action cannot be undone.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={handleDelete}>Delete permanently</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

## Exports

| Export | Description |
|---|---|
| `AlertDialog` | Root |
| `AlertDialogTrigger` | Trigger element |
| `AlertDialogPortal` | Portal |
| `AlertDialogOverlay` | Backdrop |
| `AlertDialogContent` | Modal panel |
| `AlertDialogHeader` | Header layout |
| `AlertDialogFooter` | Footer layout |
| `AlertDialogTitle` | Modal title |
| `AlertDialogDescription` | Modal description |
| `AlertDialogAction` | Confirm button — renders as `.btn.btn-primary` |
| `AlertDialogCancel` | Cancel button — renders as `.btn.btn-secondary` |

## Accessibility

`AlertDialog` uses `@radix-ui/react-alert-dialog` which applies the `alertdialog` role
(stronger than `dialog`) — screen readers announce an alert:

- `role="alertdialog"` with `aria-modal="true"`.
- Focus moves to the first focusable element on open (typically the Cancel button).
- Escape key is intentionally blocked by default — the user must click Cancel to dismiss.
  This prevents accidental dismissal of destructive confirmations.
- `AlertDialogTitle` wired to `aria-labelledby`. `AlertDialogDescription` wired to `aria-describedby`.
- WCAG 2.1 SC 3.3.4 (Error Prevention): destructive actions are confirmed before execution.

## Composition

```tsx
// Controlled AlertDialog
<AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Revoke access?</AlertDialogTitle>
      <AlertDialogDescription>
        {user.name} will lose access to all projects immediately.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Keep access</AlertDialogCancel>
      <AlertDialogAction onClick={handleRevoke}>Revoke access</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

## See also

- [Dialog](./Dialog.md) — non-destructive modal (Escape closes; no special role).
- [Button](./Button.md) — `variant="danger"` for destructive triggers.
