import { readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { chromium } from "playwright";

import { anchorIndex } from "../../../test/css-selector";
import { contrast, NON_TEXT } from "../../../tokens/__tests__/wcag-contrast";

/**
 * gh#873 — `--chart-3` measured 1.78:1 as a rendered 2px line stroke on `--card`: 59% of the
 * WCAG 2.2 SC 1.4.11 non-text floor (3:1). A prior probe on this exact palette had reported
 * 15.46:1 for every member by reading the TOKEN VALUE instead of the resolved paint, which is a
 * plausible-looking number that means nothing — `--chart-N` is a bare hex, so a probe that does
 * not run a real cascade never sees `var(--chart-3)` become `rgb(248, 181, 0)`. jsdom does not
 * run one either (`getComputedStyle` on a custom property is always `""`), so this test drives
 * real Chromium via Playwright, exactly the way src/components/charts/__tests__/
 * chart-series-knobs-865.test.tsx already does for the OTHER chart knobs.
 *
 * The palette member list is DERIVED from foundation.css's `:root` block (`--chart-<digit>`), not
 * hand-copied — the fix for #873 touches only 3 of the current 6 members, and a hand-copied list
 * would silently stop covering a 7th member added later.
 *
 * Both usages the palette actually has are measured, in both themes:
 *   · STROKE — Line/Area's edge (`chartColor()` → `stroke`, chart-cartesian.tsx).
 *   · FILL at FULL opacity — Bar's bar and Pie's slice (`chartColor()` → `fill`, same file). This
 *     is why "keep --chart-3 out of the stroke rotation" alone would not have closed the issue:
 *     Bar and Pie hand it to `fill` unchanged, and a bar/slice IS the graphical object, same floor
 *     as a line. Area's *band* fill is the one usage NOT measured here: it composites through
 *     `--chart-area-fill-alpha` (0.2) under the line that carries the value (chart-layout.css's
 *     own comment), so its rendered pixel is a blend with `--card`, not this token's raw hex.
 */

const REPO = process.cwd();
const foundation = readFileSync(join(REPO, "src/tokens/foundation.css"), "utf8");

function block(selector: string): string {
  const start = anchorIndex(foundation, selector);
  if (start === -1) throw new Error(`selector not found: ${selector}`);
  const open = foundation.indexOf("{", start);
  return foundation.slice(open + 1, foundation.indexOf("\n}", open));
}

const LIGHT_ROOT = block(":root {");

/** Every `--chart-<digit>` declared in the light `:root` block — the full current palette. */
function paletteMembers(body: string): string[] {
  const names = new Set<string>();
  for (const m of body.matchAll(/--(chart-\d+):/g)) names.add(m[1]);
  return [...names].sort((a, b) => Number(a.split("-")[1]) - Number(b.split("-")[1]));
}

const PALETTE = paletteMembers(LIGHT_ROOT);

/** Exactly the stylesheets a rendered chart loads, in load order (mirrors gh#865's helper). */
function browserStylesheet(): string {
  return [
    "src/tokens/foundation.css",
    "src/tokens/derived.css",
    "src/tokens/axes.css",
    "src/tokens/components/chart.css",
    "src/styles/chart-layout.css",
  ]
    .map((p) => readFileSync(join(REPO, p), "utf8"))
    .join("\n");
}

function rgbStringToTuple(value: string): [number, number, number] {
  const m = value.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/);
  if (!m) throw new Error(`not an rgb() string: ${value}`);
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

interface RawMeasurement {
  cardBg: string;
  stroke: string;
  fill: string;
}

/**
 * Render every palette member as a Line stroke AND a Bar/Pie-shaped fill, on a surface painted
 * `hsl(var(--card))` — exactly what the marks sit on in a real chart card — with `data-theme`
 * carrying the theme axis on `<html>`, the same element AppProvider sets it on.
 */
async function measure(theme: "light" | "dark"): Promise<Record<string, RawMeasurement>> {
  const css = browserStylesheet();
  const htmlAttr = theme === "dark" ? ' data-theme="dark"' : "";
  const marks = PALETTE.map(
    (name) => `
      <line class="stroke-${name}" x1="0" y1="0" x2="20" y2="0" stroke="var(--${name})" stroke-width="2" />
      <rect class="fill-${name}" width="20" height="20" fill="var(--${name})" />`,
  ).join("");

  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.setContent(
      `<!doctype html><html${htmlAttr}><head><style>${css}</style></head><body>
         <div id="card" style="background-color: hsl(var(--card));">
           <svg>${marks}</svg>
         </div>
       </body></html>`,
    );
    return await page.evaluate((names: string[]) => {
      const cardBg = getComputedStyle(document.getElementById("card")!).backgroundColor;
      const out: Record<string, RawMeasurement> = {};
      for (const name of names) {
        const strokeEl = document.querySelector(`.stroke-${name}`)!;
        const fillEl = document.querySelector(`.fill-${name}`)!;
        out[name] = {
          cardBg,
          stroke: getComputedStyle(strokeEl).stroke,
          fill: getComputedStyle(fillEl).fill,
        };
      }
      return out;
    }, PALETTE);
  } finally {
    await browser.close();
  }
}

describe("chart palette non-text contrast (gh#873)", () => {
  it(`derives a non-empty palette from foundation.css (found: ${PALETTE.join(", ")})`, () => {
    expect(PALETTE.length).toBeGreaterThan(0);
  });

  for (const theme of ["light", "dark"] as const) {
    describe(`${theme} theme`, () => {
      let raw: Record<string, RawMeasurement>;

      beforeAll(async () => {
        raw = await measure(theme);
      });

      it("renders every palette member", () => {
        expect(Object.keys(raw).sort()).toEqual([...PALETTE].sort());
      });

      it.each(PALETTE)(`--%s clears ${NON_TEXT}:1 as a stroke against --card`, (name) => {
        const cardRgb = rgbStringToTuple(raw[name].cardBg);
        const strokeRgb = rgbStringToTuple(raw[name].stroke);
        expect(contrast(strokeRgb, cardRgb)).toBeGreaterThanOrEqual(NON_TEXT);
      });

      it.each(PALETTE)(`--%s clears ${NON_TEXT}:1 as a full-opacity fill against --card`, (name) => {
        const cardRgb = rgbStringToTuple(raw[name].cardBg);
        const fillRgb = rgbStringToTuple(raw[name].fill);
        expect(contrast(fillRgb, cardRgb)).toBeGreaterThanOrEqual(NON_TEXT);
      });
    });
  }
});
