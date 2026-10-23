import { TextEncoder as NodeTextEncoder } from "node:util";

import { chromium, type Browser, type Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { compileRealCss } from "../../data-entry/__tests__/compile-real-css";

/**
 * gino-cloud VD-298: an open default Dialog exposed TWO buttons named 「閉じる」 — the library's
 * ✕ inside the dialog, and React Aria's `DismissButton`, a visually hidden 1×1 button RAC's
 * `Modal` renders beside the dialog whenever `ModalOverlay isDismissable` (the default variant).
 * The DismissButton exists for screen-reader users who cannot press Escape; when the visible ✕ is
 * there it is the same action under the same name, announced twice. SheetContent had the same
 * pair (`.ui-sheet-close` + DismissButton).
 *
 * In Chromium against the real stylesheet, because the fix is a `:has()` rule jsdom cannot run.
 * Playwright's role query drops `display: none`, so it counts what a screen reader can reach.
 */
const ROOT = process.cwd();
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { Dialog, DialogBody, DialogContent, DialogClose, DialogFooter, DialogHeader, DialogTitle } from "./src/components/feedback/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./src/components/feedback/sheet";
import { Button } from "./src/components/general/button";
const kind = new URLSearchParams(location.search).get("kind");
function App() {
  const [open, setOpen] = React.useState(true);
  if (kind === "sheet") {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent>
          <SheetHeader><SheetTitle>担当者</SheetTitle></SheetHeader>
        </SheetContent>
      </Sheet>
    );
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        variant={kind === "destructive" ? "destructive" : undefined}
        showCloseButton={kind === "noclose" ? false : undefined}
      >
        <DialogHeader><DialogTitle>解決済みにする</DialogTitle></DialogHeader>
        <DialogBody>証跡</DialogBody>
        <DialogFooter>
          <DialogClose asChild><Button variant="outline">やめる</Button></DialogClose>
          <Button>解決済みにする</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
createRoot(document.getElementById("root")).render(
  <AppProvider defaultLocale="ja" persist={false}>
    <div id="ready"><App /></div>
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

async function openPage(kind: string): Promise<Page> {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(`about:blank?kind=${kind}`);
  await page.setContent(
    `<!doctype html><html lang="ja"><head><style>${css}html,body{margin:0}</style></head><body><div id="root"></div><script>${js}</script></body></html>`,
  );
  await page.locator('[data-slot="dialog-content"], [data-slot="sheet-content"]').waitFor();
  return page;
}

const closeButtons = (page: Page) => page.getByRole("button", { name: "閉じる", exact: true });

describe("one 閉じる per modal overlay (gino VD-298)", { timeout: 60_000 }, () => {
  it("a default Dialog exposes only its ✕, not React Aria's hidden DismissButton as well", async () => {
    const page = await openPage("default");
    await expect(closeButtons(page).count()).resolves.toBe(1);
    // The one left is the visible ✕ inside the dialog.
    await expect(
      page.getByRole("dialog").getByRole("button", { name: "閉じる" }).count(),
    ).resolves.toBe(1);
    await page.close();
  });

  it("a default Sheet exposes only its ✕", async () => {
    const page = await openPage("sheet");
    await expect(closeButtons(page).count()).resolves.toBe(1);
    await page.close();
  });

  it("showCloseButton={false} keeps React Aria's DismissButton, so a screen reader still has one", async () => {
    const page = await openPage("noclose");
    await expect(closeButtons(page).count()).resolves.toBe(1);
    await expect(
      page.getByRole("dialog").getByRole("button", { name: "閉じる" }).count(),
    ).resolves.toBe(0);
    await page.close();
  });

  it("variant=destructive still has neither (no outside dismissal, no ✕)", async () => {
    const page = await openPage("destructive");
    await expect(closeButtons(page).count()).resolves.toBe(0);
    await page.close();
  });

  it("Escape and a click on the backdrop still close the default Dialog", async () => {
    const page = await openPage("default");
    await page.keyboard.press("Escape");
    await page.getByRole("dialog").waitFor({ state: "detached" });
    await page.close();

    const again = await openPage("default");
    await again.mouse.click(8, 8);
    await again.getByRole("dialog").waitFor({ state: "detached" });
    await again.close();
  });
});
