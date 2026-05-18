---
title: "How to contribute a primitive to @godxjp/ui"
diataxis: how-to
library: "@godxjp/ui"
library_version: 3.0.0
last-updated: 2026-05-17
audience: [developer]
lang: en
status: published
---

# How to contribute a primitive to @godxjp/ui

**When to use:** You need a component that does not exist yet and
it belongs in the shared framework (not in a single service).

**Prerequisites:** Write access to `libs/ts/godxjp-ui`. Familiarity
with the binding rules in
[`new-docs/`](../../new-docs/00-index.md) — esp.
[03 — token system](../../new-docs/03-token-system.md),
[04 — prop vocabulary](../../new-docs/04-prop-vocabulary.md),
and cardinal rules 14 + 22 + 23 + 27 in [CLAUDE.md](../../CLAUDE.md).

---

## Steps

1. **Verify it does not exist** (cardinal rule 23 §D):

   ```bash
   cd libs/ts/godxjp-ui
   grep -rln "<ComponentName>" src/components/
   ```

   Check existing barrels — `src/components/primitives.ts`,
   `src/components/shell/index.ts`,
   `src/components/composites/index.ts`. A primitive may already
   exist under a different name.

2. **Check the design canon** (cardinal rule 22). Open the matching
   `design-handoff/ui-system/<latest>/project/preview/comp-<name>.html`.
   If the primitive isn't there, STOP — ask the user to mock it on
   Claude Design first.

3. **Branch off `main` in the submodule:**

   ```bash
   cd /home/satoshi/famgia/admin/libs/ts/godxjp-ui
   git checkout main && git pull --ff-only origin main
   git checkout -b feat/add-<component-name>
   ```

4. **Add any new tokens to `src/styles/theme.css`** FIRST
   (cardinal rule 16 + 22). Token-pin every literal the design
   canon shows. Use existing tokens where they cover the value;
   add component-scope tokens (`--<component>-<aspect>`) only when
   nothing maps. See [03 §M](../../new-docs/03-token-system.md#m--how-to-extend).

5. **Pick the group folder** (cardinal rule 27). Place the file at
   `src/components/<group>/<Name>.tsx` where `<group>` is one of:

   - `general` — Button-shaped surfaces
   - `layout` — Row / Col / Flex / Space / Grid / Masonry-shaped
   - `data-display` — read-only surfaces (Card, Tag, Statistic, …)
   - `data-entry` — form controls (Input, Select, Switch, …)
   - `feedback` — overlays + status (Alert, Dialog, Spinner, …)
   - `navigation` — Anchor / Breadcrumb / Menu / Tabs / Pagination

   Composites go under `src/components/composites/<name>/`; shell
   additions under `src/components/shell/`.

6. **Implement the primitive**:

   - Wrap a Radix UI / cmdk / sonner / react-aria-components
     primitive if keyboard nav / ARIA / focus management is needed
     (cardinal rule 14).
   - Every prop maps to a row in
     [04 — prop vocabulary](../../new-docs/04-prop-vocabulary.md).
     New vocabulary entries require a §section in that doc PLUS a
     row in CLAUDE.md §23.B FIRST.
   - Use `forwardRef` (cardinal rule 13).
   - Import `cn` from `"../cn"` (one level above the group folder).
   - Read tokens via canonical class names from `shell.css` — do
     NOT `@apply` re-encode tokens (cardinal rule 15).
   - Honour all four theme axes (cardinal rule 21).
   - Mobile-first (cardinal rule 24).

7. **Re-export from the barrel:**

   ```ts
   // src/components/primitives.ts  (the single barrel file)
   export { ComponentName } from "./<group>/ComponentName"
   export type { ComponentNameProps } from "./<group>/ComponentName"
   ```

   For shell or composites, re-export from their respective
   `src/components/shell/index.ts` or
   `src/components/composites/index.ts`.

8. **Write the story** (cardinal rule 1 + 29) at
   `src/stories/<group>/<Name>.stories.tsx` with title `<Group>/<Name>`.
   Every story consumes framework primitives — no raw `<button>` /
   `<input>` / inline-styled divs (rule 29).

9. **Write the reference doc** (cardinal rule 18):
   `docs/reference/<group>/<Name>.md`. Add to the index tables
   in `docs/reference/<group>/README.md` and `docs/reference/README.md`.

10. **Verify**:

    ```bash
    pnpm type-check
    pnpm lint:tokens          # 7/7 must pass
    pnpm test
    pnpm build                # tsup bundle must succeed
    ```

11. **Commit and open a PR**:

    ```bash
    git add src/ docs/
    git commit -m "feat(primitives): add <Name>"
    git push origin feat/add-<component-name>
    gh pr create --base main --head feat/add-<component-name> \
      --title "feat(primitives): <Name>" \
      --body "Adds <Name> primitive. Story + reference doc included. Axes verified."
    ```

12. **After merge, bump the umbrella pointer**:

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
| `pnpm type-check` errors on new file | Missing type annotation | Add explicit return type to the component function (cardinal rule 13) |
| CSS class not applying | Class added to wrong CSS file | Confirm it is in `shell.css` (component classes) or `theme.css` (tokens) |
| PR fails review for hard-coded color | Used a Tailwind color utility | Replace with `var(--token)` or a token-mapped class (cardinal rule 2) |
| PR fails for vocabulary drift | Prop name uses Ant synonym (`mode`, `visible`, `kind`, …) | Match the row in [04 — prop vocabulary](../../new-docs/04-prop-vocabulary.md) |
| PR fails for wrong folder | Primitive at `src/components/primitives/<Name>.tsx` flat | Move under `src/components/<group>/<Name>.tsx` per cardinal rule 27 |

---

## Related

- [02 — Consumer contract §I (extending the framework)](../../new-docs/02-consumer-contract.md)
- [Tutorial 04: Add a new primitive](../tutorials/04-add-a-new-primitive.md)
- [ADR 0001: Radix as foundation](../adr/0001-radix-as-foundation.md)
- [ADR 0002: shadcn-style not MUI](../adr/0002-shadcn-style-not-mui.md)
- [ADR 0003: Tokens not utilities](../adr/0003-tokens-not-utilities.md)
