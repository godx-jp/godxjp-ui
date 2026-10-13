import { TextEncoder as NodeTextEncoder } from "node:util";

import { chromium, type Browser, type Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { compileRealCss } from "../data-entry/__tests__/compile-real-css";

/**
 * gh#1288 in Chromium, read from the ACCESSIBILITY TREE (CDP) — what gino-cloud (@godxjp/ui
 * 32.4.0) heard:
 *
 *   (A) A one-file Upload announced 「1 件中 0 件アップロード済み」 for a picked file: a count means
 *       nothing when only one file can exist. One file states its own state; the count stays for
 *       `multiple`.
 *   (B) Inside a FormField the trigger was named 「ファイル ファイルをアップロード」 (label + an action
 *       that already says the label), and a consumer `aria-label` was thrown away.
 */
const ROOT = process.cwd();
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { Upload } from "./src/components/data-entry/upload";
import { FormField } from "./src/components/data-entry/form-field";
const params = new URLSearchParams(location.search);
const kind = params.get("kind");
const view =
  kind === "single" ? (
    <FormField id="doc" label="ファイル"><Upload id="doc" variant="dropzone" maxCount={1} /></FormField>
  )
  : kind === "multiple" ? (
    <FormField id="doc" label="ファイル"><Upload id="doc" variant="dropzone" /></FormField>
  )
  : kind === "button" ? (
    <FormField id="doc" label="ファイル"><Upload id="doc" variant="button" maxCount={1} /></FormField>
  )
  : kind === "other-label" ? (
    <FormField id="doc" label="在留カード"><Upload id="doc" variant="dropzone" maxCount={1} /></FormField>
  )
  : kind === "consumer-label" ? (
    <FormField id="doc" label="ファイル"><Upload id="doc" variant="dropzone" maxCount={1} aria-label="在留カードの写しを選択" /></FormField>
  )
  : <div />;
createRoot(document.getElementById("root")).render(
  <AppProvider defaultLocale={params.get("lang") ?? "ja"} persist={false}><div id="ready">{view}</div></AppProvider>,
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
  browser = await chromium.launch({ headless: true, args: ["--lang=ja-JP"] });
}, 180_000);

afterAll(async () => {
  await browser?.close();
});

async function open(kind: string, lang = "ja"): Promise<Page> {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  await page.goto(`about:blank?kind=${kind}&lang=${lang}`);
  // about:blank is not a secure context, so `crypto.randomUUID` (an upload item's uid) is absent.
  await page.evaluate(() => {
    if (!crypto.randomUUID) {
      let n = 0;
      Object.assign(crypto, {
        randomUUID: () => `00000000-0000-4000-8000-${String(++n).padStart(12, "0")}`,
      });
    }
  });
  await page.setContent(
    `<!doctype html><html lang="${lang}"><head><style>${css}</style></head><body><div id="root"></div><script>${js}</script></body></html>`,
  );
  await page.locator("#ready").waitFor({ state: "attached" });
  return page;
}

/** Accessible names of every non-ignored button in the computed tree. */
async function buttonNames(page: Page): Promise<string[]> {
  const cdp = await page.context().newCDPSession(page);
  const { nodes } = (await cdp.send("Accessibility.getFullAXTree")) as {
    nodes: Array<{ ignored: boolean; role?: { value: string }; name?: { value: string } }>;
  };
  return nodes
    .filter((node) => !node.ignored && node.role?.value === "button")
    .map((node) => String(node.name?.value ?? ""));
}

const pdf = (name: string) => ({
  name,
  mimeType: "application/pdf",
  buffer: Buffer.alloc(10),
});

async function status(page: Page): Promise<string> {
  return (await page.locator('[data-slot="upload-status"]').textContent()) ?? "";
}

describe("a one-file Upload states the file, not a count (gh#1288 A)", { timeout: 60_000 }, () => {
  for (const [lang, selected] of [
    ["ja", "選択"],
    ["vi", "Đã chọn"],
    ["en", "selected"],
  ] as const) {
    it(`${lang}: a picked file is announced as selected, with no 「N of M」`, async () => {
      const page = await open("single", lang);
      await page.locator('input[type="file"]').setInputFiles(pdf("passport.pdf"));
      await page.getByText("passport.pdf").first().waitFor();
      const text = await status(page);
      expect(text).toContain("passport.pdf");
      expect(text).toContain(selected);
      expect(text).not.toMatch(/\d/);
      await page.context().close();
    });
  }

  it("multiple keeps the count", async () => {
    const page = await open("multiple");
    await page.locator('input[type="file"]').setInputFiles([pdf("a.pdf"), pdf("b.pdf")]);
    await page.getByText("b.pdf").first().waitFor();
    expect(await status(page)).toBe("2 件中 0 件アップロード済み");
    await page.context().close();
  });
});

describe("the trigger's name inside a FormField (gh#1288 B)", { timeout: 60_000 }, () => {
  it("dropzone: a label the action already says is not read twice", async () => {
    const page = await open("single");
    expect(await buttonNames(page)).toEqual(["ファイルをアップロード"]);
    await page.context().close();
  });

  it("button: a label the visible text already says is not read twice", async () => {
    const page = await open("button");
    expect(await buttonNames(page)).toEqual(["ファイルを選択"]);
    await page.context().close();
  });

  it("dropzone: any other label still leads the name", async () => {
    const page = await open("other-label");
    expect(await buttonNames(page)).toEqual(["在留カード ファイルをアップロード"]);
    await page.context().close();
  });

  it("a consumer aria-label names the trigger", async () => {
    const page = await open("consumer-label");
    expect(await buttonNames(page)).toEqual(["在留カードの写しを選択"]);
    await page.context().close();
  });
});
