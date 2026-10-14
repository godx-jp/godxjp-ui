import { TextEncoder as NodeTextEncoder } from "node:util";

import { chromium, type Browser, type Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { compileRealCss } from "../../components/data-entry/__tests__/compile-real-css";

/**
 * gh#1296 in Chromium — what godx-content's reader showed with LegalDocumentShell used bare (no
 * PageContainer around it), the way a public reader page uses it:
 *
 *   (7) At 390 the title, contents and prose touched the viewport edge: the shell had no page
 *       inline margin of its own. Inside a page shell that already pads, it must not add a second.
 *   (9) The document title rendered one type step above the section headings (≈19.8px vs ≈17.6px),
 *       so the page read flat.
 */
const ROOT = process.cwd();
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { LegalDocumentShell } from "./src/lab/legal-document-shell";
import { PageContainer } from "./src/components/layout/page-container";
import { CenteredShell } from "./src/components/layout/centered-shell";
const params = new URLSearchParams(location.search);
const sections = [
  { id: "a", title: "第1条 目的", content: <p id="first-prose">本規約は、サービスの利用条件を定めるものです。</p> },
  { id: "b", title: "第2条 定義", content: <p>本規約において使用する用語の定義は、次のとおりとします。</p> },
];
const shell = <LegalDocumentShell title="利用規約" effectiveDate="2026-04-01" sections={sections} />;
const kind = params.get("kind");
const view = kind === "page" ? (
  <PageContainer title="規約"><p id="page-sibling">前文</p>{shell}</PageContainer>
) : kind === "centered" ? (
  <CenteredShell width="lg"><p id="page-sibling">前文</p>{shell}</CenteredShell>
) : kind === "untitled" ? (
  <PageContainer extra={<button id="edit" type="button">編集</button>}>{shell}</PageContainer>
) : shell;
createRoot(document.getElementById("root")).render(
  <AppProvider defaultLocale="ja" persist={false}><div id="ready">{view}</div></AppProvider>,
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

async function open(width: number, kind = "bare"): Promise<Page> {
  const context = await browser.newContext({ viewport: { width, height: 800 } });
  const page = await context.newPage();
  await page.goto(`about:blank?kind=${kind}`);
  await page.setContent(
    `<!doctype html><html lang="ja"><head><style>${css}</style></head><body><div id="root"></div><script>${js}</script></body></html>`,
  );
  await page.locator("#ready h1").first().waitFor();
  return page;
}

/** Inline-start offset of an element from the viewport edge, in px. */
const left = (page: Page, selector: string) =>
  page
    .locator(selector)
    .first()
    .evaluate((el) => el.getBoundingClientRect().left);

describe("LegalDocumentShell page margin (gh#1296 · 7)", () => {
  it("keeps the title and the prose off the viewport edge at 390 when used bare", async () => {
    const page = await open(390);
    const title = await left(page, "[data-slot='legal-document-shell'] h1");
    const prose = await left(page, "#first-prose");
    console.info(`gh#1296 bare 390: h1 left ${title}px · prose left ${prose}px`);
    expect(title).toBeGreaterThanOrEqual(16);
    expect(prose).toBeGreaterThanOrEqual(16);
  });

  it("keeps the contents rail off the viewport edge at 1280 when used bare", async () => {
    const page = await open(1280);
    const rail = await left(page, ".ui-legal-document-toc");
    console.info(`gh#1296 bare 1280: rail left ${rail}px`);
    expect(rail).toBeGreaterThanOrEqual(16);
  });

  it.each(["page", "centered"])(
    "adds no second margin inside a page shell that already pads (%s)",
    async (kind) => {
      const page = await open(390, kind);
      const sibling = await left(page, "#page-sibling");
      const title = await left(page, "[data-slot='legal-document-shell'] h1");
      expect(sibling).toBeGreaterThan(0);
      expect(title).toBe(sibling);
    },
  );
});

describe("PageContainer without a title around the shell (gh#1296 · 7)", () => {
  it("keeps the page actions at the inline end when there is no heading beside them", async () => {
    const page = await open(1280, "untitled");
    const [actionEnd, headerEnd] = await page.evaluate(() => {
      const header = document.querySelector(".ui-page-header")!;
      const pad = parseFloat(getComputedStyle(header).paddingInlineEnd);
      return [
        document.querySelector("#edit")!.getBoundingClientRect().right,
        header.getBoundingClientRect().right - pad,
      ];
    });
    expect(await page.locator("h1").count()).toBe(1);
    expect(Math.abs(actionEnd - headerEnd)).toBeLessThan(1);
  });
});

describe("LegalDocumentShell title hierarchy (gh#1296 · 9)", () => {
  it("steps the document title clearly above the section headings", async () => {
    const page = await open(1280);
    const [h1, h2, ratio] = await page.evaluate(() => {
      const px = (sel: string) =>
        parseFloat(getComputedStyle(document.querySelector(sel)!).fontSize);
      const root = getComputedStyle(document.documentElement);
      return [
        px("[data-slot='legal-document-shell'] h1"),
        px("[data-slot='legal-document-shell'] h2"),
        parseFloat(root.getPropertyValue("--font-size-ratio")),
      ];
    });
    console.info(`gh#1296 1280: h1 ${h1}px · first h2 ${h2}px · h1/h2 ${(h1 / h2).toFixed(3)}`);
    // At least two steps of the type scale between the title and a section heading; one step
    // (ratio ≈ 1.12) is what read as flat.
    expect(h1 / h2).toBeGreaterThanOrEqual(ratio * ratio - 0.01);
  });
});
