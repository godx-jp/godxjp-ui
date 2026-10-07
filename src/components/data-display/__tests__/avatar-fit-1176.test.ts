import { TextEncoder as NodeTextEncoder } from "node:util";

import { chromium, type Browser } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { compileRealCss } from "../../data-entry/__tests__/compile-real-css";

/**
 * gh#1176 — `AvatarImage fit`: a wide logo in an app tile was always cropped by `object-fit:
 * cover`. Measured in Chromium with the real stylesheet and a real (data-URL) image, because jsdom
 * never loads an image and so never renders `AvatarImage` at all.
 */
const ROOT = process.cwd();
// A 4:1 logo: under `cover` in a square frame most of it is cut off; under `contain` it shows whole.
const WIDE = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="50"><rect width="200" height="50" fill="#36c"/></svg>',
)}`;
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { Avatar, AvatarImage, AvatarFallback } from "./src/components/data-display/avatar";
const src = ${JSON.stringify(WIDE)};
createRoot(document.getElementById("root")).render(
  <div>
    <Avatar size="lg" data-case="default"><AvatarImage src={src} alt="Acme" /><AvatarFallback>A</AvatarFallback></Avatar>
    <Avatar size="lg" data-case="cover"><AvatarImage src={src} alt="Acme" fit="cover" /><AvatarFallback>A</AvatarFallback></Avatar>
    <Avatar size="lg" data-case="contain"><AvatarImage src={src} alt="Acme" fit="contain" /><AvatarFallback>A</AvatarFallback></Avatar>
  </div>,
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

describe("AvatarImage fit (Chromium, gh#1176)", { timeout: 40_000 }, () => {
  it("cover by default and on request; contain shows a wide logo whole", async () => {
    const page = await browser.newPage();
    await page.setContent(
      `<!doctype html><html><head><style>${css}</style></head><body><div id="root"></div><script>${js}</script></body></html>`,
    );
    await page.waitForFunction(() => document.querySelectorAll(".ui-avatar-image").length === 3);
    const m = await page.evaluate(() =>
      Object.fromEntries(
        [...document.querySelectorAll<HTMLElement>("[data-case]")].map((avatar) => {
          const img = avatar.querySelector<HTMLImageElement>(".ui-avatar-image")!;
          return [
            avatar.dataset.case,
            {
              fit: getComputedStyle(img).objectFit,
              attr: img.getAttribute("data-fit"),
              square: Math.round(img.getBoundingClientRect().width) ===
                Math.round(img.getBoundingClientRect().height),
            },
          ];
        }),
      ),
    );
    expect(m.default).toEqual({ fit: "cover", attr: null, square: true });
    expect(m.cover).toEqual({ fit: "cover", attr: null, square: true });
    expect(m.contain).toEqual({ fit: "contain", attr: "contain", square: true });
    await page.close();
  });
});
