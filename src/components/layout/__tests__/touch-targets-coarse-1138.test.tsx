import { chromium } from "playwright";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { LayoutDashboard, X } from "lucide-react";

import { AppProvider } from "../../../app/app-provider";
import { compileRealCss } from "../../data-entry/__tests__/compile-real-css";
import { Sidebar } from "../sidebar";

/**
 * gh#1138 — under a finger (`pointer: coarse`) a Sidebar row and the overlay ✕ reach the 44px tap
 * floor the control ladder already lifts to (rule #24); under a mouse they keep their desk
 * geometry. The ✕'s PAINT never grows — only its `::after` hit area. jsdom has no layout and no
 * pointer media: Chromium with touch emulation.
 */
const markup = renderToStaticMarkup(
  <AppProvider persist={false} defaultLocale="en">
    <div id="sb" style={{ height: 300, display: "flex" }}>
      <Sidebar
        activeId="a"
        sections={[{ items: [{ id: "a", label: "A", icon: LayoutDashboard }] }]}
      />
    </div>
    <div id="rail" style={{ height: 300, display: "flex" }}>
      <Sidebar
        collapsed
        activeId="a"
        sections={[{ items: [{ id: "a", label: "A", icon: LayoutDashboard }] }]}
      />
    </div>
    {(["ui-sheet-close", "ui-dialog-close"] as const).map((cls) => (
      <div key={cls} style={{ position: "relative", width: 300, height: 120 }}>
        {/* ui-audit-disable-next-line no-raw-button — the close control's own markup, isolated. */}
        <button type="button" className={`${cls} ui-focus-ring`} data-probe={cls}>
          <X
            className={cls === "ui-sheet-close" ? "ui-sheet-close-icon" : "ui-dialog-close-icon"}
          />
        </button>
      </div>
    ))}
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
      const box = (sel: string) =>
        document.querySelector<HTMLElement>(sel)!.getBoundingClientRect();
      // The hit area, probed the way a finger meets it: the widest offset from the centre that
      // still lands on the control, along each axis.
      const reach = (el: HTMLElement) => {
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const along = (dx: number, dy: number) => {
          let d = 0;
          while (
            d < 40 &&
            el.contains(document.elementFromPoint(cx + dx * (d + 1), cy + dy * (d + 1)))
          )
            d++;
          return d;
        };
        return { inline: along(1, 0) + along(-1, 0) + 1, block: along(0, 1) + along(0, -1) + 1 };
      };
      const close = (cls: string) => {
        const el = document.querySelector<HTMLElement>(`[data-probe="${cls}"]`)!;
        const r = el.getBoundingClientRect();
        return { paint: [Math.round(r.width), Math.round(r.height)], hit: reach(el) };
      };
      return {
        coarse: matchMedia("(pointer: coarse)").matches,
        row: Math.round(box("#sb .sb-nav-item").height),
        railRow: [
          Math.round(box("#rail .sb-nav-item").width),
          Math.round(box("#rail .sb-nav-item").height),
        ],
        sheet: close("ui-sheet-close"),
        dialog: close("ui-dialog-close"),
      };
    });
  } finally {
    await browser.close();
  }
}

describe("touch targets on a coarse pointer (Chromium, gh#1138)", () => {
  it("lifts Sidebar rows and the overlay ✕ hit area to 44px under a finger, paint unchanged", async () => {
    const m = await measure(true);
    expect(m.coarse).toBe(true);
    expect(m.row).toBe(44);
    expect(m.railRow[0]).toBeGreaterThanOrEqual(44);
    expect(m.railRow[1]).toBe(44);
    for (const close of [m.sheet, m.dialog]) {
      expect(close.paint).toEqual([16, 16]);
      expect(close.hit.inline).toBeGreaterThanOrEqual(44);
      expect(close.hit.block).toBeGreaterThanOrEqual(44);
    }
  });

  it("keeps the desk geometry under a mouse", async () => {
    const m = await measure(false);
    expect(m.coarse).toBe(false);
    expect(m.row).toBe(32);
    for (const close of [m.sheet, m.dialog]) {
      expect(close.paint).toEqual([16, 16]);
      expect(close.hit.inline).toBeGreaterThanOrEqual(24);
      expect(close.hit.inline).toBeLessThan(30);
    }
  });
});
