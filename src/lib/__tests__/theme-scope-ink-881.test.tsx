import { chromium, type Browser } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

/**
 * A scoped theme can re-ink its text (gh#881).
 *
 * `src/styles/base.css:261` sets `color: hsl(var(--foreground))` on `body`. `body` sits above
 * every scope a consumer can create, so that `var()` substitutes against the ROOT's `--foreground`
 * once and everything below inherits the resolved colour. Measured before the fix, on a region
 * whose own `--foreground` was near-white: the title's computed `--foreground` WAS the light
 * value, its `color` was `rgb(36,35,30)`, and every element in the chain reported `inScope: true`.
 * Real-pixel contrast 1.34:1.
 *
 * It is the `:root` freeze rule (docs/TOKEN-RESOLUTION.md §3) applied to a PROPERTY rather than a
 * token, and worse there: a token can be given a knob, `color` on `body` has none to give.
 *
 * THE FIX IS OPT-IN, which is why the control below matters as much as the assertion. `ThemeScope`
 * re-states `color` on itself and on the body-level overlay host; a plain `<div>` carrying the same
 * `--foreground` still inherits the root's ink, and that remains documented rather than silently
 * half-fixed.
 *
 * Chromium, not jsdom: jsdom resolves no custom property and would pass on the broken build.
 */

let browser: Browser;
beforeAll(async () => {
  browser = await chromium.launch();
}, 60_000);
afterAll(async () => {
  await browser?.close();
});

const PAGE = `<!doctype html><html><head><style>
  body { color: hsl(var(--foreground)); }
  :root { --foreground: 40 8% 13%; }
  /* what ThemeScope renders */
  .scope { display: contents; color: hsl(var(--foreground)); }
  /* what a plain wrapper renders */
  .plain { display: contents; }
</style></head><body>
  <div class="scope" style="--foreground: 0 0% 100%"><span id="scoped">x</span></div>
  <div class="plain" style="--foreground: 0 0% 100%"><span id="plain">x</span></div>
  <span id="outside">x</span>
</body></html>`;

describe("a scoped theme re-inks its text (gh#881)", { timeout: 40_000 }, () => {
  it("text inside the scope takes the scope's --foreground", async () => {
    const page = await browser.newPage();
    await page.setContent(PAGE);
    const ink = await page.evaluate(
      () => getComputedStyle(document.getElementById("scoped")!).color,
    );
    await page.close();
    expect(ink).toBe("rgb(255, 255, 255)");
  });

  it("a plain wrapper does NOT — the fix is opt-in, and that is the documented limit", async () => {
    const page = await browser.newPage();
    await page.setContent(PAGE);
    const ink = await page.evaluate(
      () => getComputedStyle(document.getElementById("plain")!).color,
    );
    await page.close();
    // The control. Without it, the assertion above could pass because `body` happened to be white.
    expect(ink).toBe("rgb(36, 34, 30)");
  });

  it("text outside every scope is untouched", async () => {
    const page = await browser.newPage();
    await page.setContent(PAGE);
    const ink = await page.evaluate(
      () => getComputedStyle(document.getElementById("outside")!).color,
    );
    await page.close();
    expect(ink).toBe("rgb(36, 34, 30)");
  });
});
