import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * The motion tier must be declared at `:root`, not inside a class.
 *
 * It used to live in `.ui-scale-fixed` — a class the shells put on CHROME BANDS only (the app
 * topbar, the centered-shell bar) — while every reader is elsewhere: control.css, card-layout,
 * navigation-layout, shell-layout, alert-layout, layout, motion.css and one component. Measured on
 * a docs frame before the move: `--duration-fast`, `--ease-standard`, `--duration-loop` and
 * `--reveal-distance` all returned "" at `:root`, so each declaration reading them was invalid and
 * dropped. `Activity`'s dots measured `animation-duration: 0s`; after the move, 1.4s.
 *
 * A CSS-text test because the defect is a DECLARATION SITE, and jsdom resolves no custom property
 * cascade at all — the browser said the same thing, and this is what keeps it said.
 */
describe("motion tier", () => {
  const css = readFileSync(resolve(process.cwd(), "src/tokens/foundation.css"), "utf8");
  const block = (selector: string) => {
    const open = css.indexOf(`${selector} {`);
    return open < 0 ? "" : css.slice(open, css.indexOf("\n}", open));
  };

  const TIER = [
    "--duration-fast",
    "--duration-base",
    "--duration-slow",
    "--ease-standard",
    "--reveal-distance",
    "--reveal-stagger-step",
    "--duration-loop",
    "--activity-interval",
    "--activity-stagger-step",
  ];

  it.each(TIER)("declares %s at :root", (token) => {
    expect(block(":root")).toContain(`${token}:`);
  });

  it("declares none of it inside .ui-scale-fixed", () => {
    const scoped = block(".ui-scale-fixed");

    for (const token of TIER) expect(scoped, token).not.toContain(`${token}:`);
  });
});
