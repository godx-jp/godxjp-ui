---
title: "Tutorial 04 — Add a new primitive and contribute it upstream"
diataxis: tutorial
library: "@godxjp/ui"
library_version: 3.0.0
last-updated: 2026-05-17
audience: [developer]
lang: en
status: published
---

# Tutorial 04 — Add a new primitive and contribute it upstream

**You will learn:**

- How to add a new primitive following the `@godxjp/ui` conventions.
- How to write it token-first (CSS classes, not inline utilities).
- How to pick the right group folder (cardinal rule 27).
- How to export it correctly so it appears in the barrel entry.
- How to open a PR to the submodule.

For this tutorial we will add a fictitious `Slat` primitive (a thin
horizontal divider with an accent edge). The real `Progress` /
`Skeleton` / `Spinner` primitives already exist in
`src/components/feedback/`; the steps below apply to any new
primitive.

**By the end of this tutorial you will have** a `Slat` component
ready for review, committed to a branch in `libs/ts/godxjp-ui`,
with a PR opened to `main`.

**Prerequisites:** Completed [Tutorial 03](./03-shell-composition.md).
You must be working inside the `godx-admin` monorepo, not in a
consumer service.

**Time:** approximately 30 minutes.

---

## Step 1 — Verify it doesn't exist

Before adding anything, verify the primitive is not already in the
package (cardinal rule 23 §D):

```bash
cd libs/ts/godxjp-ui
grep -rln "Slat" src/components/
```

If no results, continue. If results appear, the primitive exists —
use it instead of creating a duplicate.

---

## Step 2 — Enter the submodule working directory

```bash
cd /home/satoshi/famgia/admin/libs/ts/godxjp-ui
git status   # confirm clean working tree
git checkout main
git pull --ff-only origin main
git checkout -b feat/add-slat
```

---

## Step 3 — Pick the group folder (cardinal rule 27)

Primitives live under `src/components/<group>/<Name>.tsx` where
`<group>` is one of: `general`, `layout`, `data-display`,
`data-entry`, `feedback`, `navigation`.

A `Slat` (horizontal divider with accent edge) is read-only visual
content → `data-display` group. Plan to create the file at
`src/components/data-display/Slat.tsx`.

---

## Step 4 — Add the token class to `shell.css`

Open `src/styles/shell.css` and add the `.slat` class in the
component primitives section:

```css
/* Slat — horizontal divider with optional accent edge */
.slat {
  width: 100%;
  height: 1px; /* hairline — documented px exception */
  background: var(--border);
  margin-block: var(--spacing-4);
}

.slat[data-accent="primary"] {
  background: var(--primary);
}
.slat[data-accent="success"] {
  background: var(--success);
}
.slat[data-accent="attention"] {
  background: var(--attention);
}
```

Token rules to observe (cardinal rules 2 + 15 + 16 + 22):

