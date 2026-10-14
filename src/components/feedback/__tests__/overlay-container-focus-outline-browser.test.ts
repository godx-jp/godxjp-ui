import { TextEncoder as NodeTextEncoder } from "node:util";

import { chromium, type Browser } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { compileRealCss } from "../../data-entry/__tests__/compile-real-css";

/**
 * An opened Sheet showed Chrome's own focus ring — `2px auto rgb(0, 95, 204)` — along its panel
 * edge at 390 (independent review of godx-content, round 3). react-aria's Dialog moves focus to
 * the dialog CONTAINER on open; `DialogContent` carried `outline-none` and `SheetContent` did not,
 * so the panel fell back to the UA mark, a colour that is no token of this system. The container
 * is not a control (focus-ring.css: containers are not on the list), so it paints nothing.
 *
 * Opened from the keyboard, so the programmatic focus that follows is `:focus-visible` — the
 * state in which the UA ring paints.
 */
const ROOT = process.cwd();
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetBody } from "./src/components/feedback/sheet";
import { DialogRoot, DialogTrigger, DialogContent, DialogHeader, DialogBody } from "./src/components/feedback/dialog";
import { Text } from "./src/components/general/typography";
const kind = new URLSearchParams(location.search).get("kind");
createRoot(document.getElementById("root")).render(
  <AppProvider defaultLocale="en" persist={false}>
    {kind === "dialog" ? (
      <DialogRoot><DialogTrigger id="open">Open</DialogTrigger><DialogContent><DialogHeader title="Settings" /><DialogBody><Text>Body</Text></DialogBody></DialogContent></DialogRoot>
    ) : (
      <Sheet><SheetTrigger id="open">Open</SheetTrigger><SheetContent><SheetHeader title="Page settings" /><SheetBody><Text>Body</Text></SheetBody></SheetContent></Sheet>
    )}
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

describe("an opened Sheet/Dialog container paints no UA focus ring (390)", () => {
  for (const kind of ["sheet", "dialog"] as const) {
    it(`${kind}: the focused container has no outline, never rgb(0, 95, 204)`, async () => {
      const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(`about:blank?kind=${kind}`);
      await page.setContent(
        `<!doctype html><html lang="en"><head><style>${css}</style></head><body><div id="root"></div><script>${js}</script></body></html>`,
      );
      await page.locator("#open").waitFor();
      await page.keyboard.press("Tab");
      await page.keyboard.press("Enter");
      await page.locator(`[data-slot="${kind}-content"]`).waitFor();
      await page.waitForTimeout(100);
      const focus = await page.evaluate((k) => {
        const el = document.activeElement as HTMLElement;
        const cs = getComputedStyle(el);
        return {
          isContainer: el.matches(`[data-slot="${k}-content"]`),
          focusVisible: el.matches(":focus-visible"),
          outlineStyle: cs.outlineStyle,
          outlineColor: cs.outlineColor,
          outlineWidth: cs.outlineWidth,
        };
      }, kind);
      await page.close();
      // The precondition the defect needs: focus sits on the container, keyboard-visible.
      expect(focus.isContainer, JSON.stringify(focus)).toBe(true);
      expect(focus.focusVisible, JSON.stringify(focus)).toBe(true);
      // `outline-color` keeps the UA's value even under `outline-style: none`, so the colour is
      // only evidence when something is painted.
      const painted = focus.outlineStyle !== "none" && focus.outlineWidth !== "0px";
      expect(painted, JSON.stringify(focus)).toBe(false);
    }, 60_000);
  }
});
