import { TextEncoder as NodeTextEncoder } from "node:util";

import { chromium, type Browser, type Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { compileRealCss } from "../../components/data-entry/__tests__/compile-real-css";

/**
 * DashboardGrid (#1397) in Chromium: a real pointer drag on the grip, the keyboard path where
 * moving the focused node really blurs it (jsdom never does), and the grip's touch-action.
 */
const ROOT = process.cwd();
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { DashboardGrid } from "./src/lab";
const items=[{id:"a",label:"Revenue",content:"Revenue"},{id:"b",label:"Orders",content:"Orders"}];
const initial=[{id:"a",x:0,y:0,w:1,h:2},{id:"b",x:1,y:0,w:1,h:2}];
window.__saves=[];
const root=createRoot(document.getElementById("root"));
window.__setEditing=(editable)=>root.render(<AppProvider defaultLocale="en" persist={false}><div dir={new URLSearchParams(location.search).get("dir") || "ltr"} style={{width:600,padding:16}}><DashboardGrid items={items} defaultLayout={initial} columns={new URLSearchParams(location.search).has("responsive") ? {base:1,lg:3} : 3} rowHeight={80} editable={editable} onLayoutChange={v=>window.__saves.push(v)}/></div></AppProvider>);
window.__setEditing(true);
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

async function open(dir = "ltr", responsive = false) {
  const page = await browser.newPage({ viewport: { width: 800, height: 700 } });
  await page.goto(`about:blank?dir=${dir}${responsive ? "&responsive=1" : ""}`);
  await page.setContent(
    `<!doctype html><html><head><style>${css}</style></head><body><div id="root"></div><script>${js}</script></body></html>`,
  );
  await page.waitForSelector(".ui-dashboard-grid-move");
  return page;
}
const saves = (page: Page) =>
  page.evaluate(() => (window as unknown as { __saves: unknown[] }).__saves);

describe("DashboardGrid Chromium", () => {
  it("keyboard previews, cancels, resizes and drops once with outside focus and 24px targets", async () => {
    const page = await open();
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (["error", "warning"].includes(m.type())) errors.push(m.text());
    });
    const grip = page.getByRole("button", { name: "Move Revenue" });
    await grip.focus();
    await page.keyboard.press("Enter");
    await page.keyboard.press("ArrowRight");
    expect(await saves(page)).toEqual([]);
    expect(await page.locator('[data-dashboard-id="b"]').getAttribute("data-y")).toBe("2");
    await page.keyboard.press("Escape");
    expect(await page.locator('[data-dashboard-id="b"]').getAttribute("data-y")).toBe("0");
    await page.keyboard.press("Space");
    await page.keyboard.press("Shift+ArrowDown");
    await page.keyboard.press("Space");
    expect(await saves(page)).toHaveLength(1);
    const box = (await page.locator(".ui-dashboard-grid-resize").first().boundingBox())!;
    expect(box.width).toBeGreaterThanOrEqual(24);
    expect(box.height).toBeGreaterThanOrEqual(24);
    expect(await grip.evaluate((el) => getComputedStyle(el).touchAction)).toBe("none");
    expect(errors).toEqual([]);
    await page.close();
  });
  it.each(["ltr", "rtl"])("pointer moves and resizes, Escape restores in %s", async (dir) => {
    const page = await open(dir);
    const grip = page.getByRole("button", { name: "Move Revenue" });
    const box = (await grip.boundingBox())!;
    const step = await page
      .locator(".ui-dashboard-grid-items")
      .evaluate((el) => (el.clientWidth + parseFloat(getComputedStyle(el).columnGap)) / 3);
    const start = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
    await page.mouse.move(start.x, start.y);
    await page.mouse.down();
    await page.mouse.move(start.x + step * (dir === "rtl" ? -1 : 1), start.y, { steps: 5 });
    expect(await saves(page)).toHaveLength(0);
    expect(await page.locator('[data-dashboard-id="a"]').getAttribute("data-x")).toBe("1");
    await page.keyboard.press("Escape");
    await page.mouse.up();
    expect(await saves(page)).toHaveLength(0);
    expect(await page.locator('[data-dashboard-id="a"]').getAttribute("data-x")).toBe("0");
    await page.mouse.move(start.x, start.y);
    await page.mouse.down();
    await page.mouse.move(start.x + step * (dir === "rtl" ? -1 : 1), start.y, { steps: 5 });
    await page.mouse.up();
    expect(await saves(page)).toHaveLength(1);
    const resize = page.getByRole("button", { name: "Resize Revenue" });
    const r = (await resize.boundingBox())!;
    await page.mouse.move(r.x + r.width / 2, r.y + r.height / 2);
    await page.mouse.down();
    await page.mouse.move(
      r.x + r.width / 2 + step * (dir === "rtl" ? -1 : 1),
      r.y + r.height / 2 + 96,
      { steps: 5 },
    );
    await page.mouse.up();
    expect(await saves(page)).toHaveLength(2);
    expect(await page.locator('[data-dashboard-id="a"]').getAttribute("data-w")).toBe("2");
    await page.close();
  });
  it("mirrors horizontal keyboard movement in RTL", async () => {
    const page = await open("rtl");
    await page.getByRole("button", { name: "Move Revenue" }).focus();
    await page.keyboard.press("Enter");
    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("Enter");
    expect(await page.locator('[data-dashboard-id="a"]').getAttribute("data-x")).toBe("1");
    await page.close();
  });
});

