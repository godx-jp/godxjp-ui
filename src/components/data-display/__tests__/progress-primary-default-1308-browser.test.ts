import { TextEncoder as NodeTextEncoder } from "node:util";

import { chromium, type Browser } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { compileRealCss } from "../../data-entry/__tests__/compile-real-css";

/**
 * gh#1308 item 2 — a meter with no `tone` painted the SUCCESS green, so a reading-position or an
 * upload line rendered as a status bar. ADR C09: ordinary progress uses the brand role, a status
 * tone only where the bar reports that status. In Chromium, against the real stylesheet: the
 * default meter (bar and ring) paints `--primary`, `tone="success"` still paints the success mark,
 * the over-capacity meter stays destructive, and the brand fill clears 3:1 against its track
 * (WCAG 2.2 SC 1.4.11) in light and dark. A themed `--primary` reaches it.
 */
const ROOT = process.cwd();
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { Progress } from "./src/components/data-display/progress";
createRoot(document.getElementById("root")).render(
  <AppProvider defaultLocale="en" persist={false}>
    <div style={{ width: 480 }}>
      <Progress id="plain" value={47} aria-label="Reading position" />
      <Progress id="ring" value={47} shape="ring" aria-label="Upload" />
      <Progress id="success" value={100} tone="success" aria-label="Backup complete" />
      <Progress id="over" value={140} over aria-label="Quota" />
      <div id="probe-primary" style={{ background: "hsl(var(--primary))" }} />
      <div id="probe-success" style={{ background: "hsl(var(--text-success))" }} />
      <div data-tenant style={{ "--primary": "268.7 100% 50%" }}>
        <Progress id="themed" value={47} aria-label="Themed" />
      </div>
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

async function measure(theme: "light" | "dark") {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.setContent(
    `<!doctype html><html lang="en" class="${theme === "dark" ? "dark" : ""}"><head><style>${css}</style></head><body><div id="root"></div><script>${js}</script></body></html>`,
  );
  await page.locator("#plain .ui-progress-bar").waitFor();
  const result = await page.evaluate(() => {
    const toRgb = (value: string) => {
      const ctx = document.createElement("canvas").getContext("2d")!;
      ctx.fillStyle = value;
      ctx.fillRect(0, 0, 1, 1);
      return [...ctx.getImageData(0, 0, 1, 1).data.slice(0, 3)];
    };
    const bg = (sel: string) =>
      toRgb(getComputedStyle(document.querySelector(sel)!).backgroundColor);
    const lum = ([r, g, b]: number[]) => {
      const c = [r, g, b].map((v) => {
        const s = v! / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * c[0]! + 0.7152 * c[1]! + 0.0722 * c[2]!;
    };
    const ratio = (a: number[], b: number[]) => {
      const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
      return (x! + 0.05) / (y! + 0.05);
    };
    const plain = bg("#plain .ui-progress-bar");
    return {
      tone: document.querySelector("#plain")!.getAttribute("data-tone"),
      plain: plain.join(),
      ring: toRgb(
        getComputedStyle(document.querySelector("#ring .ui-progress-ring-indicator")!).stroke,
      ).join(),
      success: bg("#success .ui-progress-bar").join(),
      over: document.querySelector("#over")!.getAttribute("data-tone"),
      themed: bg("#themed .ui-progress-bar").join(),
      primary: bg("#probe-primary").join(),
      successMark: bg("#probe-success").join(),
      vsTrack: +ratio(plain, bg("#plain .ui-progress-track")).toFixed(2),
    };
  });
  await page.close();
  return result;
}

describe("Progress meter defaults to the brand role (gh#1308)", { timeout: 60_000 }, () => {
  for (const theme of ["light", "dark"] as const) {
    it(`${theme}: default bar and ring paint --primary; success and over keep their status`, async () => {
      const m = await measure(theme);
      expect(m.tone).toBe("primary");
      expect(m.plain).toBe(m.primary);
      expect(m.ring).toBe(m.primary);
      expect(m.success).toBe(m.successMark);
      expect(m.success).not.toBe(m.plain);
      expect(m.over).toBe("destructive");
      expect(m.vsTrack).toBeGreaterThanOrEqual(3);
      // A theme's --primary arrives (rgb 122,0,255 is the GoDX violet).
      expect(m.themed).toBe("122,0,255");
    });
  }
});
