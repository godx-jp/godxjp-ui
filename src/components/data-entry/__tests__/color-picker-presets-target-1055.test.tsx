import { chromium } from "playwright";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { AppProvider } from "../../../app/app-provider";
import { ColorPicker } from "../color-picker";
import { compileRealCss } from "./compile-real-css";

/**
 * A `ColorPicker presets` swatch is a radio whose painted box IS its pointer target, so it must
 * meet the measurement contract's floor (src/contracts/measurement.json → targetSize.min, WCAG 2.2
 * SC 2.5.8: 24×24) — including at a compact `--scaling`, where every control band shrinks.
 * Measured the contract's way: the box, and what `elementFromPoint` hits across it.
 * Geometry, so Chromium; jsdom lays nothing out.
 */
async function measure(scaling: string) {
  const markup = renderToStaticMarkup(
    <AppProvider defaultLocale="en" persist={false}>
      <ColorPicker
        value="#ff0000"
        presets={[{ label: "Palette", colors: ["#ff0000", "#00ff00", "#ffffff"] }]}
      />
    </AppProvider>,
  );
  const css = await compileRealCss(markup);
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 800, height: 600 } });
    await page.setContent(
      `<!doctype html><html lang="en" style="--scaling:${scaling}"><head><style>${css}</style></head><body>${markup}</body></html>`,
    );
    return await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>(".ui-color-picker-presets-color")].map((el) => {
        const r = el.getBoundingClientRect();
        const hit = (x: number, y: number) => el.contains(document.elementFromPoint(x, y));
        return {
          width: r.width,
          height: r.height,
          // Edge midpoints, 1px in: the rounded corners are legitimately outside the target.
          edges:
            hit(r.left + 1, r.top + r.height / 2) &&
            hit(r.right - 1, r.top + r.height / 2) &&
            hit(r.left + r.width / 2, r.top + 1) &&
            hit(r.left + r.width / 2, r.bottom - 1),
        };
      }),
    );
  } finally {
    await browser.close();
  }
}

describe("ColorPicker presets swatch target size (gh#1055, Chromium)", () => {
  it.each(["1", "0.8"])("--scaling: %s → every swatch is ≥24×24 and hit-testable", async (s) => {
    const swatches = await measure(s);
    expect(swatches).toHaveLength(3);
    for (const swatch of swatches) {
      expect(swatch.width, JSON.stringify(swatch)).toBeGreaterThanOrEqual(24);
      expect(swatch.height, JSON.stringify(swatch)).toBeGreaterThanOrEqual(24);
      expect(swatch.edges, JSON.stringify(swatch)).toBe(true);
    }
  });
});
