import { join } from "node:path";
import { TextEncoder as NodeTextEncoder } from "node:util";

import { chromium, type Page } from "playwright";
import { renderToStaticMarkup } from "react-dom/server";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { AppProvider } from "../../../app/app-provider";
import { compileRealCss } from "../../data-entry/__tests__/compile-real-css";
import { DataTable } from "../../data-display/data-table";
import { Breadcrumb } from "../../layout/breadcrumb";

/**
 * gh#1045 / gh#1046 in a real browser. Truncation, the tooltip's pointer and focus triggers, and
 * the "it fits, so no tooltip" rule are all layout: jsdom reports 0 for every box. So the
 * components are bundled and mounted in Chromium with the package's real stylesheet.
 *
 *  - `Text ellipsis={{ tooltip: true }}` shows the full text on hover and on keyboard focus of the
 *    nearest focusable control (treeitem, sort button, link) — and never when it fits.
 *  - `Text asChild` + `ellipsis` renders ONE `<a>`, not `<a><a>`, and measures.
 *  - A `<Text ellipsis>` in a DataTable HEADER is cut inside its column.
 *  - `BreadcrumbItemProp.ellipsis` keeps the trail on one line and cuts the long crumb, in
 *    `Breadcrumb` and in `PageContainer breadcrumb`.
 */

const ROOT = process.cwd();

const LONG = "第3四半期 結合テスト 決済モジュール 請求書再発行シナリオ 受入基準レビュー一覧";

const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { Text } from "./src/components/general/typography";
import { Tree } from "./src/components/data-display/tree";
import { DataTable } from "./src/components/data-display/data-table";
import { Breadcrumb } from "./src/components/layout/breadcrumb";
import { PageContainer } from "./src/components/layout/page-container";

const LONG = ${JSON.stringify(LONG)};
const crumbs = [
  { label: "Home", to: "#home" },
  { label: LONG, to: "#suite", ellipsis: true },
  { label: LONG, ellipsis: true },
];

