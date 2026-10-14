import { TextEncoder as NodeTextEncoder } from "node:util";

import { chromium, type Browser, type Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

// @ts-expect-error — plain .mjs script, no declaration file
import { injectTextZoom } from "../../../../scripts/visual-audit.mjs";
import { compileRealCss } from "../../data-entry/__tests__/compile-real-css";

const ROOT = process.cwd();
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { AppShell, Topbar, TopbarItem, TopbarSearch } from "./src/components/layout";
import { Avatar, AvatarFallback } from "./src/components/data-display";
import { AppSettingPicker } from "./src/components/navigation";

function App() {
  return (
    <AppProvider defaultLocale="en" persist={false}>
      <AppShell
        topbarSpan="full"
        logo={<a href="/" aria-label="Home"><svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><rect width="20" height="20" rx="4" fill="currentColor" /></svg></a>}
        sidebar={<nav>Pages</nav>}
        topbar={
          <Topbar
            overflow="menu"
            start={<span>Engineering handbook</span>}
            end={
              <>
                <TopbarSearch ariaLabel="Search this collection" placeholder="Search this collection" />
                <AppSettingPicker kind="locale" appearance="bar" />
                <TopbarItem aria-label="Account" labelHideBelow="sm" icon={<Avatar><AvatarFallback>FA</AvatarFallback></Avatar>}>Famgia Info</TopbarItem>
              </>
            }
          />
        }
      >
        <p>Body</p>
      </AppShell>
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
  const tokens = [...new Set(js.match(/[\w:./[\]()%#!-]+/g) ?? [])].join(" ");
  css = await compileRealCss(`<div class="${tokens.replaceAll('"', "")}"></div>`);
  browser = await chromium.launch({ headless: true });
}, 180_000);

afterAll(async () => {
  await browser?.close();
});

async function open(width: number) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await page.setContent(
    `<!doctype html><html lang="en"><head><style>${css} body{margin:0}</style></head><body><div id="root"></div><script>${js}</script></body></html>`,
  );
  await page.waitForSelector(".ui-topbar-search");
  return { page, errors };
}

/** The tool's own text-zoom override (`visual-audit --text-zoom 200`), then two frames to settle. */
async function zoomText(page: Page) {
  await page.evaluate(injectTextZoom, 200);
  await page.evaluate(
    () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
  );
  // The fold re-renders from a ResizeObserver callback; give it a frame to commit.
  await page.evaluate(
    () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
  );
}

/**
 * Every end-slot control's box, the search field's frame, and what is PAINTED along the field's
 * midline: a hit outside the search means another control is drawn over the field.
 */
const measure = (page: Page) =>
  page.evaluate(() => {
    const bar = document.querySelector<HTMLElement>(".ui-topbar")!;
    const end = bar.querySelector<HTMLElement>(":scope > [data-slot='topbar-end']");
    const box = (el: Element, name: string) => {
      const r = el.getBoundingClientRect();
      return { name, l: r.left, r: r.right, t: r.top, b: r.bottom };
    };
    const visible = (el: Element) => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== "hidden";
    };
    if (!end)
      return {
        collapsed: bar.dataset.collapsed,
        more: !!bar.querySelector("[data-topbar-overflow-trigger]"),
        controls: [],
        foreignOverSearch: [],
      };
    const search = end.querySelector(".ui-topbar-search");
    const field = end.querySelector(".ui-search-input-control");
    const controls = [
      ...(field && visible(field) ? [box(field, "search")] : []),
      ...[...end.querySelectorAll("button, a, [role='combobox']")]
        .filter((el) => !search?.contains(el) && visible(el))
        .map((el) => box(el, el.getAttribute("aria-label") ?? el.textContent?.trim() ?? "")),
    ];
    const foreignOverSearch: string[] = [];
    if (field && visible(field)) {
      const f = field.getBoundingClientRect();
      const y = f.top + f.height / 2;
      for (let x = f.left + 2; x < f.right - 2; x += 2) {
        const hit = document.elementFromPoint(x, y);
        if (hit && !search!.contains(hit))
          foreignOverSearch.push(`${Math.round(x)}: ${hit.tagName}.${hit.getAttribute("class")}`);
      }
    }
    return {
      collapsed: bar.dataset.collapsed,
      more: !!bar.querySelector("[data-topbar-overflow-trigger]"),
      controls,
      foreignOverSearch,
    };
  });

type Box = { name: string; l: number; r: number; t: number; b: number };
const overlaps = (controls: Box[]) => {
  const out: string[] = [];
  for (let i = 0; i < controls.length; i++)
    for (let j = i + 1; j < controls.length; j++) {
      const a = controls[i]!;
      const c = controls[j]!;
      const w = Math.min(a.r, c.r) - Math.max(a.l, c.l);
      const h = Math.min(a.b, c.b) - Math.max(a.t, c.t);
      if (w > 0.5 && h > 0.5) out.push(`${a.name} × ${c.name}: ${w.toFixed(1)}px`);
    }
  return out;
};

/**
 * gh#1320 — `visual-audit --text-zoom 200` at a FIXED 1280 viewport: the text grows, the viewport
 * does not. The search field's text floor is in `ch`, so it grew past its 16rem wrapper (285.7 in
 * 256px) and was painted over the locale cell; the `overflow="menu"` fold watched only the bar's
 * own box, which text size never changes. Measured in the bar godx-content ships: brand, title,
 * search, locale, account.
 */
describe("Topbar under enlarged text (Chromium, gh#1320)", { timeout: 60_000 }, () => {
  it("at 1280 no end-slot control intersects another, and nothing is painted over the search field", async () => {
    const { page, errors } = await open(1280);
    const base = await measure(page);
    expect(base.controls.length).toBeGreaterThanOrEqual(3);
    expect(overlaps(base.controls)).toEqual([]);

    await zoomText(page);
    const zoomed = await measure(page);
    // At 1280 there is room: the bar stays expanded, so the overlap check below cannot pass vacuously.
    expect(zoomed.collapsed).toBe("false");
    expect(zoomed.controls.length, JSON.stringify(zoomed)).toBeGreaterThanOrEqual(3);
    expect(overlaps(zoomed.controls)).toEqual([]);
    expect(zoomed.foreignOverSearch).toEqual([]);
    expect(errors).toEqual([]);
    await page.close();
  });

  it("folds into the more cell when the CONTENT outgrows the bar, though the viewport did not change", async () => {
    // 645px: the clusters fit at 100% text and do not at 200%.
    const { page, errors } = await open(645);
    const base = await measure(page);
    expect(base.collapsed).toBe("false");
    expect(overlaps(base.controls)).toEqual([]);

    await zoomText(page);
    const zoomed = await measure(page);
    expect(zoomed.collapsed).toBe("true");
    expect(zoomed.more).toBe(true);
    expect(errors).toEqual([]);
    await page.close();
  });
});
