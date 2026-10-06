import { TextEncoder as NodeTextEncoder } from "node:util";

import { chromium, type Browser } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { compileRealCss } from "../../data-entry/__tests__/compile-real-css";

/**
 * gh#1177 — "Button is 29–33px at every size, under the 44px tap floor" was measured with a MOUSE
 * pointer at 390px wide, which is not how a phone presents. Under a finger (`pointer: coarse`,
 * touch emulation) the control ladder lifts the default size to the 44px floor and `lg` to 48px;
 * `xs` / `sm` stay smaller on purpose (rule #24: a deliberately small control is the consumer's
 * trade), still above WCAG 2.5.8's 24px. Under a mouse, desk geometry: 24 / 28 / 32 / 36.
 */
const ROOT = process.cwd();
const SIZES = ["xs", "sm", "md", "lg"] as const;
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { Button } from "./src/components/general";
createRoot(document.getElementById("root")).render(
  <AppProvider defaultLocale="en" persist={false}>
    <div style={{ display: "flex", gap: 8, padding: 8, alignItems: "flex-start" }}>
      ${SIZES.map((s) => `<Button size="${s}" data-size-probe="${s}">Save</Button>`).join("")}
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

async function heights(touch: boolean) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 800 },
    hasTouch: touch,
    isMobile: touch,
  });
  const page = await context.newPage();
  await page.setContent(
    `<!doctype html><html lang="en"><head><style>${css}</style></head><body><div id="root"></div><script>${js}</script></body></html>`,
  );
  await page.locator('[data-size-probe="lg"]').waitFor();
  const out = await page.evaluate(() => ({
    coarse: matchMedia("(pointer: coarse)").matches,
    sizes: Object.fromEntries(
      [...document.querySelectorAll<HTMLElement>("[data-size-probe]")].map((el) => [
        el.dataset.sizeProbe,
        el.getBoundingClientRect().height,
      ]),
    ),
  }));
  await context.close();
  return out;
}

describe("Button tap target (Chromium, gh#1177)", { timeout: 40_000 }, () => {
  it("reaches the 44px floor at the default size and above under a finger", async () => {
    const m = await heights(true);
    expect(m.coarse).toBe(true);
    expect(m.sizes.md).toBeGreaterThanOrEqual(44);
    expect(m.sizes.lg).toBeGreaterThanOrEqual(44);
    for (const size of SIZES) expect(m.sizes[size], size).toBeGreaterThanOrEqual(24);
  });

  it("keeps desk geometry under a mouse, above WCAG 2.5.8's 24px", async () => {
    const m = await heights(false);
    expect(m.coarse).toBe(false);
    for (const size of SIZES) expect(m.sizes[size], size).toBeGreaterThanOrEqual(24);
    expect(m.sizes.lg).toBeLessThan(44);
  });
});
