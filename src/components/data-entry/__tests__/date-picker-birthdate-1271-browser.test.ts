import { TextEncoder as NodeTextEncoder } from "node:util";

import { chromium, type Browser, type Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { compileRealCss } from "./compile-real-css";

/**
 * gh#1271 in Chromium, against the real stylesheet — a birth-date field, measured by a consumer:
 *
 *   (a) the arrows alone put 1999 ~320 clicks away. `captionLayout="dropdown"` must reach it in ONE
 *       select interaction; the dropdown roots must be visible, clear of the ‹ › buttons, and
 *       actually receive the pointer (the nav overlays the caption row); keyboard focus on the
 *       invisible `<select>` must paint the mark on the visible root.
 *   (b) 「2026/10/01」 showed in the field while `onValueChange` never fired. Year-first spellings
 *       commit on blur / Enter; an impossible date does not; char-by-char typing of a two-digit day
 *       is not cut short by an earlier complete-looking prefix.
 */
const ROOT = process.cwd();
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { DatePicker } from "./src/components/data-entry/date-picker";
import { Calendar } from "./src/components/data-entry/calendar";
const kind = new URLSearchParams(location.search).get("kind");
window.__dates = [];
const record = (date) =>
  window.__dates.push(date ? [date.getFullYear(), date.getMonth() + 1, date.getDate()] : null);
const view =
  kind === "range-preserve" ? (
    <div>
      <DatePicker range preserveInvalidOnBlur aria-label="Stay"
        onValueChange={(next) => record(next?.from)} />
    </div>
  ) : kind === "picker-dropdown" ? (
    <DatePicker aria-label="Birth date" captionLayout="dropdown" defaultOpen
      defaultPickerValue={new Date(2026, 8, 1)} onValueChange={record} />
  ) : kind === "calendar-dropdown" || kind === "calendar-dropdown-full" ? (
    <div style={{ width: 720 }}>
      <Calendar mode="single" captionLayout="dropdown" defaultMonth={new Date(2026, 8, 1)}
        {...(kind === "calendar-dropdown-full" ? { width: "full" } : {})} />
    </div>
  ) : (
    <DatePicker aria-label="Birth date" onValueChange={record} />
  );
createRoot(document.getElementById("root")).render(
  <AppProvider defaultLocale="en" persist={false}><div id="ready">{view}</div></AppProvider>,
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

async function open(kind: string): Promise<Page> {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(`about:blank?kind=${kind}`);
  // The focus mark ships switched OFF (`--focus-outline: 0`); a consumer turns it on like this.
  await page.setContent(
    `<!doctype html><html lang="en" data-focus-outline="on"><head><style>${css}</style></head><body><div id="root"></div><script>${js}</script></body></html>`,
  );
  await page.locator("#ready > *").first().waitFor();
  return page;
}

const dates = (page: Page) =>
  page.evaluate(() => (window as unknown as { __dates: unknown[] }).__dates);

/** Every dropdown root: visible, inside no nav button, and the select is what the pointer hits. */
const dropdownGeometry = (page: Page) =>
  page.evaluate(() => {
    const overlap = (a: DOMRect, b: DOMRect) =>
      a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
    const navs = [...document.querySelectorAll<HTMLElement>(".ui-calendar-nav-button")].map((b) =>
      b.getBoundingClientRect(),
    );
    return [...document.querySelectorAll<HTMLElement>(".ui-calendar-dropdown-root")].map((root) => {
      const rect = root.getBoundingClientRect();
      const label = root.querySelector<HTMLElement>(".ui-calendar-caption-label")!;
      const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
      return {
        width: rect.width,
        height: rect.height,
        labelVisible: getComputedStyle(label).visibility === "visible" && label.offsetWidth > 0,
        hitsSelect: hit?.tagName === "SELECT" && root.contains(hit),
        overlapsNav: navs.some((nav) => overlap(rect, nav)),
        navCount: navs.length,
      };
    });
  });

describe("captionLayout=dropdown (gh#1271 a)", { timeout: 60_000 }, () => {
  it("DatePicker reaches 1999 in ONE select interaction", async () => {
    const page = await open("picker-dropdown");
    const years = page.locator("select.ui-calendar-years-dropdown");
    await years.waitFor();
    // Real pointer path first: the select must be what a click lands on, not the nav overlay.
    await years.click({ trial: true });
    await years.selectOption("1999");
    // The VISIBLE label, not the root: the root's text includes every <option>, 1999 among them.
    const label = page
      .locator(".ui-calendar-years-dropdown")
      .locator("xpath=..")
      .locator(".ui-calendar-caption-label");
    await expect.poll(() => label.innerText()).toBe("1999");
    // The grid follows: every in-month day button now names a 1999 date.
    const dayLabels = await page
      .locator(".ui-calendar-day:not(.day-outside) .ui-calendar-day-button")
      .evaluateAll((buttons) => buttons.map((b) => b.getAttribute("aria-label") ?? ""));
    expect(dayLabels.length).toBeGreaterThan(27);
    expect(dayLabels.every((label) => label.includes("1999"))).toBe(true);
    await page
      .locator(".ui-calendar-day:not(.day-outside) .ui-calendar-day-button")
      .first()
      .click();
    expect(await dates(page)).toEqual([[1999, 9, 1]]);
    await page.close();
  });

  for (const kind of ["picker-dropdown", "calendar-dropdown", "calendar-dropdown-full"]) {
    it(`${kind}: both roots are visible, clear of the nav buttons and take the pointer`, async () => {
      const page = await open(kind);
      await page.locator(".ui-calendar-dropdown-root").first().waitFor();
      const roots = await dropdownGeometry(page);
      expect(roots).toHaveLength(2);
      for (const root of roots) {
        expect(root.navCount).toBe(2);
        expect(root.width).toBeGreaterThan(0);
        expect(root.height).toBeGreaterThan(0);
        expect(root.labelVisible).toBe(true);
        expect(root.overlapsNav).toBe(false);
        expect(root.hitsSelect).toBe(true);
      }
      await page.close();
    });
  }

  it("keyboard focus on the invisible select paints the mark on the visible root", async () => {
    const page = await open("calendar-dropdown");
    let reached = false;
    for (let i = 0; i < 12 && !reached; i++) {
      await page.keyboard.press("Tab");
      reached = await page.evaluate(() =>
        Boolean(document.activeElement?.matches(".ui-calendar-years-dropdown")),
      );
    }
    expect(reached).toBe(true);
    const mark = await page.evaluate(() => {
      const root = document.activeElement!.closest<HTMLElement>(".ui-calendar-dropdown-root")!;
      const s = getComputedStyle(root);
      return { style: s.outlineStyle, width: parseFloat(s.outlineWidth) };
    });
    expect(mark.style).toBe("solid");
    expect(mark.width).toBeGreaterThan(0);
    await page.close();
  });
});

describe("year-first typed dates (gh#1271 b)", { timeout: 60_000 }, () => {
  const typeAnd = async (text: string, finish: "Tab" | "Enter") => {
    const page = await open("typing");
    const input = page.locator('input[role="combobox"]');
    await input.click();
    await input.pressSequentially(text);
    await input.press(finish);
    const result = { dates: await dates(page), text: await input.inputValue() };
    await page.close();
    return result;
  };

  for (const [typed, expected] of [
    ["2026/10/01", [2026, 10, 1]],
    ["2026/1/5", [2026, 1, 5]],
    ["2026.10.01", [2026, 10, 1]],
    ["20261001", [2026, 10, 1]],
  ] as const) {
    for (const finish of ["Tab", "Enter"] as const) {
      it(`${typed} + ${finish} fires onValueChange with ${expected.join("-")}`, async () => {
        const { dates: fired, text } = await typeAnd(typed, finish);
        expect(fired.at(-1)).toEqual(expected);
        const iso = expected.map((n, i) => String(n).padStart(i ? 2 : 4, "0")).join("-");
        expect(text).toBe(iso);
      });
    }
  }

  for (const finish of ["Tab", "Enter"] as const) {
    it(`2026/02/30 + ${finish} fires nothing and does not keep showing`, async () => {
      const { dates: fired, text } = await typeAnd("2026/02/30", finish);
      expect(fired).toEqual([]);
      expect(text).toBe("");
    });
  }

  for (const typed of ["2026-10-15", "2026/10/15"]) {
    it(`${typed} typed char by char lands on the 15th, not on an earlier prefix`, async () => {
      const { dates: fired, text } = await typeAnd(typed, "Tab");
      expect(fired.at(-1)).toEqual([2026, 10, 15]);
      expect(text).toBe("2026-10-15");
    });
  }

  it("a loose range edge buffers on blur and commits only after both dates (gh#1476)", async () => {
    const page = await open("range-preserve");
    const from = page.locator("input.ui-month-picker-input").first();
    await from.click();
    await from.pressSequentially("2026/10/01");
    await from.press("Tab");
    expect(await dates(page)).toEqual([]);
    const to = page.locator("input.ui-month-picker-input").nth(1);
    await to.fill("2026/10/15");
    await to.press("Tab");
    expect((await dates(page)).at(-1)).toEqual([2026, 10, 1]);
    await page.close();
  });
});
