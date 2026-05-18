---
title: "Sheet"
diataxis: reference
library: "@godxjp/ui"
library_version: 3.0.0
component: Sheet
status: stable
audience: [developer, agent]
lang: en
---

# Sheet

> Slide-in panel built on `@radix-ui/react-dialog` — same accessibility model as Dialog, positioned to slide from any edge.

## Usage

```tsx
import {
  Sheet,
  Sheet,
  Sheet,
  Sheet,
  Sheet,
  Sheet,
  Sheet,
  Sheet,
} from "@godxjp/ui";

<Sheet>
  <Sheet asChild>
    <Button variant="ghost">Open panel</Button>
  </Sheet>
  <Sheet side="right">
    <Sheet>
      <Sheet>Filters</Sheet>
      <Sheet>Narrow the issue list.</Sheet>
    </Sheet>
    {/* filter form */}
    <Sheet>
      <Sheet asChild>
        <Button variant="secondary">Close</Button>
      </Sheet>
    </Sheet>
  </Sheet>
</Sheet>;
```

## Exports

| Export             | Description              |
| ------------------ | ------------------------ |
| `Sheet`            | Root — Radix Dialog Root |
| `Sheet`     | Trigger element          |
| `Sheet`      | Portal                   |
| `Sheet`     | Backdrop                 |
| `Sheet`     | Slide-in panel           |
| `Sheet`      | Header layout            |
| `Sheet`      | Footer layout            |
| `Sheet`       | Panel title              |
| `Sheet` | Panel description        |
| `Sheet`       | Close trigger            |

## Props — Sheet

| Prop      | Type                                                       | Default   | Description                    |
| --------- | ---------------------------------------------------------- | --------- | ------------------------------ |
| `side`    | `"top" \| "right" \| "bottom" \| "left"`                   | `"right"` | Edge the panel slides from     |
| `...rest` | `ComponentPropsWithoutRef<typeof DialogPrimitive.Content>` | —         | All Radix Dialog Content props |

## Accessibility

Same accessibility model as [Dialog](./Dialog.md):

- `role="dialog"` with `aria-modal="true"`.
- Focus trap while open.
- Escape closes the panel.
- `Sheet` wired to `aria-labelledby` automatically.
- `Sheet` wired to `aria-describedby` automatically.
- Focus returns to the trigger on close.

## Composition

```tsx
// TweaksPanel pattern — right-side persistent settings drawer
<Sheet open={open} onOpenChange={setOpen}>
  <Sheet side="right" style={{ width: "320px" }}>
    <Sheet>
      <Sheet>Display settings</Sheet>
    </Sheet>
    <DensityPicker />
    <ThemePicker />
  </Sheet>
</Sheet>
```

## See also

- [Dialog](./Dialog.md) — centered modal variant.
- [TweaksPanel](../shell/TweaksPanel.md) — built using Sheet internally.
