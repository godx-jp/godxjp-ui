import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * A sticky page header/footer must be able to reach the scroll container's real edge.
 *
 * `.ui-page-container` carries `padding: var(--space-page-active-y) 0`, and a sticky box
 * CANNOT travel into its own containing block's padding area. So with that padding left in
 * place, `bottom: 0` resolves one page-padding ABOVE the true bottom edge: the footer floats
 * short of the fold and page content scrolls through the gap behind it. Measured in Chromium
 * on the chat surface at the 24px page padding — the composer pinned at 837px inside an 861px
 * scroller, which is exactly the "floating composer" the bug report showed.
 *
 * The fix drops the container's padding on the sticky side and moves it onto the body, which
 * is what wanted the breathing room anyway. These assertions exist because the jsdom tests
 * next door can only see class names: jsdom does no layout, so nothing else in this suite can
 * fail when this geometry regresses.
 */

const layout = readFileSync(join(process.cwd(), "src/styles/layout.css"), "utf8");

/** Body of the first rule whose selector matches, with comments stripped. */
function ruleBody(selector: string): string {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = layout.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`));
  expect(match, `layout.css must keep a ${selector} rule`).not.toBeNull();
  return match![1].replace(/\/\*[\s\S]*?\*\//g, "");
}

describe("sticky page bands clear the container padding", () => {
  it("the container still pads the page on both blocks by default", () => {
    // The guard below is only meaningful while this padding exists — if the page
    // container ever stops padding itself, these rules become dead weight and
    // should go, not be kept passing.
    expect(ruleBody(".ui-page-container")).toMatch(/padding:\s*var\(--space-page-active-y\)\s+0/);
  });

  it("drops the container's block-end padding when the footer is sticky", () => {
    expect(ruleBody(".ui-page-container--sticky-footer")).toMatch(/padding-block-end:\s*0/);
  });

  it("gives that block-end space to the body instead", () => {
    expect(ruleBody(".ui-page-container--sticky-footer .ui-page-body")).toMatch(
      /padding-block-end:\s*var\(--space-page-active-y\)/,
    );
  });
});

/**
 * `fill` means the body OCCUPIES the remaining height, so overflowing content must
 * scroll INSIDE it. Without that, the container merely started at the region's top and
 * grew past it: the shell scrolled instead, and a chat transcript slid under its own
 * pinned composer — the half-sliced message line in the bug report. A sticky band can
 * never fix that, because sticky is defined as content flowing beneath the pinned box.
 *
 * Same reason as the block above for asserting on CSS text: jsdom does no layout, so
 * nothing else in this suite can fail when this geometry regresses.
 */
describe("fill makes the body the scroll container", () => {
  const shell = readFileSync(join(process.cwd(), "src/styles/shell-layout.css"), "utf8");

  it("lays the shell's main region out as a column", () => {
    // A `block` main leaves a filling container nothing to flex against.
    const match = shell.match(/\.app-main\s*\{([^}]*)\}/);
    expect(match, "shell-layout.css must keep an .app-main rule").not.toBeNull();
    const body = match![1].replace(/\/\*[\s\S]*?\*\//g, "");
    expect(body).toMatch(/display:\s*flex/);
    expect(body).toMatch(/flex-direction:\s*column/);
  });

  it("bounds the filling container to the region instead of growing past it", () => {
    const body = ruleBody(".ui-page-container--fill");
    expect(body).toMatch(/flex:\s*1/);
    expect(body).toMatch(/min-height:\s*0/);
  });

  it("gives the scroll to the body", () => {
    const body = ruleBody(".ui-page-container--fill .ui-page-body");
    expect(body).toMatch(/overflow-y:\s*auto/);
    expect(body).toMatch(/min-height:\s*0/);
  });
});
