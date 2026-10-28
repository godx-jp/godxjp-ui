import { TextEncoder as NodeTextEncoder } from "node:util";
import { chromium } from "playwright";
import { it, expect } from "vitest";
import { compileRealCss } from "../../components/data-entry/__tests__/compile-real-css";
it("Chromium native chrome follows AppProvider light/dark/system live, dark alias, and print", async () => {
  const realm = { encoder: globalThis.TextEncoder, bytes: globalThis.Uint8Array };
  globalThis.TextEncoder = NodeTextEncoder as unknown as typeof TextEncoder;
  globalThis.Uint8Array = Object.getPrototypeOf(Buffer.prototype).constructor;
  let js: string;
  let css: string;
  try {
    const { build } = await import("esbuild");
    js = (
      await build({
        stdin: {
          contents: `import * as React from 'react'; import {createRoot} from 'react-dom/client'; import {AppProvider} from './src/app/app-provider'; const root=createRoot(document.getElementById('root')); window.setTheme=(theme)=>root.render(<AppProvider theme={theme} persist={false}><div id="ready">Native chrome</div></AppProvider>); window.setTheme('dark');`,
          loader: "tsx",
          resolveDir: process.cwd(),
        },
        bundle: true,
        write: false,
        format: "iife",
        jsx: "automatic",
        define: { "process.env.NODE_ENV": '"production"' },
        logLevel: "silent",
      })
    ).outputFiles![0]!.text;
    css = await compileRealCss("");
  } finally {
    globalThis.TextEncoder = realm.encoder;
    globalThis.Uint8Array = realm.bytes;
  }
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ colorScheme: "light" });
  try {
    await page.setContent(
      `<html><head><style>${css}</style></head><body><div id="root"></div><script>${js}</script></body></html>`,
    );
    await page.locator("#ready").waitFor();
    const scheme = () =>
      page.evaluate(() => getComputedStyle(document.documentElement).colorScheme);
    expect(await scheme()).toBe("dark");
    for (const theme of ["light", "system"]) {
      await page.evaluate(
        (t) => (window as unknown as { setTheme: (s: string) => void }).setTheme(t),
        theme,
      );
      await page.waitForFunction(() => document.documentElement.dataset.theme === "light");
      expect(await scheme()).toBe("light");
    }
    await page.emulateMedia({ colorScheme: "dark" });
    await page.waitForFunction(() => document.documentElement.dataset.theme === "dark");
    expect(await scheme()).toBe("dark");
    await page.emulateMedia({ media: "print" });
    expect(await scheme()).toBe("light");
    await page.emulateMedia({ media: "screen" });
    await page.evaluate(() => {
      document.documentElement.removeAttribute("data-theme");
      document.documentElement.classList.add("dark");
    });
    expect(await scheme()).toBe("dark");
  } finally {
    await browser.close();
  }
}, 60000);
