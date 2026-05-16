---
diataxis: reference
library: "@godxjp/ui"
library_version: 3.0.0
component: Sheet
status: stable
audience: [developer, agent]
---

# Sheet

> Slide-in panel built on `@radix-ui/react-dialog` — same accessibility model as Dialog, positioned to slide from any edge.

## Usage

```tsx
import {
  Sheet, SheetTrigger, SheetContent,
  SheetHeader, SheetFooter, SheetTitle, SheetDescription, SheetClose,
} from "@godxjp/ui"

<Sheet>
  <SheetTrigger asChild>
    <Button variant="ghost">Open panel</Button>
  </SheetTrigger>
  <SheetContent side="right">
    <SheetHeader>
      <SheetTitle>Filters</SheetTitle>
      <SheetDescription>Narrow the issue list.</SheetDescription>
    </SheetHeader>
    {/* filter form */}
    <SheetFooter>
      <SheetClose asChild>
        <Button variant="secondary">Close</Button>
      </SheetClose>
    </SheetFooter>
  </SheetContent>
</Sheet>
```

## Exports

| Export | Description |
|---|---|
| `Sheet` | Root — Radix Dialog Root |
| `SheetTrigger` | Trigger element |
| `SheetPortal` | Portal |
| `SheetOverlay` | Backdrop |
| `SheetContent` | Slide-in panel |
| `SheetHeader` | Header layout |
| `SheetFooter` | Footer layout |
| `SheetTitle` | Panel title |
| `SheetDescription` | Panel description |
| `SheetClose` | Close trigger |

## Props — SheetContent

| Prop | Type | Default | Description |
|---|---|---|---|
| `side` | `"top" \| "right" \| "bottom" \| "left"` | `"right"` | Edge the panel slides from |
| `...rest` | `ComponentPropsWithoutRef<typeof DialogPrimitive.Content>` | — | All Radix Dialog Content props |

## Accessibility

Same accessibility model as [Dialog](./Dialog.md):

- `role="dialog"` with `aria-modal="true"`.
- Focus trap while open.
- Escape closes the panel.
- `SheetTitle` wired to `aria-labelledby` automatically.
- `SheetDescription` wired to `aria-describedby` automatically.
- Focus returns to the trigger on close.

## Composition

```tsx
// TweaksPanel pattern — right-side persistent settings drawer
<Sheet open={open} onOpenChange={setOpen}>
  <SheetContent side="right" style={{ width: "320px" }}>
    <SheetHeader>
      <SheetTitle>Display settings</SheetTitle>
    </SheetHeader>
    <DensityPicker />
    <ThemePicker />
  </SheetContent>
</Sheet>
```

## See also

- [Dialog](./Dialog.md) — centered modal variant.
- [TweaksPanel](../shell/TweaksPanel.md) — built using Sheet internally.
