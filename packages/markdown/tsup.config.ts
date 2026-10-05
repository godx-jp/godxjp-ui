import { defineConfig } from "tsup";

/**
 * Two ESM entries; every dependency and peer stays external (tsup reads them from package.json).
 * The renderer is a client component. `codec` is NOT: it is pure (no React, no DOM) so it runs on
 * a server or in a Worker, and it carries no "use client" banner (gh#1156).
 */
export default defineConfig([
  {
    entry: ["src/index.ts"],
    format: ["esm"],
    target: "es2022",
    dts: true,
    sourcemap: false,
    clean: true,
    banner: { js: '"use client";' },
  },
  {
    entry: { "codec/index": "src/codec/index.ts" },
    format: ["esm"],
    target: "es2022",
    dts: true,
    sourcemap: false,
    clean: false,
  },
]);
