import { TextEncoder as NodeTextEncoder } from "node:util";
import { chromium, type Browser } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { compileRealCss } from "./compile-real-css";
const ROOT = process.cwd();
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { Select } from "./src/components/data-entry";
import { Popover, PopoverTrigger, PopoverContent } from "./src/components/data-display/popover";
import { Button } from "./src/components/general/button";
const params = new URLSearchParams(location.search);
const fixed = params.has("fixed");
createRoot(document.getElementById("root")).render(<AppProvider persist={false}>
<div style={{ minHeight: "200vh", paddingTop: 40 }}>
<Select aria-label="Area" showSearch popupMatchSelectWidth={fixed ? 2000 : true} options={[{value:"13",label:"Tokyo"}]} />
<Popover><PopoverTrigger asChild><Button>Notifications</Button></PopoverTrigger><PopoverContent flush={params.has("flush")}>{Array.from({length:30},(_,i)=><Button key={i} style={{display:"block"}}>Notice {i}</Button>)}</PopoverContent></Popover>
</div></AppProvider>);
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
  browser = await chromium.launch({ headless: true, ignoreDefaultArgs: ["--hide-scrollbars"] });
}, 180_000);

afterAll(async () => {
  await browser?.close();
});

describe("overlay caps", { timeout: 40000 }, () => {
  for (const width of [320, 360, 390, 1024, 1280, 1440])
    for (const fixed of [false, true])
      for (const dir of ["ltr", "rtl"]) {
        it(`search panel ${width} fixed=${fixed} ${dir}`, async () => {
          const page = await browser.newPage({ viewport: { width, height: 600 } });
          await page.route("http://fixture.test/**", (route) =>
            route.fulfill({
              contentType: "text/html",
              body: `<!doctype html><html dir="${dir}"><head><style>${css}</style></head><body style="margin:0"><div id="root"></div><script>${js}</script></body></html>`,
            }),
          );
          await page.goto(`http://fixture.test/${fixed ? "?fixed" : ""}`);
          await page.getByRole("combobox").click();
          await page.locator(".ui-search-select-panel").waitFor();
          for (let i = 0; i < 6; i++) {
            await page.waitForTimeout(150);
            const m = await page.locator(".ui-search-select-panel").evaluate((el) => {
              const r = el.getBoundingClientRect();
              return {
                left: r.left,
                right: r.right,
                width: r.width,
                viewport: document.documentElement.clientWidth,
                overflow:
                  document.documentElement.scrollWidth - document.documentElement.clientWidth,
              };
            });
            expect(m.left).toBeGreaterThanOrEqual(11);
            expect(m.right).toBeLessThanOrEqual(m.viewport - 11);
            expect(m.overflow).toBe(0);
          }
          await page.close();
        });
      }
  for (const flush of [false, true])
    it(`capped popover scrolls and preserves rings (flush=${flush})`, async () => {
      const page = await browser.newPage({ viewport: { width: 390, height: 320 } });
      await page.route("http://fixture.test/**", (route) =>
        route.fulfill({
          contentType: "text/html",
          body: `<style>${css}</style><div id="root"></div><script>${js}</script>`,
        }),
      );
      await page.goto(`http://fixture.test/${flush ? "?flush" : ""}`);
      await page.getByRole("button", { name: "Notifications", exact: true }).click();
      const panel = page.locator('[data-slot="popover-content"]');
      await panel.waitFor();
      expect(await panel.evaluate((el) => getComputedStyle(el).overflowY)).toBe("auto");
      await page.keyboard.press("Tab");
      await page.getByRole("button", { name: "Notice 29", exact: true }).focus();
      const m = await panel.evaluate((el) => {
        const child = el.querySelector("button:last-child")!;
        const r = el.getBoundingClientRect(),
          c = child.getBoundingClientRect();
        return {
          top: c.top - r.top,
          bottom: r.bottom - c.bottom,
          scroll: el.scrollTop,
          ringOffset: parseFloat(getComputedStyle(child).outlineOffset),
        };
      });
      expect(m.scroll).toBeGreaterThan(0);
      if (flush) expect(m.ringOffset).toBeLessThan(0);
      else expect(m.ringOffset).toBeGreaterThanOrEqual(0);
      expect(m.top).toBeGreaterThanOrEqual(flush ? 0 : 4);
      expect(m.bottom).toBeGreaterThanOrEqual(flush ? 0 : 4);
      await page.close();
    });
});
