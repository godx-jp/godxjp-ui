import { TextEncoder as NodeTextEncoder } from "node:util";
import { describe, expect, it } from "vitest";

/**
 * Bundle cost of `Card` (33.30.1). `Card` used to STATICALLY import `Tabs`, so a card with no
 * `tabList` — and `ErrorSurface`, whose details card loads in every AppShell route through
 * PageErrorBoundary — pulled Tabs, Toggle, react-aria Tabs/ToggleButton and tabs-scroll into
 * the consumer's shared chunk (Platform measured +10.7 kB gzip). The strip is now a lazy chunk.
 *
 * Measured on the real import graph: each entry is bundled with esbuild CODE SPLITTING, and the
 * MAIN output (what loads up front) must not contain the tab modules; they may only appear in a
 * separate, dynamically imported chunk. `splitting: false` would inline the dynamic import and
 * fail this for the wrong reason.
 */
const TAB_MODULES = [
  /navigation\/tabs\.tsx$/,
  /navigation\/tabs-scroll\.ts$/,
  /data-entry\/toggle\.tsx$/,
];

async function mainInputs(entry: string) {
  const realm = { encoder: globalThis.TextEncoder, bytes: globalThis.Uint8Array };
  globalThis.TextEncoder = NodeTextEncoder as unknown as typeof TextEncoder;
  globalThis.Uint8Array = Object.getPrototypeOf(Buffer.prototype).constructor;
  try {
    const { build } = await import("esbuild");
    const out = await build({
      stdin: { contents: entry, loader: "tsx", resolveDir: process.cwd(), sourcefile: "entry.tsx" },
      bundle: true,
      splitting: true,
      format: "esm",
      outdir: "/virtual-out",
      write: false,
      metafile: true,
      jsx: "automatic",
      logLevel: "silent",
      loader: { ".css": "empty" },
      external: ["react", "react-dom", "react/jsx-runtime"],
    });
    const outputs = Object.entries(out.metafile!.outputs);
    const main = outputs.find(([, meta]) => meta.entryPoint?.includes("entry.tsx"));
    expect(main, "main output").toBeDefined();
    const chunks = outputs.filter(([path]) => path !== main![0] && path.endsWith(".js"));
    return {
      main: Object.keys(main![1].inputs),
      lazy: chunks.flatMap(([, meta]) => Object.keys(meta.inputs)),
    };
  } finally {
    globalThis.TextEncoder = realm.encoder;
    globalThis.Uint8Array = realm.bytes;
  }
}

describe("AppShell does not load the error surface up front (33.30.2)", { timeout: 60_000 }, () => {
  it("AppShell's up-front graph holds no card / descriptions / error-surface module", async () => {
    const { main, lazy } = await mainInputs(
      `import { AppShell } from "./src/components/layout/app-shell"; console.log(AppShell);`,
    );
    for (const pattern of [
      /data-display\/card\.tsx$/,
      /data-display\/descriptions\.tsx$/,
      /layout\/error-surface\.tsx$/,
      /card-tab-strip-loader\.ts$/,
    ]) {
      expect(
        main.filter((p) => pattern.test(p)),
        `AppShell main ⊅ ${pattern}`,
      ).toEqual([]);
    }
    // The boundary itself is up front; the surface it draws is a lazy chunk.
    expect(main.some((p) => /layout\/page-error-boundary\.tsx$/.test(p))).toBe(true);
    expect(lazy.some((p) => /layout\/error-surface\.tsx$/.test(p))).toBe(true);
  });
});

describe("Card tab strip is code-split", { timeout: 60_000 }, () => {
  for (const [name, entry] of [
    ["Card", `import { Card } from "./src/components/data-display/card"; console.log(Card);`],
    [
      "ErrorSurface",
      `import { ErrorSurface } from "./src/components/layout/error-surface"; console.log(ErrorSurface);`,
    ],
  ] as const) {
    it(`${name}: the up-front graph holds no Tabs / Toggle / tabs-scroll module`, async () => {
      const { main, lazy } = await mainInputs(entry);
      for (const pattern of TAB_MODULES) {
        expect(
          main.filter((p) => pattern.test(p)),
          `${name} main ⊅ ${pattern}`,
        ).toEqual([]);
      }
      // The strip still ships — as its own lazily imported chunk.
      expect(lazy.some((p) => /navigation\/tabs\.tsx$/.test(p))).toBe(true);
      expect(main.some((p) => /data-display\/card\.tsx$/.test(p))).toBe(true);
    });
  }
});
