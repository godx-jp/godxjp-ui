import { TextEncoder as NodeTextEncoder } from "node:util";

import { chromium, type Browser, type Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { compileRealCss } from "../../data-entry/__tests__/compile-real-css";

/**
 * gh#1477 in Chromium. Since the expanded Toaster became the default (gh#1387), an error toast
 * raised while a modal Dialog is open was drawn over the dialog's footer and INTERCEPTED its
 * pointer events: a consumer's real-browser journey could not press Cancel after a 422 until the
 * toast timed out (Playwright: `<li data-sonner-toast …> intercepts pointer events`, 60s, both
 * retries). The footer action must take the click — Playwright `click()` without `force`.
 */
const ROOT = process.cwd();
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { Button } from "./src/components/general/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogBody, Toaster, toast } from "./src/components/feedback";
function App() {
  const [open, setOpen] = React.useState(true);
  const [log, setLog] = React.useState("");
  return (
    <AppProvider defaultLocale="en" persist={false}>
      <Toaster />
      <output id="log">{log}</output>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit role</DialogTitle></DialogHeader>
          <DialogBody>{Array.from({ length: 30 }, (_, i) => <p key={i}>Role field {i}</p>)}</DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setLog("cancel"); setOpen(false); }}>Cancel</Button>
            <Button onClick={() => toast.error("This role code is already in use. Choose another code and save again.", { duration: 60000 })}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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

async function open(width: number, height: number): Promise<Page> {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.setContent(
    `<!doctype html><html lang="en"><head><style>${css}</style></head><body><div id="root"></div><script>${js}</script></body></html>`,
  );
  await page.getByRole("dialog", { name: "Edit role" }).waitFor();
  return page;
}

describe("a toast never takes a modal's clicks (gh#1477)", { timeout: 60_000 }, () => {
  for (const [width, height] of [
    [390, 640],
    [1024, 420],
  ] as const) {
    it(`${width}×${height}: after an error toast, the dialog's Cancel receives the click`, async () => {
      const page = await open(width, height);
      await page.getByRole("button", { name: "Save" }).click();
      const toastEl = page.locator("[data-sonner-toast]");
      await toastEl.waitFor();
      await page.waitForTimeout(500);
      // The geometry this test is about: the toast overlaps a footer action.
      const overlap = await page.evaluate(() => {
        const t = document.querySelector("[data-sonner-toast]")!.getBoundingClientRect();
        return [...document.querySelectorAll('[role="dialog"] button')].some((b) => {
          const r = b.getBoundingClientRect();
          return r.left < t.right && r.right > t.left && r.top < t.bottom && r.bottom > t.top;
        });
      });
      expect(overlap).toBe(true);
      await page.getByRole("button", { name: "Cancel" }).click({ timeout: 3_000 });
      await expect(page.locator("#log").textContent()).resolves.toBe("cancel");
      // The message is still on screen — the fix is about clicks, not about hiding the toast.
      await expect(toastEl.isVisible()).resolves.toBe(true);
      // With the modal gone the toast is an ordinary, clickable surface again (negative case).
      await page.getByRole("dialog").waitFor({ state: "detached" });
      await expect(toastEl.evaluate((el) => getComputedStyle(el).pointerEvents)).resolves.not.toBe(
        "none",
      );
      await page.close();
    });
  }
});
