import { chromium } from "playwright";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { AppProvider } from "../../../app/app-provider";
import { compileRealCss } from "../../data-entry/__tests__/compile-real-css";
import { Breadcrumb } from "../breadcrumb";
import { PageContainer } from "../page-container";

/**
 * gh#1144 — under a finger (`pointer: coarse`) a breadcrumb link offers a 44px-tall target while
 * the trail itself does not move: same row height, same glyph positions as under a mouse. Both
 * trails (`<Breadcrumb>` and `PageContainer`'s own), and an `ellipsis` crumb, whose label is cut
 * with `overflow: hidden` on the link itself. Chromium with touch emulation.
 */
const trail = [
  { label: "Home", to: "/" },
  { label: "A very long collection name that will be cut", to: "/c", ellipsis: true },
  { label: "Page" },
];
const markup = renderToStaticMarkup(
  <AppProvider persist={false} defaultLocale="en">
    <div data-p="bc" style={{ width: 300, marginBlock: 40 }}>
      <Breadcrumb items={trail} />
    </div>
    <div data-p="pc" style={{ marginBlock: 40 }}>
      <PageContainer title="Page" breadcrumb={[{ label: "Home", to: "/" }, { label: "Page" }]}>
        x
      </PageContainer>
    </div>
  </AppProvider>,
);

async function measure(touch: boolean) {
  const css = await compileRealCss(markup);
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await (
      await browser.newContext({
        viewport: { width: 390, height: 900 },
        hasTouch: touch,
        isMobile: touch,
      })
    ).newPage();
    await page.setContent(
      `<!doctype html><html><head><style>${css} body{margin:0}</style></head><body>${markup}</body></html>`,
    );
    return await page.evaluate(() => {
      const reachBlock = (el: HTMLElement) => {
        const r = el.getBoundingClientRect();
        // Probe at a third of the width — inside the visible label of an ellipsis crumb too.
        const x = r.left + Math.min(r.width / 3, 12);
        const cy = r.top + r.height / 2;
        const along = (dy: number) => {
          let d = 0;
          while (d < 40 && el.contains(document.elementFromPoint(x, cy + dy * (d + 1)))) d++;
          return d;
        };
        return along(1) + along(-1) + 1;
      };
      const links = (p: string) => [
        ...document.querySelectorAll<HTMLElement>(`[data-p="${p}"] .ui-breadcrumb-item a[href]`),
      ];
      const geometry = (p: string) => {
        const list = document.querySelector<HTMLElement>(`[data-p="${p}"] ol`)!;
        return {
          listHeight: Math.round(list.getBoundingClientRect().height * 10) / 10,
          // Relative to the list: a coarse pointer already grows chrome ABOVE the trail.
          textTops: links(p).map((a) => {
            const range = document.createRange();
            range.selectNodeContents(a);
            const top = range.getBoundingClientRect().top - list.getBoundingClientRect().top;
            return Math.round(top * 10) / 10;
          }),
        };
      };
      return {
        coarse: matchMedia("(pointer: coarse)").matches,
        hits: { bc: links("bc").map(reachBlock), pc: links("pc").map(reachBlock) },
        bc: geometry("bc"),
        pc: geometry("pc"),
      };
    });
  } finally {
    await browser.close();
  }
}

describe("breadcrumb targets on a coarse pointer (Chromium, gh#1144)", () => {
  it("gives every crumb link a 44px-tall target without moving the trail", async () => {
    const [touch, mouse] = [await measure(true), await measure(false)];
    expect(touch.coarse).toBe(true);
    expect(mouse.coarse).toBe(false);

    // Both trails, including the ellipsis crumb (the second link of `bc`).
    expect(touch.hits.bc).toHaveLength(2);
    expect(touch.hits.pc).toHaveLength(1);
    for (const h of [...touch.hits.bc, ...touch.hits.pc]) expect(h).toBeGreaterThanOrEqual(44);

    // The trail is laid out exactly as under a mouse.
    expect(touch.bc).toEqual(mouse.bc);
    expect(touch.pc).toEqual(mouse.pc);

    // And under a mouse the target is still the line.
    for (const h of [...mouse.hits.bc, ...mouse.hits.pc]) expect(h).toBeLessThan(30);
  });
});
