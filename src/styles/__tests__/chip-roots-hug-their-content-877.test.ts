import { readFileSync } from "node:fs";
import { join } from "node:path";

import { chromium } from "playwright";
import { describe, expect, it } from "vitest";

/**
 * A chip's width is its content, in every container (gh#877).
 *
 * `Badge` and `Segmented` both declare `display: inline-flex`, and that guarantees nothing: a flex
 * item is BLOCKIFIED (CSS Display 3 §2.7), so `inline-flex` computes to `flex`, and the parent's
 * default `align-items: stretch` fills the cross axis. Measured on the same `inline-flex` chip:
 *
 *     parent display:block            inline-flex    46px   ✓
 *     parent flex-direction:column    flex          600px   ✗
 *     parent flex-direction:row       flex           46px   ✓
 *     parent display:grid             flex          600px   ✗
 *
 * A `Flex direction="col"`, a `FormField` and a `DataTable` cell are all column flex containers —
 * the ordinary way both components are used. On `/showcase/caimono-price-comparison` a two-option
 * Segmented spanned 659px of a 659px card and a 109px "Tổng thấp nhất" badge filled its 354px
 * column, reading as a filled bar rather than a chip.
 *
 * It is a defect and not a layout choice because `Segmented` already has `block`
 * (`inline-size: 100%`) as the documented way to ask for full width. A knob that opts IN to what
 * the default already does is not a knob.
 *
 * THE TEST RUNS IN A REAL ENGINE because blockification is the engine's, not the stylesheet's:
 * jsdom reports the declared `inline-flex` and would pass on the broken CSS.
 */

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");
const css = [
  "src/tokens/foundation.css",
  "src/tokens/components/segmented.css",
  "src/tokens/components/badge.css",
  "src/styles/control.css",
  "src/styles/badge-layout.css",
]
  .map((p) => {
    try {
      return read(p);
    } catch {
      return "";
    }
  })
  .join("\n")
  // `@import` cannot resolve inside a `<style>`, so it goes. The `@layer` wrappers STAY: stripping
  // the opening `@layer x {` leaves its `}` behind, and 21 stray closing braces put the parser into
  // error recovery that silently swallowed the very rule under test — it reported the defect as
  // unfixed while the fix was in the string being parsed.
  .replace(/@import[^;]+;/g, "");

/** Width of one chip inside a 600px column-flex parent, and inside a plain block for reference. */
async function widths(markup: string) {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.setContent(
      `<!doctype html><html><head><style>${css}</style></head><body>
         <div id="col" style="display:flex;flex-direction:column;inline-size:600px">${markup}</div>
         <div id="grid" style="display:grid;inline-size:600px">${markup}</div>
         <div id="block" style="display:block;inline-size:600px">${markup}</div>
       </body></html>`,
    );
    return await page.evaluate(() =>
      ["col", "grid", "block"].map((id) =>
        Math.round(
          (document.getElementById(id)!.firstElementChild as HTMLElement).getBoundingClientRect()
            .width,
        ),
      ),
    );
  } finally {
    await browser.close();
  }
}

const BADGE = `<span data-slot="badge" class="ui-focus-ring">chip</span>`;
const SEGMENTED = `<div class="ui-segmented" data-slot="segmented">
   <label class="ui-segmented-item" data-state="checked"><span class="ui-segmented-item-label">A</span></label>
   <label class="ui-segmented-item" data-state="unchecked"><span class="ui-segmented-item-label">B</span></label>
 </div>`;

describe("chip roots hug their content in every container (gh#877)", { timeout: 40_000 }, () => {
  it("Badge does not fill a column-flex or grid parent", async () => {
    const [col, grid, block] = await widths(BADGE);
    // The reference: in a block parent nothing stretches, so this is the chip's own width.
    expect(block).toBeLessThan(600);
    expect(col, "column-flex parent").toBe(block);
    expect(grid, "grid parent").toBe(block);
  });

  it("Segmented does not fill a column-flex or grid parent", async () => {
    const [col, grid, block] = await widths(SEGMENTED);
    expect(block).toBeLessThan(600);
    expect(col, "column-flex parent").toBe(block);
    expect(grid, "grid parent").toBe(block);
  });

  it("`block` still fills — the opt-in must survive the default hugging", async () => {
    const [col] = await widths(
      SEGMENTED.replace('data-slot="segmented"', 'data-slot="segmented" data-block="true"'),
    );
    // `inline-size: 100%` is a CONTENT-box claim, so the track's own padding sits outside it.
    expect(col).toBeGreaterThanOrEqual(600);
  });
});
