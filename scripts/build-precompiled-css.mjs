#!/usr/bin/env node
/**
 * dist/styles.css — the PRECOMPILED stylesheet (v32 #1221).
 *
 * `dist/styles/index.css` starts with `@import "tailwindcss"`, so every consumer needs the Tailwind
 * v4 compiler. This script runs that compiler HERE, once, over the package's own build output
 * (`dist/styles/index.css` → its `@source "../**\/*.{tsx,ts,js}"` scans `dist/**`, the exact code a
 * consumer runs) and writes plain CSS to `dist/styles.css`. A consumer imports
 * `@godxjp/ui/styles.css` with NO Tailwind installed.
 *
 * Runs AFTER tsup + copy-styles (it reads their output). Fonts are not in it: `styles/fonts` is an
 * opt-in sheet that needs the optional `@fontsource/*` peers.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import { build } from "vite";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
// `--entry` / `--out` exist so the parity test can compile from `src/` without a prior build.
const arg = (name, fallback) => {
  const i = process.argv.indexOf(name);
  return i > -1 ? process.argv[i + 1] : fallback;
};
const entry = arg("--entry", join(root, "dist", "styles", "index.css"));
const outFile = arg("--out", join(root, "dist", "styles.css"));
if (!existsSync(entry)) {
  console.error("build-precompiled-css: dist/styles/index.css is missing — run copy-styles first");
  process.exit(1);
}

const tmp = join(dirname(outFile), ".precompiled");
rmSync(tmp, { recursive: true, force: true });
mkdirSync(tmp, { recursive: true });

await build({
  root,
  configFile: false,
  logLevel: "warn",
  plugins: [tailwindcss()],
  build: {
    outDir: tmp,
    emptyOutDir: true,
    cssMinify: "lightningcss",
    rollupOptions: { input: entry, output: { assetFileNames: "styles.css" } },
  },
});

const css = readdirSync(tmp).find((f) => f.endsWith(".css"));
if (!css) {
  console.error("build-precompiled-css: vite emitted no CSS");
  process.exit(1);
}
renameSync(join(tmp, css), outFile);
rmSync(tmp, { recursive: true, force: true });

const bytes = readFileSync(outFile).length;
console.log(
  `${outFile.replace(`${root}/`, "")} ${(bytes / 1024).toFixed(1)} KiB (precompiled, no Tailwind needed)`,
);
