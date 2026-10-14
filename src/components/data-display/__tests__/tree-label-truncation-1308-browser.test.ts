import { TextEncoder as NodeTextEncoder } from "node:util";

import { chromium, type Browser, type Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { compileRealCss } from "../../data-entry/__tests__/compile-real-css";

/**
 * gh#1308 item 1 — Tree cut a long label with an ellipsis and exposed nothing else: measured in a
 * consumer, "Working at the team: a guide for new members" cut by 137px in a 256px rail. The same
 * treatment ListRow got (gh#1298): while a label is ACTUALLY cut it carries the full text as a
 * `title` (pointer), and the row unfolds the label while it holds keyboard focus (a `title` never
 * opens on focus). A label that fits gets neither, and a consumer's own `title` is kept.
 */
const ROOT = process.cwd();
const LONG = "Working at the team: a guide for new members";
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { Tree } from "./src/components/data-display/tree";
const DATA = [
  { value: "handbook", label: "Handbook" },
  { value: "long", label: ${JSON.stringify(LONG)} },
  { value: "own", label: "A label whose consumer sets a title of their own, also long" },
];
const virtual = new URLSearchParams(location.search).get("virtual") === "1";
createRoot(document.getElementById("root")).render(
  <AppProvider defaultLocale="en" persist={false}>
    <div style={{ width: 256 }}>
      <Tree aria-label="Pages" treeData={DATA} height={virtual ? 400 : undefined}
        titleRender={(node) => node.value === "own" ? <span title="Consumer title">{node.label}</span> : node.label} />
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
  const tokens = [...new Set(js.match(/[\w:./[\]()%#!=-]+/g) ?? [])].join(" ");
  css = await compileRealCss(`<div class="${tokens.replaceAll('"', "")}"></div>`);
  browser = await chromium.launch({ headless: true });
}, 180_000);

afterAll(async () => {
  await browser?.close();
});

async function open(virtual = false): Promise<Page> {
  const page = await browser.newPage({ viewport: { width: 1024, height: 700 } });
  await page.goto(`about:blank?virtual=${virtual ? 1 : 0}`);
  await page.setContent(
    `<!doctype html><html lang="en"><head><style>${css}</style></head><body><div id="root"></div><script>${js}</script></body></html>`,
  );
  await page.locator('[role="treeitem"]').first().waitFor();
  await page.waitForTimeout(50);
  return page;
}

const labels = (page: Page) =>
  page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>(".ui-tree-label")].map((l) => ({
      title: l.title,
      truncated: l.dataset.truncated !== undefined,
      cut: l.scrollWidth - l.clientWidth,
      rowHeight: l.parentElement!.getBoundingClientRect().height,
    })),
  );

describe("Tree — a cut label stays readable (gh#1308)", () => {
  it("a cut label carries its full text as a title; one that fits does not; a consumer title is kept", async () => {
    const page = await open();
    const [short, long, own] = await labels(page);
    await page.close();
    expect(short).toMatchObject({ title: "", truncated: false });
    expect(long!.cut).toBeGreaterThan(1);
    expect(long).toMatchObject({ title: LONG, truncated: true });
    // The consumer's own title sits on its inner span and wins on hover; ours never replaces it.
    expect(own!.truncated).toBe(true);
  });

  it("keyboard focus on the row unfolds the cut label, and it folds back on blur", async () => {
    const page = await open();
    const before = (await labels(page))[1]!;
    await page.keyboard.press("Tab"); // the tree's roving tab stop: the first row
    await page.keyboard.press("ArrowDown"); // the long row
    const focused = (await labels(page))[1]!;
    await page.evaluate(() => (document.activeElement as HTMLElement).blur());
    await page.waitForTimeout(50);
    const after = (await labels(page))[1]!;
    await page.close();
    expect(focused.cut, JSON.stringify(focused)).toBeLessThanOrEqual(1);
    expect(focused.rowHeight).toBeGreaterThan(before.rowHeight);
    expect(after).toMatchObject({ title: LONG, truncated: true });
    expect(after.rowHeight).toBe(before.rowHeight);
  });

  it("a windowed tree (fixed row height) gets the title but does not unfold", async () => {
    const page = await open(true);
    const before = (await labels(page))[1]!;
    await page.keyboard.press("Tab");
    await page.keyboard.press("ArrowDown");
    const focused = (await labels(page))[1]!;
    await page.close();
    expect(before).toMatchObject({ title: LONG, truncated: true });
    expect(focused.rowHeight).toBe(before.rowHeight);
  });
});
