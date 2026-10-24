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
 * It also writes the same CSS cut along the layer manifest (gh#1455) to `dist/styles/precompiled/`:
 * `base.css` (the Tailwind entry: tokens, theme, preflight, every utility the components use), one
 * file per `*-layout.css` layer and one per vendor wrapper, each compiled by the same Tailwind
 * pass. `prune-css --precompiled` emits a stylesheet that imports only the slices an app uses, so
 * a consumer without Tailwind can ship less than the whole sheet. Slices are never cherry-picked by
 * hand — the manifest's dependency graph picks them, as for the Tailwind entry.
 *
 * Runs AFTER tsup + copy-styles (it reads their output). Fonts are not in it: `styles/fonts` is an
 * opt-in sheet that needs the optional `@fontsource/*` peers.
 */
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import { build } from "vite";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
// `--entry` / `--out` / `--slices` exist so the parity tests can compile from `src/` without a
// prior build.
const arg = (name, fallback) => {
  const i = process.argv.indexOf(name);
  return i > -1 ? process.argv[i + 1] : fallback;
};
const entry = arg("--entry", join(root, "dist", "styles", "index.css"));
const outFile = arg("--out", join(root, "dist", "styles.css"));
const slicesDir = arg("--slices", join(dirname(outFile), "styles", "precompiled"));
if (!existsSync(entry)) {
  console.error("build-precompiled-css: dist/styles/index.css is missing — run copy-styles first");
  process.exit(1);
}

/** Compile CSS entries (name → file) with Tailwind into `outDir/<name>.css`. */
async function compile(inputs, outDir) {
  const tmp = join(outDir, ".precompiled");
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
      cssCodeSplit: true,
      rollupOptions: { input: inputs, output: { assetFileNames: "[name].css" } },
    },
  });
  const written = {};
  for (const name of Object.keys(inputs)) {
    const file = readdirSync(tmp).find((f) => f === `${name}.css`);
    if (!file) {
      console.error(`build-precompiled-css: vite emitted no CSS for ${name}`);
      process.exit(1);
    }
    written[name] = join(outDir, `${name}.css`);
    renameSync(join(tmp, file), written[name]);
  }
  rmSync(tmp, { recursive: true, force: true });
  return written;
}

// ── the whole sheet ──────────────────────────────────────────────────────────
mkdirSync(dirname(outFile), { recursive: true });
const { styles } = await compile({ styles: entry }, dirname(outFile));
if (styles !== outFile) renameSync(styles, outFile);
const bytes = readFileSync(outFile).length;
console.log(
  `${outFile.replace(`${root}/`, "")} ${(bytes / 1024).toFixed(1)} KiB (precompiled, no Tailwind needed)`,
);

// ── the slices (gh#1455) ─────────────────────────────────────────────────────
// Each slice is compiled from a one-line entry that @imports its source file, so Tailwind treats
// it as a root and gives it the same optimisation pass (media-query lowering, nesting, @property
// fallbacks) the whole sheet gets. The base entry repeats index.css's layer statement first.
const stylesDir = dirname(entry);
const manifest = JSON.parse(readFileSync(join(stylesDir, "layers.json"), "utf8"));
const sliceFiles = [...manifest.vendor, manifest.base, ...manifest.order];
const entries = {};
try {
  for (const file of sliceFiles) {
    const name = file.replace(/\.css$/, "");
    const tmpEntry = join(stylesDir, `.precompiled-entry-${process.pid}-${name}.css`);
    // A layer file uses no Tailwind feature, and the plugin skips a sheet that uses none; the
    // empty utilities import (no sources, so no rules) marks the slice as a Tailwind root.
    const head =
      file === manifest.base
        ? "@layer theme, base, vendor, components, utilities;\n"
        : '@import "tailwindcss/utilities" source(none);\n';
    writeFileSync(tmpEntry, `${head}@import "./${file}";\n`);
    entries[name] = tmpEntry;
  }
  rmSync(slicesDir, { recursive: true, force: true });
  mkdirSync(slicesDir, { recursive: true });
  await compile(entries, slicesDir);
} finally {
  for (const tmpEntry of Object.values(entries)) rmSync(tmpEntry, { force: true });
}
const sliceBytes = sliceFiles.reduce((n, f) => n + readFileSync(join(slicesDir, f)).length, 0);
console.log(
  `${slicesDir.replace(`${root}/`, "")}/ ${sliceFiles.length} slices, ${(sliceBytes / 1024).toFixed(1)} KiB (prune-css --precompiled)`,
);
