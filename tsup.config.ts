import { defineConfig } from "tsup";

/**
 * PRESERVED MODULE STRUCTURE (no bundling, no shared chunks).
 *
 * The previous bundled+split build merged unrelated module graphs into
 * shared chunks, so importing even `Button` dragged a ~100KB minified
 * floor (date-fns + tailwind-merge + a mixed chunk) into every consumer
 * — `sideEffects: false` cannot prune inside a pre-merged chunk. Emitting
 * one file per source module gives consumers' bundlers the REAL import
 * graph, so per-component imports tree-shake perfectly and the public
 * `exports` map keeps working unchanged (dist mirrors src).
 *
 * Declarations are emitted separately by `tsc -p tsconfig.build.json`
 * (structure-preserving and much faster than per-entry dts bundling);
 * CSS trees and the i18n message JSONs are copied by
 * scripts/copy-styles.mjs. Output is bundler-oriented ESM (extensionless
 * relative imports + JSON imports), matching the vite-based consumers.
 */
export default defineConfig({
  entry: [
    "src/**/*.ts",
    "src/**/*.tsx",
    "!src/**/__tests__/**",
    "!src/**/__fixtures__/**",
    "!src/**/*.test.*",
    "!src/test/**",
  ],
  outDir: "dist",
  format: ["esm"],
  target: "es2022",
  bundle: false,
  dts: false,
  sourcemap: false,
  clean: true,
});
