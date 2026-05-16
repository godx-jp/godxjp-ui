---
diataxis: reference
library: "@godxjp/ui"
library_version: 3.0.0
component: Toaster
status: stable
audience: [developer, agent]
---

# Toaster

> Toast notification host backed by `sonner`, styled with `.toast*` token classes.

## Usage

```tsx
// 1. Mount <Toaster /> once at the root of your app (inside the portal)
import { Toaster } from "@godxjp/ui"

function App() {
  return (
    <>
      <AppShell>…</AppShell>
      <Toaster position="bottom-right" />
    </>
  )
}
```

```tsx
// 2. Call toast() anywhere in your app
import { toast } from "@godxjp/ui"

toast.success("Saved successfully")
toast.error("Failed to connect")
toast.info("Background sync started")
toast.warning("Storage almost full")
toast("Hello from toast")
```

## Exports

| Export | Description |
|---|---|
| `Toaster` | Toast host component — mount once per page |
| `toast` | Function to imperatively show toasts |

## Props — Toaster

All props from `sonner` `Toaster` component are accepted. Common ones:

| Prop | Type | Default | Description |
|---|---|---|---|
| `position` | `"top-left" \| "top-center" \| "top-right" \| "bottom-left" \| "bottom-center" \| "bottom-right"` | `"bottom-right"` | Screen position |
| `duration` | `number` | `4000` | Auto-dismiss delay in milliseconds |
| `richColors` | `boolean` | `false` | Use colored success/error backgrounds (vs. monochrome) |
| `closeButton` | `boolean` | `false` | Show a close button on each toast |
| `expand` | `boolean` | `false` | Expand all toasts by default |
| `visibleToasts` | `number` | `3` | Maximum number of visible toasts |

## CSS import

Import `@godxjp/ui/sonner.css` after tokens for the animation keyframes:

```tsx
import "@godxjp/ui/tailwind.css"
import "@godxjp/ui/sonner.css"   // toast slide-in/out animations
```

## Accessibility

- `Toaster` renders an `aria-live="polite"` region — screen readers announce toast messages.
- Error toasts use `aria-live="assertive"` — announced immediately.
- WCAG 2.1 SC 4.1.3 (Status Messages): toasts are announced without requiring focus.
- WCAG 2.1 SC 2.2.1 (Timing Adjustable): `duration` prop lets operators increase the display time for users who need more time.

## See also

- [Button](./Button.md) — buttons inside toast actions.
- [sonner documentation](https://sonner.emilkowal.ski/) — full `toast()` API reference.
