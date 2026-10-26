import { TextEncoder as NodeTextEncoder } from "node:util";

import { chromium, type Browser, type Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { compileRealCss } from "../../data-entry/__tests__/compile-real-css";

/**
 * gh#1481 in Chromium, against the real stylesheet. A consumer measured AppShell at 320px with
 * `html { font-size: 200% }` (WCAG 1.4.4 / 1.4.10): mobile-nav trigger + a logo lockup with a
 * product suffix + a folded `Topbar overflow="menu"`. The folded bar's one "more" cell (72px at
 * 200%) did not fit the custom slot, the header clipped it, and the clip margin let 8px of it into
 * the page: scrollWidth 328 on a 320px viewport. The header must fit — the brand yields first —
 * and nothing it clips may widen the page.
 */
const ROOT = process.cwd();
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { AppShell } from "./src/components/layout/app-shell";
import { Sidebar } from "./src/components/layout/sidebar";
import { Topbar } from "./src/components/layout/topbar";
import { TopbarItem } from "./src/components/layout/topbar-item";
import { Logo } from "./src/components/general/logo";
const sections = [{ items: [{ id: "home", label: "Home", href: "#" }, { id: "security", label: "Security", href: "#" }] }];
createRoot(document.getElementById("root")).render(
  <AppProvider defaultLocale="en" persist={false}>
    <AppShell
      topbarSpan="full"
      sidebar={<Sidebar sections={sections} activeId="security" />}
      logo={<Logo glyph="G" wordmark="GoDX" productSuffix="ID" />}
      topbar={
        <Topbar
          overflow="menu"
          end={<>
            <TopbarItem aria-label="Language">EN</TopbarItem>
            <TopbarItem aria-label="Theme">T</TopbarItem>
            <TopbarItem aria-label="Account">A</TopbarItem>
          </>}
        />
      }
    >
      <p>My security</p>
    </AppShell>
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

async function open(width: number, fontSize: string): Promise<Page> {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  await page.setContent(
    `<!doctype html><html lang="en" style="font-size:${fontSize}"><head><style>${css}</style></head><body><div id="root"></div><script>${js}</script></body></html>`,
  );
  await page.locator('[data-slot="topbar"]').waitFor();
  await page.waitForTimeout(200);
  return page;
}

const measure = (page: Page) =>
  page.evaluate(() => {
    const more = document.querySelector("[data-topbar-overflow-trigger]");
    const header = document.querySelector(".app-topbar")!.getBoundingClientRect();
    const r = more?.getBoundingClientRect();
    return {
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      headerRight: header.right,
      more: r ? { left: r.left, right: r.right, width: r.width } : null,
      collapsed: document.querySelector('[data-slot="topbar"]')!.getAttribute("data-collapsed"),
    };
  });

describe("AppShell header at 320px / 200% text (gh#1481)", { timeout: 60_000 }, () => {
  for (const [width, fontSize] of [
    [320, "200%"],
    [320, "100%"],
    [390, "200%"],
  ] as const) {
    it(`${width}px at ${fontSize}: the page does not scroll sideways and the more cell is whole`, async () => {
      const page = await open(width, fontSize);
      const m = await measure(page);
      expect(m.scrollWidth, JSON.stringify(m)).toBeLessThanOrEqual(m.innerWidth);
      // The brand yielded: the folded bar's cell is not pushed past the header's edge.
      if (m.more) {
        // The folded bar's one cell is painted whole, inside the header.
        expect(m.more.right, JSON.stringify(m)).toBeLessThanOrEqual(m.headerRight + 0.5);
        expect(m.more.width).toBeGreaterThan(0);
      }
      await page.close();
    });
  }

  it("a header that cannot fit at all still does not widen the page (the clip margin is contained)", async () => {
    // 240px at 200%: inset + trigger + gaps + one cell exceed the row even with the brand at 0.
    const page = await open(240, "200%");
    const m = await measure(page);
    expect(m.scrollWidth, JSON.stringify(m)).toBeLessThanOrEqual(m.innerWidth);
    await page.close();
  });
});
