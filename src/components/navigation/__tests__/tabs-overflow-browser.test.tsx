import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium, type Browser } from "playwright";
import { renderToStaticMarkup } from "react-dom/server";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { AppProvider } from "../../../app/app-provider";
import { compileRealCss } from "../../data-entry/__tests__/compile-real-css";
import { Tabs } from "../tabs";

const labels = [
  "カート保持時間",
  "顧客",
  "LINE 連携",
  "決済",
  "配送",
  "税率",
  "領収書",
  "通知",
  "スタッフ",
  "店舗情報",
  "クーポン",
  "ポイント",
  "API",
  "監査ログ",
];
const items = labels.map((label, index) => ({ value: String(index), label, content: label }));
let browser: Browser | undefined;
let html: string;

beforeAll(async () => {
  // Real CSS AND mounted React: static markup cannot exercise overflow observers or menus.
  const markup = renderToStaticMarkup(
    <AppProvider>
      <Tabs variant="line" overflow="menu" items={items} />
    </AppProvider>,
  );
  const css = await compileRealCss(markup);
  const bundleOptions = {
    stdin: {
      contents: `import React from 'react';
        import { createRoot } from 'react-dom/client';
        import { AppProvider } from './src/app/app-provider';
        import { Tabs } from './src/components/navigation/tabs';
        const root = createRoot(document.getElementById('root'));
        window.mountTabs = (mode, dir) => root.render(
          <AppProvider><div dir={dir}><Tabs key={mode + dir} dir={dir}
            variant="line" overflow="menu" aria-label="Settings"
            items={${JSON.stringify(items)}.map(item => mode === 'route'
              ? {...item, href: '#' + item.value} : item)} /></div></AppProvider>);`,
      loader: "tsx",
      resolveDir: process.cwd(),
    },
    bundle: true,
    write: false,
    platform: "browser",
    format: "iife",
    define: { "process.env.NODE_ENV": '"production"' },
  };
  // Run the compiler in Node's realm (jsdom's Uint8Array differs from TextEncoder's).
  const script = execFileSync(
    process.execPath,
    [
      "-e",
      "process.stdout.write(require('esbuild').buildSync(JSON.parse(process.argv[1])).outputFiles[0].text)",
      JSON.stringify(bundleOptions),
    ],
    { encoding: "utf8", maxBuffer: 20 * 1024 * 1024 },
  );
  html = `<style>${css}</style><div id="root"></div><script>${script}</script>`;
  // Also usable by the MCP browser when the shell's Chromium sandbox cannot launch.
  const artifact = join(mkdtempSync(join(tmpdir(), "tabs-overflow-")), "fixture.html");
  writeFileSync(artifact, html);
  console.info(`Tabs browser fixture: ${artifact}`);
  browser = await chromium.launch({ headless: true });
}, 60_000);

afterAll(async () => {
  await browser?.close();
});

for (const mode of ["route", "panel"] as const) {
  for (const dir of ["ltr", "rtl"] as const) {
    describe(`${mode} overflow menu ${dir}`, () => {
      it("paints only complete tabs and menus exactly the hidden set at 390 and 1280", async () => {
        const page = await browser!.newPage();
        try {
          await page.setViewportSize({ width: 390, height: 900 });
          await page.setContent(html);
          await page.evaluate(
            ({ mode, dir }) => {
              (window as unknown as { mountTabs: (mode: string, dir: string) => void }).mountTabs(
                mode,
                dir,
              );
            },
            { mode, dir },
          );
          const list = page.locator('[data-slot="tabs-list"]');
          await list.waitFor();
          // Reuse the mounted component: expansion must remove the menu, contraction restore it.
          for (const width of [390, 1280, 390]) {
            await page.setViewportSize({ width, height: 900 });
            await expect
              .poll(() => page.locator(".ui-tabs-overflow").count())
              .toBe(width === 390 ? 1 : 0);
            // The overflow hook settles in a ResizeObserver callback after the menu button
            // appears, so wait for the steady state before reading the whole geometry.
            const measure = () =>
              list.evaluate((element) => {
                const box = element.getBoundingClientRect();
                return [...element.querySelectorAll<HTMLElement>('[data-slot="tabs-trigger"]')].map(
                  (tab) => {
                    const rect = tab.getBoundingClientRect();
                    return {
                      label: tab.textContent,
                      painted: getComputedStyle(tab).opacity !== "0",
                      inside:
                        rect.left >= box.left - 1 &&
                        rect.right <= box.right + 1 &&
                        rect.top >= box.top - 1 &&
                        rect.bottom <= box.bottom + 1,
                    };
                  },
                );
              });
            await expect
              .poll(
                async () => (await measure()).filter((tab) => tab.painted && !tab.inside).length,
              )
              .toBe(0);
            const geometry = await measure();
            expect(geometry.filter((tab) => tab.painted && !tab.inside)).toEqual([]);
            if (width === 1280) {
              // Expanding re-shows the hidden triggers in the same ResizeObserver pass that removes
              // the menu button; on a slow runner it can land a frame later, so wait for all 14.
              await expect
                .poll(async () => (await measure()).filter((tab) => tab.painted).length)
                .toBe(14);
            } else {
              await page.locator(".ui-tabs-overflow").click();
              const menu = page.getByRole("menuitem");
              await menu.first().waitFor();
              expect(await menu.allTextContents()).toEqual(
                geometry.filter((tab) => !tab.inside).map((tab) => tab.label),
              );
              expect(await menu.allTextContents()).toEqual(
                geometry.filter((tab) => !tab.painted).map((tab) => tab.label),
              );
              await page.keyboard.press("Escape");
            }
          }
        } finally {
          await page.close();
        }
      });
    });
  }
}
