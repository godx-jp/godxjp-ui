import { readFileSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Prose } from "../prose";

/**
 * gh#1112 — `Prose measure`. A wiki / decision body ran the full column (120+ characters a line at
 * 1440px); godx-task narrowed the whole page to 46rem as a stand-in. `measure` caps the reading
 * line with the same `--page-measure-*` tokens Flex and PageContainer read, without centring, and
 * a long code line stays within the cap. jsdom does not lay out: Chromium.
 */
const REPO = process.cwd();
const css = [
  "src/tokens/foundation.css",
  "src/tokens/derived.css",
  "src/tokens/semantic/layout.css",
  "src/tokens/components/data-display.css",
  "src/styles/data-display-layout.css",
]
  .map((p) => readFileSync(join(REPO, p), "utf8"))
  .join("\n");

const body = (
  <>
    <p>{"読みやすい行の長さ。".repeat(40)}</p>
    <pre>
      <code>{"const x = 1; ".repeat(200)}</code>
    </pre>
  </>
);
const markup = renderToStaticMarkup(
  <>
    <Prose id="full">{body}</Prose>
    <Prose id="narrow" measure="narrow">
      {body}
    </Prose>
    <Prose id="medium" measure="medium">
      {body}
    </Prose>
  </>,
);

async function measure(extra = "") {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.setContent(
      `<!doctype html><html lang="ja"><head><style>${css} body{margin:0} ${extra}</style></head><body><main style="inline-size:1200px">${markup}</main></body></html>`,
    );
    return await page.evaluate(() => {
      const px = (id: string) => document.getElementById(id)!.getBoundingClientRect();
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
      return {
        rem,
        full: px("full").width,
        narrow: px("narrow").width,
        medium: px("medium").width,
        narrowLeft: px("narrow").left,
        fullLeft: px("full").left,
        // The long code line stays inside the capped box (it wraps) instead of widening it.
        preInside:
          document.querySelector("#narrow pre")!.getBoundingClientRect().right <=
          px("narrow").right + 0.5,
      };
    });
  } finally {
    await browser.close();
  }
}

describe("Prose measure (Chromium, gh#1112)", () => {
  it("caps the reading line at the page-measure tokens, keeps the start edge, unset stays full", async () => {
    const m = await measure();
    expect(m.full).toBe(1200);
    expect(m.narrow).toBe(42 * m.rem);
    expect(m.medium).toBe(48 * m.rem);
    // A cap, not a centred column: the body starts where the unmeasured one does.
    expect(m.narrowLeft).toBe(m.fullLeft);
    expect(m.preInside).toBe(true);
  });

  it("a theme override of the token moves every Prose measure with it", async () => {
    const m = await measure(":root { --page-measure-narrow: 30rem; }");
    expect(m.narrow).toBe(30 * m.rem);
  });
});
