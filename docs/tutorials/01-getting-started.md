---
title: "Tutorial 01 — Getting started with @godxjp/ui"
diataxis: tutorial
library: "@godxjp/ui"
library_version: 3.0.0
last-updated: 2026-05-17
audience: [developer]
lang: en
status: published
---

# Tutorial 01 — Getting started with @godxjp/ui

**You will learn:**

- How to install `@godxjp/ui` in a new Vite + React project.
- How to import the design tokens so the GoDX visual language is active.
- How to render your first brand-compliant component.
- How to verify the install is working correctly.

**By the end of this tutorial you will have** a running React app that renders
a `Button` and a `Card` with the GoDX design tokens applied.

**Time:** approximately 15 minutes.

**Prerequisites:**

- Node 22 or later (`node -v` to check).
- pnpm 9 or later (`pnpm -v` to check).
- A Vite + React 19 project. If you do not have one, create it now:

```bash
pnpm create vite my-app --template react-ts
cd my-app
pnpm install
```

---

## Step 1 — Install @godxjp/ui

From inside your project directory:

```bash
pnpm add @godxjp/ui
```

`@godxjp/ui` declares `react`, `react-dom`, and `tailwindcss` as peer dependencies.
If they are already in your project you do not need to install them again.
If they are missing:

```bash
pnpm add react react-dom
pnpm add -D tailwindcss
```

**Expected output:** pnpm prints a dependency tree that includes `@godxjp/ui@3.0.0`
and its direct dependencies (Radix UI, lucide-react, i18next, sonner, etc.).

---

## Step 2 — Import the design tokens

Open `src/main.tsx` (or `src/index.tsx`) and add one CSS import at the very top,
before any other stylesheet:

```tsx
// src/main.tsx
import "@godxjp/ui/tailwind.css"; // tokens + Tailwind v4 utilities
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

`@godxjp/ui/tailwind.css` includes:

- All CSS custom properties (color, spacing, typography, radius, motion).
- The Tailwind v4 layer that maps tokens to utility class names.
- Base styles for `body`, `::selection`, scrollbars.

**What if I need only the raw tokens?** Import `@godxjp/ui/tokens.css` instead;
that file omits the Tailwind layer so it works in projects that do not use Tailwind.

---

## Step 3 — Initialise i18n

`@godxjp/ui` ships a pre-configured i18next instance. Call `initI18n()` once
before you render anything that uses translated strings:

```tsx
// src/main.tsx
import "@godxjp/ui/tailwind.css";
import { initI18n } from "@godxjp/ui/i18n";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";

initI18n(); // configure i18next before first render

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

If you omit `initI18n()`, components that use translated strings (such as
`Topbar` and `TweaksPanel`) will render raw i18n keys instead of the translated labels.

---

## Step 4 — Render your first components

Replace the contents of `src/App.tsx` with:

```tsx
// src/App.tsx
import { Button, Card, Card content, Card header, Card title } from "@godxjp/ui"

export default function App() {
  return (
    <main style={{ padding: "2rem", maxWidth: "480px" }}>
      <Card>
        <Card title="PLACEHOLDER">
          Hello from @godxjp/ui

        <div className="card-body">
          <p style={{ marginBottom: "1rem" }}>
            The design tokens are active. This card uses <code>--card</code>{" "}
            surface color, token border-radius, and token shadow.
          </p>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <Button variant="primary">Save</Button>
            <Button variant="secondary">Cancel</Button>
            <Button variant="ghost">Learn more</Button>
            <Button variant="danger">Delete</Button>
          </div>
        </div>
      </Card>
    </main>
  )
}
```

Start the dev server:

```bash
pnpm dev
```

**Expected output:** The terminal prints a localhost URL (typically `http://localhost:5173`).
Open it in a browser.

**Expected in browser:** A card with a light off-white background, a `Card title` in
medium-weight text (500), and four buttons — a blue primary, a bordered secondary,
a transparent ghost, and a red danger button. All sizing follows the 32 px default density.

---

## Step 5 — Verify dark mode works

Add `data-theme="dark"` to your `<html>` element to confirm the tokens flip correctly.
In Chrome DevTools, select the `<html>` element and add the attribute. The card
background, text, and buttons should all swap to the dark surface palette without
any code change.

Remove the attribute to return to light mode.

---

## Troubleshooting

| Problem                                                     | Likely cause                                         | Fix                                                                           |
| ----------------------------------------------------------- | ---------------------------------------------------- | ----------------------------------------------------------------------------- |
| Buttons render with no styling                              | The CSS import is missing or placed after app styles | Move `import "@godxjp/ui/tailwind.css"` to the very first line of `main.tsx`  |
| Components have no color (raw `var(--primary)` in DevTools) | The tokens CSS was not loaded                        | Confirm the import path is `@godxjp/ui/tailwind.css`, not `@godxjp/ui/styles` |
| TypeScript error: "Cannot find module '@godxjp/ui'"         | Package not installed                                | Run `pnpm add @godxjp/ui`                                                     |
| `initI18n is not a function`                                | Importing from wrong entry                           | Use `import { initI18n } from "@godxjp/ui/i18n"`                              |
| Buttons render as plain `<div>`                             | `react` peer dep missing                             | Run `pnpm add react react-dom`                                                |

---

## What you achieved

You installed `@godxjp/ui`, wired the design tokens, initialised i18n, and rendered
brand-compliant components. Every subsequent tutorial builds on this foundation.

**Next:** [Tutorial 02 — Theming: override a token and enable dark mode](./02-theming.md).
