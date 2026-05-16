---
diataxis: how-to
library: "@godxjp/ui"
library_version: 3.0.0
updated: 2026-05-16
audience: [developer]
---

# How to override tokens in a service

**When to use:** Your service needs a brand-approved accent color, custom sidebar width, or any other deviation from the base token set.

**Prerequisites:** `@godxjp/ui` installed. `import "@godxjp/ui/tailwind.css"` is the first import in `main.tsx`.

---

## Steps

1. Create `src/theme.css` in the service's frontend directory.

2. Write overrides under a `[data-tenant="<slug>"]` selector:

   ```css
   /* src/theme.css */
   [data-tenant="myapp"] {
     --primary: oklch(56% 0.15 200);   /* chroma ≤ 0.18 required */
     --ring:    oklch(56% 0.15 200);
   }
   ```

3. Import `theme.css` AFTER the base tokens in `main.tsx`:

   ```tsx
   import "@godxjp/ui/tailwind.css"
   import "./theme.css"              // overlay comes after base
   ```

4. Activate the tenant on the `<html>` element. The `useTweaks` hook does this automatically when `tweaks.tenant` matches your slug:

   ```tsx
   import { useTweaks } from "@godxjp/ui/hooks"
   // In your App component:
   const { setTweak } = useTweaks()
   setTweak("tenant", "myapp")
   ```

   Or set it directly at app startup:

   ```tsx
   document.documentElement.dataset.tenant = "myapp"
   ```

---

## Rules

- Overrides MUST live inside a `[data-tenant="<slug>"]` or `[data-theme="dark"]` selector. Never target `:root` directly.
- Chroma in OKLCH MUST be ≤ 0.18 for primary/ring (brand rule — see [BRAND.md](../../BRAND.md)).
- Only redeclare established token names (`--primary`, `--ring`, etc.). Inventing new root-level tokens is a review-block.
- For dark-mode variants, add `[data-tenant="myapp"][data-theme="dark"]` rules if the base dark derivation does not look correct.

---

## What if it fails?

| Symptom | Cause | Fix |
|---|---|---|
| Override color not applied | `theme.css` imported before `tailwind.css` | Reorder so `tailwind.css` is first |
| Override leaks outside the tenant scope | Targeting `:root` instead of `[data-tenant]` | Wrap all rules in the tenant selector |
| Color renders as neon | Chroma above 0.18 | Reduce the second OKLCH value to ≤ 0.18 |

---

## Related

- [How-to: Add a tenant theme](./add-tenant-theme.md)
- [Reference: Tokens](../reference/tokens.md)
- [ADR 0003: Tokens not utilities](../adr/0003-tokens-not-utilities.md)
