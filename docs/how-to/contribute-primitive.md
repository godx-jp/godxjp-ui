---
diataxis: how-to
library: "@godxjp/ui"
library_version: 3.0.0
updated: 2026-05-16
audience: [developer]
---

# How to contribute a primitive to @godxjp/ui

**When to use:** You need a component that does not exist yet and it belongs in the shared framework (not in a single service).

**Prerequisites:** Write access to `libs/ts/godxjp-ui`. Familiarity with the token system (see [ADR 0003](../adr/0003-tokens-not-utilities.md)).

---

## Steps

1. **Verify it does not exist:**

   ```bash
   grep -r "ComponentName" /home/satoshi/famgia/admin/libs/ts/godxjp-ui/src/
   ```

2. **Branch off `main` in the submodule:**

   ```bash
   cd /home/satoshi/famgia/admin/libs/ts/godxjp-ui
   git checkout main && git pull --ff-only origin main
   git checkout -b feat/add-<component-name>
   ```

3. **Add the CSS token class to `src/tokens/tokens.css`:**

   - Use only semantic token variables (`--primary`, `--muted`, `--spacing-*`, etc.)
   - Do not hard-code pixel values or hex colors
   - Follow the naming pattern: `.component-root`, `.component-part`, etc.

4. **Create `src/components/primitives/<Name>.tsx`:**

   - Export: named export for the component, named export for each part, named export for the props type
   - Accessibility: `role`, `aria-*`, and keyboard behavior per WCAG 2.1 AA
   - Pattern: wrap a Radix primitive if the component needs keyboard nav or focus management; use a plain HTML element otherwise
   - Use `forwardRef` so consumers can wire `react-hook-form` and focus management
   - Import `cn` from `"./cn"` for class merging

5. **Export from the barrel:**

   ```ts
   // src/components/primitives/index.ts
   export { ComponentName } from "./ComponentName"
   export type { ComponentNameProps } from "./ComponentName"
   ```

6. **Write the reference doc:**

   Create `docs/reference/primitives/<Name>.md` using the primitive template from [reference/primitives/README.md](../reference/primitives/README.md).

7. **Add to the primitive index tables** in `docs/reference/primitives/README.md` and `docs/reference/README.md`.

8. **Type-check:**

   ```bash
   pnpm type-check
   ```

9. **Commit and open a PR:**

   ```bash
   git add src/ docs/
   git commit -m "feat(primitives): add <Name>"
   git push origin feat/add-<component-name>
   gh pr create --base main --head feat/add-<component-name> \
     --title "feat(primitives): <Name>" \
     --body "Adds <Name> primitive. WCAG AA verified. Reference doc included."
   ```

10. **After merge, bump the umbrella pointer:**

    ```bash
    cd /home/satoshi/famgia/admin
    git -C libs/ts/godxjp-ui pull --ff-only origin main
    git add libs/ts/godxjp-ui
    git commit -m "chore(godxjp-ui): bump to include <Name> primitive"
    git push origin master
    ```

---

## What if it fails?

| Symptom | Cause | Fix |
|---|---|---|
| `pnpm type-check` errors on new file | Missing type annotation | Add explicit return type to the component function |
| CSS class not applying | Class added to wrong CSS file | Confirm it is in `tokens.css`, not in `tokens-ext.css` (ext is for shell + tenant rules only) |
| PR fails review for hard-coded color | Used a Tailwind color utility | Replace with `var(--token)` or a token-mapped class |

---

## Related

- [Tutorial 04: Add a new primitive](../tutorials/04-add-a-new-primitive.md)
- [ADR 0003: Tokens not utilities](../adr/0003-tokens-not-utilities.md)
- [ADR 0001: Radix as foundation](../adr/0001-radix-as-foundation.md)
