import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * A row of cards with unequal content must be able to line its footers up.
 *
 * `ResponsiveGrid` stretches every item to the row height, so the short cards have spare space —
 * which a `display: block` card spent as emptiness BELOW the footer. A consumer measured the
 * buttons in one row 40px apart, and the only way out was `className="flex h-full flex-col"`,
 * which `ui-audit` flags as `no-utility-layout` (godx-jp/id#521). It was right to: the fix belongs
 * in the card.
 *
 * CSS text, not jsdom: jsdom lays nothing out, so the browser did the measuring (two cards in a
 * 1fr 1fr grid, footer tops 1028 and 1028 after the fix) and this keeps the declaration honest.
 */
describe("card column", () => {
  const css = readFileSync(resolve(process.cwd(), "src/styles/card-layout.css"), "utf8");
  const rule = (selector: string) => {
    const at = css.indexOf(`${selector} {`);
    return at < 0 ? "" : css.slice(at, css.indexOf("}", at));
  };

  it("lays the card out as a column", () => {
    const base = rule('[data-slot="card"]');

    expect(base).toContain("display: flex");
    expect(base).toContain("flex-direction: column");
  });

  it("gives the footer the slack", () => {
    expect(rule('[data-slot="card"] > [data-slot="card-footer"]')).toContain(
      "margin-block-start: auto",
    );
  });
});
