---
title: "Dialog"
diataxis: reference
library: "@godxjp/ui"
library_version: 3.0.0
component: Dialog
status: stable
audience: [developer, agent]
lang: en
---

# Dialog

> Modal overlay backed by `@radix-ui/react-dialog` with focus trap and ARIA modal semantics.

## Usage

```tsx
import {
  Dialog, DialogTrigger, DialogContent,
  DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose,
} from "@godxjp/ui"

<Dialog>
  <DialogTrigger asChild>
    <Button>Open dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Confirm action</DialogTitle>
      <DialogDescription>This action cannot be undone.</DialogDescription>
    </DialogHeader>
    <p>Are you sure you want to proceed?</p>
    <DialogFooter>
      <DialogClose asChild>
        <Button variant="secondary">Cancel</Button>
      </DialogClose>
      <Button variant="danger" onClick={handleConfirm}>Delete</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

## Exports

| Export | Description |
|---|---|
| `Dialog` | Root — Radix Dialog Root |
| `DialogTrigger` | Trigger element |
| `DialogPortal` | Portal — renders content outside the DOM tree |
| `DialogOverlay` | Backdrop overlay |
| `DialogContent` | Modal panel — includes built-in Portal + Overlay |
| `DialogHeader` | Header section layout |
| `DialogFooter` | Footer section layout |
| `DialogTitle` | Modal title (`aria-labelledby` target) |
| `DialogDescription` | Modal description (`aria-describedby` target) |
| `DialogClose` | Close trigger |

## Props — Dialog (root)

| Prop | Type | Default | Description |
|---|---|---|---|
| `open` | `boolean` | — | Controlled open state |
| `onOpenChange` | `(open: boolean) => void` | — | Called when open state changes |
| `defaultOpen` | `boolean` | `false` | Uncontrolled initial open state |

## Accessibility

- `DialogContent` renders `role="dialog"` with `aria-modal="true"`.
- Focus is trapped inside the dialog when open — keyboard cannot reach content behind.
- Escape closes the dialog.
- `DialogTitle` is wired to `aria-labelledby` automatically by Radix.
- `DialogDescription` is wired to `aria-describedby` automatically.
- On close, focus returns to the element that opened the dialog.
- WCAG 2.1 SC 1.4.3 + 4.11: content and interactive elements inside the dialog meet contrast requirements.

## Composition

```tsx
// Controlled dialog
const [open, setOpen] = useState(false)

<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Edit issue title</DialogTitle>
    </DialogHeader>
    <Input defaultValue={issue.title} />
    <DialogFooter>
      <Button onClick={() => setOpen(false)}>Save</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

## See also

- [AlertDialog](./AlertDialog.md) — for destructive confirmations (stronger ARIA pattern).
- [Sheet](./Sheet.md) — slide-in panel variant.
- [Button](./Button.md) — `asChild` pattern for trigger.
