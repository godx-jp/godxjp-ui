import { TextEncoder as NodeTextEncoder } from "node:util";

import { chromium, type Browser, type Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { compileRealCss } from "../../data-entry/__tests__/compile-real-css";

/**
 * TopbarSearch in Chromium (ADR C02): the search text area is never under 8ch. Below the compact
 * step the field folds to a named cell that opens it across the bar; Escape and the close cell
 * fold it back with focus on the cell. Measured in the bar a consumer ships: brand, a locale cell
 * and an account cell beside the search.
 */
const ROOT = process.cwd();
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { AppShell, Topbar, TopbarItem, TopbarSearch } from "./src/components/layout";
import { Avatar, AvatarFallback } from "./src/components/data-display";
import { AppSettingPicker } from "./src/components/navigation";

function App() {
  return (
    <AppProvider defaultLocale="en" persist={false}>
      <AppShell
        topbarSpan="full"
        logo={<a href="/">Product manual</a>}
        sidebar={<nav>Pages</nav>}
        topbar={
          <Topbar
            end={
              <>
                <TopbarSearch ariaLabel="Search this collection" placeholder="Search this collection" />
                <AppSettingPicker kind="locale" appearance="bar" />
                <TopbarItem aria-label="Account" labelHideBelow="sm" icon={<Avatar><AvatarFallback>FA</AvatarFallback></Avatar>}>Famgia Info</TopbarItem>
              </>
            }
          />
        }
      >
        <button type="button" id="after">after</button>
      </AppShell>
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
  const tokens = [...new Set(js.match(/[\w:./[\]()%#!-]+/g) ?? [])].join(" ");
  css = await compileRealCss(`<div class="${tokens.replaceAll('"', "")}"></div>`);
  browser = await chromium.launch({ headless: true });
}, 180_000);

afterAll(async () => {
  await browser?.close();
});

async function open(width: number) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await page.setContent(
    `<!doctype html><html lang="en"><head><style>${css} body{margin:0}</style></head><body><div id="root"></div><script>${js}</script></body></html>`,
  );
  await page.waitForSelector(".ui-topbar-search");
  return { page, errors };
}

/** The search geometry the ADR predicate reads: text area after padding, in units of the field's own 1ch. */
const measure = (page: Page) =>
  page.evaluate(() => {
    const visible = (el: Element | null) => {
      if (!el) return false;
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== "hidden";
    };
    const input = document.querySelector<HTMLInputElement>(".ui-topbar-search input")!;
    const cs = getComputedStyle(input);
    const probe = document.createElement("span");
    probe.textContent = "00000000";
    probe.style.cssText = `position:absolute;visibility:hidden;white-space:pre;font:${cs.font};letter-spacing:${cs.letterSpacing}`;
    document.body.append(probe);
    const eightCh = probe.getBoundingClientRect().width;
    probe.remove();
    const textArea =
      input.clientWidth - parseFloat(cs.paddingInlineStart) - parseFloat(cs.paddingInlineEnd);
    const trigger = document.querySelector<HTMLElement>(".ui-topbar-search-trigger")!;
    const t = trigger.getBoundingClientRect();
    const panel = document.querySelector(".ui-topbar-search-panel")!.getBoundingClientRect();
    const bar = document.querySelector(".app-topbar")!.getBoundingClientRect();
    return {
      inputVisible: visible(input),
      textAreaCh: (textArea / eightCh) * 8,
      triggerVisible: visible(trigger),
      triggerName: trigger.getAttribute("aria-label"),
      triggerExpanded: trigger.getAttribute("aria-expanded"),
      trigger: { w: t.width, h: t.height },
      panel: { left: panel.left, right: panel.right },
      bar: { left: bar.left, right: bar.right },
      focused:
        document.activeElement === input
          ? "input"
          : document.activeElement === trigger
            ? "trigger"
            : document.activeElement?.id || document.activeElement?.tagName,
      overflow: document.documentElement.scrollWidth - window.innerWidth,
    };
  });

describe("TopbarSearch (Chromium, ADR C02)", { timeout: 40_000 }, () => {
  it("at 1280 is an inline field whose text area holds at least 8ch, with no search cell", async () => {
    const { page, errors } = await open(1280);
    const m = await measure(page);
    expect(m.inputVisible).toBe(true);
    expect(m.triggerVisible).toBe(false);
    expect(m.textAreaCh).toBeGreaterThanOrEqual(8);
    expect(m.overflow).toBeLessThanOrEqual(1.5);
    expect(errors).toEqual([]);
    await page.close();
  });

  it("at 390 folds to a named cell that opens a full-bar field of at least 8ch; Escape returns focus", async () => {
    const { page, errors } = await open(390);
    const closed = await measure(page);
    expect(closed.inputVisible).toBe(false);
    expect(closed.triggerVisible).toBe(true);
    expect(closed.triggerName).toBe("Search this collection");
    expect(closed.triggerExpanded).toBe("false");
    expect(closed.trigger.w).toBeGreaterThanOrEqual(24);
    expect(closed.trigger.h).toBeGreaterThanOrEqual(24);
    expect(closed.overflow).toBeLessThanOrEqual(1.5);

    await page.locator(".ui-topbar-search-trigger").click();
    const opened = await measure(page);
    expect(opened.inputVisible).toBe(true);
    expect(opened.focused).toBe("input");
    expect(opened.triggerExpanded).toBe("true");
    expect(opened.textAreaCh).toBeGreaterThanOrEqual(8);
    // It covers the whole bar row, brand included.
    expect(Math.abs(opened.panel.left - opened.bar.left)).toBeLessThanOrEqual(1.5);
    expect(Math.abs(opened.panel.right - opened.bar.right)).toBeLessThanOrEqual(1.5);

    await page.keyboard.type("guide");
    await page.keyboard.press("Escape");
    const escaped = await measure(page);
    expect(escaped.inputVisible).toBe(false);
    expect(escaped.focused).toBe("trigger");

    // The query survives folding; the close cell folds it the same way.
    await page.keyboard.press("Enter");
    expect(await page.locator(".ui-topbar-search input").inputValue()).toBe("guide");
    await page.getByRole("button", { name: "Close search" }).click();
    expect((await measure(page)).focused).toBe("trigger");

    // Focus leaving the open field folds it, and stays where it went.
    await page.keyboard.press("Enter");
    await page.locator("#after").focus();
    const left = await measure(page);
    expect(left.inputVisible).toBe(false);
    expect(left.focused).toBe("after");
    expect(errors).toEqual([]);
    await page.close();
  });
});
