import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { anchorIndex } from "../../../test/css-selector";

/**
 * THE ARROW'S BOX IS A TOKEN, NOT A LITERAL (gh#931).
 *
 * `--carousel-arrow-icon-size` sized the GLYPH; the BUTTON was `width: 2rem; height: 2rem`, two
 * bare literals. 32px clears WCAG 2.2 SC 2.5.8 (24px), so this was a missing knob rather than a
 * defect — but it meant the one dimension an accessibility spec actually talks about was the one
 * dimension a theme could not reach. It surfaced on a real re-theme whose own foundations say
 * "arrows44px": the consumer's only remaining option was to override a library selector from a
 * page stylesheet, which is exactly what the token tiers exist to prevent (#45).
 *
 * The default is unchanged at 2rem, so no existing carousel moves; a brand that needs the bigger
 * target declares `--carousel-arrow-size` once.
 */
const LAYOUT = readFileSync(resolve(__dirname, "../../../styles/data-display-layout.css"), "utf8");
const TOKENS = readFileSync(
  resolve(__dirname, "../../../tokens/components/data-display.css"),
  "utf8",
);

/*
 * Anchor on STRUCTURE, not on the formatting (gh#767/gh#769). A hand-wrapped literal like
 * ".ui-carousel-previous,\n.ui-carousel-next" pins the LAYOUT of the stylesheet: the moment
 * Prettier re-wraps that selector the probe reads "rule not found" and the failure blames the
 * CSS instead of the test. `anchorIndex` matches any run of whitespace where the caller wrote
 * one, so the selector can be written on one line here whatever the file does.
 *
 * The repo has a meta-guard for exactly this (`src/test/__tests__/css-probe-formatting.test.ts`)
 * and it is what caught the first version of this file — inside `verify:release`, after the tag.
 */
function rule(selector: string) {
  const at = anchorIndex(LAYOUT, selector);
  expect(at, `${selector} not found`).toBeGreaterThan(-1);
  return LAYOUT.slice(at, LAYOUT.indexOf("\n}", at));
}

describe("Carousel arrows · the target is themeable (gh#931)", () => {
  const arrows = rule(".ui-carousel-previous, .ui-carousel-next");

  it("declares the box token in the component tier, defaulting to today's 2rem", () => {
    expect(TOKENS).toMatch(/--carousel-arrow-size:\s*2rem\s*;/);
  });

  it("sizes the button FROM that token, on the logical axes", () => {
    expect(arrows).toMatch(/inline-size:\s*var\(--carousel-arrow-size\)/);
    expect(arrows).toMatch(/block-size:\s*var\(--carousel-arrow-size\)/);
  });

  it("leaves no bare 2rem literal for the box behind", () => {
    expect(arrows).not.toMatch(/\b(width|height):\s*2rem/);
  });

  it("keeps the GLYPH on its own separate knob — the two are not one decision", () => {
    expect(TOKENS).toMatch(/--carousel-arrow-icon-size:/);
    expect(rule(".ui-carousel-arrow")).toMatch(/var\(--carousel-arrow-icon-size\)/);
  });
});
