# Testing @godxjp/ui

Every component **must** ship with a Vitest suite before merge.

## Run

```bash
cd packages/ui
pnpm test              # single run
pnpm test:watch        # watch mode
pnpm test:coverage     # v8 coverage report
```

## File location

Co-locate tests next to components:

```
src/components/layout/page-container.tsx
src/components/layout/__tests__/page-container.test.tsx
src/form/use-zod-form.ts
src/form/__tests__/use-zod-form.test.tsx
```

## Required coverage per component

Each `*.test.tsx` must include:

1. **Render** — component mounts without throw
2. **Props** — key prop variations (variants, sizes, density, slots)
3. **Interaction** — userEvent for clicks, typing, keyboard where applicable
4. **A11y** — roles, labels, aria-\* attributes for form controls
5. **Edge cases** — empty, error, loading, disabled states

## Test utilities

```tsx
import { renderWithUi, screen, userEvent } from "@/test/render";
```

`renderWithUi` wraps `MemoryRouter` + `React.StrictMode` + **`RenderLoopGuard`** (fails fast on infinite re-render loops, default max 25 renders).

```tsx
// Optional: disable guard for stress tests
renderWithUi(<HeavyChart />, { loopGuard: false });

// Custom threshold
renderWithUi(<Widget />, { loopGuard: { maxRenders: 40, label: "Widget" } });
```

Shared guard lives in `@godxjp/tooling/test` — apps import the same helper.

Vitest setup (apps):

```ts
// vitest.setup.ts
import "@godxjp/tooling/test/vitest.setup.react";
import "@testing-library/jest-dom/vitest";
```

`testTimeout: 8000` — hung tests fail before blocking CI.

## Render loop prevention (ESLint + test)

| Layer                             | Catches                          |
| --------------------------------- | -------------------------------- |
| `react-hooks/exhaustive-deps`     | missing/unstable effect deps     |
| `react-hooks/set-state-in-effect` | sync setState in effects         |
| `RenderLoopGuard` in tests        | runaway re-renders during Vitest |

Run `pnpm lint` before `pnpm test` — official React Compiler rules align with test guard.

## Forms testing

Form integration tests **must** use Zod 4 schemas:

```tsx
const schema = z.object({ email: z.string().email() });
const form = useZodForm(schema);
```

Never test forms with raw `useState` — mirror production `FormRoot` + `FormFieldControl`.

## CI gate

`pnpm test` in `packages/ui` must pass with zero failures before any UI PR merges.

## When tests fail

Guard suites and fix playbooks:

| Suite                    | File                                                          |
| ------------------------ | ------------------------------------------------------------- |
| Theme token audit        | `src/lib/__tests__/theme-tokens-audit.test.ts`                |
| Theme axes integration   | `src/components/__tests__/theme-axes-integration.test.tsx`    |
| formatDate / AppProvider | `src/lib/__tests__/format-date.test.ts`, `src/app/__tests__/` |

**Full failure routing:** MCP tool `godxjp_ui_guide` topic=`testing-troubleshooting` or `godxjp_ui_verify` with `failureHint` from CI log (see `tools/godxjp-ui-mcp/`).
