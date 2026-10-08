import { chromium } from "playwright";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Star } from "lucide-react";

import { AppProvider } from "../../../app/app-provider";
import { compileRealCss } from "../../data-entry/__tests__/compile-real-css";
import { Toggle } from "../../data-entry/toggle";
import { ToggleGroup, ToggleGroupItem } from "../../data-entry/toggle-group";
import { Button } from "../button";

/**
 * gh#1142 — under a finger (`pointer: coarse`) every icon-only Button and Toggle offers a 44×44
 * target; the painted box keeps the size the call site chose. Toggle-group items grow on the
 * block axis only, so a tap on one item's edge never presses its neighbour. Chromium with touch
 * emulation — jsdom has neither layout nor pointer media.
 */
const markup = renderToStaticMarkup(
  <AppProvider persist={false} defaultLocale="en">
    <div data-p="icon-sm">
      <Button size="icon-sm" aria-label="Star">
        <Star />
      </Button>
    </div>
    <div data-p="toggle">
      <Toggle aria-label="Star">
        <Star />
      </Toggle>
    </div>
    <div data-p="toggle-sm">
      <Toggle size="sm" aria-label="Star">
        <Star />
      </Toggle>
    </div>
    <div data-p="group">
      <ToggleGroup type="single" aria-label="View" size="sm">
        <ToggleGroupItem value="a" aria-label="A">
          <Star />
        </ToggleGroupItem>
        <ToggleGroupItem value="b" aria-label="B">
          <Star />
        </ToggleGroupItem>
      </ToggleGroup>
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
      `<!doctype html><html><head><style>${css} body{margin:0;padding:40px} [data-p]{margin-block:24px}</style></head><body>${markup}</body></html>`,
    );
    return await page.evaluate(() => {
      const probe = (el: HTMLElement) => {
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
        return {
          box: [Math.round(r.width), Math.round(r.height)],
          hit: [along(1, 0) + along(-1, 0) + 1, along(0, 1) + along(0, -1) + 1],
        };
      };
      const one = (p: string) =>
        probe(document.querySelector<HTMLElement>(`[data-p="${p}"] button`)!);
      const [a, b] = [...document.querySelectorAll<HTMLElement>('[data-p="group"] button')];
      const ra = a!.getBoundingClientRect();
      // One px inside A's trailing edge must still press A, never B.
      const edge = document.elementFromPoint(ra.right - 1, ra.top + ra.height / 2);
      return {
        coarse: matchMedia("(pointer: coarse)").matches,
        iconSm: one("icon-sm"),
        toggle: one("toggle"),
        toggleSm: one("toggle-sm"),
        group: probe(a!),
        groupEdgeIsA: a!.contains(edge) && !b!.contains(edge),
      };
    });
  } finally {
    await browser.close();
  }
}

describe("icon-only targets on a coarse pointer (Chromium, gh#1142)", () => {
  it("gives icon-only Buttons and Toggles a 44×44 target, box unchanged", async () => {
    const m = await measure(true);
    expect(m.coarse).toBe(true);
    for (const [name, c] of Object.entries({
      iconSm: m.iconSm,
      toggle: m.toggle,
      toggleSm: m.toggleSm,
    })) {
      expect(c.hit[0], `${name} inline`).toBeGreaterThanOrEqual(44);
      expect(c.hit[1], `${name} block`).toBeGreaterThanOrEqual(44);
    }
    // The paint stays the step the call site chose.
    expect(m.iconSm.box).toEqual([40, 40]);
    expect(m.toggleSm.box[0]).toBeLessThan(44);
    // A group item grows on the block axis and never reaches into its neighbour.
    expect(m.group.hit[1]).toBeGreaterThanOrEqual(44);
    expect(m.group.hit[0]).toBe(m.group.box[0]);
    expect(m.groupEdgeIsA).toBe(true);
  });

  it("changes nothing under a mouse: the target is the box", async () => {
    const m = await measure(false);
    expect(m.coarse).toBe(false);
    for (const c of [m.iconSm, m.toggle, m.toggleSm]) {
      expect(c.hit[0]).toBe(c.box[0]);
      expect(c.hit[1]).toBe(c.box[1]);
    }
  });
});
