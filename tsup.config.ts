import { existsSync } from "node:fs";
import { join } from "node:path";

import { defineConfig } from "tsup";

import pkg from "./package.json";

type ExportTarget = string | { types?: string; import?: string };

/**
 * Entry points are derived from the public `exports` map so the build stays in
 * sync with what consumers can import. Each non-CSS export points at a built
 * `dist/*.js`; we reverse that to the matching `src/*.{ts,tsx}` source entry.
 * `.css` targets are copied verbatim by scripts/copy-styles.mjs.
 *
 * @returns {string[]} unique source entry paths relative to the package root
 */
function entriesFromExports(): string[] {
  const exports = pkg.exports as Record<string, ExportTarget>;
  const seen = new Set<string>();

  for (const target of Object.values(exports)) {
    const dist = typeof target === "string" ? target : target.import;
    if (!dist || !dist.endsWith(".js")) {
      continue;
    }
    const base = dist
      .replace(/^\.\//, "")
      .replace(/^dist\//, "src/")
      .replace(/\.js$/, "");
    for (const ext of [".tsx", ".ts"]) {
      if (existsSync(join(import.meta.dirname, base + ext))) {
        seen.add(base + ext);
        break;
      }
    }
  }

  return [...seen];
}

export default defineConfig({
  entry: entriesFromExports(),
  outDir: "dist",
  format: ["esm"],
  target: "es2022",
  dts: true,
  splitting: true,
  treeshake: true,
  sourcemap: false,
  clean: true,
  // deps + peerDeps are externalized automatically by tsup; bundle nothing else.
  external: [/^node:/],
});
