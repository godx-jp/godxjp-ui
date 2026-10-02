import { join } from "node:path";
import { TextEncoder as NodeTextEncoder } from "node:util";

import { chromium, type Page } from "playwright";
import { renderToStaticMarkup } from "react-dom/server";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { AppProvider } from "../../../app/app-provider";
import { compileRealCss } from "../../data-entry/__tests__/compile-real-css";
import { Badge } from "../badge";

/**
 * gh#1105 — a Badge whose label is cut (gh#1101) exposed its full text only as a `title` set on
 * pointer hover, so a keyboard user focusing the row link around it, or a touch user, never got it
 * (WCAG 2.1.1 / 1.4.13). It now opens the same tooltip `Text ellipsis={{ tooltip: true }}` uses:
 * on hover of the label and on keyboard focus of the nearest focusable control around the chip —
 * never when the label fits, and never with a caller's own `title`. The chip stays out of the tab
 * order. Layout decides all of this, so the components run in Chromium with the real stylesheet.
 */

const ROOT = process.cwd();
const LONG =
  "チーム経由 · プラットフォーム基盤運用チーム（東日本リージョン・夜間当番ローテーション第二班）";

const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { Badge } from "./src/components/data-display/badge";

const LONG = ${JSON.stringify(LONG)};

createRoot(document.getElementById("root")).render(
  <AppProvider defaultLocale="ja" persist={false}>
    <a id="row" href="#member" style={{ display: "block", width: 200 }}>
      <Badge tone="info">{LONG}</Badge>
    </a>
    <a id="fits" href="#short" style={{ display: "block", width: 600 }}>
      <Badge tone="info">短いラベル</Badge>
    </a>
    <div id="own" style={{ width: 200 }}>
      <Badge tone="info" title="custom">{LONG}</Badge>
    </div>
  </AppProvider>,
);
`;

let css = "";
let js = "";
let browser: Awaited<ReturnType<typeof chromium.launch>>;

beforeAll(async () => {
  css = await compileRealCss(
    renderToStaticMarkup(
      <AppProvider defaultLocale="ja" persist={false}>
        <Badge tone="info">x</Badge>
      </AppProvider>,
    ),
  );
  // esbuild's TextEncoder/Uint8Array check fails under jsdom's realm — see org-chart-geometry-1034.
  const realm = { encoder: globalThis.TextEncoder, bytes: globalThis.Uint8Array };
  globalThis.TextEncoder = NodeTextEncoder as unknown as typeof TextEncoder;
  globalThis.Uint8Array = Object.getPrototypeOf(Buffer.prototype).constructor;
  let out: Awaited<ReturnType<typeof import("esbuild").build>>;
  try {
    const { build } = await import("esbuild");
    out = await build({
      stdin: { contents: ENTRY, loader: "tsx", resolveDir: ROOT, sourcefile: "entry.tsx" },
      bundle: true,
      write: false,
      format: "iife",
      jsx: "automatic",
      define: { "process.env.NODE_ENV": '"production"' },
      logLevel: "silent",
      absWorkingDir: join(ROOT),
    });
  } finally {
    globalThis.TextEncoder = realm.encoder;
    globalThis.Uint8Array = realm.bytes;
  }
  js = out.outputFiles![0]!.text;
  browser = await chromium.launch({ headless: true });
}, 60_000);

afterAll(async () => {
  await browser?.close();
});

async function mount(): Promise<Page> {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.setContent(
    `<!doctype html><html lang="ja"><head><style>${css}</style></head><body><div id="root"></div></body></html>`,
  );
  await page.addScriptTag({ content: js });
  await page.waitForSelector('[data-slot="badge-label"]', { state: "attached" });
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => r(null))));
  return page;
}

const openTooltips = (page: Page) =>
  page.evaluate(() =>
    [...document.querySelectorAll('[data-ellipsis-tooltip][data-state="delayed-open"]')].map(
      (node) => node.textContent,
    ),
  );

async function expectTooltip(page: Page) {
  await page.waitForFunction(
    (text) =>
      [...document.querySelectorAll('[data-ellipsis-tooltip][data-state="delayed-open"]')].some(
        (node) => node.textContent === text,
      ),
    LONG,
    { timeout: 3000 },
  );
}

async function expectNoTooltip(page: Page) {
  await page.waitForTimeout(450);
  expect(await openTooltips(page)).toEqual([]);
}

describe("Badge cut label tooltip (Chromium, gh#1105)", () => {
  it("the long label is actually cut, the short one is not, and no chip is a tab stop", async () => {
    const page = await mount();
    try {
      const m = await page.evaluate(() =>
        ["row", "fits"].map((id) => {
          const label = document.querySelector<HTMLElement>(`#${id} [data-slot="badge-label"]`)!;
          const chip = label.closest<HTMLElement>('[data-slot="badge"]')!;
          return { cut: label.scrollWidth > label.clientWidth, tabIndex: chip.tabIndex };
        }),
      );
      expect(m).toEqual([
        { cut: true, tabIndex: -1 },
        { cut: false, tabIndex: -1 },
      ]);
    } finally {
      await page.close();
    }
  });

  it("opens on keyboard focus of the control around the chip", async () => {
    const page = await mount();
    try {
      await page.keyboard.press("Tab");
      expect(await page.evaluate(() => document.activeElement?.id)).toBe("row");
      await expectTooltip(page);
      // Escape dismisses (WCAG 1.4.13).
      await page.keyboard.press("Escape");
      await expectNoTooltip(page);
    } finally {
      await page.close();
    }
  });

  it("opens on pointer hover of a cut label", async () => {
    const page = await mount();
    try {
      await page.hover('#row [data-slot="badge-label"]');
      await expectTooltip(page);
    } finally {
      await page.close();
    }
  });

  it("stays shut when the label fits, on focus and on hover", async () => {
    const page = await mount();
    try {
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");
      expect(await page.evaluate(() => document.activeElement?.id)).toBe("fits");
      await expectNoTooltip(page);
      await page.hover('#fits [data-slot="badge-label"]');
      await expectNoTooltip(page);
    } finally {
      await page.close();
    }
  });

  it("leaves a caller's own title alone", async () => {
    const page = await mount();
    try {
      await page.hover('#own [data-slot="badge-label"]');
      await expectNoTooltip(page);
      expect(await page.getAttribute('#own [data-slot="badge"]', "title")).toBe("custom");
    } finally {
      await page.close();
    }
  });
});
