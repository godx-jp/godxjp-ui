import { TextEncoder as NodeTextEncoder } from "node:util";

import { chromium, type Browser, type Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { compileRealCss } from "../../data-entry/__tests__/compile-real-css";

/**
 * gh#1174 / gh#1178 in Chromium, against the real stylesheet.
 * - DialogContent `width` (Sheet's / antd Modal's vocabulary) sizes the panel, capped at the
 *   viewport minus the inset; omitted, it stays 32rem.
 * - Sheet and Dialog enter durations are tokens, short by default (≤ 200ms), and neither animates
 *   under `prefers-reduced-motion: reduce`.
 */
const ROOT = process.cwd();
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { DialogRoot, DialogContent, DialogTitle } from "./src/components/feedback/dialog";
import { Sheet, SheetContent, SheetTitle } from "./src/components/feedback/sheet";
const params = new URLSearchParams(location.search);
const kind = params.get("kind");
const width = params.get("width") || undefined;
createRoot(document.getElementById("root")).render(
  <AppProvider defaultLocale="en" persist={false}>
    {kind === "sheet" ? (
      <Sheet defaultOpen><SheetContent><SheetTitle>Sheet</SheetTitle></SheetContent></Sheet>
    ) : (
      <DialogRoot defaultOpen><DialogContent width={width}><DialogTitle>Dialog</DialogTitle></DialogContent></DialogRoot>
    )}
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
  // `=` included: `data-[state=open]:animate-in` is one class, and without it the variant never compiles.
  const tokens = [...new Set(js.match(/[\w:./[\]()%#!=-]+/g) ?? [])].join(" ");
  css = await compileRealCss(`<div class="${tokens.replaceAll('"', "")}"></div>`);
  browser = await chromium.launch({ headless: true });
}, 180_000);

afterAll(async () => {
  await browser?.close();
});

async function open(query: string, width: number, reducedMotion: "reduce" | "no-preference") {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  await page.emulateMedia({ reducedMotion });
  await page.goto(`about:blank?${query}`);
  await page.setContent(
    `<!doctype html><html lang="en"><head><style>${css}</style></head><body><div id="root"></div><script>${js}</script></body></html>`,
  );
  return page;
}

const measure = (page: Page, slot: string) =>
  page.locator(`[data-slot="${slot}"]`).evaluate((el) => {
    const s = getComputedStyle(el);
    const raw = s.animationDuration;
    return {
      // Layout width: the enter animation scales the box (zoom-in-95), which a bounding rect would report.
      width: (el as HTMLElement).offsetWidth,
      animationName: s.animationName,
      animationMs: raw.endsWith("ms") ? parseFloat(raw) : parseFloat(raw) * 1000,
    };
  });

describe("DialogContent width (gh#1174)", { timeout: 40_000 }, () => {
  it("keeps 32rem by default and takes `width`, capped at the viewport minus the inset", async () => {
    const plain = await open("kind=dialog", 1440, "no-preference");
    expect((await measure(plain, "dialog-content")).width).toBe(512);
    await plain.close();

    const wide = await open("kind=dialog&width=60rem", 1440, "no-preference");
    expect((await measure(wide, "dialog-content")).width).toBe(960);
    await wide.close();

    // 390 − 1.5rem inset = 366px: a wide dialog never leaves a phone screen.
    const phone = await open("kind=dialog&width=60rem", 390, "no-preference");
    expect((await measure(phone, "dialog-content")).width).toBe(366);
    await phone.close();
  });
});

describe("Sheet / Dialog motion (gh#1178)", { timeout: 40_000 }, () => {
  it("enters in ≤ 200ms by default", async () => {
    for (const [kind, slot] of [
      ["sheet", "sheet-content"],
      ["dialog", "dialog-content"],
    ] as const) {
      const page = await open(`kind=${kind}`, 1440, "no-preference");
      const m = await measure(page, slot);
      expect(m.animationName, kind).not.toBe("none");
      expect(m.animationMs, kind).toBeGreaterThan(0);
      expect(m.animationMs, kind).toBeLessThanOrEqual(200);
      await page.close();
    }
  });

  it("does not animate under prefers-reduced-motion", async () => {
    for (const [kind, slot] of [
      ["sheet", "sheet-content"],
      ["dialog", "dialog-content"],
    ] as const) {
      const page = await open(`kind=${kind}`, 1440, "reduce");
      expect((await measure(page, slot)).animationName, kind).toBe("none");
      await page.close();
    }
  });
});
