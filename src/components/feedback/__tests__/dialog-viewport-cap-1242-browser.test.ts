import { TextEncoder as NodeTextEncoder } from "node:util";

import { chromium, type Browser, type Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { compileRealCss } from "../../data-entry/__tests__/compile-real-css";

/**
 * gh#1242 in Chromium, against the real stylesheet. `dialog-body` caps itself at
 * `min(60vh, 32rem)`, but `dialog-content` had no cap of its own: header + footer + padding are a
 * fixed ~154px, so below ~385px of viewport the dialog outgrew the screen and the footer, holding
 * the confirm button, sat off-screen while only the body scrolled (measured by the consumer at
 * 1280x200: footer bottom 236px). That height is real: a phone in landscape, or WCAG 2.2 SC 1.4.10
 * reflow at 200% zoom on a 768px laptop window. Asserted: the footer stays on screen and the body
 * scrolls at 200px, and at a normal height the dialog is exactly as tall as before.
 */
const ROOT = process.cwd();
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import {
  DialogRoot, DialogContent, DialogHeader, DialogBody, DialogFooter,
} from "./src/components/feedback/dialog";
const lines = Number(new URLSearchParams(location.search).get("lines") || 6);
createRoot(document.getElementById("root")).render(
  <AppProvider defaultLocale="en" persist={false}>
    <DialogRoot defaultOpen>
      <DialogContent>
        <DialogHeader title="Reason" />
        <DialogBody>
          {Array.from({ length: lines }, (_, i) => (
            <p key={i} style={{ margin: 0, height: 20 }}>Line {i + 1}</p>
          ))}
        </DialogBody>
        <DialogFooter><button type="button">Confirm</button></DialogFooter>
      </DialogContent>
    </DialogRoot>
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

async function measure(height: number, lines = 6) {
  const page = await browser.newPage({ viewport: { width: 1280, height } });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(`about:blank?lines=${lines}`);
  await page.setContent(
    `<!doctype html><html lang="en"><head><style>${css}</style></head><body><div id="root"></div><script>${js}</script></body></html>`,
  );
  await page.locator('[data-slot="dialog-footer"] button').waitFor();
  const m = await page.evaluate(() => {
    const content = document.querySelector('[data-slot="dialog-content"]')!.getBoundingClientRect();
    const body = document.querySelector('[data-slot="dialog-body"]') as HTMLElement;
    const header = document.querySelector('[data-slot="dialog-header"]')!.getBoundingClientRect();
    const footer = document.querySelector('[data-slot="dialog-footer"]')!.getBoundingClientRect();
    return {
      contentTop: Math.round(content.top),
      contentHeight: Math.round(content.height),
      headerTop: Math.round(header.top),
      footerBottom: Math.round(footer.bottom),
      bodyHeight: Math.round(body.getBoundingClientRect().height),
      bodyScrolls: body.scrollHeight > body.clientHeight + 1,
      viewport: window.innerHeight,
    };
  });
  await page.close();
  return m;
}

describe("DialogContent is capped to the viewport (gh#1242)", () => {
  it("keeps header and footer on screen at 1280x200, and the body is what scrolls", async () => {
    const m = await measure(200);
    expect(m.headerTop, JSON.stringify(m)).toBeGreaterThanOrEqual(0);
    expect(m.footerBottom, JSON.stringify(m)).toBeLessThanOrEqual(m.viewport);
    expect(m.bodyScrolls).toBe(true);
  }, 60_000);

  it("keeps the footer on screen with a long body at 1280x360 (phone landscape)", async () => {
    const m = await measure(360, 40);
    expect(m.footerBottom, JSON.stringify(m)).toBeLessThanOrEqual(m.viewport);
    expect(m.bodyScrolls).toBe(true);
  }, 60_000);

  // The control: pixel values measured on 32.0.4, before the cap, at a viewport tall enough that
  // the cap never binds. The fix must leave both untouched.
  it("leaves a dialog that fits exactly as it was at 1280x900 (short and long body)", async () => {
    const short = await measure(900);
    expect(short).toMatchObject({ contentTop: 313, contentHeight: 274, bodyHeight: 128 });
    expect(short.bodyScrolls).toBe(false);
    const long = await measure(900, 40);
    // The body's own `min(60vh, 32rem)` cap still decides here: 512px, as before.
    expect(long).toMatchObject({ contentTop: 121, contentHeight: 658, bodyHeight: 512 });
    expect(long.bodyScrolls).toBe(true);
  }, 60_000);
});
