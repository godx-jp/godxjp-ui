import { chromium } from "playwright";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { compileRealCss } from "../../../../src/components/data-entry/__tests__/compile-real-css";
import { Prose } from "../../../../src/components/data-display/prose";
import { Markdown } from "../markdown";

/**
 * gh#1156 in Chromium: grammar v1 drawn by Prose. Columns share the row by their widths on a wide
 * screen and stack below 40rem; a callout wears the <Callout> rail in its kind's tone; a toggle
 * opens from its summary.
 */
const BODY = [
  "::::columns\n:::column{width=25}\nNarrow\n:::\n\n:::column\nWide\n:::\n::::",
  "> [!WARNING] Careful\n> Body",
  ":::toggle[More]\nHidden body\n:::",
].join("\n\n");
const markup = renderToStaticMarkup(
  <Prose>
    <Markdown>{BODY}</Markdown>
  </Prose>,
);

async function measure(width: number) {
  const css = await compileRealCss(markup);
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await page.setContent(
      `<!doctype html><html><head><style>${css} body{margin:0;padding:16px}</style></head><body>${markup}</body></html>`,
    );
    const m = await page.evaluate(() => {
      const [a, b] = [...document.querySelectorAll<HTMLElement>(".ui-prose-column")];
      const ra = a!.getBoundingClientRect();
      const rb = b!.getBoundingClientRect();
      const callout = getComputedStyle(document.querySelector(".ui-prose-callout")!);
      // The warning tone, resolved the same way the stylesheet resolves it.
      const probe = document.createElement("span");
      probe.style.color = "hsl(var(--warning))";
      document.body.append(probe);
      return {
        sameRow: Math.abs(ra.top - rb.top) < 1,
        ratio: Math.round((rb.width / ra.width) * 10) / 10,
        stacked: rb.top >= ra.bottom,
        rail: callout.borderInlineStartWidth,
        railColor: callout.borderInlineStartColor,
        warning: getComputedStyle(probe).color,
        hiddenBefore: !document.querySelector(".ui-prose-toggle p")!.checkVisibility(),
      };
    });
    await page.click(".ui-prose-toggle-summary");
    const shownAfter = await page.evaluate(() =>
      document.querySelector(".ui-prose-toggle p")!.checkVisibility(),
    );
    return { ...m, shownAfter };
  } finally {
    await browser.close();
  }
}

describe("grammar v1 in Prose (Chromium, gh#1156)", () => {
  it("lays columns out by width on a wide screen and stacks them on a phone", async () => {
    const wide = await measure(1024);
    expect(wide.sameRow).toBe(true);
    expect(wide.ratio).toBe(3); // 25 vs the remaining 75
    const phone = await measure(390);
    expect(phone.sameRow).toBe(false);
    expect(phone.stacked).toBe(true);
  });

  it("draws the callout rail and opens a toggle from its summary", async () => {
    const m = await measure(1024);
    expect(parseFloat(m.rail)).toBeGreaterThan(0);
    expect(m.railColor).toBe(m.warning);
    expect(m.hiddenBefore).toBe(true);
    expect(m.shownAfter).toBe(true);
  });
});
