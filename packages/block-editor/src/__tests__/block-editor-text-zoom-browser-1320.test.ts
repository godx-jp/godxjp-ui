import { join } from "node:path";
import { TextEncoder as NodeTextEncoder } from "node:util";

import { chromium, type Browser } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { compileRealCss } from "../../../../src/components/data-entry/__tests__/compile-real-css";
// @ts-expect-error — plain .mjs script, no declaration file
import { injectTextZoom } from "../../../../scripts/visual-audit.mjs";

/**
 * gh#1320 — the editor's headings under `visual-audit --text-zoom 200`. The tool tags every element
 * with its computed size and appends `[data-visual-audit-fz="k"] { font-size: 2k px !important }`.
 * Inside the editor ProseMirror strips that foreign attribute from the blocks it owns, so blocks
 * grow only by INHERITING the editor root's doubled size: paragraphs went 14 → 28px while the h2,
 * sized by a fixed length, stayed 17.6px — smaller than its own body text. Headings must scale with
 * the text they head.
 */
const ROOT = process.cwd();
const ALIAS = {
  "@godxjp/markdown/codec": join(ROOT, "packages/markdown/src/codec/index.ts"),
  "@godxjp/markdown": join(ROOT, "packages/markdown/src/index.ts"),
  "@godxjp/ui/i18n": join(ROOT, "src/i18n/index.ts"),
  "@godxjp/ui/data-display": join(ROOT, "src/components/data-display/index.ts"),
  "@godxjp/ui/data-entry": join(ROOT, "src/components/data-entry/index.ts"),
  "@godxjp/ui/general": join(ROOT, "src/components/general/index.ts"),
  "@godxjp/ui/navigation": join(ROOT, "src/components/navigation/index.ts"),
  "@godxjp/ui/layout": join(ROOT, "src/components/layout/index.ts"),
};

const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { BlockEditor } from "./packages/block-editor/src";

function App() {
  return (
    <AppProvider defaultLocale="en" persist={false}>
      <div style={{ padding: 16, maxWidth: 720 }}>
        <BlockEditor aria-label="Body" defaultValue={"# Handbook\\n\\n## Onboarding\\n\\nBody text.\\n\\n### Accounts\\n\\nMore text.\\n\\n#### Notes\\n\\nLast."} />
      </div>
    </AppProvider>
  );
}
createRoot(document.getElementById("root")).render(<App />);
`;

let css = "";
let js = "";
let browser: Browser;

beforeAll(async () => {
  const realm = { encoder: globalThis.TextEncoder, bytes: globalThis.Uint8Array };
  globalThis.TextEncoder = NodeTextEncoder as unknown as typeof TextEncoder;
  globalThis.Uint8Array = Object.getPrototypeOf(Buffer.prototype).constructor;
  try {
    const { build } = await import("esbuild");
    const out = await build({
      stdin: { contents: ENTRY, loader: "tsx", resolveDir: ROOT, sourcefile: "entry.tsx" },
      bundle: true,
      write: false,
      format: "iife",
      jsx: "automatic",
      alias: ALIAS,
      define: { "process.env.NODE_ENV": '"production"' },
      logLevel: "silent",
      absWorkingDir: ROOT,
    });
    js = out.outputFiles![0]!.text;
  } finally {
    globalThis.TextEncoder = realm.encoder;
    globalThis.Uint8Array = realm.bytes;
  }
  const tokens = [...new Set(js.match(/[\w:./[\]()%#!-]+/g) ?? [])].join(" ");
  css = await compileRealCss(`<div class="${tokens.replaceAll('"', "")}"></div>`);
  browser = await chromium.launch({ headless: true });
}, 180_000);

afterAll(async () => {
  await browser?.close();
});

describe(
  "BlockEditor headings under enlarged text (Chromium, gh#1320)",
  { timeout: 40_000 },
  () => {
    it("every heading level grows by the same factor as the body text", async () => {
      const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
      await page.setContent(
        `<!doctype html><html lang="en"><head><style>${css}</style></head><body><div id="root"></div><script>${js}</script></body></html>`,
      );
      await page.waitForSelector(".ui-block-editor-content h2");
      const sizes = () =>
        page.evaluate(() => {
          const fz = (sel: string) =>
            parseFloat(getComputedStyle(document.querySelector(`.ProseMirror > ${sel}`)!).fontSize);
          return { p: fz("p"), h1: fz("h1"), h2: fz("h2"), h3: fz("h3"), h4: fz("h4") };
        });
      const before = await sizes();
      // The default scale is unchanged: each level at or above body size, stepping down.
      expect(before.h1).toBeGreaterThan(before.h2);
      expect(before.h2).toBeGreaterThan(before.h3);
      expect(before.h3).toBeGreaterThan(before.p);
      expect(before.h4).toBe(before.p);

      await page.evaluate(injectTextZoom, 200);
      await page.evaluate(
        () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
      );
      const after = await sizes();
      const body = after.p / before.p;
      expect(body).toBeCloseTo(2, 1);
      for (const level of ["h1", "h2", "h3", "h4"] as const)
        expect(
          after[level] / before[level],
          `${level} ${before[level]} → ${after[level]}`,
        ).toBeCloseTo(body, 1);
      expect(after.h2).toBeGreaterThan(after.p);
      await page.close();
    });
  },
);
