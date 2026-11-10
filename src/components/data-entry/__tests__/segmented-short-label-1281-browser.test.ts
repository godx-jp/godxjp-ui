import { TextEncoder as NodeTextEncoder } from "node:util";

import { chromium, type Browser, type Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { compileRealCss } from "./compile-real-css";

/**
 * GDX-1281 in Chromium, against the real stylesheet. Three views with counts, the way a list's
 * status filter is drawn, at phone widths (320 / 390) and on a desktop (1280), in en / ja / vi:
 * with `shortLabel` the bar stays ONE row on a phone, nothing truncates, the page does not scroll
 * sideways, and every radio still answers to its FULL name. On a desktop the full labels show.
 * A bar without `shortLabel` keeps the wrap it always had (default unchanged).
 */
const LABELS = {
  en: { inbox: ["Waiting for me", "To approve"], mine: ["Sent by me", "Sent"], all: "All" },
  ja: {
    inbox: ["自分の承認待ち", "承認待ち"],
    mine: ["自分が出した申請", "送信済み"],
    all: "すべて",
  },
  vi: { inbox: ["Chờ tôi duyệt", "Chờ duyệt"], mine: ["Tôi đã gửi", "Đã gửi"], all: "Tất cả" },
} as const;
type Locale = keyof typeof LABELS;

const ROOT = process.cwd();
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { Segmented } from "./src/components/data-entry/segmented";
const LABELS = ${JSON.stringify(LABELS)};
const params = new URLSearchParams(location.hash.slice(1));
const locale = params.get("locale");
const short = params.get("short") === "1";
const l = LABELS[locale];
const options = [
  { value: "inbox", label: l.inbox[0], shortLabel: short ? l.inbox[1] : undefined, count: 3 },
  { value: "mine", label: l.mine[0], shortLabel: short ? l.mine[1] : undefined, count: 12 },
  { value: "all", label: l.all },
];
createRoot(document.getElementById("root")).render(
  <AppProvider defaultLocale={locale} persist={false}>
    <div style={{ padding: 16 }}>
      <Segmented aria-label="views" defaultValue="inbox" options={options} />
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

async function open(width: number, locale: Locale, short: boolean) {
  const page = await browser.newPage({ viewport: { width, height: 700 } });
  await page.goto(`about:blank#locale=${locale}&short=${short ? 1 : 0}`);
  await page.setContent(
    `<!doctype html><html lang="${locale}"><head><style>body{margin:0}${css}</style></head><body><div id="root"></div><script>${js}</script></body></html>`,
  );
  await page.locator(".ui-segmented-item").first().waitFor();
  return page;
}

async function read(page: Page, locale: Locale) {
  // The bar re-measures from a ResizeObserver callback; give it two frames to commit.
  await page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
  );
  const result = await page.evaluate(() => {
    const items = [...document.querySelectorAll<HTMLElement>(".ui-segmented-item")];
    return {
      rows: new Set(items.map((item) => Math.round(item.getBoundingClientRect().top))).size,
      truncated: [...document.querySelectorAll<HTMLElement>(".ui-segmented-item-label")].filter(
        (label) => label.scrollWidth - label.clientWidth > 1,
      ).length,
      sideways: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      shown: items.map((item) =>
        [...item.querySelectorAll(".ui-segmented-item-label")].map((l) => l.textContent).join(""),
      ),
    };
  });
  const l = LABELS[locale];
  // Chromium spaces the visually hidden full label off the count (", 3" reads the same aloud).
  const name = (label: string, count?: number) =>
    new RegExp(`^${label}${count == null ? "" : `\\s*, ${count}`}$`);
  const named = [
    await page.getByRole("radio", { name: name(l.inbox[0], 3) }).count(),
    await page.getByRole("radio", { name: name(l.mine[0], 12) }).count(),
    await page.getByRole("radio", { name: name(l.all) }).count(),
  ];
  return { ...result, named };
}

const full = (locale: Locale) => [
  LABELS[locale].inbox[0],
  LABELS[locale].mine[0],
  LABELS[locale].all,
];
const brief = (locale: Locale) => [
  LABELS[locale].inbox[1],
  LABELS[locale].mine[1],
  LABELS[locale].all,
];

describe("Segmented shortLabel at phone and desktop widths (GDX-1281)", () => {
  for (const locale of Object.keys(LABELS) as Locale[]) {
    for (const width of [320, 390]) {
      it(`${locale} @ ${width}: one row, nothing cut, full accessible names`, async () => {
        const page = await open(width, locale, true);
        const m = await read(page, locale);
        await page.close();
        expect(m.rows).toBe(1);
        expect(m.truncated).toBe(0);
        expect(m.sideways).toBe(0);
        // Full labels where they fit (en and vi at 390), the short ones where they do not.
        expect([full(locale), brief(locale)]).toContainEqual(m.shown);
        expect(m.named).toEqual([1, 1, 1]);
      });
    }
  }

  it("follows its container both ways: 320 short, 1280 full, 320 short again", async () => {
    const page = await open(320, "ja", true);
    expect((await read(page, "ja")).shown).toEqual(brief("ja"));
    await page.setViewportSize({ width: 1280, height: 700 });
    const wide = await read(page, "ja");
    expect(wide.shown).toEqual(full("ja"));
    expect(wide.rows).toBe(1);
    await page.setViewportSize({ width: 320, height: 700 });
    const narrow = await read(page, "ja");
    await page.close();
    expect(narrow.shown).toEqual(brief("ja"));
    expect(narrow.rows).toBe(1);
  });

  it("without shortLabel the 320px bar still wraps whole options (default unchanged)", async () => {
    const page = await open(320, "ja", false);
    const m = await read(page, "ja");
    await page.close();
    expect(m.rows).toBeGreaterThan(1);
    expect(m.truncated).toBe(0);
    expect(m.sideways).toBe(0);
    expect(m.shown).toEqual(full("ja"));
  });
});
