---
diataxis: explanation
library: "@godxjp/ui"
library_version: 3.0.0
updated: 2026-05-16
audience: [developer]
---

# Compatibility

This document describes the browser, runtime, and framework versions that
`@godxjp/ui` v3.0.0 supports. Constraints exist because the library uses
modern CSS features (OKLCH, `@layer`, `@property`, cascade layers) and modern
JavaScript (ES2022 class fields, `structuredClone`, `queueMicrotask`).

---

## React

| Version | Status |
|---|---|
| React 19.x | Supported — minimum required |
| React 18.x | Not supported |

`@godxjp/ui` uses React 19 APIs including:

- `use(Context)` pattern inside some hooks
- `ref` as a prop (React 19 drops `forwardRef` requirement for function
  components in many cases; the library still uses `forwardRef` explicitly
  for public API clarity)

Peer dependency declared in `package.json`:

```json
"peerDependencies": {
  "react": ">=19.0.0",
  "react-dom": ">=19.0.0"
}
```

---

## TypeScript

| Version | Status |
|---|---|
| TypeScript 6.x | Supported — minimum required |
| TypeScript 5.x | Not supported (uses TypeScript 6 module resolution semantics) |

All exports carry explicit types. `strict: true` is assumed; the provided
`@godxjp/ui/tsconfig` preset enables the full strict flag set.

---

## Build tooling

| Tool | Status |
|---|---|
| Vite 8+ | Supported — reference implementation |
| webpack 5+ | Supported |
| Next.js 15+ | Supported (App Router) |
| esbuild standalone | Supported for library builds |
| Rollup 4+ | Supported |
| Parcel 2+ | Not tested — community-reported |

The library ships pre-built ESM in the `dist/` directory. Consumers do not
need to transpile `@godxjp/ui` source. Build tooling requirements apply to
the consuming service's build process, not to `@godxjp/ui` internals.

---

## Tailwind CSS

| Version | Status |
|---|---|
| Tailwind v4 | Supported — required |
| Tailwind v3 | Not supported |

`@godxjp/ui/tailwind.css` uses Tailwind v4's `@import "tailwindcss"` entry
and `@layer` cascade layers. Tailwind v3's `tailwind.config.js` schema is not
accepted. Services must import `@godxjp/ui/tailwind.css` as the first
stylesheet.

---

## Browsers

`@godxjp/ui` targets [Baseline 2024](https://web.dev/baseline/) —
specifically, features that are Widely Available as of 2024, meaning they have
been supported in the last two stable versions of all four major browser
engines:

| Engine | Browsers | Minimum version |
|---|---|---|
| Blink | Chrome, Edge | Last 2 stable releases |
| WebKit | Safari | Last 2 stable releases |
| Gecko | Firefox | Last 2 stable releases |

### CSS features used

| Feature | Baseline status |
|---|---|
| `oklch()` color function | Widely Available 2023 |
| CSS `@layer` cascade layers | Widely Available 2022 |
| CSS `@property` (typed custom properties) | Widely Available 2024 |
| `:focus-visible` | Widely Available 2022 |
| `prefers-reduced-motion` | Widely Available 2020 |
| CSS custom properties | Widely Available 2017 |
| `display: grid` with subgrid | Widely Available 2023 |
| `container` queries | Widely Available 2023 |

### Not supported

- Internet Explorer: any version.
- Legacy Edge (EdgeHTML engine): any version.
- Chrome 102 and below (OKLCH not supported).
- Safari 15.3 and below (OKLCH not supported).

---

## Node.js (build-time only)

Node.js is required for build tooling (Vite, TypeScript, pnpm). It is not a
runtime dependency of the browser bundle.

| Version | Status |
|---|---|
| Node 22 LTS | Supported — minimum required |
| Node 20 LTS | Not tested in CI — may work |
| Node 18 LTS | Not supported |

---

## Package manager

`pnpm` is the canonical package manager for the monorepo. `npm` and `yarn`
are accepted in consuming service repositories. Lockfile format for the
submodule itself is `pnpm-lock.yaml`.

---

## Environment: server-side rendering

`@godxjp/ui` components are designed for client-side React. Server-side
rendering (SSR) compatibility:

- `useTweaks` is SSR-safe: `loadInitial()` returns defaults when
  `typeof window === "undefined"`.
- CSS custom properties are inert on the server; the client hydration pass
  applies theme/density/tenant attributes.
- Radix portals (`Dialog`, `Sheet`, `AlertDialog`, `Select`, `DropdownMenu`,
  `Popover`, `Combobox`) render into `document.body`; in SSR they produce no
  DOM output and hydrate correctly on the client.
- Full SSR testing (Next.js App Router) is not part of the CI matrix in
  v3.0.0. SSR support is best-effort; issues are accepted and prioritized.

---

## See also

- [Explanation: Versioning](./versioning.md) — SemVer policy and breaking-change
  criteria.
- [How-to: Migrate from v2](../how-to/migrate-from-v2.md) — peer version
  requirements changed in v3.
- [Reference: Exports](../reference/exports.md) — ESM entry points and
  `package.json` exports map.
