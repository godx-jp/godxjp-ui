import { TextEncoder as NodeTextEncoder } from "node:util";

import { chromium, type Browser, type Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { compileRealCss } from "../../data-entry/__tests__/compile-real-css";

/**
 * gh#1478 in Chromium, against the real stylesheet: a folded `overflow="menu"` Topbar with a
 * CommandPalette in `start` still opens on Ctrl+K while the "more" menu is CLOSED (a consumer
 * measured 30 presses in 15s with no dialog at 1024px), the open menu holds the same controls,
 * and widening the bar puts them back in the bar.
 */
const ROOT = process.cwd();
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { Topbar } from "./src/components/layout/topbar";
import { TopbarItem } from "./src/components/layout/topbar-item";
import { CommandPalette } from "./src/components/data-entry/command-palette";
const groups = [{ id: "pages", label: "Pages", items: [{ id: "/a", label: "Alpha" }] }];
const labels = { open: "Open palette", title: "Palette", description: "Find", placeholder: "Search", empty: "None", loading: "Loading" };
createRoot(document.getElementById("root")).render(
  <AppProvider defaultLocale="en" persist={false}>
    <div id="frame" style={{ inlineSize: "160px" }}>
      <Topbar
        overflow="menu"
        start={<CommandPalette groups={groups} labels={labels} onSelect={() => {}} />}
        end={<>
          <TopbarItem aria-label="Notifications">N</TopbarItem>
          <TopbarItem aria-label="Settings">S</TopbarItem>
          <TopbarItem aria-label="Account">A</TopbarItem>
        </>}
      />
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
  const tokens = [...new Set(js.match(/[\w:./[\]()%#!=-]+/g) ?? [])].join(" ");
  css = await compileRealCss(`<div class="${tokens.replaceAll('"', "")}"></div>`);
  browser = await chromium.launch({ headless: true });
}, 180_000);

afterAll(async () => {
  await browser?.close();
});

async function open(): Promise<Page> {
  const page = await browser.newPage({ viewport: { width: 1024, height: 768 } });
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.setContent(
    `<!doctype html><html lang="en"><head><style>${css}</style></head><body><div id="root"></div><script>${js}</script></body></html>`,
  );
  await page.locator('[data-slot="topbar"][data-collapsed="true"]').waitFor();
  expect(errors).toEqual([]);
  return page;
}

describe("folded Topbar keeps its controls mounted (gh#1478)", { timeout: 60_000 }, () => {
  it("Ctrl+K opens the palette while the more menu is closed", async () => {
    const page = await open();
    await expect(page.getByRole("button", { name: "Account" }).count()).resolves.toBe(0);
    await page.keyboard.press("ControlOrMeta+k");
    await page.getByRole("dialog", { name: "Palette" }).waitFor({ timeout: 3_000 });
    await page.close();
  });

  it("the open menu shows the same controls, and widening puts them back in the bar", async () => {
    const page = await open();
    await page.locator("[data-topbar-overflow-trigger]").click();
    const account = page.getByRole("button", { name: "Account" });
    await account.waitFor();
    expect(await account.evaluate((el) => !!el.closest('[data-slot="topbar-overflow"]'))).toBe(
      true,
    );
    expect(await page.getByRole("button", { name: "Account" }).count()).toBe(1);
    await page.keyboard.press("Escape");
    await page.locator("#frame").evaluate((el) => {
      (el as HTMLElement).style.inlineSize = "900px";
    });
    await page.locator('[data-slot="topbar"][data-collapsed="false"]').waitFor();
    const inBar = await page.evaluate(() => {
      const bar = document.querySelector('[data-slot="topbar"]')!;
      const end = bar.querySelector(":scope > .ui-topbar-end");
      const acc = [...document.querySelectorAll("button")].find(
        (b) => b.getAttribute("aria-label") === "Account",
      )!;
      const r = acc.getBoundingClientRect();
      return { direct: !!end, contains: !!end?.contains(acc), w: r.width, h: r.height };
    });
    expect(inBar.direct).toBe(true);
    expect(inBar.contains).toBe(true);
    expect(inBar.w).toBeGreaterThan(0);
    // And the shortcut still works after unfolding.
    await page.keyboard.press("ControlOrMeta+k");
    await page.getByRole("dialog", { name: "Palette" }).waitFor({ timeout: 3_000 });
    await page.close();
  });
});
