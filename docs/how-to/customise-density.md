---
diataxis: how-to
library: "@godxjp/ui"
library_version: 3.0.0
updated: 2026-05-16
audience: [developer]
---

# How to customise density

**When to use:** You want to start the service in compact or comfortable density by default, or you want to let the user switch at runtime.

**Prerequisites:** `@godxjp/ui` installed. `useTweaks` imported from `@godxjp/ui/hooks`.

---

## Set a default density at app startup

Set `data-density` on the `<html>` element before the first render. Do this in `main.tsx`, before the `createRoot` call:

```tsx
// src/main.tsx
import "@godxjp/ui/tailwind.css"
import { initI18n } from "@godxjp/ui/i18n"
import { createRoot } from "react-dom/client"
import App from "./App.tsx"

initI18n()
document.documentElement.dataset.density = "compact"   // default for this service

createRoot(document.getElementById("root")!).render(<App />)
```

Valid values are: `compact` (28 px elements), `default` (32 px), `comfortable` (44 px).

---

## Let the user switch density at runtime

Use `useTweaks`. The hook persists the choice to `localStorage` under `"godx.tweaks"` and synchronises `data-density` on `<html>` automatically:

```tsx
import { useTweaks } from "@godxjp/ui/hooks"
import type { Density } from "@godxjp/ui/hooks"

function DensityPicker() {
  const { tweaks, setTweak } = useTweaks()

  return (
    <div style={{ display: "flex", gap: "0.5rem" }}>
      {(["compact", "default", "comfortable"] as Density[]).map((d) => (
        <button
          key={d}
          type="button"
          onClick={() => setTweak("density", d)}
          style={{
            fontWeight: tweaks.density === d ? 700 : 400,
          }}
        >
          {d}
        </button>
      ))}
    </div>
  )
}
```

For the built-in density picker UI, use `TweaksPanel` — it already includes the density radio group.

---

## Override density for a specific element

If one section of the page needs a different density independently of the global setting, add `data-density` to a container element:

```tsx
<div data-density="compact">
  {/* Everything inside here renders at compact density */}
  <Table>…</Table>
</div>
```

The token selectors are ancestor-aware, so the `[data-density="compact"]` block inside a `[data-density="comfortable"]` page works correctly.

---

## What if it fails?

| Symptom | Cause | Fix |
|---|---|---|
| Setting density has no effect | `tokens-ext.css` not loaded | Use `@godxjp/ui/tailwind.css` (not `tokens.css`) — density scaling is in `tokens-ext.css` |
| Density resets on reload | Not using `useTweaks` | Use `useTweaks` — it persists to `localStorage` |
| Comfortable density buttons are too wide | Touch-target scaling by design | The 44 px minimum is required by WCAG SC 2.5.5 and Digital Agency rules |

---

## Related

- [Reference: useTweaks](../reference/hooks/useTweaks.md)
- [Reference: Tokens — density section](../reference/tokens.md)
- [Reference: TweaksPanel](../reference/shell/TweaksPanel.md)
