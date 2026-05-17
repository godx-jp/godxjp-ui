---
title: "How to wire @godxjp/ui in a new service frontend"
diataxis: how-to
library: "@godxjp/ui"
library_version: 3.0.0
last-updated: 2026-05-17
audience: [developer]
lang: en
status: published
---

# How to wire @godxjp/ui in a new service frontend

**When to use:** You are scaffolding a new service frontend and need to integrate `@godxjp/ui` from scratch.

**Prerequisites:** A freshly scaffolded Vite + React 19 + TypeScript service at `services/<svc>-service/frontend/`.

---

## Steps

1. **Run the adoption preflight check:**

   ```bash
   scripts/lint-godxjp-ui-adoption.sh services/<svc>-service
   ```

   If it exits non-zero, fix the issues before continuing.

2. **Install the package:**

   ```bash
   cd services/<svc>-service/frontend
   pnpm add @godxjp/ui
   ```

3. **Wire the toolchain presets.** Replace per-service config boilerplate:

   ```js
   // eslint.config.js
   export { default } from "@godxjp/ui/eslint-config"
   ```

   ```json
   // .prettierrc
   "@godxjp/ui/prettier-config"
   ```

   ```json
   // tsconfig.json
   {
     "extends": "@godxjp/ui/tsconfig",
     "compilerOptions": {
       "paths": { "@/*": ["./src/*"] }
     }
   }
   ```

   ```ts
   // vitest.config.ts
   import base from "@godxjp/ui/vitest-config"
   import { mergeConfig } from "vitest/config"
   export default mergeConfig(base, { test: {} })
   ```

4. **Write `src/main.tsx`:**

   ```tsx
   import "@godxjp/ui/tailwind.css"
   import { initI18n } from "@godxjp/ui/i18n"
   import { StrictMode } from "react"
   import { createRoot } from "react-dom/client"
   import App from "./App.tsx"

   initI18n()

   createRoot(document.getElementById("root")!).render(
     <StrictMode>
       <App />
     </StrictMode>,
   )
   ```

5. **Wire the shell in `src/App.tsx`.** See [How-to: Compose shell](./compose-shell.md) for the full snippet.

6. **Update the adoption tracker** in `packages/godxjp-ui/README.md` (or `libs/ts/godxjp-ui/README.md`):

   | Service | Status | Notes |
   |---|---|---|
   | `<svc>-service/frontend` | adopted | Greenfield; compliant from first commit. |

7. **Verify everything builds:**

   ```bash
   pnpm type-check && pnpm test && pnpm build
   ```

---

## What if it fails?

| Symptom | Cause | Fix |
|---|---|---|
| `pnpm build` fails on missing export | `@godxjp/ui` not in `package.json` | Run step 2 again |
| Design tokens not visible in browser | CSS import missing | Add `import "@godxjp/ui/tailwind.css"` as the first import in `main.tsx` |
| TypeScript errors on Radix types | Peer dep `@types/react` version mismatch | Run `pnpm add -D @types/react@^19` |
| Adoption check fails | `@godxjp/ui` not in `package.json` | Run `pnpm add @godxjp/ui` in the service's `frontend/` directory |

---

## Related

- [Tutorial 01: Getting started](../tutorials/01-getting-started.md)
- [How-to: Compose shell](./compose-shell.md)
- [Explanation: Compatibility](../explanation/compatibility.md)
- CLAUDE.md hard rule #15 — adoption tracker mandatory for every service frontend
