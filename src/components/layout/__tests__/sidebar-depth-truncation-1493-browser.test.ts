import { TextEncoder as NodeTextEncoder } from "node:util";

import { chromium, type Browser, type Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { compileRealCss } from "../../data-entry/__tests__/compile-real-css";

/**
 * gh#1493 in Chromium, against the real stylesheet: (1) the third level is a visible, clickable row
 * indented past its parent sub-row; (2) a label the rail cuts with an ellipsis exposes its full text
 * as `title` — only while it is actually cut (measured on a consumer: 232px of text in 178px, eight
 * labels unreadable) — and loses it when the rail widens enough for it to fit.
 */
const ROOT = process.cwd();
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { Sidebar } from "./src/components/layout/sidebar";
const sections = [{ label: "人事", items: [
  { id: "hr", label: "従業員", children: [
    { id: "roster", label: "従業員一覧", href: "#roster" },
    { id: "labour", label: "労務", children: [
      { id: "santei", label: "定時決定（算定基礎届）の提出と標準報酬月額の確認", href: "#santei" },
      { id: "short", label: "賞与", href: "#short" },
    ] },
  ] },
] }];
createRoot(document.getElementById("root")).render(
  <AppProvider defaultLocale="ja" persist={false}>
    <div id="rail" style={{ inlineSize: "240px" }}><Sidebar sections={sections} activeId="santei" /></div>
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
  const tokens = [...new Set(js.match(/[\w:./[\]()%#!=-]+/g) ?? [])].join(" ");
  css = await compileRealCss(`<div class="${tokens.replaceAll('"', "")}"></div>`);
  browser = await chromium.launch({ headless: true });
}, 180_000);

afterAll(async () => {
  await browser?.close();
});

async function open(): Promise<Page> {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.setContent(
    `<!doctype html><html lang="ja"><head><style>${css}</style></head><body><div id="root"></div><script>${js}</script></body></html>`,
  );
  await page.getByRole("link", { name: /定時決定/ }).waitFor();
  return page;
}

const labelOf = (page: Page, name: RegExp | string) =>
  page.getByRole("link", { name }).locator(".sb-label");

describe("Sidebar depth and cut labels in Chromium (gh#1493)", { timeout: 60_000 }, () => {
  it("the third level is a visible row indented past its level-2 parent, and clickable", async () => {
    const page = await open();
    const leaf = page.getByRole("link", { name: /定時決定/ });
    await expect(leaf.isVisible()).resolves.toBe(true);
    expect(await leaf.getAttribute("aria-current")).toBe("page");
    const parent = page.getByRole("button", { name: "労務" });
    const [leafBox, parentBox] = [await leaf.boundingBox(), await parent.boundingBox()];
    expect(leafBox!.x).toBeGreaterThan(parentBox!.x);
    await page.getByRole("link", { name: "賞与" }).click();
    expect(await page.evaluate(() => location.hash)).toBe("#short");
    await page.close();
  });

  it("a cut label carries its full text as title; a label that fits carries none", async () => {
    const page = await open();
    const long = labelOf(page, /定時決定/);
    const metrics = await long.evaluate((el) => ({
      scroll: el.scrollWidth,
      client: el.clientWidth,
    }));
    expect(metrics.scroll).toBeGreaterThan(metrics.client);
    expect(await long.getAttribute("title")).toBe(
      "定時決定（算定基礎届）の提出と標準報酬月額の確認",
    );
    expect(await labelOf(page, "賞与").getAttribute("title")).toBeNull();
    await page.close();
  });

  it("widening the rail until the label fits removes the title", async () => {
    const page = await open();
    await page.locator("#rail").evaluate((el) => {
      (el as HTMLElement).style.inlineSize = "900px";
    });
    const long = labelOf(page, /定時決定/);
    await expect.poll(() => long.getAttribute("title"), { timeout: 5_000 }).toBeNull();
    await page.close();
  });
});
