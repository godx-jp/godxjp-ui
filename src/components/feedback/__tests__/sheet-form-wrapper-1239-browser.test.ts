import { TextEncoder as NodeTextEncoder } from "node:util";

import { chromium, type Browser, type Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { compileRealCss } from "../../data-entry/__tests__/compile-real-css";

/**
 * gh#1239 in Chromium, against the real stylesheet. `SheetBody` scrolls because it is a flex child
 * of `SheetContent` (`flex-1 overflow-y-auto`). The usual form shape puts a `<form>` between them:
 *
 *     <SheetContent><SheetHeader/><form><SheetBody/><SheetFooter/></form></SheetContent>
 *
 * A plain block `<form>` breaks that chain: the body grows to its content and the footer, which
 * holds the submit button, lands below the viewport. Dialog never had this, because dialog-body
 * carries its own max-height. Asserted: with the wrapper the footer stays on screen, the body is
 * the thing that scrolls, and the layout matches the same sheet without the wrapper.
 */
const ROOT = process.cwd();
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetBody, SheetFooter,
} from "./src/components/feedback/sheet";
const wrapped = new URLSearchParams(location.search).get("form") === "1";
const fields = Array.from({ length: 30 }, (_, i) => (
  <p key={i} style={{ margin: 0, height: 32 }}>Field {i + 1}</p>
));
const body = <SheetBody>{fields}</SheetBody>;
const footer = <SheetFooter><button type="submit">Save</button></SheetFooter>;
createRoot(document.getElementById("root")).render(
  <AppProvider defaultLocale="en" persist={false}>
    <Sheet defaultOpen>
      <SheetContent>
        <SheetHeader><SheetTitle>Correction</SheetTitle></SheetHeader>
        {wrapped ? <form onSubmit={(e) => e.preventDefault()}>{body}{footer}</form> : <>{body}{footer}</>}
      </SheetContent>
    </Sheet>
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

async function measure(form: boolean) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 700 } });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(`about:blank?form=${form ? 1 : 0}`);
  await page.setContent(
    `<!doctype html><html lang="en"><head><style>${css}</style></head><body><div id="root"></div><script>${js}</script></body></html>`,
  );
  await page.locator('[data-slot="sheet-footer"] button').waitFor();
  const m = await page.evaluate(() => {
    const body = document.querySelector('[data-slot="sheet-body"]') as HTMLElement;
    const footer = document.querySelector('[data-slot="sheet-footer"]')!.getBoundingClientRect();
    const panel = document.querySelector('[data-slot="sheet-content"]')!.getBoundingClientRect();
    return {
      footerBottom: Math.round(footer.bottom),
      footerTop: Math.round(footer.top),
      panelBottom: Math.round(panel.bottom),
      bodyScrolls: body.scrollHeight > body.clientHeight + 1,
      bodyHeight: Math.round(body.getBoundingClientRect().height),
      viewport: window.innerHeight,
    };
  });
  await page.close();
  return m;
}

describe("a <form> between SheetContent and SheetBody/SheetFooter keeps the body scrolling (gh#1239)", () => {
  it("keeps the footer on screen and scrolls the body, exactly like the unwrapped sheet", async () => {
    const plain = await measure(false);
    const wrapped = await measure(true);
    // The control: without the wrapper the sheet already behaves.
    expect(plain.bodyScrolls).toBe(true);
    expect(plain.footerBottom).toBeLessThanOrEqual(plain.viewport);
    // The defect: with the wrapper the footer was pushed below the 700px viewport.
    expect(wrapped.footerBottom, JSON.stringify(wrapped)).toBeLessThanOrEqual(wrapped.viewport);
    expect(wrapped.bodyScrolls).toBe(true);
    // And the wrapper is invisible to the layout: same footer and body geometry.
    expect(wrapped.footerTop).toBe(plain.footerTop);
    expect(wrapped.bodyHeight).toBe(plain.bodyHeight);
  }, 60_000);
});
