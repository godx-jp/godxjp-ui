import { chromium, type Browser } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { compileRealCss } from "../../components/data-entry/__tests__/compile-real-css";

/**
 * gh#1251 in Chromium, against the real stylesheet. `DataTable.BulkActions` renders nothing at
 * count 0, so the bar is INSERTED with the first selection — a plain `transition: opacity` has no
 * "before" value on an inserted element and never runs. `@starting-style` supplies one. Measured:
 * the bar must start a CSS transition on opacity when it mounts, and must not under
 * `prefers-reduced-motion: reduce`.
 */
let css = "";
let browser: Browser;

beforeAll(async () => {
  css = await compileRealCss(
    `<div class="ui-data-table-bulk"></div><span class="ui-checkbox"></span><span class="ui-radio"></span>`,
  );
  browser = await chromium.launch({ headless: true });
}, 60_000);

afterAll(async () => {
  await browser?.close();
});

async function mountBar(reducedMotion: "reduce" | "no-preference") {
  const page = await browser.newPage();
  await page.emulateMedia({ reducedMotion });
  await page.setContent(
    `<!doctype html><html><head><style>${css}</style></head><body></body></html>`,
  );
  const result = await page.evaluate(() => {
    const bar = document.createElement("div");
    bar.className = "ui-data-table-bulk";
    document.body.append(bar);
    // Reading style flushes it: the transition (if any) starts here.
    const opacity = getComputedStyle(bar).opacity;
    const transitions = bar
      .getAnimations()
      .map((animation) => (animation as CSSTransition).transitionProperty)
      .filter(Boolean);
    return { opacity, transitions };
  });
  await page.close();
  return result;
}

describe("BulkActions bar fades in on mount (gh#1251)", { timeout: 60_000 }, () => {
  it("an inserted bar starts an opacity transition from 0", async () => {
    const { opacity, transitions } = await mountBar("no-preference");
    expect(transitions).toEqual(["opacity"]);
    expect(Number(opacity)).toBeLessThan(1);
  });

  it("under prefers-reduced-motion it appears at full opacity with no transition", async () => {
    const { opacity, transitions } = await mountBar("reduce");
    expect(transitions).toEqual([]);
    expect(opacity).toBe("1");
  });
});

describe(
  "Checkbox / Radio colour changes ease at --duration-fast (gh#1251)",
  { timeout: 60_000 },
  () => {
    it.each(["ui-checkbox", "ui-radio"])(
      "%s resolves to a 150ms colour transition, none under reduce",
      async (cls) => {
        const read = async (reducedMotion: "reduce" | "no-preference") => {
          const page = await browser.newPage();
          await page.emulateMedia({ reducedMotion });
          await page.setContent(
            `<!doctype html><html><head><style>${css}</style></head><body><span class="${cls}"></span></body></html>`,
          );
          const style = await page.locator(`.${cls}`).evaluate((el) => {
            const cs = getComputedStyle(el);
            return { property: cs.transitionProperty, duration: cs.transitionDuration };
          });
          await page.close();
          return style;
        };
        const normal = await read("no-preference");
        expect(normal.property).toBe("background-color, border-color, color");
        expect(normal.duration.split(", ").every((d) => d === "0.15s")).toBe(true);
        const reduced = await read("reduce");
        expect(reduced.duration.split(", ").every((d) => d === "0s")).toBe(true);
      },
    );
  },
);
