import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { chromium } from "playwright";

import { SplitPane } from "../split-pane";

/**
 * gh#1057 — `stackOrder="aside-first"`: when the pane is too narrow to split, the aside stacks
 * ABOVE main, and focus reaches it first (it is first in the DOM). When the pane is wide enough to
 * split, the geometry is identical to the default main-first pane, LTR and RTL. `fill` keeps the
 * flexible row on main in both layouts. Measured in Chromium; jsdom does not lay out.
 */
const REPO = process.cwd();
const css = [
  "src/tokens/foundation.css",
  "src/tokens/derived.css",
  "src/tokens/axes.css",
  "src/tokens/semantic/layout.css",
  "src/styles/base.css",
  "src/styles/layout.css",
]
  .map((p) => readFileSync(join(REPO, p), "utf8"))
  .join("\n");

type Rect = { top: number; bottom: number; left: number; right: number; height: number };

function pane(id: string, stackOrder: "main-first" | "aside-first", fill = false) {
  return (
    <div id={id}>
      <SplitPane
        stackOrder={stackOrder}
        fill={fill}
        asideLabel={`${id}-aside`}
        aside={
          <div style={{ blockSize: 80 }}>
            <a href="#aside">aside link</a>
          </div>
        }
      >
        <div style={{ blockSize: fill ? 2000 : 120 }}>
          <a href="#main">main link</a>
        </div>
      </SplitPane>
    </div>
  );
}

const hosts = (width: number, fillHeight = 600) => `
  #default, #aside-first, #rtl-default, #rtl-aside-first { inline-size: ${width}px; }
  #fill-aside-first { inline-size: ${width}px; block-size: ${fillHeight}px; }
`;

async function measure(width: number) {
  const markup = renderToStaticMarkup(
    <>
      {pane("default", "main-first")}
      {pane("aside-first", "aside-first")}
      <div dir="rtl">
        {pane("rtl-default", "main-first")}
        {pane("rtl-aside-first", "aside-first")}
      </div>
      {pane("fill-aside-first", "aside-first", true)}
    </>,
  );
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1400, height: 3000 } });
    await page.setContent(
      `<!doctype html><html><head><style>${css}${hosts(width)}</style></head><body>${markup}</body></html>`,
    );
    const rects = await page.evaluate(() => {
      const r = (sel: string) => {
        const b = document.querySelector(sel)!.getBoundingClientRect();
        return { top: b.top, bottom: b.bottom, left: b.left, right: b.right, height: b.height };
      };
      const out: Record<string, { main: Rect; aside: Rect }> = {};
      for (const id of [
        "default",
        "aside-first",
        "rtl-default",
        "rtl-aside-first",
        "fill-aside-first",
      ]) {
        out[id] = {
          main: r(`#${id} .ui-split-pane-main`),
          aside: r(`#${id} .ui-split-pane-aside`),
        };
      }
      return out;
    });
    // Focus order inside the aside-first pane: the first Tab stop is the aside's link.
    await page.evaluate(() => {
      const a = document.querySelector<HTMLElement>("#aside-first");
      a!.tabIndex = -1;
      a!.focus();
    });
    await page.keyboard.press("Tab");
    const firstTab = await page.evaluate(() => document.activeElement?.getAttribute("href"));
    return { rects, firstTab };
  } finally {
    await browser.close();
  }
}

const near = (a: number, b: number) => expect(Math.abs(a - b)).toBeLessThanOrEqual(1);

describe("SplitPane stackOrder geometry (Chromium, gh#1057)", () => {
  it("stacked (narrow): aside-first puts the aside ABOVE main and first in focus order", async () => {
    const { rects, firstTab } = await measure(400);
    // Precondition: the default pane really is stacked at this width (main above aside).
    expect(rects.default.main.bottom).toBeLessThanOrEqual(rects.default.aside.top + 1);

    for (const id of ["aside-first", "rtl-aside-first"]) {
      expect(rects[id].aside.bottom).toBeLessThanOrEqual(rects[id].main.top + 1);
      // Still one full-width column.
      near(rects[id].aside.left, rects[id].main.left);
      near(rects[id].aside.right, rects[id].main.right);
    }
    expect(firstTab).toBe("#aside");

    // fill + aside-first stacked: the aside keeps its content height, main takes the rest.
    const fill = rects["fill-aside-first"];
    near(fill.aside.height, 80);
    expect(fill.aside.bottom).toBeLessThanOrEqual(fill.main.top + 1);
    expect(fill.main.bottom - fill.aside.top).toBeLessThanOrEqual(601);
    expect(fill.main.height).toBeGreaterThan(400);
  });

  it("split (wide): aside-first geometry is identical to the default, LTR and RTL", async () => {
    const { rects } = await measure(1000);
    for (const [base, ordered] of [
      ["default", "aside-first"],
      ["rtl-default", "rtl-aside-first"],
    ] as const) {
      const a = rects[base];
      const b = rects[ordered];
      const topOffset = b.main.top - a.main.top;
      for (const part of ["main", "aside"] as const) {
        near(b[part].left, a[part].left);
        near(b[part].right, a[part].right);
        near(b[part].top - topOffset, a[part].top);
        near(b[part].height, a[part].height);
      }
      // Side by side on one row.
      near(b.main.top, b.aside.top);
    }
    // Aside on the inline-end: right in LTR, left in RTL.
    expect(rects["aside-first"].aside.left).toBeGreaterThan(rects["aside-first"].main.right);
    expect(rects["rtl-aside-first"].aside.right).toBeLessThan(rects["rtl-aside-first"].main.left);

    // fill + aside-first split: both columns share the one definite row.
    const fill = rects["fill-aside-first"];
    near(fill.main.top, fill.aside.top);
    near(fill.main.height, 600);
    near(fill.aside.height, 600);
  });
});
