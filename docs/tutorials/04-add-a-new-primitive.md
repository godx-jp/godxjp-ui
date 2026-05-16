---
diataxis: tutorial
library: "@godxjp/ui"
library_version: 3.0.0
updated: 2026-05-16
audience: [developer]
---

# Tutorial 04 — Add a new primitive and contribute it upstream

**You will learn:**

- How to add a new primitive (`ProgressBar`) following the `@godxjp/ui` conventions.
- How to write it token-first (CSS classes, not inline utilities).
- How to export it correctly so it appears in the barrel entry.
- How to open a PR to the submodule.

**By the end of this tutorial you will have** a `ProgressBar` component ready for
review, committed to a branch in `libs/ts/godxjp-ui`, with a PR opened to `main`.

**Prerequisites:** Completed [Tutorial 03](./03-shell-composition.md).
You must be working inside the `godx-admin` monorepo, not in a consumer service.

**Time:** approximately 30 minutes.

---

## Step 1 — Check if the primitive already exists

Before adding anything, verify the primitive is not already in the package:

```bash
grep -r "ProgressBar" /home/satoshi/famgia/admin/libs/ts/godxjp-ui/src/
```

If no results, continue. If results appear, the primitive exists — use it instead of
creating a duplicate.

---

## Step 2 — Enter the submodule working directory

```bash
cd /home/satoshi/famgia/admin/libs/ts/godxjp-ui
git status   # confirm clean working tree
git checkout main
git pull --ff-only origin main
git checkout -b feat/add-progress-bar
```

---

## Step 3 — Add the token class to tokens.css

Open `src/tokens/tokens.css` and add the `.progress-*` classes in the component
primitives section (near `.checkbox-root`, `.switch-root`):

```css
/* ProgressBar */
.progress-track {
  width: 100%;
  height: var(--spacing-2);       /* 8px — matches density default */
  background: var(--muted);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--primary);
  border-radius: var(--radius-full);
  transition: width var(--transition-base) var(--ease-in-out);
}
```

Token rules to observe:

- Height comes from a spacing token, not a literal pixel value.
- Background colors use semantic tokens (`--muted`, `--primary`).
- The transition uses `--transition-base` and `--ease-in-out`.
- Do not add `--progress-*` custom properties unless you expect operators to
  override them. The semantic tokens are enough for this primitive.

---

## Step 4 — Create the React component

Create `src/components/primitives/ProgressBar.tsx`:

```tsx
// src/components/primitives/ProgressBar.tsx
import type { HTMLAttributes } from "react"
import { cn } from "./cn"

/**
 * ProgressBar — determinate progress indicator.
 *
 * Renders a `.progress-track` / `.progress-fill` pair from tokens.css.
 * The value must be in the range 0–100.
 *
 * @example
 *   <ProgressBar value={65} aria-label="Upload progress" />
 */

export interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  /** Progress percentage, 0–100. */
  value: number
  /** Maximum value. Defaults to 100. */
  max?: number
}

export function ProgressBar({
  value,
  max = 100,
  className,
  ...rest
}: ProgressBarProps) {
  const clampedValue = Math.min(Math.max(0, value), max)
  const pct = (clampedValue / max) * 100

  return (
    <div
      role="progressbar"
      aria-valuenow={clampedValue}
      aria-valuemin={0}
      aria-valuemax={max}
      className={cn("progress-track", className)}
      {...rest}
    >
      <div
        className="progress-fill"
        style={{ width: `${pct}%` }}
        aria-hidden
      />
    </div>
  )
}
```

---

## Step 5 — Export the primitive

Open `src/components/primitives/index.ts` and add the export:

```ts
// src/components/primitives/index.ts  (excerpt — add at end)
export { ProgressBar } from "./ProgressBar"
export type { ProgressBarProps } from "./ProgressBar"
```

The barrel entry at `src/index.ts` re-exports everything from `components/primitives/index.ts`,
so no further changes are needed.

---

## Step 6 — Write a type-check smoke test

Verify TypeScript compiles correctly:

```bash
cd /home/satoshi/famgia/admin/libs/ts/godxjp-ui
pnpm type-check
```

**Expected output:** No errors.

---

## Step 7 — Write the reference doc

Create `docs/reference/primitives/ProgressBar.md`:

```markdown
---
diataxis: reference
library: "@godxjp/ui"
library_version: 3.0.0
component: ProgressBar
status: stable
audience: [developer, agent]
---

# ProgressBar

> Determinate progress indicator that shows completion percentage.

## Usage

\`\`\`tsx
import { ProgressBar } from "@godxjp/ui"

<ProgressBar value={65} aria-label="Upload progress" />
\`\`\`

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `number` | required | Progress percentage, 0–`max` |
| `max` | `number` | `100` | Maximum value |
| `...rest` | `HTMLAttributes<HTMLDivElement>` | — | Standard div props |

## Accessibility

- Renders `role="progressbar"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`.
- The fill bar uses `aria-hidden` — the numeric state is on the track element.
- Always provide `aria-label` or `aria-labelledby` to describe what is in progress.
- WCAG 2.1 AA: `--primary` fill on `--muted` track meets 3:1 contrast ratio.

## See also

- [tokens.md](../tokens.md) — `--primary`, `--muted`, `--transition-base` values.
- [adr/0003-tokens-not-utilities.md](../../adr/0003-tokens-not-utilities.md)
```

---

## Step 8 — Commit and open a PR

```bash
cd /home/satoshi/famgia/admin/libs/ts/godxjp-ui

git add src/tokens/tokens.css \
        src/components/primitives/ProgressBar.tsx \
        src/components/primitives/index.ts \
        docs/reference/primitives/ProgressBar.md

git commit -m "feat(primitives): add ProgressBar with token-first CSS"

git push origin feat/add-progress-bar

gh pr create \
  --base main \
  --head feat/add-progress-bar \
  --title "feat(primitives): ProgressBar" \
  --body "Adds a determinate ProgressBar primitive backed by .progress-track/.progress-fill CSS tokens.
Includes reference doc, ARIA role, and type exports."
```

---

## Troubleshooting

| Problem | Likely cause | Fix |
|---|---|---|
| `pnpm type-check` fails on `cn` import | Wrong relative path | Import `cn` from `"./cn"` (same directory) |
| ProgressBar renders but has wrong height | Token class not loaded | Confirm `.progress-track` is in `tokens.css`, not inline |
| Export not visible from barrel | Missing line in `index.ts` | Add `export { ProgressBar } from "./ProgressBar"` to `index.ts` |
| PR opens on wrong base | Not on `main` before checkout | Always start with `git checkout main && git pull --ff-only` |

---

## What you achieved

You added a brand-compliant primitive following the exact pattern used by every
existing primitive in the library: token-first CSS, forwarded refs, ARIA attributes,
and a companion reference doc.

**See also:** [How-to: Contribute a primitive](../how-to/contribute-primitive.md)
for the abbreviated task reference once you are comfortable with the workflow.
