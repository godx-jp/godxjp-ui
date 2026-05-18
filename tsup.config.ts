import { defineConfig } from "tsup"
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, resolve } from "node:path"

// Build config for the published `@godxjp/ui` npm artefact.
// Per cardinal rule 26 (library isolation) every npm `dependencies`
// entry is `external` — consumers install them via their own package
// manager, we don't double-bundle. Only React + Tailwind sit in
// `peerDependencies` (consumer-required, never bundled).
//
// What ships in `dist/`:
//   • Sub-path entries (one per `package.json::exports` key) — ESM
//     + .d.ts + sourcemaps.
//   • NO story files (`src/stories/**` excluded — not an entry,
//     `package.json::files` excludes the `src/stories/` tree).
//   • NO Storybook config (`.storybook/**` excluded).
//   • NO dev-only tooling (`scripts/**`, `__tests__/**`, `*.test.*`
//     excluded — same — not an entry).

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const pkg = JSON.parse(
  readFileSync(resolve(__dirname, "package.json"), "utf-8"),
) as {
  dependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
}

// Externalise EVERY runtime dep so consumer's bundler resolves them
// once, deduped, not double-bundled into our dist. Per cardinal rule
// 26 anything declared in `dependencies` MUST be external.
const externalDeps = [
  ...Object.keys(pkg.dependencies ?? {}),
  ...Object.keys(pkg.peerDependencies ?? {}),
]

// Plus regex matchers for sub-path imports (e.g. `react/jsx-runtime`,
// `react-dom/client`, `@radix-ui/react-dialog/style.css`).
const externalRegex = [
  /^react\//,
  /^react-dom\//,
  /^@radix-ui\//,
  /^@internationalized\//,
]

export default defineConfig({
  entry: {
    index: "src/index.ts",
    // Sub-path entries kept identical to the `exports` map in
    // package.json so consumers can do `@godxjp/ui/i18n` etc.
    i18n: "src/i18n/index.ts",
    hooks: "src/hooks/index.ts",
    props: "src/props/index.ts",
    "components/primitives": "src/components/primitives.ts",
    "components/shell": "src/components/shell/index.ts",
    "components/composites": "src/components/composites/index.ts",
    preferences: "src/preferences/index.ts",
  },
  format: ["esm"],
  dts: true,
  sourcemap: true,
  splitting: false,
  clean: true,
  treeshake: true,
  external: [...externalDeps, ...externalRegex],
  outDir: "dist",
  target: "es2022",
  // NOTE on "use client": tsup runs `rollup-plugin-dts` to bundle
  // `.d.ts`, and that plugin re-parses the JS source as a Rollup
  // module graph during which it warns about top-level directives.
  // Setting either `banner: { js: '"use client"' }` OR
  // `esbuildOptions(o) { o.banner = …}` causes a noisy
  // "Module level directives cause errors when bundled, 'use client'
  // in 'dist/X.js' was ignored" warning per entry. We DON'T inject the
  // directive into our published dist; Next.js App Router consumers
  // mark their own boundary at `app/` or via a per-component wrapper.
  // This is the same posture as MUI / Radix / shadcn — they ship
  // components without a baked-in `"use client"` directive.
})
