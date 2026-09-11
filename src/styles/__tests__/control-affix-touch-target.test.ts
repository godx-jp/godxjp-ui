import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * The hit area of an inline affix action — the DatePicker's calendar button and every control
 * that uses the same affix — must reach the WCAG 2.2 SC 2.5.8 floor without the PAINT growing.
 *
 * Measured on a Pixel 5 profile at 393px before this rule: 20×20, and a consumer could neither
 * reach it nor fix it — the size is neither a prop nor a token, and overriding it from outside is
 * what `ui-audit` forbids (godx-jp/id#507). After: pseudo-element 24×24, paint still 20×20.
 *
 * A CSS-text test rather than a browser one on purpose: the browser gate that would own this
 * (`check:data-entry-touch-aria`) scans painted boxes, and this fix deliberately leaves the
 * painted box alone.
 */
describe("inline affix action — hit area", () => {
  const css = readFileSync(resolve(process.cwd(), "src/styles/control.css"), "utf8");
  const rule = css.match(/\.ui-control-inline-affix-action::after\s*\{[^}]*\}/)?.[0] ?? "";

  it("carries a centred pseudo-element at the touch floor", () => {
    expect(rule).toContain("min-inline-size: var(--touch-target-min)");
    expect(rule).toContain("min-block-size: var(--touch-target-min)");
    expect(rule).toContain("translate: -50% -50%");
  });

  it("does not grow the painted affix", () => {
    const paint = css.match(/\.ui-control-inline-affix-action\s*\{[^}]*\}/g)?.join("\n") ?? "";

    expect(paint).toContain("inline-size: var(--control-inline-affix-size)");
    expect(paint).not.toContain("min-inline-size: var(--touch-target-min)");
  });
});
