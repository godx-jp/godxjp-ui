import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * A `basis-*` UTILITY ON `<CarouselItem>` MUST WIN (gh#930).
 *
 * `.ui-carousel-item` carried `min-width: 100%` to mean "one slide fills the rail". A `min-width`
 * floor beats `flex-basis`, so the multi-item composition this component's own documentation
 * prescribes — `<CarouselItem className="basis-full sm:basis-1/2 lg:basis-1/3">` — computed
 * `flex-basis: 33.3333%` and still painted a full-width slide. The failure was silent: the rail
 * still scrolled, it just showed one card where three were asked for.
 *
 * Measured in Chromium at 1440 on this repo's own `/isolate/data-display-carousel`, whose
 * "multi-item" example is written exactly that way:
 *
 *     rail (.ui-carousel-viewport)   1278px
 *     item, before                   1310px   basis 33.3333%, min-width 100%   1-up, 32px WIDER
 *                                                                              than its own rail
 *     item, after                     426px   basis 33.3333%, min-inline 0     3-up
 *
 * `flex-shrink: 0` is the second half, and dropping it cost its own measured round: a flex item
 * shrinks below its width, so with the basis no longer pinned every slide collapsed to share the
 * rail — 262px each, on the utility row and the plain rows alike, where a plain row owes a full
 * 1278px. The old `min-width: 100%` had been holding the shrink too.
 *
 * THE RULE MAY NOT DECLARE `flex-basis` EITHER. This carousel block is UNLAYERED, so anything in
 * it outranks all of `@layer utilities`: the first attempt, `flex: 0 0 100%`, merely moved the
 * blockage from `min-width` to `flex-basis` and the item measured 1310px again. `inline-size`
 * with the basis left at `auto` is what has nothing to lose — a basis of `auto` sizes from width
 * (same default), and a `basis-*` utility sets a DEFINITE basis, which beats width in a flex row
 * by Flexbox §7.2.3 rather than by out-ranking anyone.
 *
 * jsdom performs no layout, so the pixels above are the browser's. What this test holds is the
 * shipped CSS contract that makes them possible.
 */
const CSS = readFileSync(
  resolve(__dirname, "../../../styles/data-display-layout.css"),
  "utf8",
);

function rule(selector: string) {
  const at = CSS.indexOf(`\n${selector} {`);
  expect(at, `${selector} not found`).toBeGreaterThan(-1);
  return CSS.slice(at, CSS.indexOf("\n}", at));
}

describe("CarouselItem · one-slide default is a basis, not a minimum (gh#930)", () => {
  const item = rule(".ui-carousel-item");

  it("expresses the full-width default as a width, not a minimum", () => {
    expect(item).toMatch(/inline-size:\s*100%/);
    expect(item).not.toMatch(/min-width:\s*100%/);
    expect(item).not.toMatch(/min-inline-size:\s*100%/);
  });

  it("leaves `flex-basis` alone, because an unlayered rule would outrank every `basis-*`", () => {
    expect(item).not.toMatch(/flex-basis\s*:/);
    // The `flex` SHORTHAND is what would reset the basis; the shrink longhand is fine and needed.
    expect(item).not.toMatch(/\bflex\s*:\s*[^;]*\d/);
  });

  it("pins the shrink factor, which is the other thing `min-width: 100%` was doing", () => {
    expect(item).toMatch(/flex-shrink:\s*0\b/);
  });

  it("zeroes the flex minimum so a utility — or a long unbreakable string — can shrink it", () => {
    expect(item).toMatch(/min-inline-size:\s*0\b/);
  });

  it("keeps the gutter that pairs with .ui-carousel-content's negative margin", () => {
    expect(item).toMatch(/padding-inline:\s*var\(--space-4\)/);
    expect(rule(".ui-carousel-content")).toMatch(
      /margin-inline:\s*calc\(var\(--space-4\)\s*\*\s*-1\)/,
    );
  });
});