createRoot(document.getElementById("root")).render(
  <AppProvider defaultLocale="en" persist={false}>
    <div id="plain" style={{ width: 160 }}>
      <Text ellipsis={{ tooltip: true }}>{LONG}</Text>
    </div>
    <div id="fits" style={{ width: 600 }}>
      <Text ellipsis={{ tooltip: true }}>Short title</Text>
    </div>
    <div id="link" style={{ width: 160 }}>
      <Text asChild link ellipsis={{ tooltip: true }}>
        <a href="#case">{LONG}</a>
      </Text>
    </div>
    <div id="tree" style={{ width: 220 }}>
      <Tree
        treeData={[{ value: "a", label: LONG }, { value: "b", label: "Short" }]}
        titleRender={(node) => <Text ellipsis={{ tooltip: true }}>{node.label}</Text>}
      />
    </div>
    <div id="table" style={{ width: 420 }}>
      <DataTable
        showSorterTooltip
        data={[{ id: "1", title: LONG }]}
        columns={[
          { key: "id", header: "ID", width: "80px" },
          {
            key: "title",
            header: <Text ellipsis={{ tooltip: true }}>{LONG}</Text>,
            width: "160px",
            ellipsis: true,
            sortable: true,
            render: (row) => <Text ellipsis={{ tooltip: true }}>{row.title}</Text>,
          },
          { key: "plain", header: <Text ellipsis={{ tooltip: true }}>{LONG}</Text>, width: "160px" },
        ]}
      />
    </div>
    <div id="crumb" style={{ width: 360 }}>
      <Breadcrumb items={crumbs} />
    </div>
    <div id="pc" style={{ width: 360 }}>
      <PageContainer title="Suite" breadcrumb={crumbs} />
    </div>
  </AppProvider>,
);
`;

let css = "";
let js = "";
let browser: Awaited<ReturnType<typeof chromium.launch>>;

beforeAll(async () => {
  // Utility classes the DataTable / Breadcrumb emit, so the real sheet covers them.
  const markup = renderToStaticMarkup(
    <AppProvider defaultLocale="en" persist={false}>
      <DataTable data={[{ id: "1" }]} columns={[{ key: "id", header: "ID", sortable: true }]} />
      <Breadcrumb items={[{ label: "a", to: "#" }, { label: "b" }]} />
    </AppProvider>,
  );
  css = await compileRealCss(markup);
  // esbuild's TextEncoder/Uint8Array check fails under jsdom's realm — see org-chart-geometry-1034.
  const realm = { encoder: globalThis.TextEncoder, bytes: globalThis.Uint8Array };
  globalThis.TextEncoder = NodeTextEncoder as unknown as typeof TextEncoder;
  globalThis.Uint8Array = Object.getPrototypeOf(Buffer.prototype).constructor;
  let out: Awaited<ReturnType<typeof import("esbuild").build>>;
  try {
    const { build } = await import("esbuild");
    out = await build({
      stdin: { contents: ENTRY, loader: "tsx", resolveDir: ROOT, sourcefile: "entry.tsx" },
      bundle: true,
      write: false,
      format: "iife",
      jsx: "automatic",
      define: { "process.env.NODE_ENV": '"production"' },
      logLevel: "silent",
      absWorkingDir: join(ROOT),
    });
  } finally {
    globalThis.TextEncoder = realm.encoder;
    globalThis.Uint8Array = realm.bytes;
  }
  js = out.outputFiles![0]!.text;
  browser = await chromium.launch({ headless: true });
}, 60_000);

afterAll(async () => {
  await browser?.close();
});

async function mount(): Promise<Page> {
  const page = await browser.newPage({ viewport: { width: 1280, height: 1400 } });
  await page.setContent(
    `<!doctype html><html lang="en"><head><style>${css}</style></head><body><div id="root"></div></body></html>`,
  );
  await page.addScriptTag({ content: js });
  await page.waitForSelector('[role="treeitem"]', { state: "attached" });
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => r(null))));
  return page;
}

/** Text of every OPEN ellipsis tooltip (an exiting one carries `data-state="closed"`). */
function openTooltips(page: Page) {
  return page.evaluate(() =>
    [...document.querySelectorAll('[data-ellipsis-tooltip][data-state="delayed-open"]')].map(
      (node) => ({ text: node.textContent, side: node.getAttribute("data-side") }),
    ),
  );
}

async function expectTooltip(page: Page, side = "top") {
  await page.waitForFunction(
    (text) =>
      [...document.querySelectorAll('[data-ellipsis-tooltip][data-state="delayed-open"]')].some(
        (node) => node.textContent === text,
      ),
    LONG,
    { timeout: 3000 },
  );
  expect(await openTooltips(page)).toContainEqual({ text: LONG, side });
}

async function expectNoTooltip(page: Page) {
  await page.waitForTimeout(450);
  expect(await openTooltips(page)).toEqual([]);
}

describe("Text ellipsis tooltip + DataTable header + Breadcrumb ellipsis (Chromium, gh#1045/#1046)", () => {
  it("truncates to one line inside the box, in every host", async () => {
    const page = await mount();
    try {
      const boxes = await page.evaluate(() => {
        const one = (el: HTMLElement, host: Element) => {
          const r = el.getBoundingClientRect();
          const h = host.getBoundingClientRect();
          const cs = getComputedStyle(el);
          return {
            clipping: el.scrollWidth > el.clientWidth,
            textOverflow: cs.textOverflow,
            whiteSpace: cs.whiteSpace,
            overflowEnd: r.right - h.right,
          };
        };
        const text = (sel: string) => document.querySelector<HTMLElement>(sel)!;
        const th = [...document.querySelectorAll("#table th")];
        const headerText = th[1]!.querySelector<HTMLElement>('[data-slot="text"]')!;
        const plainHeaderText = th[2]!.querySelector<HTMLElement>('[data-slot="text"]')!;
        const cellText = document.querySelector<HTMLElement>('#table td [data-slot="text"]')!;
        const crumbList = (root: string) => {
          const ol = document.querySelector<HTMLElement>(`${root} .ui-breadcrumb-list`)!;
          const items = [...ol.querySelectorAll<HTMLElement>(":scope > li")];
          const tops = new Set(items.map((li) => Math.round(li.getBoundingClientRect().top)));
          const cut = [...ol.querySelectorAll<HTMLElement>(".ui-breadcrumb-ellipsis")];
          return {
            lines: tops.size,
            olEnd:
              ol.getBoundingClientRect().right - ol.parentElement!.getBoundingClientRect().right,
            cut: cut.map((el) => one(el, ol)),
          };
        };
        return {
          plain: one(text('#plain [data-slot="text"]'), text("#plain")),
          link: one(text("#link a"), text("#link")),
          tree: one(text('#tree [role="treeitem"] [data-slot="text"]'), text("#tree")),
          cell: one(cellText, cellText.closest("td")!),
          header: one(headerText, th[1]!),
          plainHeader: one(plainHeaderText, th[2]!),
          crumb: crumbList("#crumb"),
          pc: crumbList("#pc"),
          nested: document.querySelectorAll("a a").length,
        };
      });
      for (const key of ["plain", "link", "tree", "cell", "header", "plainHeader"] as const) {
        const box = boxes[key];
        expect(box.clipping, `${key} clips its text`).toBe(true);
        expect(box.textOverflow, `${key} draws the ellipsis`).toBe("ellipsis");
        expect(box.whiteSpace, `${key} is one line`).toBe("nowrap");
        expect(box.overflowEnd, `${key} stays inside its host`).toBeLessThanOrEqual(1);
      }
      for (const key of ["crumb", "pc"] as const) {
        const trail = boxes[key];
        expect(trail.lines, `${key} trail is one line`).toBe(1);
        expect(trail.olEnd, `${key} trail stays inside its box`).toBeLessThanOrEqual(1);
        expect(trail.cut.length).toBe(2);
        for (const c of trail.cut) {
          expect(c.clipping).toBe(true);
          expect(c.textOverflow).toBe("ellipsis");
          expect(c.overflowEnd).toBeLessThanOrEqual(1);
        }
      }
      expect(boxes.nested, "Text asChild + ellipsis must not nest the child in itself").toBe(0);
      // The truncation is paint only: the accessible names are the whole text.
      await expect(page.getByRole("link", { name: LONG }).count()).resolves.toBeGreaterThan(0);
      await expect(page.getByRole("treeitem", { name: LONG }).count()).resolves.toBe(1);
    } finally {
      await page.close();
    }
  });

  it("opens on hover while clipped, never when the text fits, and Escape dismisses", async () => {
    const page = await mount();
    try {
      await page.hover('#plain [data-slot="text"]');
      await expectTooltip(page);
      await page.keyboard.press("Escape");
      await expectNoTooltip(page);

      await page.hover('#fits [data-slot="text"]');
      await expectNoTooltip(page);

      await page.hover('#table td [data-slot="text"]');
      await expectTooltip(page);
      await page.mouse.move(1200, 1350);
      await expectNoTooltip(page);

      await page.hover("#crumb .ui-breadcrumb-current");
      await expectTooltip(page);
    } finally {
      await page.close();
    }
  });

  it("opens on keyboard focus of the nearest control, without a second tab stop", async () => {
    const page = await mount();
    try {
      // Text asChild link: the link IS the focus host.
      await page.keyboard.press("Tab");
      expect(await page.evaluate(() => document.activeElement?.closest("#link") !== null)).toBe(
        true,
      );
      await expectTooltip(page);

      // Tree: focus lands on the treeitem; the Text inside it is not a tab stop of its own.
      await page.keyboard.press("Tab");
      const focused = await page.evaluate(() => ({
        role: document.activeElement?.getAttribute("role"),
        textTabIndex: document
          .querySelector('#tree [role="treeitem"] [data-slot="text"]')
          ?.getAttribute("tabindex"),
      }));
      expect(focused).toEqual({ role: "treeitem", textTabIndex: null });
      await expectTooltip(page);
      await page.waitForTimeout(250);
      // The link's tooltip closed when focus left it; only the treeitem's is open.
      expect(await openTooltips(page)).toEqual([{ text: LONG, side: "top" }]);

      // Sortable header: the sort button already carries the sort hint on top, so ours goes below.
      await page.focus("#table th .ui-data-table-sort-button");
      await expectTooltip(page, "bottom");

      // Breadcrumb link.
      await page.focus('#crumb a[href="#suite"]');
      await expectTooltip(page);
      await page.focus('#pc a[href="#suite"]');
      await expectTooltip(page);

      // A focused treeitem whose text fits shows nothing.
      await page.focus('#tree [role="treeitem"][data-value="b"]');
      await expectNoTooltip(page);
    } finally {
      await page.close();
    }
  });
});
