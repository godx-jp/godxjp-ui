import { chromium } from "playwright";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { AppProvider } from "@/app/app-provider";
import { compileRealCss } from "@/components/data-entry/__tests__/compile-real-css";
import { Actions } from "../actions";

/**
 * gh#1121 — an `Actions` strip wider than its container wraps instead of pushing actions out of
 * reach. The nightly geometry sweep caught the @godxjp/editor toolbar (12 actions) with 6 of them
 * outside the strip at 320px. jsdom does not lay out: Chromium.
 */
const items = (n: number) =>
  Array.from({ length: n }, (_, i) => ({
    key: `a${i}`,
    label: `Action ${i}`,
    icon: <span>{i}</span>,
  }));
const markup = renderToStaticMarkup(
  <AppProvider persist={false} defaultLocale="en">
    <div id="narrow" style={{ width: 200 }}>
      <Actions label="Many" items={items(12)} />
    </div>
    <div id="wide" style={{ width: 600 }}>
      <Actions label="Few" items={items(4)} />
    </div>
  </AppProvider>,
);

describe("Actions wraps (Chromium, gh#1121)", () => {
  it("every action of a long strip stays inside it; a short strip stays one row", async () => {
    // The REAL stylesheet: the actions' size comes from the Button tier tokens, and a hand-picked
    // subset left them out — twelve zero-width buttons fit anywhere and proved nothing.
    const css = await compileRealCss(markup);
    const browser = await chromium.launch({ headless: true });
    try {
      const page = await browser.newPage({ viewport: { width: 390, height: 800 } });
      await page.setContent(
        `<!doctype html><html><head><style>${css} body{margin:0}</style></head><body>${markup}</body></html>`,
      );
      const m = await page.evaluate(() =>
        ["narrow", "wide"].map((id) => {
          const strip = document.querySelector<HTMLElement>(`#${id} [role="toolbar"]`)!;
          const box = strip.getBoundingClientRect();
          const buttons = [...strip.querySelectorAll("button")].map((b) =>
            b.getBoundingClientRect(),
          );
          return {
            outside: buttons.filter((r) => r.right > box.right + 0.5 || r.left < box.left - 0.5)
              .length,
            rows: new Set(buttons.map((r) => Math.round(r.top))).size,
          };
        }),
      );
      expect(m[0]!.outside).toBe(0);
      expect(m[0]!.rows).toBeGreaterThan(1);
      expect(m[1]).toEqual({ outside: 0, rows: 1 });
    } finally {
      await browser.close();
    }
  });
});
