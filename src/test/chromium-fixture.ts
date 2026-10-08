import { TextEncoder as NodeTextEncoder } from "node:util";

import { chromium, type Browser, type Page } from "playwright";

import { compileRealCss } from "../components/data-entry/__tests__/compile-real-css";

/**
 * Real-Chromium fixture for GEOMETRY parity (v32 #1223): bundles `entry` (a TSX module that renders
 * into `#root`, reading its case from `location.search`) with esbuild, compiles the package's REAL
 * stylesheet for every class token in the bundle, and serves both into a blank page.
 *
 * jsdom has no layout, so "the merged component lays out like the one it replaced" can only be
 * measured here — the same harness `overlay-reduced-motion-1213-browser.test.ts` uses inline.
 */
export type ChromiumFixture = {
  open: (search: string, viewport?: { width: number; height: number }) => Promise<Page>;
  close: () => Promise<void>;
};

export async function bootChromium(entry: string): Promise<ChromiumFixture> {
  const ROOT = process.cwd();
  // esbuild's Node API checks `TextEncoder`/`Uint8Array` identity, which jsdom replaces.
  const realm = { encoder: globalThis.TextEncoder, bytes: globalThis.Uint8Array };
  globalThis.TextEncoder = NodeTextEncoder as unknown as typeof TextEncoder;
  globalThis.Uint8Array = Object.getPrototypeOf(Buffer.prototype).constructor;
  let js: string;
  try {
    const { build } = await import("esbuild");
    const out = await build({
      stdin: { contents: entry, loader: "tsx", resolveDir: ROOT, sourcefile: "entry.tsx" },
      bundle: true,
      write: false,
      format: "iife",
      jsx: "automatic",
      define: { "process.env.NODE_ENV": '"production"' },
      logLevel: "silent",
      absWorkingDir: ROOT,
    });
    js = out.outputFiles![0]!.text;
  } finally {
    globalThis.TextEncoder = realm.encoder;
    globalThis.Uint8Array = realm.bytes;
  }
  const tokens = [...new Set(js.match(/[\w:./[\]()%#!=-]+/g) ?? [])].join(" ");
  const css = await compileRealCss(`<div class="${tokens.replaceAll('"', "")}"></div>`);
  const browser: Browser = await chromium.launch({ headless: true });
  return {
    async open(search, viewport = { width: 1280, height: 800 }) {
      const page = await browser.newPage({ viewport });
      await page.goto(`about:blank${search}`);
      await page.setContent(
        `<!doctype html><html lang="en"><head><style>${css}</style></head><body><div id="root"></div><script>${js}</script></body></html>`,
      );
      await page.locator("#root > *").first().waitFor();
      return page;
    },
    close: () => browser.close(),
  };
}

/** Border-box rects of every element matching `selector`, rounded to 0.1px. */
export async function rects(page: Page, selector: string) {
  return page.$$eval(selector, (els) =>
    els.map((el) => {
      const r = el.getBoundingClientRect();
      const round = (n: number) => Math.round(n * 10) / 10;
      return { x: round(r.x), y: round(r.y), w: round(r.width), h: round(r.height) };
    }),
  );
}
