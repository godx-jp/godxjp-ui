import { TextEncoder as NodeTextEncoder } from "node:util";

import { chromium, type Browser, type Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { compileRealCss } from "../../data-entry/__tests__/compile-real-css";

/**
 * gh#1271 in Chromium, against the real stylesheet and sonner's own injected CSS. A consumer's
 * usability test caught three success toasts stacked bottom-right ON TOP of a `PageContainer`
 * sticky footer's submit button. The fix: a visible sticky footer publishes its block size as
 * `--toast-sticky-bar-height` and the Toaster adds it to its bottom offset.
 *
 * Asserted at 1440x900 (desktop offset) and 390x844 (sonner's ≤600px mobile offset):
 *   · with a sticky footer, every toast's bottom edge is at or above the footer's top edge;
 *   · with no footer, and with a reveal footer still parked below the fold, the stack keeps the
 *     offset it had before the fix — 24px desktop, 16px mobile (measured on the pre-fix source).
 */
const ROOT = process.cwd();
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { PageContainer } from "./src/components/layout/page-container";
import { MobileShell } from "./src/components/layout/mobile-shell";
import { Button } from "./src/components/general/button";
import { Toaster } from "./src/components/feedback/sonner";
import { toast } from "./src/components/feedback/use-toast";
window.__toast = toast;
const kind = new URLSearchParams(location.search).get("kind");
const footer = kind === "none" ? undefined : (
  <><Button variant="outline">Cancel</Button><Button id="submit">記録する</Button></>
);
createRoot(document.getElementById("root")).render(
  <AppProvider defaultLocale="en" persist={false}>
    <div id="ready">
      {kind === "shell" ? (
        <MobileShell
          header={<span>Scan</span>}
          actions={<Button id="submit">記録する</Button>}
          tabBar={<><Button variant="ghost">Home</Button><Button variant="ghost">Me</Button></>}
        >
          {Array.from({ length: 60 }, (_, i) => <p key={i}>Row {i + 1}</p>)}
        </MobileShell>
      ) : (
      <PageContainer
        title="Record"
        footer={footer}
        stickyFooter={kind !== "none"}
        footerReveal={kind === "reveal" ? "onScroll" : "always"}
      >
        {Array.from({ length: 60 }, (_, i) => <p key={i}>Row {i + 1}</p>)}
      </PageContainer>
      )}
      <Toaster />
    </div>
  </AppProvider>,
);
`;

/** Pre-fix bottom gap between the front toast and the viewport edge (sonner's defaults). */
const BASELINE_GAP = { desktop: 24, mobile: 16 } as const;
const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  mobile: { width: 390, height: 844 },
} as const;

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

async function open(kind: string, viewport: keyof typeof VIEWPORTS): Promise<Page> {
  const page = await browser.newPage({ viewport: VIEWPORTS[viewport] });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(`about:blank?kind=${kind}`);
  // A definite height chain, so `min-height: 100%` puts the sticky footer at the viewport bottom
  // — the consumer's geometry. Without it the footer trails short content and nothing overlaps.
  await page.setContent(
    `<!doctype html><html lang="en"><head><style>${css}html,body,#root{height:100%;margin:0}</style></head><body><div id="root"></div><script>${js}</script></body></html>`,
  );
  await page.locator("#ready").waitFor();
  await page.evaluate(() => {
    const fire = (window as unknown as { __toast: { success: (m: string) => void } }).__toast;
    for (let i = 1; i <= 3; i += 1) fire.success(`Saved record ${i}`);
  });
  await page.waitForFunction(
    () => document.querySelectorAll('[data-sonner-toast][data-mounted="true"]').length === 3,
  );
  // Let sonner settle its measured heights (it sets them in effects after mount).
  await page.waitForTimeout(300);
  return page;
}

const geometry = (page: Page) =>
  page.evaluate(() => {
    const toasts = [...document.querySelectorAll<HTMLElement>("[data-sonner-toast]")];
    const footer = document.querySelector<HTMLElement>(".ui-page-footer, .ui-mobile-shell-actions");
    return {
      toastBottoms: toasts.map((t) => t.getBoundingClientRect().bottom),
      footerTop: footer?.getBoundingClientRect().top ?? null,
      submitTop: document.querySelector("#submit")?.getBoundingClientRect().top ?? null,
      viewportHeight: window.innerHeight,
    };
  });

describe("toasts clear a PageContainer sticky footer (gh#1271)", { timeout: 60_000 }, () => {
  for (const viewport of ["desktop", "mobile"] as const) {
    it(`${viewport}: every toast sits above the sticky footer`, async () => {
      const page = await open("sticky", viewport);
      const g = await geometry(page);
      expect(g.footerTop).not.toBeNull();
      // The fixture reproduces the consumer's layout: the footer is pinned to the viewport bottom.
      expect(g.footerTop!).toBeGreaterThan(g.viewportHeight - 120);
      expect(g.toastBottoms).toHaveLength(3);
      for (const bottom of g.toastBottoms) {
        expect(bottom).toBeLessThanOrEqual(g.footerTop! + 0.5);
        expect(bottom).toBeLessThanOrEqual(g.submitTop! + 0.5);
      }
      await page.close();
    });

    it(`${viewport}: without a sticky footer the stack keeps its pre-fix offset`, async () => {
      const page = await open("none", viewport);
      const g = await geometry(page);
      expect(g.footerTop).toBeNull();
      const front = Math.max(...g.toastBottoms);
      expect(g.viewportHeight - front).toBeCloseTo(BASELINE_GAP[viewport], 0);
      await page.close();
    });

    it(`${viewport}: every toast sits above the MobileShell action bar and tab bar`, async () => {
      const page = await open("shell", viewport);
      const g = await geometry(page);
      expect(g.footerTop).not.toBeNull();
      for (const bottom of g.toastBottoms) {
        expect(bottom).toBeLessThanOrEqual(g.footerTop! + 0.5);
      }
      await page.close();
    });

    it(`${viewport}: a reveal footer still below the fold adds no clearance`, async () => {
      const page = await open("reveal", viewport);
      const g = await geometry(page);
      const front = Math.max(...g.toastBottoms);
      expect(g.viewportHeight - front).toBeCloseTo(BASELINE_GAP[viewport], 0);
      await page.close();
    });
  }
});
