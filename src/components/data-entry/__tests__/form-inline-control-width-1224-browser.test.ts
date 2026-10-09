import { TextEncoder as NodeTextEncoder } from "node:util";

import { chromium, type Browser } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { compileRealCss } from "./compile-real-css";

/**
 * gh#1224 — in `<Form layout="inline">` a FormField's `controlWidth` is the control's width. It
 * used to be only a cap, so an inline Select hugged its own text (142px empty, 219px with a value,
 * against 16rem) and the row jumped on pick. godx-content2#7 (History → Compare selects).
 */
const ROOT = process.cwd();
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { Form, FormField, Select } from "./src/components/data-entry";
const opts = [{ value: "a", label: "Revision 12 — 2026-10-01" }, { value: "b", label: "Revision 13" }];
function App() {
  return (
    <AppProvider defaultLocale="en" persist={false}>
      <div style={{ width: 1100 }}>
        <Form layout="inline">
          <FormField id="empty" label="From" controlWidth="16rem"><Select id="empty" placeholder="Pick a revision" options={opts} /></FormField>
          <FormField id="filled" label="To" controlWidth="16rem"><Select id="filled" placeholder="Pick a revision" options={opts} value="a" onValueChange={() => {}} /></FormField>
          <FormField id="hug" label="Hug"><Select id="hug" placeholder="Pick" options={opts} /></FormField>
        </Form>
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

describe("inline FormField controlWidth (Chromium, gh#1224)", () => {
  it("is the control's width in an inline row, whatever the Select shows; unset, the field hugs", async () => {
    const page = await browser.newPage({ viewport: { width: 1200, height: 600 } });
    await page.setContent(
      `<!doctype html><html lang="en"><head><style>${css}</style></head><body><div id="root"></div><script>${js}</script></body></html>`,
    );
    await page.locator("#hug").waitFor();
    const width = (id: string) =>
      page.evaluate((id) => document.getElementById(id)!.getBoundingClientRect().width, id);
    // 16rem at the 16px root.
    expect(Math.abs((await width("empty")) - 256), "empty Select").toBeLessThanOrEqual(1);
    expect(Math.abs((await width("filled")) - 256), "Select with a value").toBeLessThanOrEqual(1);
    // No controlWidth: the inline field still hugs its content.
    expect(await width("hug")).toBeLessThan(256);
    await page.close();
  });
});
