import { TextEncoder as NodeTextEncoder } from "node:util";

import { chromium, type Browser, type Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { compileRealCss } from "../../data-entry/__tests__/compile-real-css";

/**
 * gh#1318 — gh#1308 decided whether a Tree label is cut only when the tree rendered or its own box
 * resized. A label that becomes cut LATER without either — the WCAG 1.4.12 text-spacing override
 * applied, a web font arriving — kept no title and no unfold: measured on godx-content, the rail
 * label "Engineering handbook" cut by 9.4px under visual-audit --text-spacing.
 */
const ROOT = process.cwd();
const LABEL = "Engineering handbook";
const TEXT_SPACING_CSS =
  "*, *::before, *::after { line-height: 1.5 !important; letter-spacing: 0.12em !important; " +
  "word-spacing: 0.16em !important; } p { margin-block-end: 2em !important; }";
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { Tree } from "./src/components/data-display/tree";
const DATA = [
  { value: "eng", label: ${JSON.stringify(LABEL)} },
  { value: "own", label: "A consumer title" },
];
createRoot(document.getElementById("root")).render(
  <AppProvider defaultLocale="en" persist={false}>
    <div id="rail" style={{ width: 400 }}>
      <Tree aria-label="Pages" treeData={DATA}
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

/** Two frames: a ResizeObserver callback or a scheduled re-measure has run. */
const settle = (page: Page) =>
  page.evaluate(
    () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r(null)))),
  );

/** The rail is narrowed until LABEL fits with `slack` px to spare. */
async function open(slack: number): Promise<Page> {
  const page = await browser.newPage({ viewport: { width: 1024, height: 700 } });
  await page.setContent(
    `<!doctype html><html lang="en"><head><style>${css}</style></head><body><div id="root"></div><script>${js}</script></body></html>`,
  );
  await page.locator('[role="treeitem"]').first().waitFor();
  await page.evaluate((slack) => {
    const label = document.querySelector<HTMLElement>(".ui-tree-label")!;
    const range = document.createRange();
    range.selectNodeContents(label);
    const spare = label.clientWidth - range.getBoundingClientRect().width;
    const rail = document.getElementById("rail")!;
    rail.style.width = `${rail.getBoundingClientRect().width - spare + slack}px`;
  }, slack);
  await settle(page);
  return page;
}

const addSheet = (page: Page) =>
  page.evaluate((text) => {
    const style = document.createElement("style");
    style.id = "text-spacing";
    style.textContent = text;
    document.head.appendChild(style);
  }, TEXT_SPACING_CSS);

const labels = (page: Page) =>
  page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>(".ui-tree-label")].map((l) => ({
      title: l.title,
      truncated: l.dataset.truncated !== undefined,
      cut: Math.round((l.scrollWidth - l.clientWidth) * 10) / 10,
    })),
  );

describe("Tree — a label cut after first render is re-measured (gh#1318)", () => {
  it("the WCAG 1.4.12 text-spacing override cuts a fitting label: it gains data-truncated + full title", async () => {
    const page = await open(4);
    const before = (await labels(page))[0]!;
    await addSheet(page);
    await settle(page);
    const [after, own] = await labels(page);
    await page.close();
    expect(before).toMatchObject({ title: "", truncated: false, cut: 0 });
    expect(after!.cut).toBeGreaterThan(1);
    expect(after).toMatchObject({ title: LABEL, truncated: true });
    // The consumer's own title lives on its inner span; ours never lands on a label that fits.
    expect(own!.title).toBe("");
  });

  it("the override removed again: the label fits and loses data-truncated and our title", async () => {
    const page = await open(4);
    await addSheet(page);
    await settle(page);
    const cut = (await labels(page))[0]!;
    await page.evaluate(() => document.getElementById("text-spacing")!.remove());
    await settle(page);
    const after = (await labels(page))[0]!;
    await page.close();
    expect(cut).toMatchObject({ title: LABEL, truncated: true });
    expect(after).toMatchObject({ title: "", truncated: false, cut: 0 });
  });

  it("a font load (FontFaceSet `loadingdone`) re-measures a label whose box did not move", async () => {
    const page = await open(4);
    // Glyphs widen with the line box unchanged — what a late web font does; no ResizeObserver fires.
    await page.addStyleTag({ content: ".ui-tree-label { letter-spacing: 0.12em; }" });
    await settle(page);
    await page.evaluate(() => document.fonts.dispatchEvent(new Event("loadingdone")));
    await settle(page);
    const after = (await labels(page))[0]!;
    await page.close();
    expect(after!.cut).toBeGreaterThan(1);
    expect(after).toMatchObject({ title: LABEL, truncated: true });
  });

  it("shrinking the container cuts a fitting label: it gains data-truncated + full title", async () => {
    const page = await open(4);
    const before = (await labels(page))[0]!;
    await page.evaluate(() => {
      const rail = document.getElementById("rail")!;
      rail.style.width = `${rail.getBoundingClientRect().width - 40}px`;
    });
    await settle(page);
    const after = (await labels(page))[0]!;
    await page.close();
    expect(before).toMatchObject({ title: "", truncated: false, cut: 0 });
    expect(after!.cut).toBeGreaterThan(1);
    expect(after).toMatchObject({ title: LABEL, truncated: true });
  });
});
