import { TextEncoder as NodeTextEncoder } from "node:util";

import { chromium, type Browser, type Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { compileRealCss } from "../../data-entry/__tests__/compile-real-css";

/**
 * `NavList overflow="wrap"` in Chromium, against the real stylesheet. A filter column of 15rem
 * holds labels that ARE the content (spec values, brand names); the rail's one-line ellipsis cut
 * every one of them. With `wrap` the label breaks onto further lines, its row grows from the item
 * height, a one-line row stays exactly the item height, the line box is not clipped (Vietnamese
 * tone marks) and no truncation `title` is emitted. The default NavList beside it is the control:
 * still one line, still cut, still titled (gh#1493).
 */
const ROOT = process.cwd();
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { NavList } from "./src/components/layout/nav-list";
const items = [
  { id: "otc", label: "Over-the-counter medicine and supplements", href: "#otc", badge: 12 },
  { id: "bath", label: "Perawatan tubuh & garam mandi untuk relaksasi", href: "#bath" },
  { id: "vi", label: "Chăm sóc cơ thể và muối tắm thư giãn hằng ngày", href: "#vi" },
  { id: "beer", label: "ザ・プレミアムモルツ マスターズドリーム 無濾過", href: "#beer" },
  { id: "short", label: "賞与", href: "#short" },
  { id: "group", label: "ブランド", children: [
    { id: "sub-short", label: "サントリー", href: "#sub-short" },
    { id: "sub-long", label: "香るエール 6缶パック 350ml ケース販売 限定醸造", href: "#sub-long" },
  ] },
];
createRoot(document.getElementById("root")).render(
  <AppProvider defaultLocale="ja" persist={false}>
    <div style={{ display: "flex", gap: "32px" }}>
      <div id="cut" style={{ inlineSize: "15rem" }}><NavList label="cut" items={items} activeId="sub-short" /></div>
      <div id="wrap" style={{ inlineSize: "15rem" }}><NavList label="wrap" overflow="wrap" items={items} activeId="sub-short" /></div>
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

async function open(): Promise<Page> {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.setContent(
    `<!doctype html><html lang="ja"><head><style>${css}</style></head><body><div id="root"></div><script>${js}</script></body></html>`,
  );
  await page.locator("#wrap").getByRole("link", { name: "サントリー" }).waitFor();
  return page;
}

type Row = {
  rowHeight: number;
  itemHeight: number;
  scrollW: number;
  clientW: number;
  scrollH: number;
  clientH: number;
  lines: number;
  title: string | null;
  whiteSpace: string;
  textOverflow: string;
  overflowWrap: string;
  badgeOffset: number | null;
};

const measure = (page: Page, column: "cut" | "wrap", name: string) =>
  page
    .locator(`#${column}`)
    .getByRole("link", { name })
    .evaluate((row): Row => {
      const label = row.querySelector<HTMLElement>(".sb-label")!;
      const style = getComputedStyle(label);
      const badge = row.querySelector<HTMLElement>(".sb-badge");
      const r = row.getBoundingClientRect();
      const b = badge?.getBoundingClientRect();
      const probe = document.createElement("div");
      probe.style.blockSize = "var(--sidebar-nav-item-height)";
      row.appendChild(probe);
      const itemHeight = probe.getBoundingClientRect().height;
      probe.remove();
      return {
        rowHeight: r.height,
        itemHeight,
        scrollW: label.scrollWidth,
        clientW: label.clientWidth,
        scrollH: label.scrollHeight,
        clientH: label.clientHeight,
        lines: Math.round(label.getBoundingClientRect().height / parseFloat(style.lineHeight)),
        title: label.getAttribute("title"),
        whiteSpace: style.whiteSpace,
        textOverflow: style.textOverflow,
        overflowWrap: style.overflowWrap,
        // Distance between the badge's centre and the row's centre: 0 = centred on the row.
        badgeOffset: b ? Math.abs(b.top + b.height / 2 - (r.top + r.height / 2)) : null,
      };
    });

const LONG = [
  "Over-the-counter medicine and supplements",
  "Perawatan tubuh & garam mandi untuk relaksasi",
  "Chăm sóc cơ thể và muối tắm thư giãn hằng ngày",
  "ザ・プレミアムモルツ マスターズドリーム 無濾過",
];

describe('NavList overflow="wrap" in Chromium', { timeout: 60_000 }, () => {
  it("control: the default NavList keeps one line, cuts the label and titles it (gh#1493)", async () => {
    const page = await open();
    for (const name of LONG) {
      const row = await measure(page, "cut", name);
      expect(row.rowHeight, name).toBeCloseTo(row.itemHeight, 0);
      expect(row.scrollW, name).toBeGreaterThan(row.clientW);
      expect(row.whiteSpace).toBe("nowrap");
      expect(row.textOverflow).toBe("ellipsis");
      expect(row.title, name).toBe(name);
    }
    await page.close();
  });

  it("wrap: every long label is shown whole on several lines, its row grows, no title", async () => {
    const page = await open();
    for (const name of LONG) {
      const row = await measure(page, "wrap", name);
      expect(row.whiteSpace).toBe("normal");
      expect(row.textOverflow).toBe("clip");
      expect(row.overflowWrap).toBe("anywhere");
      expect(row.lines, name).toBeGreaterThanOrEqual(2);
      expect(row.rowHeight, name).toBeGreaterThan(row.itemHeight);
      // Nothing cut: not sideways (the ellipsis), not vertically (a tone mark under the line box).
      expect(row.scrollW, name).toBeLessThanOrEqual(row.clientW);
      expect(row.scrollH, name).toBeLessThanOrEqual(row.clientH);
      expect(row.title, name).toBeNull();
    }
    await page.close();
  });

  it("wrap: a label that fits is the same one-line row as the default", async () => {
    const page = await open();
    const wrapped = await measure(page, "wrap", "賞与");
    const cut = await measure(page, "cut", "賞与");
    expect(wrapped.lines).toBe(1);
    expect(wrapped.rowHeight).toBeCloseTo(cut.rowHeight, 1);
    expect(wrapped.rowHeight).toBeCloseTo(wrapped.itemHeight, 0);
    // A sub-row keeps its own (shorter) height when it fits, and grows when it does not.
    const subShort = await measure(page, "wrap", "サントリー");
    const subShortCut = await measure(page, "cut", "サントリー");
    expect(subShort.rowHeight).toBeCloseTo(subShortCut.rowHeight, 1);
    const subLong = await measure(page, "wrap", "香るエール 6缶パック 350ml ケース販売 限定醸造");
    expect(subLong.rowHeight).toBeGreaterThan(subShort.rowHeight);
    expect(subLong.title).toBeNull();
    await page.close();
  });

  it("wrap: the badge stays centred on a grown row", async () => {
    const page = await open();
    const row = await measure(page, "wrap", "Over-the-counter medicine and supplements");
    expect(row.lines).toBeGreaterThanOrEqual(2);
    expect(row.badgeOffset).not.toBeNull();
    expect(row.badgeOffset!).toBeLessThanOrEqual(1);
    await page.close();
  });
});
