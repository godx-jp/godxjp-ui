import { TextEncoder as NodeTextEncoder } from "node:util";

import { chromium, type Browser } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { compileRealCss } from "../../data-entry/__tests__/compile-real-css";

/**
 * gh#1276 in Chromium, against the real stylesheet — `Text ellipsis={{ suffix }}` on one line:
 * the text truncates and the suffix stays whole inside the slot (antd `ellipsis.suffix`). It was
 * laid out after a content box already 100% of the slot, so the suffix was cut with it.
 */
const ROOT = process.cwd();
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { Text } from "./src/components/general/typography";
const q = new URLSearchParams(location.search);
const name = q.get("name");
createRoot(document.getElementById("root")).render(
  <AppProvider defaultLocale="en" persist={false}>
    <div id="slot" style={{ width: 294, overflow: "hidden" }}>
      <Text ellipsis={{ suffix: <span id="suffix">.xlsx</span> }}>{name}</Text>
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

async function measure(name: string) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto(`about:blank?name=${encodeURIComponent(name)}`);
  await page.setContent(
    `<!doctype html><html lang="en"><head><style>${css}</style></head><body><div id="root"></div><script>${js}</script></body></html>`,
  );
  await page.locator("#suffix").waitFor();
  const m = await page.evaluate(() => {
    const slot = document.getElementById("slot")!.getBoundingClientRect();
    const suffix = document.getElementById("suffix")!;
    const s = suffix.getBoundingClientRect();
    const content = document.querySelector<HTMLElement>(".ui-typography-content")!;
    const probe = document.createElement("span");
    probe.textContent = suffix.textContent;
    document.body.append(probe);
    const natural = probe.getBoundingClientRect().width;
    probe.remove();
    return {
      suffixInside: s.right <= slot.right + 0.5,
      suffixWhole: Math.abs(s.width - natural) < 0.5,
      contentTruncated: content.scrollWidth > content.clientWidth,
      oneLine: Math.round(s.top) === Math.round(content.getBoundingClientRect().top),
    };
  });
  await page.close();
  return m;
}

describe("Text ellipsis suffix on one line (gh#1276)", { timeout: 60_000 }, () => {
  it("a long name truncates and the suffix stays whole inside the slot", async () => {
    expect(
      await measure("2026年度_研修計画_受入企業別_最終版_差し替え_確定済み_共有用_コピー"),
    ).toEqual({ suffixInside: true, suffixWhole: true, contentTruncated: true, oneLine: true });
  });

  it("a short name does not truncate and the suffix follows it", async () => {
    expect(await measure("plan")).toMatchObject({
      suffixInside: true,
      suffixWhole: true,
      contentTruncated: false,
    });
  });
});
