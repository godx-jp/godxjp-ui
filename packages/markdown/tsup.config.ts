import { defineConfig } from "tsup";

/** One ESM entry; every dependency and peer stays external (tsup reads them from package.json). */
export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  target: "es2022",
  dts: true,
  sourcemap: false,
  clean: true,
  banner: { js: '"use client";' },
});
