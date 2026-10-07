import { TextEncoder as NodeTextEncoder } from "node:util";

import { chromium, type Browser, type Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { compileRealCss } from "./compile-real-css";

/**
 * SortableList (gh#1173) in Chromium: a real pointer drag on the grip, the keyboard path where
 * moving the focused node really blurs it (jsdom never does), and the grip's touch-action.
 */
const ROOT = process.cwd();
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { SortableList } from "./src/components/data-entry";
const items = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Beta" },
  { value: "c", label: "Gamma" },
];
window.__value = null;
const layout = new URLSearchParams(location.search).get("layout") || "list";
createRoot(document.getElementById("root")).render(
  <AppProvider defaultLocale="en" persist={false}>
    <div style={{ padding: 16, width: layout === "grid" ? 720 : 320 }}>
      <SortableList aria-label="Widgets" layout={layout} items={items} onValueChange={(v) => { window.__value = v; }} />
    </div>
  </AppProvider>,
);
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

async function open(layout = "list") {
  const page = await browser.newPage({ viewport: { width: 900, height: 700 } });
  await page.goto(`about:blank?layout=${layout}`);
  await page.setContent(
    `<!doctype html><html lang="en"><head><style>${css}</style></head><body><div id="root"></div><script>${js}</script></body></html>`,
  );
  await page.waitForSelector(".ui-sortable-list-handle");
  return page;
}

const order = (page: Page) =>
  page.$$eval(".ui-sortable-list-content", (nodes) => nodes.map((n) => n.textContent));
const value = (page: Page) =>
  page.evaluate(() => (window as unknown as { __value: string[] | null }).__value);

async function drag(page: Page, from: string, to: string) {
  const grip = page.getByRole("button", { name: `Reorder ${from}` });
  const source = (await grip.boundingBox())!;
  const target = (await page.locator(".ui-sortable-list-item", { hasText: to }).boundingBox())!;
  await page.mouse.move(source.x + source.width / 2, source.y + source.height / 2);
  await page.mouse.down();
  const steps = 12;
  for (let i = 1; i <= steps; i++) {
    await page.mouse.move(
      source.x +
        source.width / 2 +
        ((target.x + target.width / 2 - source.x - source.width / 2) * i) / steps,
      source.y +
        source.height / 2 +
        ((target.y + target.height / 2 - source.y - source.height / 2) * i) / steps,
    );
  }
  await page.mouse.up();
}

describe("SortableList (Chromium, gh#1173)", { timeout: 40_000 }, () => {
  it("drags a grip onto the last row: the order and onValueChange follow, once", async () => {
    const page = await open();
    await drag(page, "Alpha", "Gamma");
    expect(await order(page)).toEqual(["Beta", "Gamma", "Alpha"]);
    expect(await value(page)).toEqual(["b", "c", "a"]);
    await page.close();
  });

  it("drags in a grid of tiles too", async () => {
    const page = await open("grid");
    const columns = await page.$eval(
      ".ui-sortable-list-items",
      (el) => getComputedStyle(el).gridTemplateColumns.split(" ").length,
    );
    expect(columns).toBeGreaterThan(1);
    await drag(page, "Gamma", "Alpha");
    expect(await order(page)).toEqual(["Gamma", "Alpha", "Beta"]);
    expect(await value(page)).toEqual(["c", "a", "b"]);
    await page.close();
  });

  it("a click without travel is not a drag", async () => {
    const page = await open();
    await page.getByRole("button", { name: "Reorder Alpha" }).click();
    expect(await order(page)).toEqual(["Alpha", "Beta", "Gamma"]);
    expect(await value(page)).toBeNull();
    await page.close();
  });

  it("keyboard: the held grip survives being moved (real blur on DOM move) and drops", async () => {
    const page = await open();
    const grip = page.getByRole("button", { name: "Reorder Alpha" });
    await grip.focus();
    await page.keyboard.press("Space");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    expect(await order(page)).toEqual(["Beta", "Gamma", "Alpha"]);
    expect(await grip.getAttribute("aria-pressed")).toBe("true");
    expect(await grip.evaluate((el) => el === document.activeElement)).toBe(true);
    await page.keyboard.press("Space");
    expect(await value(page)).toEqual(["b", "c", "a"]);
    await page.close();
  });

  it("the grip takes the pointer whole (touch-action: none); the item does not", async () => {
    const page = await open();
    const m = await page.evaluate(() => ({
      grip: getComputedStyle(document.querySelector(".ui-sortable-list-handle")!).touchAction,
      item: getComputedStyle(document.querySelector(".ui-sortable-list-item")!).touchAction,
    }));
    expect(m.grip).toBe("none");
    expect(m.item).toBe("auto");
    await page.close();
  });
});
