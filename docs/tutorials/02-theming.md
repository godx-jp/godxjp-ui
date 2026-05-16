---
diataxis: tutorial
library: "@godxjp/ui"
library_version: 3.0.0
updated: 2026-05-16
audience: [developer]
---

# Tutorial 02 — Theming: override a token and enable dark mode

**You will learn:**

- How the `[data-theme]`, `[data-tenant]`, and `[data-density]` HTML attributes
  control the visual layer.
- How to write a service-local `theme.css` that adds a tenant accent.
- How to wire the `useTweaks` hook so the user can toggle dark mode.
- How to confirm the override respects the brand rule (chroma ≤ 0.18).

**By the end of this tutorial you will have** a working dark-mode toggle and
a custom accent color scoped to a tenant slug.

**Prerequisites:** Completed [Tutorial 01](./01-getting-started.md).

---

## Step 1 — Understand the attribute system

`@godxjp/ui` does not use JavaScript for dark mode or theming. All visual switching
happens via CSS attribute selectors on the `<html>` element:

| Attribute | Values | What changes |
|---|---|---|
| `data-theme` | `light` (default) \| `dark` | Surface colors, foreground, border |
| `data-density` | `compact` \| `default` \| `comfortable` | Button/row/input height |
| `data-tenant` | any registered slug, e.g. `godx` | Primary color, ring color |

`tokens-ext.css` (included via `tailwind.css`) declares all variants.
Setting `document.documentElement.dataset.theme = "dark"` is enough to flip the UI.

---

## Step 2 — Add a manual dark-mode button

Update `src/App.tsx` to toggle `data-theme` on the document root:

```tsx
// src/App.tsx
import { useState } from "react"
import { Button, Card, CardContent, CardHeader, CardTitle } from "@godxjp/ui"

export default function App() {
  const [dark, setDark] = useState(false)

  function toggleTheme() {
    const next = !dark
    setDark(next)
    document.documentElement.dataset.theme = next ? "dark" : "light"
  }

  return (
    <main style={{ padding: "2rem", maxWidth: "480px" }}>
      <Button variant="ghost" onClick={toggleTheme} style={{ marginBottom: "1rem" }}>
        {dark ? "Switch to light" : "Switch to dark"}
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Dark mode demo</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Toggle the button above. All token values flip automatically.</p>
        </CardContent>
      </Card>
    </main>
  )
}
```

Run the dev server (`pnpm dev`) and click the button. The card, buttons, and background
all switch without any CSS reload.

---

## Step 3 — Use useTweaks for persistent state

For production code you should use the `useTweaks` hook, which persists the user's
preference to `localStorage` and keeps the `<html>` attributes in sync automatically.

```tsx
// src/App.tsx
import { Button, Card, CardContent, CardHeader, CardTitle } from "@godxjp/ui"
import { useTweaks } from "@godxjp/ui/hooks"

export default function App() {
  const { tweaks, setTweak } = useTweaks()

  return (
    <main style={{ padding: "2rem", maxWidth: "480px" }}>
      <Button
        variant="ghost"
        onClick={() => setTweak("theme", tweaks.theme === "dark" ? "light" : "dark")}
        style={{ marginBottom: "1rem" }}
      >
        Theme: {tweaks.theme}
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Persistent dark mode</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            Reload the page. Your choice persists via <code>godx.tweaks</code> in
            localStorage.
          </p>
        </CardContent>
      </Card>
    </main>
  )
}
```

`useTweaks` handles all three attributes (`data-theme`, `data-density`, `data-tenant`)
in one hook. See [useTweaks reference](../reference/hooks/useTweaks.md).

---

## Step 4 — Create a tenant accent override

Create a `src/theme.css` file in your service's frontend directory:

```css
/* src/theme.css — service-local brand overlay */

/* Tenant "myapp" — green accent */
[data-tenant="myapp"] {
  --primary: oklch(56% 0.15 155);   /* chroma = 0.15 — within the 0.18 cap */
  --ring:    oklch(56% 0.15 155);
}

/* Dark variant is automatic — tokens-ext.css darkens every tenant automatically.
   Only override if you need to fine-tune a specific dark value. */
```

Import it AFTER the base tokens in `main.tsx`:

```tsx
import "@godxjp/ui/tailwind.css"   // base tokens first
import "./theme.css"               // service overlay second
import { initI18n } from "@godxjp/ui/i18n"
// …
```

Activate the tenant in your App:

```tsx
// Activate the tenant on mount
document.documentElement.dataset.tenant = "myapp"
```

Or use `useTweaks`:

```tsx
const { setTweak } = useTweaks()
setTweak("tenant", "myapp")
```

---

## Step 5 — Verify the chroma cap

Open the browser DevTools and inspect `--primary` on the `<html>` element when
`[data-tenant="myapp"]` is active. Confirm the OKLCH chroma value (the second number
in `oklch(L C H)`) is 0.18 or below.

Values above 0.18 are saturated neon — outside the brand contract and will fail review.

---

## Troubleshooting

| Problem | Likely cause | Fix |
|---|---|---|
| Dark mode toggle has no visible effect | `useTweaks` sets `data-theme` but `tokens-ext.css` is not loaded | Confirm `import "@godxjp/ui/tailwind.css"` (not `tokens.css`) is the first import |
| Tenant color does not appear | `theme.css` imported before base tokens | Move `theme.css` import AFTER `@godxjp/ui/tailwind.css` |
| Custom color looks wrong in dark mode | Dark variant assumed inherited from base | Add `[data-tenant="myapp"][data-theme="dark"]` rule in `theme.css` if needed |
| `useTweaks` import fails | Wrong sub-path | Use `import { useTweaks } from "@godxjp/ui/hooks"` |

---

## What you achieved

You switched the visual layer using HTML attributes, wired persistent theme state
via `useTweaks`, and added a scoped tenant color override. The `[data-tenant]` pattern
is how every GoDX deployment customises colors without touching the framework source.

**Next:** [Tutorial 03 — Shell composition](./03-shell-composition.md).
