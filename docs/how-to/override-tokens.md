---
title: "How to override tokens in a service"
diataxis: how-to
library: "@godxjp/ui"
library_version: 3.0.0
last-updated: 2026-05-17
audience: [developer]
lang: en
status: published
---

# How to override tokens in a service

**When to use:** Your service needs a brand-approved accent color, custom sidebar width, or any other deviation from the base token set.

**Prerequisites:** `@godxjp/ui` installed. `import "@godxjp/ui/tailwind.css"` is the first import in `main.tsx`.

---

## Steps

1. Create `src/theme.css` in the service's frontend directory.

2. Write overrides under a `[data-accent="<palette>"]` selector
   (per cardinal rule 19 — no `[data-tenant]` blocks; per-deployment
   brand colour flows through accent):

   ```css
   /* src/theme.css */
   @import "@godxjp/ui/tailwind.css";

   [data-accent="myapp"] {
     --primary:           oklch(56% 0.15 200);   /* chroma ≤ 0.18 required */
     --primary-foreground:oklch(98% 0.01 200);
     --ring:              oklch(56% 0.15 200);
     --brand:             oklch(56% 0.15 200);
     --sidebar-active-bg: oklch(95% 0.02 200);
     --sidebar-active-fg: oklch(56% 0.15 200);
   }

   /* Optional — explicit dark variant if the auto-derived one is off */
   [data-theme="dark"][data-accent="myapp"] {
     --primary: oklch(68% 0.15 200);
     --ring:    oklch(68% 0.15 200);
   }
   ```

3. Import `theme.css` (which now also pulls `@godxjp/ui/tailwind.css`) in `main.tsx`:

   ```tsx
   import "./theme.css"     // chains @godxjp/ui/tailwind.css first
   ```

4. Activate the accent on the `<html>` element. The `useTweaks` hook
   does this automatically when `tweaks.accent` matches your value:

   ```tsx
   import { useTweaks } from "@godxjp/ui/hooks"
   const { setTweak } = useTweaks()
   setTweak("accent", "myapp")
   ```

   Or set it directly at app startup:

   ```tsx
   document.documentElement.dataset.accent = "myapp"
   ```

---

## Rules

- Overrides MUST live inside a `[data-accent="<palette>"]` or
  `[data-theme="dark"]` selector. Never target `:root` directly.
- Chroma in OKLCH MUST be ≤ 0.18 for primary/ring (brand rule —
  see [BRAND.md](../../BRAND.md)).
- Only redeclare established token names (`--primary`, `--ring`,
  `--brand`, `--sidebar-active-*`, etc.). Inventing new root-level
  tokens is a review-block.
- For dark-mode variants, add `[data-theme="dark"][data-accent="myapp"]`
  rules if the base dark derivation does not look correct.
- Per cardinal rule 19 do NOT add `[data-tenant="<slug>"]` blocks
  back. The framework collapsed tenant + accent into a single
  axis (see [01 — theme axes](../../new-docs/01-theme-axes.md)).

---

## What if it fails?

| Symptom | Cause | Fix |
|---|---|---|
| Override color not applied | `theme.css` did not `@import "@godxjp/ui/tailwind.css"` | Add the import at the top of `theme.css` |
| Override leaks outside the accent scope | Targeting `:root` instead of `[data-accent]` | Wrap all rules in the accent selector |
| Color renders as neon | Chroma above 0.18 | Reduce the second OKLCH value to ≤ 0.18 |

---

## Related

- [01 — Theme axes](../../new-docs/01-theme-axes.md) — accent axis specification.
- [03 — Token system](../../new-docs/03-token-system.md) — token catalogue.
- [Reference: Tokens](../reference/tokens.md).
- [ADR 0003: Tokens not utilities](../adr/0003-tokens-not-utilities.md).
