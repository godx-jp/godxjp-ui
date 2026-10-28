#!/usr/bin/env node
/** esbuild static import closures; dynamic chunks are deliberately excluded. Bytes are gzip -9. */
import { build } from "esbuild";
import { gzipSync } from "node:zlib";
import { resolve } from "node:path";

for (const entry of process.argv.slice(2).length
  ? process.argv.slice(2)
  : [
      "src/app/app-provider.tsx",
      "packages/markdown/src/index.ts",
      "packages/markdown/src/lazy.tsx",
    ]) {
  const result = await build({
    entryPoints: [entry],
    bundle: true,
    splitting: true,
    format: "esm",
    platform: "browser",
    outdir: "/tmp/godx-startup-measure",
    write: false,
    metafile: true,
    minify: true,
    external: ["react", "react-dom", "react/jsx-runtime", "react-dom/*", "mermaid"],
    loader: { ".css": "empty" },
    define: { "process.env.NODE_ENV": '"production"' },
  });
  const outputs = result.metafile.outputs;
  const first = Object.keys(outputs).find((p) => outputs[p].entryPoint === entry);
  const closure = new Set();
  function visit(path) {
    if (closure.has(path)) return;
    closure.add(path);
    for (const edge of outputs[path].imports) {
      if (!edge.external && edge.kind !== "dynamic-import") visit(edge.path);
    }
  }
  visit(first);
  const files = result.outputFiles.filter((f) => [...closure].some((p) => resolve(p) === f.path));
  const bytes = files.reduce((n, f) => n + f.contents.length, 0);
  const gzip = files.reduce((n, f) => n + gzipSync(f.contents, { level: 9 }).length, 0);
  const inputs = [...new Set([...closure].flatMap((p) => Object.keys(outputs[p].inputs)))];
  console.log(
    JSON.stringify({
      entry,
      bytes,
      gzip,
      chunks: closure.size,
      dayPickerInputs: inputs.filter((p) => p.includes("react-day-picker")).length,
      dateFnsInputs: inputs.filter((p) => /(?:date-fns|@date-fns)/.test(p)).length,
      mathHighlightInputs: inputs.filter((p) =>
        /node_modules\/.*(?:katex|highlight\.js|lowlight)/.test(p),
      ).length,
    }),
  );
}
