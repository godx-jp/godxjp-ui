import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Neighbouring-month days — the rule main already carries, and the two shapes that broke it.
 *
 * The stylesheet's own comment records both, each paid for on a real screen:
 *
 *   1. The colour on the `<td>`. react-day-picker puts `outside` there, and the visible number is
 *      a `.ui-button--ghost` that sets its own `color`, so it never inherits the cell's. Measured
 *      at the time: an outside day and an in-month day rendered the same ink, byte for byte.
 *   2. The `:not(.day-selected)` on the BUTTON. The class it negates is never on the button, so it
 *      excluded nothing — a selected day from the neighbouring month kept `--muted-foreground` on
 *      the primary fill and failed contrast. Reported twice, for that one reason.
 *
 * Both are invisible to a render test: jsdom does no cascade, and the DOM is identical either way.
 * Reading the stylesheet is what makes the two shapes distinguishable, so this guards the SELECTOR
 * rather than the pixel — the pixel is what the contrast sweep already measures.
 */
describe("Calendar — outside days", () => {
  const css = readFileSync(join(process.cwd(), "src/styles/control.css"), "utf8");
  const rule = css.match(
    /(\.ui-calendar[^{}]*day-outside[^{}]*)\{([^}]*color:[^}]*)\}/,
  );

  it("paints the muted ink on the BUTTON, not on the cell that carries the class", () => {
    expect(rule, "no `day-outside` colour rule found in control.css").not.toBeNull();
    expect(rule![1].trim()).toMatch(/\.ui-calendar-day-button\s*$/);
  });

  it("negates `day-selected` on the CELL, where that class actually lands", () => {
    // `.day-outside:not(.day-selected)` — the two on ONE compound selector. The broken shape put
    // the `:not()` after the descendant combinator, on the button.
    expect(rule![1]).toMatch(/day-outside:not\(\.day-selected\)/);
    expect(rule![1]).not.toMatch(/day-button:not\(\.day-selected\)/);
  });

  it("uses the muted tier, which already promises AA on the calendar surface", () => {
    expect(rule![2]).toMatch(/color:\s*hsl\(var\(--muted-foreground\)\)/);
  });
});
