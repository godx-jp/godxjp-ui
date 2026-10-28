import { TextEncoder as NodeTextEncoder } from "node:util";
import { describe, expect, it } from "vitest";

async function staticInputs(entry: string) {
  const realm = { encoder: globalThis.TextEncoder, bytes: globalThis.Uint8Array };
  globalThis.TextEncoder = NodeTextEncoder as unknown as typeof TextEncoder;
  globalThis.Uint8Array = Object.getPrototypeOf(Buffer.prototype).constructor;
  try {
    const { build } = await import("esbuild");
    const result = await build({
      entryPoints: [entry],
      bundle: true,
      splitting: true,
      format: "esm",
      platform: "browser",
      outdir: "/tmp/markdown-import-closure",
      write: false,
      metafile: true,
      external: ["react", "react/jsx-runtime", "mermaid"],
      loader: { ".css": "empty" },
    });
    const outputs = result.metafile!.outputs;
    const first = Object.keys(outputs).find((path) => outputs[path].entryPoint === entry)!;
    const seen = new Set<string>();
    const inputs = new Set<string>();
    function visit(path: string) {
      if (seen.has(path)) return;
      seen.add(path);
      Object.keys(outputs[path].inputs).forEach((input) => inputs.add(input));
      for (const edge of outputs[path].imports) {
        if (!edge.external && edge.kind !== "dynamic-import") visit(edge.path);
      }
    }
    visit(first);
    return [...inputs];
  } finally {
    globalThis.TextEncoder = realm.encoder;
    globalThis.Uint8Array = realm.bytes;
  }
}

const heavy = (path: string) => /node_modules\/.*(?:katex|highlight\.js|lowlight)/.test(path);

describe("#1464 — existing opt-in lazy entry", () => {
  it("excludes the engines from its static closure while the synchronous entry retains them", async () => {
    const eager = await staticInputs("packages/markdown/src/index.ts");
    const lazy = await staticInputs("packages/markdown/src/lazy.tsx");
    expect(eager.filter(heavy).length).toBeGreaterThan(20);
    expect(lazy.filter(heavy)).toEqual([]);
    expect(lazy.some((path) => path.endsWith("core.tsx"))).toBe(true);
  });
});