it("touch drag commits once, touch cancellation restores, and reduced motion stays still", async () => {
  const page = await open();
  await page.emulateMedia({ reducedMotion: "reduce" });
  const client = await page.context().newCDPSession(page);
  const grip = page.getByRole("button", { name: "Move Revenue" });
  const box = (await grip.boundingBox())!;
  const x = box.x + box.width / 2,
    y = box.y + box.height / 2;
  const step = await page
    .locator(".ui-dashboard-grid-items")
    .evaluate((el) => (el.clientWidth + parseFloat(getComputedStyle(el).columnGap)) / 3);
  await client.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
  await client.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [{ x: x + step, y }],
  });
  expect(await saves(page)).toHaveLength(0);
  await client.send("Input.dispatchTouchEvent", { type: "touchCancel", touchPoints: [] });
  expect(await page.locator('[data-dashboard-id="a"]').getAttribute("data-x")).toBe("0");
  await client.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
  await client.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [{ x: x + step, y }],
  });
  await client.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  expect(await saves(page)).toHaveLength(1);
  expect(
    await page
      .locator(".ui-dashboard-grid-item")
      .first()
      .evaluate((el) => getComputedStyle(el).animationName),
  ).toBe("none");
  await page.close();
});

it("responsive projection restores saved desktop geometry without a callback", async () => {
  const page = await open("ltr", true);
  await page.setViewportSize({ width: 1280, height: 700 });
  // The column count follows a media query listener: wait for its re-render, as the steps below do.
  await page.waitForFunction(
    () => document.querySelector('[data-dashboard-id="b"]')?.getAttribute("data-x") === "1",
  );
  expect(await page.locator('[data-dashboard-id="b"]').getAttribute("data-x")).toBe("1");
  await page.setViewportSize({ width: 390, height: 700 });
  await page.waitForFunction(
    () => document.querySelector('[data-dashboard-id="b"]')?.getAttribute("data-x") === "0",
  );
  expect(await page.locator('[data-dashboard-id="b"]').getAttribute("data-x")).toBe("0");
  await page.setViewportSize({ width: 1280, height: 700 });
  await page.waitForFunction(
    () => document.querySelector('[data-dashboard-id="b"]')?.getAttribute("data-x") === "1",
  );
  expect(await saves(page)).toEqual([]);
  await page.close();
});

it("keeps content fixed across edit mode, insets both controls, and stacks at natural heights", async () => {
  const page = await open();
  const tile = page.locator('[data-dashboard-id="a"]');
  const before = await tile.locator(".ui-dashboard-grid-content").boundingBox();
  const bounds = await tile.boundingBox();
  for (const selector of [".ui-dashboard-grid-move", ".ui-dashboard-grid-resize"]) {
    const handle = tile.locator(selector);
    const box = await handle.boundingBox();
    expect(box!.width).toBeGreaterThanOrEqual(24);
    expect(box!.height).toBeGreaterThanOrEqual(24);
    expect(box!.x).toBeGreaterThanOrEqual(bounds!.x);
    expect(box!.y).toBeGreaterThanOrEqual(bounds!.y);
    expect(box!.x + box!.width).toBeLessThanOrEqual(bounds!.x + bounds!.width);
    expect(box!.y + box!.height).toBeLessThanOrEqual(bounds!.y + bounds!.height);
  }
  const grip = await tile.locator(".ui-dashboard-grid-move").boundingBox();
  const title = await tile.locator('[data-slot="card-title"]').boundingBox();
  expect(title!.x).toBeGreaterThanOrEqual(grip!.x + grip!.width);
  await page.evaluate(() =>
    (window as unknown as { __setEditing: (v: boolean) => void }).__setEditing(false),
  );
  await page.waitForFunction(() => !document.querySelector(".ui-dashboard-grid-move"));
  expect(await tile.locator(".ui-dashboard-grid-content").boundingBox()).toEqual(before);
  await page.close();
  const mobile = await open("ltr", true);
  await mobile.setViewportSize({ width: 390, height: 700 });
  await mobile.waitForSelector(".ui-dashboard-grid-items[data-stacked]");
  expect((await mobile.locator('[data-dashboard-id="a"]').boundingBox())!.height).toBeLessThan(160);
  await mobile.close();
});

it("prints every tile at its content height with no handles (gh#1446)", async () => {
  const page = await open();
  await page.locator('[data-dashboard-id="a"] .ui-dashboard-grid-content').evaluate((el) => {
    const tall = document.createElement("div");
    tall.style.blockSize = "600px";
    el.append(tall);
  });
  const clipped = () =>
    page
      .locator('[data-dashboard-id="a"] .ui-dashboard-grid-content')
      .evaluate((el) => el.scrollHeight - el.clientHeight);
  expect(await clipped()).toBeGreaterThan(0);
  await page.emulateMedia({ media: "print" });
  expect(await clipped()).toBe(0);
  expect(await page.locator(".ui-dashboard-grid-move").first().isVisible()).toBe(false);
  expect(await page.locator(".ui-dashboard-grid-resize").first().isVisible()).toBe(false);
  await page.close();
});
