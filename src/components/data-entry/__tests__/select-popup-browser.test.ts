import { TextEncoder as NodeTextEncoder } from "node:util";

import { chromium, type Browser } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { compileRealCss } from "./compile-real-css";

/**
 * Select mode="tags" / "multiple" popup in Chromium. godx-task reported four defects measured with
 * computed styles: a second focus ring on the search field, the selected row painted like the
 * active row, a list with no max height, and records-list dividers in a picker.
 */
const ROOT = process.cwd();
const OPTIONS = Array.from({ length: 30 }, (_, i) => `{ value: "o${i}", label: "Option ${i}" }`);
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { Select } from "./src/components/data-entry";
const options = [${OPTIONS.join(",")}];
createRoot(document.getElementById("root")).render(
  <AppProvider defaultLocale="en" persist={false}>
    <div style={{ padding: 16, width: 320 }}>
      <Select aria-label="Tags" mode="tags" options={options} defaultValue={["o0"]} />
    </div>
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
  const tokens = [...new Set(js.match(/[\w:./[\]()%#!-]+/g) ?? [])].join(" ");
  css = await compileRealCss(`<div class="${tokens.replaceAll('"', "")}"></div>`);
  browser = await chromium.launch({ headless: true });
}, 180_000);

afterAll(async () => {
  await browser?.close();
});

describe("Select tags popup (Chromium)", { timeout: 40_000 }, () => {
  it("reads as one picker: one ring, check marks for selection, a capped list, compact rows", async () => {
    const page = await browser.newPage({ viewport: { width: 800, height: 900 } });
    await page.setContent(
      `<!doctype html><html lang="en"><head><style>${css}</style></head><body><div id="root"></div><script>${js}</script></body></html>`,
    );
    const trigger = page.getByRole("combobox", { name: "Tags" });
    await trigger.focus();
    await page.keyboard.press("ArrowDown");
    const search = page.locator(".ui-search-select-search-input");
    await search.waitFor();
    await expect.poll(() => search.evaluate((el) => el === document.activeElement)).toBe(true);
    // Move the active row off the selected one: row 0 is selected, row 1 becomes active.
    await page.keyboard.press("ArrowDown");

    const m = await page.evaluate(() => {
      const search = document.querySelector(".ui-search-select-search-input")!;
      const list = document.querySelector<HTMLElement>(".ui-search-select-list")!;
      const rows = [...list.querySelectorAll<HTMLElement>(".ui-command-item")];
      const selected = rows.find((r) => r.getAttribute("aria-selected") === "true")!;
      const plain = rows.find((r) => r.getAttribute("aria-selected") !== "true" && r !== rows[1])!;
      const style = (el: Element) => getComputedStyle(el);
      return {
        searchOutline:
          style(search).outlineStyle === "none" ? 0 : parseFloat(style(search).outlineWidth),
        listMax: style(list).maxBlockSize,
        listScrolls: list.scrollHeight > list.clientHeight,
        listBottom: list.getBoundingClientRect().bottom,
        selectedBg: style(selected).backgroundColor,
        plainBg: style(plain).backgroundColor,
        selectedHasIcon: !!selected.querySelector('[data-slot="search-select-selected-icon"] svg'),
        rowHeight: plain.getBoundingClientRect().height,
        rowBorder: style(plain).borderBlockEndWidth,
        split: document.querySelector(".ui-search-select-command")!.hasAttribute("data-split"),
      };
    });
    // 1. The trigger keeps the only ring; the search is the panel's header line.
    expect(m.searchOutline).toBe(0);
    // 2. Selection is the check mark; the background belongs to the active (pointer/keyboard) row.
    expect(m.selectedHasIcon).toBe(true);
    expect(m.selectedBg).toBe(m.plainBg);
    // 3. The list is capped and scrolls inside the panel, on screen.
    expect(m.listMax).not.toBe("none");
    expect(m.listScrolls).toBe(true);
    expect(m.listBottom).toBeLessThanOrEqual(900);
    // 4. Compact picker rows, no dividers.
    expect(m.split).toBe(false);
    expect(m.rowBorder).toBe("0px");
    expect(m.rowHeight).toBeLessThanOrEqual(36);
    await page.close();
  });
});
