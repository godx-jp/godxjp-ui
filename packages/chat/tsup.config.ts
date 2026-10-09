import { defineConfig } from "tsup";

/** One ESM entry per source file, so a bundler drops an unused component with its module (gh#1228); every dependency and peer stays external (tsup reads them from package.json). */
export default defineConfig({
  entry: ["src/*.ts", "src/*.tsx"],
  format: ["esm"],
  target: "es2022",
  dts: true,
  sourcemap: false,
  clean: true,
  banner: { js: '"use client";' },
});
