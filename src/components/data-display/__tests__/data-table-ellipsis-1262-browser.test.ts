import { TextEncoder as NodeTextEncoder } from "node:util";

import { chromium, type Browser, type Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { compileRealCss } from "../../data-entry/__tests__/compile-real-css";

/**
 * gh#1262 in Chromium, against the real stylesheet — DataTable `ellipsis` keeps a truncated
 * cell's text reachable:
 *
 *   1. a RENDERED truncated cell gets a `title` from its text (antd `ellipsis.showTitle`);
 *   2. the header of an ellipsis column wraps instead of truncating;
 *   3. a truncated cell is a tab stop whose focus unfolds the text (PatternFly `Truncate`) —
 *      and only a truncated one, and never one that already holds a focusable element.
 */
const ROOT = process.cwd();
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { DataTable } from "./src/components/data-display/data-table";
import { Text } from "./src/components/general/typography";
import { Badge } from "./src/components/data-display/badge";
const long = "A very long issue subject that cannot possibly fit in a narrow column";
const data = [
  { id: "1", subject: long, plain: long, link: long, short: "OK" },
];
const columns = [
  { key: "subject", header: "Subject rendered by the app", width: "140px", ellipsis: true,
    render: (row) => <strong>{row.subject}</strong> },
  { key: "plain", header: "Plain text column with a long heading", width: "140px", ellipsis: true },
  { key: "link", header: "Link", width: "140px", ellipsis: true,
    render: (row) => <a href="#x">{row.link}</a> },
  { key: "short", header: "Short", width: "140px", ellipsis: true, render: (row) => <em>{row.short}</em> },
  { key: "badged", header: "Badged", width: "180px", ellipsis: true,
    render: (row) => (
      <span style={{ display: "flex", gap: 4, alignItems: "center", minWidth: 0 }}>
        <Text truncate><a href="#s">{row.subject}</a></Text>
        <Badge>AI翻訳</Badge>
      </span>
    ) },
];
function App() {
  const [wide, setWide] = React.useState(false);
  window.__widen = () => setWide(true);
  return (
    <AppProvider defaultLocale="en" persist={false}>
      <div id="ready" style={{ width: 640 }}>
        <DataTable rowKey="id" data={data} columns={wide ? columns.map((c) => ({ ...c, width: "1200px" })) : columns} />
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

async function open(): Promise<Page> {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setContent(
    `<!doctype html><html lang="en"><head><style>${css}</style></head><body><div id="root"></div><script>${js}</script></body></html>`,
  );
  await page.locator("tbody td").first().waitFor();
  // The truncation is measured after layout settles (effect + ResizeObserver).
  await page.locator('tbody td[data-column-key="subject"][data-truncated]').waitFor();
  return page;
}

const cell = (page: Page, key: string) =>
  page.locator(`tbody td[data-column-key="${key}"]`).evaluate((el) => ({
    title: el.getAttribute("title"),
    tabindex: el.getAttribute("tabindex"),
    truncated: el.hasAttribute("data-truncated"),
    overflow: el.scrollWidth - el.clientWidth,
  }));

describe("DataTable ellipsis keeps truncated text reachable (gh#1262)", { timeout: 60_000 }, () => {
  it("a rendered truncated cell gets a title from its text and a tab stop", async () => {
    const page = await open();
    const c = await cell(page, "subject");
    expect(c.overflow).toBeGreaterThan(0);
    expect(c).toMatchObject({
      truncated: true,
      tabindex: "0",
      title: "A very long issue subject that cannot possibly fit in a narrow column",
    });
    await page.close();
  });

  it("a plain cell keeps its own title and also becomes a tab stop", async () => {
    const page = await open();
    const c = await cell(page, "plain");
    expect(c).toMatchObject({ truncated: true, tabindex: "0" });
    expect(c.title).toContain("A very long issue subject");
    await page.close();
  });

  it("a cell that holds a link gets the title but no second tab stop", async () => {
    const page = await open();
    const c = await cell(page, "link");
    expect(c.truncated).toBe(true);
    expect(c.tabindex).toBeNull();
    await page.close();
  });

  it("a cell that fits gets neither", async () => {
    const page = await open();
    expect(await cell(page, "short")).toMatchObject({
      truncated: false,
      tabindex: null,
      title: null,
    });
    await page.close();
  });

  it("keyboard focus unfolds the truncated text", async () => {
    const page = await open();
    const td = page.locator('tbody td[data-column-key="subject"]');
    // Tab until the cell has focus (the scroll region may take one stop first).
    for (let i = 0; i < 8; i += 1) {
      await page.keyboard.press("Tab");
      if (await td.evaluate((el) => el === document.activeElement)) break;
    }
    const focused = await td.evaluate((el) => ({
      active: el === document.activeElement,
      whiteSpace: getComputedStyle(el).whiteSpace,
      overflow: el.scrollWidth - el.clientWidth,
      outline: getComputedStyle(el).outlineStyle,
    }));
    expect(focused).toMatchObject({ active: true, whiteSpace: "normal", overflow: 0 });
    expect(focused.outline).not.toBe("none");
    // The unfolded cell keeps its tab stop while focused (it measures as fitting then), and folds
    // back to a truncated tab stop once focus leaves.
    await page.waitForTimeout(100);
    expect(await td.evaluate((el) => el === document.activeElement)).toBe(true);
    await page.keyboard.press("Tab");
    await page.waitForTimeout(100);
    expect(await cell(page, "subject")).toMatchObject({ truncated: true, tabindex: "0" });
    await page.close();
  });

  it("the header of an ellipsis column wraps instead of truncating", async () => {
    const page = await open();
    const head = await page.locator('th[data-column-key="plain"]').evaluate((el) => ({
      ellipsis: el.classList.contains("ui-data-table-ellipsis"),
      wrap: el.hasAttribute("data-wrap"),
      overflow: el.scrollWidth - el.clientWidth,
    }));
    expect(head).toEqual({ ellipsis: false, wrap: true, overflow: 0 });
    await page.close();
  });

  it("a cell that stops being truncated loses the title it was given and its tab stop", async () => {
    const page = await open();
    await page.evaluate(() => (window as unknown as { __widen: () => void }).__widen());
    await page.waitForFunction(
      () =>
        !document
          .querySelector('tbody td[data-column-key="subject"]')!
          .hasAttribute("data-truncated"),
    );
    expect(await cell(page, "subject")).toMatchObject({
      truncated: false,
      tabindex: null,
      title: null,
    });
    await page.close();
  });

  it("a focused LINK inside a truncated cell unfolds the cell too (gh#1267)", async () => {
    const page = await open();
    const link = page.locator('tbody td[data-column-key="link"] a');
    for (let i = 0; i < 10; i += 1) {
      await page.keyboard.press("Tab");
      if (await link.evaluate((el) => el === document.activeElement)) break;
    }
    const state = await page.locator('tbody td[data-column-key="link"]').evaluate((el) => ({
      linkFocused: el.querySelector("a") === document.activeElement,
      whiteSpace: getComputedStyle(el).whiteSpace,
      overflow: el.scrollWidth - el.clientWidth,
      truncated: el.hasAttribute("data-truncated"),
    }));
    expect(state).toEqual({
      linkFocused: true,
      whiteSpace: "normal",
      overflow: 0,
      truncated: true,
    });
    await page.close();
  });

  it("a Text truncating INSIDE the cell beside a badge marks the cell, titled with its own text (gh#1269)", async () => {
    const page = await open();
    const c = await page.locator('tbody td[data-column-key="badged"]').evaluate((el) => ({
      cellOverflow: el.scrollWidth - el.clientWidth,
      textOverflow: (() => {
        const t = el.querySelector<HTMLElement>("[data-truncate]")!;
        return t.scrollWidth - t.clientWidth;
      })(),
      truncated: el.hasAttribute("data-truncated"),
      title: el.getAttribute("title"),
    }));
    // The reported shape: the CELL fits, the Text inside it is cut.
    expect(c.cellOverflow).toBeLessThanOrEqual(1);
    expect(c.textOverflow).toBeGreaterThan(1);
    expect(c.truncated).toBe(true);
    expect(c.title).toBe("A very long issue subject that cannot possibly fit in a narrow column");
    // Keyboard focus on the link unfolds the Text too.
    const link = page.locator('tbody td[data-column-key="badged"] a');
    for (let i = 0; i < 12; i += 1) {
      await page.keyboard.press("Tab");
      if (await link.evaluate((el) => el === document.activeElement)) break;
    }
    const unfolded = await page
      .locator('tbody td[data-column-key="badged"] [data-truncate]')
      .evaluate((el) => ({
        focused: el.querySelector("a") === document.activeElement,
        whiteSpace: getComputedStyle(el).whiteSpace,
      }));
    expect(unfolded).toEqual({ focused: true, whiteSpace: "normal" });
    await page.close();
  });
});
