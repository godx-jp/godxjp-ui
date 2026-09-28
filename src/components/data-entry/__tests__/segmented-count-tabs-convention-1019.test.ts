import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { chromium } from "playwright";

/**
 * gh#1019 — every Segmented count pill was painted solid `--primary`, the unselected ones and the
 * zero ones included: four pills, four identical rgb(122,0,255) blobs, so the pill said nothing
 * about which segment was chosen. `Tabs` already had the right convention (gh#762): the resting
 * pill is muted, and ONLY the selected tab's pill takes the primary emphasis.
 *
 * Measured in Chromium, side by side with a real Tabs strip in the same page, so "the same as
 * Tabs" is a byte comparison of computed colours rather than a claim about token names.
 */

const STYLESHEETS = [
  "src/tokens/foundation.css",
  "src/tokens/derived.css",
  "src/tokens/axes.css",
  "src/tokens/components/control.css",
  "src/tokens/components/segmented.css",
  "src/tokens/components/navigation.css",
  "src/styles/control.css",
  "src/styles/navigation-layout.css",
];

const css = STYLESHEETS.map((path) => readFileSync(join(process.cwd(), path), "utf8")).join("\n");

const MARKUP = `
  <div data-slot="tabs" data-variant="line">
    <button data-slot="tabs-trigger" data-state="active">未対応<span class="ui-tabs-count">12</span></button>
    <button data-slot="tabs-trigger" data-state="inactive">完了<span class="ui-tabs-count">3</span></button>
  </div>
  <div class="ui-segmented" data-slot="segmented">
    <label class="ui-segmented-item ui-focus-ring" data-state="checked">
      <span class="ui-segmented-item-label">全件</span>
      <span data-slot="segmented-count" class="ui-segmented-count">54</span>
    </label>
    <label class="ui-segmented-item ui-focus-ring" data-state="unchecked">
      <span class="ui-segmented-item-label">今週</span>
      <span data-slot="segmented-count" class="ui-segmented-count">9</span>
    </label>
    <label class="ui-segmented-item ui-focus-ring" data-state="unchecked">
      <span class="ui-segmented-item-label">期限超過</span>
      <span data-slot="segmented-count" class="ui-segmented-count">0</span>
    </label>
  </div>`;

type Measured = {
  tabsActive: { bg: string; fg: string };
  tabsResting: { bg: string; fg: string };
  segSelected: { bg: string; fg: string; textRatio: number };
  segResting: Array<{ bg: string; fg: string; textRatio: number }>;
};

async function measure(theme: "light" | "dark"): Promise<Measured> {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.setContent(
      `<!doctype html><html class="${theme === "dark" ? "dark" : ""}"><head><style>${css}</style></head><body>${MARKUP}</body></html>`,
    );
    return await page.evaluate(() => {
      const probe = document.createElement("canvas").getContext("2d")!;
      const rgb = (c: string): [number, number, number] => {
        // Normalise any colour syntax Chromium hands back (rgb(), color(srgb …), oklch …).
        probe.fillStyle = "#000";
        probe.fillStyle = c;
        probe.fillRect(0, 0, 1, 1);
        const d = probe.getImageData(0, 0, 1, 1).data;
        return [d[0], d[1], d[2]];
      };
      const lum = ([r, g, b]: [number, number, number]) => {
        const f = (v: number) => {
          v /= 255;
          return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
        };
        return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
      };
      const ratio = (a: [number, number, number], b: [number, number, number]) => {
        const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
        return (hi + 0.05) / (lo + 0.05);
      };
      const read = (el: Element) => {
        const s = getComputedStyle(el);
        const bg = rgb(s.backgroundColor);
        const fg = rgb(s.color);
        return { bg: bg.join(","), fg: fg.join(","), textRatio: ratio(bg, fg) };
      };
      const tabs = document.querySelectorAll(".ui-tabs-count");
      const segSelected = document.querySelector(
        '[data-state="checked"] [data-slot="segmented-count"]',
      )!;
      const segResting = Array.from(
        document.querySelectorAll('[data-state="unchecked"] [data-slot="segmented-count"]'),
      );
      const strip = ({ bg, fg }: { bg: string; fg: string }) => ({ bg, fg });
      return {
        tabsActive: strip(read(tabs[0]!)),
        tabsResting: strip(read(tabs[1]!)),
        segSelected: read(segSelected),
        segResting: segResting.map(read),
      };
    });
  } finally {
    await browser.close();
  }
}

describe.each(["light", "dark"] as const)("Segmented count follows Tabs (gh#1019, %s)", (theme) => {
  it("resting pill = Tabs resting pill; selected pill = Tabs active pill; text ≥ 4.5:1", async () => {
    const m = await measure(theme);

    // The defect: the resting pills wore the selected pill's primary fill.
    for (const pill of m.segResting) {
      expect(pill.bg).not.toBe(m.segSelected.bg);
      expect({ bg: pill.bg, fg: pill.fg }).toEqual(m.tabsResting);
      expect(pill.textRatio).toBeGreaterThanOrEqual(4.5);
    }

    expect({ bg: m.segSelected.bg, fg: m.segSelected.fg }).toEqual(m.tabsActive);
    expect(m.segSelected.textRatio).toBeGreaterThanOrEqual(4.5);
  }, 30_000);
});
