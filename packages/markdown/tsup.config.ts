import { defineConfig } from "tsup";

/**
 * Three ESM entries; every dependency and peer stays external (tsup reads them from package.json).
 * The renderer is a client component, in two entries that share chunks: `index` (KaTeX and the
 * code tokeniser bundled in, deterministic) and `lazy` (both behind `import()`, each its own chunk;
 * the KaTeX chunk imports `../katex.css`, kept external so the HOST's bundler loads the stylesheet
 * with it). `codec` is NOT a client component: it is pure (no React, no DOM) so it runs on a server
 * or in a Worker, and it carries no "use client" banner (gh#1156).
 */
export default defineConfig([
  {
    entry: ["src/index.ts", "src/lazy.tsx"],
    format: ["esm"],
    target: "es2022",
    // ALL THREE declaration files come from THIS config's one DTS pass, codec's included. The two
    // configs build in parallel, and this one's DTS pass (two entries, the slower) starts by
    // removing the `.d.ts` already in `dist/`; with its own `dts: true` the codec config had
    // written `codec/index.d.ts` first, so 33.22.1 shipped `./codec` without types (TS7016).
    dts: {
      entry: { index: "src/index.ts", lazy: "src/lazy.tsx", "codec/index": "src/codec/index.ts" },
    },
    sourcemap: false,
    clean: true,
    splitting: true,
    external: ["../katex.css"],
    banner: { js: '"use client";' },
  },
  {
    entry: { "codec/index": "src/codec/index.ts" },
    format: ["esm"],
    target: "es2022",
    dts: false, // emitted by the config above — see there.
    sourcemap: false,
    clean: false,
  },
]);
