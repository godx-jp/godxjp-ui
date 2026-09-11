import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * SEGMENTED'S BOX GEOMETRY, PINNED IN THE SOURCE — because jsdom has no layout and every one of
 * these defects was invisible to a rendering test that cannot paint.
 *
 * All three were measured in Chromium at 1280px before the fix:
 *
 *   size="sm" / "md" / "lg"     track 65.72x32, item 28px  — IDENTICAL, three tiers doing nothing
 *   vertical + block            rows 23.8px (collapsed to the line box, not 28px)
 *   vertical inside MobileShell rows 28px, where the shell scopes --control-height to 44px
 *
 * `check:control-sizing` was green throughout and was right to be: it checks that a control's
 * height DERIVES from `--control-height`, and this one textually did. What it cannot see is WHERE
 * the derivation is declared — and a `calc()` over two custom properties is substituted at its
 * declaring element, then inherits as a frozen length. Declared at `:root`, `--segmented-item-height`
 * was computed once against the root's 32px and no scope below it could move it.
 *
 * So the assertions are about the SHAPE of the CSS, not about pixels: which selector owns the
 * composition, and which selector each flex rule is scoped to.
 */
const CONTROL_CSS = readFileSync(join(process.cwd(), "src/styles/control.css"), "utf8");
const SEGMENTED_TOKENS = readFileSync(
  join(process.cwd(), "src/tokens/components/segmented.css"),
  "utf8",
);

/** The body of the first rule whose selector text starts with `selector`, comments stripped. */
function rule(css: string, selector: string): string {
  const start = css.indexOf(`${selector} {`);
  expect(start, `rule not found: ${selector}`).toBeGreaterThan(-1);
  const open = css.indexOf("{", start);
  let depth = 1;
  let i = open + 1;
  while (i < css.length && depth > 0) {
    if (css[i] === "{") depth += 1;
    else if (css[i] === "}") depth -= 1;
    i += 1;
  }
  return css.slice(open + 1, i - 1).replace(/\/\*[\s\S]*?\*\//g, "");
}

describe("Segmented sizes from the scope it is IN, not from :root", () => {
  it("composes --segmented-item-height on .ui-segmented", () => {
    expect(rule(CONTROL_CSS, "  .ui-segmented")).toContain(
      "--segmented-item-height: calc(var(--control-height) - var(--segmented-track-padding) * 2)",
    );
  });

  /**
   * Four options must survive a phone. Measured at 393px without this: four options with counts in
   * a 361px track, every label truncated and 「失踪・帰国 0」 showing 9.1px of its 25.1px count.
   * `check:segmented-wrap` measures the rendered rows; this pins the one declaration it rests on.
   */
  it("lets the track wrap to a second row instead of truncating its members", () => {
    expect(rule(CONTROL_CSS, "  .ui-segmented")).toMatch(/flex-wrap:\s*wrap;/);
  });

  /**
   * The counterpart, and the assertion that actually fails if someone moves the composition back:
   * the token file must hold the INPUTS and not the sum. `--segmented-track-padding` stays there
   * (it is a constant); `--segmented-item-height` must not, because it reads a scopable token.
   */
  it("does not declare the sum at :root, where the scope would be frozen out", () => {
    expect(SEGMENTED_TOKENS).toContain("--segmented-track-padding:");
    expect(SEGMENTED_TOKENS).not.toMatch(/^\s*--segmented-item-height:/m);
  });

  /**
   * `flex: 1 1 0` is an equal-share claim on the MAIN axis, and a vertical bar's main axis is the
   * block axis — where the item's own height lives. Unscoped it zeroed the basis and let each row
   * collapse to its line box (23.8px measured against the 28px asked for). A column gets its equal
   * widths from the track's `align-items: stretch` instead.
   */
  it("keeps the block-axis flex share away from the vertical orientation", () => {
    expect(CONTROL_CSS).toContain(
      '.ui-segmented[data-block="true"]:not([data-orientation="vertical"]) > .ui-segmented-item',
    );
  });

  /**
   * A row in a column IS a control, so it is a whole control tall. The `− track padding × 2`
   * subtraction exists so a ONE-ROW horizontal bar measures exactly `--control-height` overall and
   * sits level with an Input; stacked, it only shaves every target. Inside a `MobileShell`
   * (`--control-height: 2.75rem`) this is the difference between 40px rows and rule #24's 44px.
   */
  it("gives a stacked row the whole control height", () => {
    expect(
      rule(CONTROL_CSS, '  .ui-segmented[data-orientation="vertical"] > .ui-segmented-item'),
    ).toContain("block-size: var(--control-height)");
  });
});
