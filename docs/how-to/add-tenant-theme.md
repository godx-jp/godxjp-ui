---
diataxis: how-to
library: "@godxjp/ui"
library_version: 3.0.0
updated: 2026-05-16
audience: [developer]
---

# How to add a per-tenant brand override

**When to use:** An operator needs their own accent color (for example a new restaurant franchise tenant).

**Prerequisites:** Operator approval for the brand change. `@godxjp/ui` submodule write access.

---

## Steps

Tenant themes live inside `@godxjp/ui` itself (in `src/tokens/tokens-ext.css`) so all services inherit them automatically from a single source. For operator-level customisation without touching the framework, see [How-to: Override tokens](./override-tokens.md) instead.

### Add a framework-level tenant (for godx team)

1. Open `libs/ts/godxjp-ui/src/tokens/tokens-ext.css`.

2. Add a `[data-tenant="<slug>"]` block in the tenant section:

   ```css
   /* src/tokens/tokens-ext.css — add to the tenant overrides section */
   [data-tenant="acme"] {
     --primary:   oklch(58% 0.17 290);   /* deep purple — chroma 0.17 ✓ */
     --ring:      oklch(58% 0.17 290);
   }

   [data-tenant="acme"][data-theme="dark"] {
     --primary:   oklch(68% 0.17 290);   /* lighter in dark mode */
     --ring:      oklch(68% 0.17 290);
   }
   ```

3. Add the tenant to `src/data/products.ts` if it needs a fixture entry:

   ```ts
   // src/data/products.ts — add to PRODUCTS array
   {
     id: "acme",
     name: "Acme Corp",
     tenant: "acme",
     role: "Enterprise",
     desc: "Acme enterprise workspace",
     color: "oklch(58% 0.17 290)",
     owner: "ops-team",
     devs: 0,
     projects: [],
   }
   ```

4. Bump the patch or minor version in `package.json` and `CHANGELOG.md`:

   ```
   ### Added
   - Tenant `acme` — deep-purple primary accent (`--primary: oklch(58% 0.17 290)`).
   ```

5. Open a PR to `libs/ts/godxjp-ui` `main`. After merge, bump the umbrella submodule pointer.

### Activate at runtime

```tsx
// In the consuming service
document.documentElement.dataset.tenant = "acme"
// or via useTweaks:
const { setTweak } = useTweaks()
setTweak("tenant", "acme")
```

---

## Rules

- Chroma ≤ 0.18 in OKLCH for `--primary` and `--ring` (brand rule — see [BRAND.md](../../BRAND.md)).
- Always add both light and dark variants.
- Do not override foundational tokens (`--foreground`, `--background`, `--muted`, typography).
- One `[data-tenant]` block per tenant slug — do not fan-out across multiple blocks.

---

## What if it fails?

| Symptom | Cause | Fix |
|---|---|---|
| Tenant color not applied | Tenant slug mismatch between CSS and `data-tenant` value | Check the slug in the selector vs `document.documentElement.dataset.tenant` |
| Dark mode tenant color wrong | Missing `[data-tenant][data-theme="dark"]` block | Add the dark variant rule |
| Color looks too vivid | Chroma above 0.18 | Reduce the C value in the OKLCH literal |

---

## Related

- [How-to: Override tokens](./override-tokens.md)
- [Reference: Tokens](../reference/tokens.md)
- [BRAND.md](../../BRAND.md)
