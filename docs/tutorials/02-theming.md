---
title: "Tutorial 02 — Theming: override a token and enable dark mode"
diataxis: tutorial
library: "@godxjp/ui"
library_version: 3.0.0
last-updated: 2026-05-17
audience: [developer]
lang: en
status: published
---

# Tutorial 02 — Theming: override a token and enable dark mode

**You will learn:**

- How the four `data-*` axes (`data-theme`, `data-accent`,
  `data-density`, `data-font-size`) on `<html>` control the visual
  layer.
- How to write a service-local `theme.css` that adds an accent
  palette.
- How to wire the `useTweaks` hook so the user can toggle dark mode.
- How to confirm the override respects the brand rule (chroma ≤ 0.18).

**By the end of this tutorial you will have** a working dark-mode
toggle and a custom accent color scoped to a deployment-specific
palette.

**Prerequisites:** Completed [Tutorial 01](./01-getting-started.md).

---

## Step 1 — Understand the four theme axes

`@godxjp/ui` does not use JavaScript for dark mode or theming. All
visual switching happens via CSS attribute selectors on the
`<html>` element. There are **four orthogonal axes** (see
[01 — theme axes](../specs/01-theme-axes.md)):

| Attribute        | Values                                                                                            | What changes                       |
| ---------------- | ------------------------------------------------------------------------------------------------- | ---------------------------------- |
| `data-theme`     | `light` (default) \| `dark`                                                                       | Surface colors, foreground, border |
| `data-accent`    | `blue` (default) \| `green` \| `violet` \| `amber` \| `rose` \| `slate` \| any registered palette | Primary, ring, brand chain         |
| `data-density`   | `compact` \| `default` \| `comfortable`                                                           | Element / card / page heights      |
| `data-font-size` | `sm` \| `base` (default) \| `lg` \| `xl`                                                          | Root rem scale                     |

`tailwind.css` (which transitively imports `theme.css`) declares
every variant. Setting `document.documentElement.dataset.theme =
"dark"` is enough to flip the UI.

Per cardinal rule 19 the framework does NOT carry per-service
`data-tenant` blocks. Per-deployment branding flows through the
accent axis.

---

## Step 2 — Add a manual dark-mode button

Update `src/App.tsx` to toggle `data-theme` on the document root:

```tsx
// src/App.tsx
import { useState } from "react"
import { Button, Card, Card content, Card header, Card title } from "@godxjp/ui"

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

      <Card title="Dark mode demo">
        <p>Toggle the button above. All token values flip automatically.</p>
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
import { Button, Card } from "@godxjp/ui";
import { useTweaks } from "@godxjp/ui/hooks";

export default function App() {
  const { tweaks, setTweak } = useTweaks();

  return (
    <main style={{ padding: "2rem", maxWidth: "480px" }}>
      <Button
        variant="ghost"
        onClick={() =>
          setTweak("theme", tweaks.theme === "dark" ? "light" : "dark")
        }
        style={{ marginBottom: "1rem" }}
      >
        Theme: {tweaks.theme}
      </Button>

      <Card title="Persistent dark mode">
        <p>
          Reload the page. Your choice persists via <code>godx:theme</code> in
          localStorage.
        </p>
      </Card>
    </main>
  );
}
```

`useTweaks` handles all four axes (`data-theme`, `data-accent`,
`data-density`, `data-font-size`) in one hook. See [useTweaks
reference](../reference/hooks/useTweaks.md).

---

## Step 4 — Create an accent palette override

Create a `src/theme.css` file in your service's frontend directory:

```css
/* src/theme.css — service-local brand overlay */
@import "@godxjp/ui/tailwind.css";

/* Accent palette "myapp" — green */
[data-accent="myapp"] {
  --primary: oklch(56% 0.15 155); /* chroma = 0.15 — within the 0.18 cap */
  --primary-foreground: oklch(98% 0.01 155);
  --ring: oklch(56% 0.15 155);
  --brand: oklch(56% 0.15 155);
  --sidebar-active-bg: oklch(95% 0.02 155);
  --sidebar-active-fg: oklch(56% 0.15 155);
}

/* Optional explicit dark variant */
[data-theme="dark"][data-accent="myapp"] {
  --primary: oklch(70% 0.15 155);
  --ring: oklch(70% 0.15 155);
}
```

Import it in `main.tsx`:

```tsx
import "./theme.css"; // chains @godxjp/ui/tailwind.css first
import { initI18n } from "@godxjp/ui/i18n";
// …
```

Activate the palette in your App:

```tsx
document.documentElement.dataset.accent = "myapp";
```

Or use `useTweaks`:

```tsx
const { setTweak } = useTweaks();
setTweak("accent", "myapp");
```

---

## Step 5 — Verify the chroma cap

Open the browser DevTools and inspect `--primary` on the `<html>` element when
`[data-accent="myapp"]` is active. Confirm the OKLCH chroma value (the second number
in `oklch(L C H)`) is 0.18 or below.

Values above 0.18 are saturated neon — outside the brand contract and will fail review.

---

## Troubleshooting

| Problem                                | Likely cause                                            | Fix                                                                |
| -------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------ |
| Dark mode toggle has no visible effect | `theme.css` did not `@import "@godxjp/ui/tailwind.css"` | Add the import at the top of `theme.css`                           |
| Accent color does not appear           | `data-accent` value mismatch between CSS and `<html>`   | Confirm `dataset.accent` matches the CSS selector slug             |
| Custom color looks wrong in dark mode  | Dark variant not specified                              | Add `[data-theme="dark"][data-accent="myapp"]` rule in `theme.css` |
| `useTweaks` import fails               | Wrong sub-path                                          | Use `import { useTweaks } from "@godxjp/ui/hooks"`                 |

---

## What you achieved

You switched the visual layer using HTML attribute axes, wired
persistent theme state via `useTweaks`, and added a scoped accent
palette. The `[data-accent]` pattern is how every GoDX deployment
customises colors without touching the framework source — per
cardinal rule 19, there is no `[data-tenant]` escape hatch.

**Next:** [Tutorial 03 — Shell composition](./03-shell-composition.md).
