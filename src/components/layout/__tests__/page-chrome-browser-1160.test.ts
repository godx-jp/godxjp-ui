import { TextEncoder as NodeTextEncoder } from "node:util";

import { chromium, type Browser } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { compileRealCss } from "../../data-entry/__tests__/compile-real-css";

/**
 * gh#1160 in Chromium: the display title's size at phone and desktop width, a banner cover
 * spanning the page, the icon riding over the cover's edge, the cover actions kept off the image on
 * a phone, and a real pointer drag moving the focal point.
 */
const ROOT = process.cwd();
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { PageContainer } from "./src/components/layout";
import { PageCover } from "./src/lab";
import { Button } from "./src/components/general";

const COVER = "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1600"><rect width="1600" height="1600" fill="#789"/></svg>');

function App() {
  const [y, setY] = React.useState(50);
  window.__y = y;
  return (
    <AppProvider defaultLocale="ja" persist={false}>
      <PageContainer
        title="長い記事のタイトルがここに入ります、折り返しても読みやすいように"
        headerScale="display"
        icon={<span aria-hidden="true">🚀</span>}
        cover={<PageCover src={COVER} alt="" positionY={y} onPositionChange={setY} repositioning actions={<Button size="sm">変更</Button>} />}
      >
        <p>本文</p>
      </PageContainer>
      <div id="document"><PageContainer title="Document title">x</PageContainer></div>
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

async function open(width: number) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  await page.setContent(
    `<!doctype html><html lang="ja"><head><style>${css} body{margin:0}</style></head><body><div id="root"></div><script>${js}</script></body></html>`,
  );
  await page.waitForSelector(".ui-page-cover-image");
  await page.waitForFunction(
    () => (document.querySelector(".ui-page-cover-image") as HTMLImageElement).complete,
  );
  return page;
}

const measure = (page: Awaited<ReturnType<typeof open>>) =>
  page.evaluate(() => {
    const r = (sel: string) => document.querySelector(sel)!.getBoundingClientRect();
    const title = document.querySelector(
      ".ui-page-container[data-header-scale='display'] .ui-page-title",
    )!;
    const doc = document.querySelector("#document .ui-page-title")!;
    return {
      display: parseFloat(getComputedStyle(title).fontSize),
      lineHeight:
        parseFloat(getComputedStyle(title).lineHeight) /
        parseFloat(getComputedStyle(title).fontSize),
      wrap:
        getComputedStyle(title).textWrap || getComputedStyle(title).getPropertyValue("text-wrap"),
      documentTitle: parseFloat(getComputedStyle(doc).fontSize),
      cover: r(".ui-page-cover-frame"),
      container: r(".ui-page-container"),
      icon: r(".ui-page-header-icon"),
      actions: r(".ui-page-cover-actions"),
      overflow: document.documentElement.scrollWidth > window.innerWidth,
    };
  });

describe("page chrome (Chromium, gh#1160)", () => {
  it("draws a display title, a full-bleed banner and an icon over its edge on a wide screen", async () => {
    const page = await open(1280);
    const m = await measure(page);
    expect(m.display).toBeGreaterThan(m.documentTitle * 1.6);
    expect(m.lineHeight).toBeCloseTo(1.4, 1);
    expect(m.wrap).toContain("balance");
    expect(Math.round(m.cover.width)).toBe(Math.round(m.container.width));
    expect(m.cover.top).toBe(m.container.top);
    expect(m.icon.top).toBeLessThan(m.cover.bottom); // rides over the cover's bottom edge
    expect(m.icon.bottom).toBeGreaterThan(m.cover.bottom);
    expect(m.actions.bottom).toBeLessThanOrEqual(m.cover.bottom); // on the cover
    await page.close();
  });

  it("keeps the display title big on a phone and moves the actions off the image", async () => {
    const page = await open(390);
    const m = await measure(page);
    expect(m.display).toBeGreaterThan(m.documentTitle * 1.2);
    expect(m.actions.top).toBeGreaterThanOrEqual(m.cover.bottom - 0.5); // below, not on the focal area
    expect(m.overflow).toBe(false);
    await page.close();
  });

  it("follows a pointer drag: dragging the picture down reveals its top (smaller y)", async () => {
    const page = await open(1280);
    const frame = (await page.locator(".ui-page-cover-frame").boundingBox())!;
    const x = frame.x + frame.width / 2;
    const y = frame.y + frame.height / 2;
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x, y + 100, { steps: 5 });
    await page.mouse.up();
    const after = await page.evaluate(() => (window as unknown as { __y: number }).__y);
    expect(after).toBeLessThan(50);
    expect(
      await page
        .locator("img.ui-page-cover-image")
        .evaluate((img) => (img as HTMLElement).style.objectPosition),
    ).toBe(`50% ${after}%`);
    await page.close();
  });
});
