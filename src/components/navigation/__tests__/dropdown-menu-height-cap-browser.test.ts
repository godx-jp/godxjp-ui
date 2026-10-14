import { TextEncoder as NodeTextEncoder } from "node:util";

import { chromium, type Browser } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { compileRealCss } from "../../data-entry/__tests__/compile-real-css";

/**
 * DropdownMenu height cap in Chromium, against the real stylesheet (gh#1316). A consumer review
 * reported a long ⋯ menu at 844×390 "cut by the viewport, items unreachable". The CSS cap read
 * `--radix-dropdown-menu-content-available-height`, which nothing sets since the menu moved to
 * react-aria — but react-aria's Popover writes its computed `max-height` inline, and that is what
 * clamps the panel (its bottom lands at viewport − 12px container padding). This pins the
 * recovery path the review could not see: the panel ends inside the viewport, scrolls inside
 * itself, and its last item can be scrolled to and chosen. GREEN on the old CSS too — the dead
 * variable was harmless; `no-dead-radix-vars-1316.test.ts` is the red-on-old check for it.
 */
const ROOT = process.cwd();
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from "./src/components/navigation/dropdown-menu";
const q = new URLSearchParams(location.search);
const n = Number(q.get("n") || 30);
const top = Number(q.get("top") || 0);
const tall = q.get("tall") === "1";
function App() {
  const [picked, setPicked] = React.useState("");
  return (
    <AppProvider defaultLocale="en" persist={false}>
      <div style={{ padding: 8, paddingTop: 8 + top, display: "flex", justifyContent: "flex-end" }}>
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>More</DropdownMenuTrigger>
          <DropdownMenuContent>
            {Array.from({ length: n }, (_, i) => (
              <DropdownMenuItem key={i} onSelect={() => setPicked("Item " + (i + 1))}>
                Item {i + 1}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <output id="picked">{picked}</output>
      {tall ? <div style={{ height: 3000 }} /> : null}
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

async function measure(width: number, height: number, n: number, query = "") {
  const mobile = query.includes("mobile");
  const page = await browser.newPage({
    viewport: { width, height },
    isMobile: mobile,
    hasTouch: mobile,
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(`about:blank?n=${n}${query}`);
  await page.setContent(
    `<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>${css}</style></head><body><div id="root"></div><script>${js}</script></body></html>`,
  );
  await page.locator('[role="menuitem"]').first().waitFor();
  await page.waitForTimeout(100);
  const m = await page.evaluate(() => {
    const panel = document.querySelector('[data-slot="dropdown-menu-content"]') as HTMLElement;
    const r = panel.getBoundingClientRect();
    return {
      top: Math.round(r.top),
      bottom: Math.round(r.bottom),
      scrollable: panel.scrollHeight > panel.clientHeight + 1,
      maxHeight: getComputedStyle(panel).maxHeight,
      inlineMaxHeight: panel.style.maxHeight,
    };
  });
  const last = page.locator('[role="menuitem"]').last();
  await last.scrollIntoViewIfNeeded({ timeout: 2000 }).catch(() => undefined);
  const lastBox = await last.boundingBox();
  await last.click({ timeout: 2000 }).catch(() => undefined);
  const picked = await page.locator("#picked").textContent();
  await page.close();
  return { ...m, lastBottom: lastBox ? Math.round(lastBox.y + lastBox.height) : null, picked };
}

// `top` puts the trigger where a page header's ⋯ sits; `tall` makes the document scroll; `mobile`
// is the consumer's phone condition (isMobile + hasTouch, with the meta viewport above).
describe("DropdownMenu caps its height to the viewport (gh#1316)", { timeout: 60_000 }, () => {
  for (const [w, h, n, query] of [
    [844, 390, 30, ""],
    [390, 844, 60, ""],
    [844, 390, 30, "&top=120&tall=1&mobile"],
    [390, 844, 60, "&top=160&tall=1&mobile"],
  ] as const) {
    it(`${w}×${h}${query}: a long menu ends inside the viewport and its last item is reachable`, async () => {
      const m = await measure(w, h, n, query);
      const why = JSON.stringify(m);
      expect(m.bottom, why).toBeLessThanOrEqual(h);
      expect(m.scrollable, why).toBe(true);
      expect(m.lastBottom, why).not.toBeNull();
      expect(m.lastBottom!, why).toBeLessThanOrEqual(h);
      expect(m.picked, why).toBe(`Item ${n}`);
    });
  }

  it("a short menu is not capped into a scroller", async () => {
    const m = await measure(844, 390, 4);
    expect(m.scrollable, JSON.stringify(m)).toBe(false);
  });
});
