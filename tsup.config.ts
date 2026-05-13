import { defineConfig } from "tsup"

// Build config for the published `@godxjp/ui` npm artefact.
// Mirrors the TempoFast 0.2.0 layout so dependents see the same shape
// after the v2 dep bump (esm-only, types co-located, CSS shipped raw).
export default defineConfig({
  entry: {
    index: "src/index.ts",
    // Sub-path entries kept identical to the `exports` map in
    // package.json so consumers can do `@godxjp/ui/i18n` etc.
    i18n: "src/i18n/index.ts",
    hooks: "src/hooks/index.ts",
    data: "src/data/index.ts",
    "components/primitives": "src/components/primitives/index.ts",
    "components/shell": "src/components/shell/index.ts",
    "components/screens": "src/components/screens/index.ts",
  },
  format: ["esm"],
  dts: true,
  sourcemap: true,
  splitting: false,
  clean: true,
  treeshake: true,
  // React is a peer; everything else lives at runtime in the
  // consuming app. Don't bundle CSS — it's served raw from
  // `src/tokens/tokens.css` via the `./tokens` export.
  external: ["react", "react-dom", /^react\//],
  outDir: "dist",
  target: "es2022",
  banner: { js: '"use client";' },
})