- Background colors use semantic tokens (`--border`, `--primary`).
- Spacing comes from `--spacing-4`, not a literal pixel value.
- The 1px hairline is a documented exception ([03 §F](../../new-docs/03-token-system.md#f--radius)).

---

## Step 5 — Create the React component

Create `src/components/data-display/Slat.tsx`:

```tsx
// src/components/data-display/Slat.tsx
import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../cn";

/**
 * Slat — a horizontal divider with optional accent edge.
 *
 * Per cardinal rule 23 §B the `accent` prop is the canonical name
 * for "edge indicator in semantic color".
 */

export type SlatAccent =
  | "primary"
  | "success"
  | "warning"
  | "attention"
  | "info"
  | "destructive";

export interface SlatProps extends HTMLAttributes<HTMLDivElement> {
  /** Optional accent color edge. */
  accent?: SlatAccent;
}

export const Slat = forwardRef<HTMLDivElement, SlatProps>(function Slat(
  { accent, className, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      role="separator"
      aria-orientation="horizontal"
      data-accent={accent}
      className={cn("slat", className)}
      {...rest}
    />
  );
});
```

Notes:

- `forwardRef` per cardinal rule 13.
- `cn` imported from `"../cn"` (one level above the group folder).
- The `accent` prop matches the vocabulary row in
  [04 — prop vocabulary §F](../../new-docs/04-prop-vocabulary.md).

---

## Step 6 — Export the primitive

Open `src/components/primitives.ts` (the single barrel file, NOT a
folder) and add the export:

```ts
// src/components/primitives.ts  (excerpt — add near other data-display exports)
export { Slat } from "./data-display/Slat";
export type { SlatProps, SlatAccent } from "./data-display/Slat";
```

The root `src/index.ts` re-exports every name from
`./components/primitives`, so no further changes are needed.

---

## Step 7 — Verify TypeScript + tokens

```bash
cd libs/ts/godxjp-ui
pnpm type-check
pnpm lint:tokens     # 7/7 must pass
pnpm build           # tsup bundle must succeed
```

**Expected output:** No errors.

---

## Step 8 — Write the story (cardinal rules 1 + 29)

Create `src/stories/data-display/Slat.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Slat, Card, Typography } from "@godxjp/ui";

const meta: Meta<typeof Slat> = {
  title: "Data Display/Slat",
  component: Slat,
};
export default meta;

type Story = StoryObj<typeof Slat>;

export const Default: Story = {
  render: () => (
    <Card padding="cozy">
      <Typography.Paragraph>Above the slat.</Typography.Paragraph>
      <Slat />
      <Typography.Paragraph>Below the slat.</Typography.Paragraph>
    </Card>
  ),
};

export const AccentVariants: Story = {
  render: () => (
    <Card padding="cozy">
      {(["primary", "success", "attention"] as const).map((accent) => (
        <div key={accent}>
          <Typography.Paragraph>{accent}</Typography.Paragraph>
          <Slat accent={accent} />
        </div>
      ))}
    </Card>
  ),
};
```

Per cardinal rule 29 the story consumes framework primitives only
(Card, Typography, Slat) — no raw `<div>` styling, no Tailwind
utility stacks for visual decisions.

---

## Step 9 — Write the reference doc

Create `docs/reference/<group>/Slat.md`:

```markdown
---
diataxis: reference
library: "@godxjp/ui"
library_version: 3.0.0
component: Slat
status: stable
audience: [developer, agent]
---

# Slat

> Horizontal divider with optional accent color edge.

## Usage

\`\`\`tsx
import { Slat } from "@godxjp/ui"

<Slat />
<Slat accent="primary" />
\`\`\`

## Props

| Prop      | Type                                                                            | Default     | Description         |
| --------- | ------------------------------------------------------------------------------- | ----------- | ------------------- |
| `accent`  | `"primary" \| "success" \| "warning" \| "attention" \| "info" \| "destructive"` | `undefined` | Semantic color edge |
| `...rest` | `HTMLAttributes<HTMLDivElement>`                                                | —           | Standard div props  |

## Accessibility

- Renders `role="separator"` with `aria-orientation="horizontal"`.
- WCAG 2.1 AA: `--border` background on body surface meets 3:1 non-text contrast.

## See also

- [04 — prop vocabulary §F (accent)](../../new-docs/04-prop-vocabulary.md)
```

---

## Step 10 — Commit and open a PR

```bash
cd libs/ts/godxjp-ui

git add src/styles/shell.css \
        src/components/data-display/Slat.tsx \
        src/components/primitives.ts \
        src/stories/data-display/Slat.stories.tsx \
        docs/reference/<group>/Slat.md

git commit -m "feat(primitives): add Slat with accent edge"

git push origin feat/add-slat

gh pr create \
  --base main \
  --head feat/add-slat \
  --title "feat(primitives): Slat" \
  --body "Adds a horizontal-divider primitive with semantic accent edge. Story + reference doc included. Axes verified."
```

---

## Troubleshooting

| Problem                                | Likely cause                    | Fix                                                                                    |
| -------------------------------------- | ------------------------------- | -------------------------------------------------------------------------------------- |
| `pnpm type-check` fails on `cn` import | Wrong relative path             | Import `cn` from `"../cn"` (one level above the group folder)                          |
| Slat renders but has wrong height      | Token class not loaded          | Confirm `.slat` is in `shell.css`, not inline                                          |
| Export not visible from barrel         | Missing line in `primitives.ts` | Add the `export { Slat } from "./data-display/Slat"` line                              |
| Story fails parity check               | Story title doesn't match group | Title must be `Data Display/Slat`, file at `src/stories/data-display/Slat.stories.tsx` |
| PR opens on wrong base                 | Not on `main` before checkout   | Always start with `git checkout main && git pull --ff-only`                            |

---

## What you achieved

You added a brand-compliant primitive following the exact pattern
used by every existing primitive in the library: per-group folder
placement (cardinal rule 27), token-first CSS, forwarded refs,
ARIA attributes, a paired story (cardinal rule 1 + 29), and a
companion reference doc (cardinal rule 18).

**See also:**

- [How-to: Contribute a primitive](../how-to/contribute-primitive.md) — task-mode summary.
- [02 — Consumer contract §I (extending the framework)](../../new-docs/02-consumer-contract.md).
- [04 — Prop vocabulary](../../new-docs/04-prop-vocabulary.md).
