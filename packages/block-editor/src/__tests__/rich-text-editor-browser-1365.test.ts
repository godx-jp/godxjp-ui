import { join } from "node:path";
import { TextEncoder as NodeTextEncoder } from "node:util";

import { chromium, type Browser, type Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { compileRealCss } from "../../../../src/components/data-entry/__tests__/compile-real-css";

/**
 * gh#1365 — TranslatableRichText in a real browser, CONTROLLED: every onValueChange goes into
 * React state and comes back as `value`, the loop TempoFast's forms run. jsdom has no text input
 * into contenteditable and no IME, so typing and a Japanese composition are driven here through
 * Chromium's own input pipeline (CDP `Input.imeSetComposition` / `Input.insertText`).
 */
const ROOT = process.cwd();
const ALIAS = {
  "@godxjp/markdown/codec": join(ROOT, "packages/markdown/src/codec/index.ts"),
  "@godxjp/markdown": join(ROOT, "packages/markdown/src/index.ts"),
  "@godxjp/ui/i18n": join(ROOT, "src/i18n/index.ts"),
  "@godxjp/ui/data-display": join(ROOT, "src/components/data-display/index.ts"),
  "@godxjp/ui/data-entry": join(ROOT, "src/components/data-entry/index.ts"),
  "@godxjp/ui/general": join(ROOT, "src/components/general/index.ts"),
  "@godxjp/ui/navigation": join(ROOT, "src/components/navigation/index.ts"),
  "@godxjp/ui/layout": join(ROOT, "src/components/layout/index.ts"),
};

const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { FormField } from "./src/components/data-entry/form-field";
import { TranslatableRichText } from "./packages/block-editor/src";

window.__changes = [];
function App() {
  const [value, setValue] = React.useState({ ja: "<p>醤油</p>", en: "<p>Soy</p>" });
  window.__value = value;
  return (
    <AppProvider defaultLocale="ja" fallbackLocale="ja" persist={false} contentLocales={["ja", "en", "vi"]}>
      <div style={{ padding: 16, maxWidth: 720 }}>
        <FormField label="説明">
          <TranslatableRichText
            value={value}
            onValueChange={(next) => { window.__changes.push(next); setValue(next); }}
          />
        </FormField>
      </div>
    </AppProvider>
  );
}
createRoot(document.getElementById("root")).render(<App />);
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
      alias: ALIAS,
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

async function open() {
  const page = await browser.newPage({ viewport: { width: 1024, height: 800 } });
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await page.setContent(
    `<!doctype html><html lang="ja"><head><style>${css}</style></head><body><div id="root"></div><script>${js}</script></body></html>`,
  );
  await page.waitForSelector(".ui-rich-text-editor .ProseMirror");
  return { page, errors };
}

const current = (page: Page) =>
  page.evaluate(() => (window as unknown as { __value: Record<string, string> }).__value);
const changes = (page: Page) =>
  page.evaluate(() => (window as unknown as { __changes: unknown[] }).__changes.length);
const textbox = (page: Page) => page.getByRole("textbox", { name: /説明/ });

describe("TranslatableRichText (Chromium, gh#1365)", { timeout: 40_000 }, () => {
  it("a controlled Japanese IME composition is never reset and commits once", async () => {
    const { page, errors } = await open();
    await textbox(page).click();
    await page.keyboard.press("End");
    const cdp = await page.context().newCDPSession(page);
    await cdp.send("Input.imeSetComposition", { text: "らーめん", selectionStart: 4, selectionEnd: 4 });
    await cdp.send("Input.imeSetComposition", { text: "ラーメン", selectionStart: 4, selectionEnd: 4 });
    // Mid-composition the controlled loop has re-rendered; the composing text is still there.
    await expect.poll(() => textbox(page).textContent()).toBe("醤油ラーメン");
    await cdp.send("Input.insertText", { text: "ラーメン" });
    await expect.poll(async () => (await current(page)).ja).toBe("<p>醤油ラーメン</p>");
    expect(await textbox(page).textContent()).toBe("醤油ラーメン");
    expect((await current(page)).en).toBe("<p>Soy</p>");
    expect(errors).toEqual([]);
    await page.close();
  });

  it("typing, then switching tabs swaps the HTML without an extra onValueChange", async () => {
    const { page, errors } = await open();
    await textbox(page).click();
    await page.keyboard.press("End");
    await page.keyboard.type(" sauce");
    await expect.poll(async () => (await current(page)).ja).toBe("<p>醤油 sauce</p>");
    const before = await changes(page);
    await page.getByRole("tab", { name: "英語" }).click();
    await expect.poll(() => textbox(page).textContent()).toBe("Soy");
    expect(await textbox(page).getAttribute("lang")).toBe("en");
    await page.getByRole("tab", { name: "ベトナム語" }).click();
    await expect.poll(() => textbox(page).getAttribute("aria-placeholder")).toBe("醤油 sauce");
    expect(await changes(page)).toBe(before);
    expect(errors).toEqual([]);
    await page.close();
  });
});
