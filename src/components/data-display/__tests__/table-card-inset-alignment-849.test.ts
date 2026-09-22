import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * gh#849 — a card and the table inside it sat on two different optical axes.
 *
 * Measured in Chromium on /showcase/table-pagination at 1440px, as a gap from the card's inner
 * edge, BEFORE this fix:
 *
 *   card header (title / count)     17px
 *   table th/td (column text)       13px   <- the odd one out
 *   pagination footer               17px
 *
 * On both edges, on every card. The cause was two spacing FAMILIES meeting at one edge: the card
 * read the section step (--card-space-inset -> --space-section-active, 16px) and the table read
 * the control step (--control-padding-x, 12px). A table is the flush body of a card more often
 * than it is anything else, so the two met on the most common composition this library ships.
 *
 * It could not be settled in the footer, because --table-pagination-padding-x defaults to the CELL
 * token by design ("so the rows-per-page label sits on the same optical axis as the first
 * column's text"). Either the cells move to the card's inset, or a card disagrees with its own
 * content forever.
 *
 * What this test pins is the RELATIONSHIP, not either number — 12 and 16 are both legal Carbon
 * steps, and the defect was never the value.
 */
const tokensDir = resolve(process.cwd(), "src/tokens/components");
const tableTokens = readFileSync(resolve(tokensDir, "table.css"), "utf8");
const cardTokens = readFileSync(resolve(tokensDir, "card.css"), "utf8");
const tableCss = readFileSync(resolve(process.cwd(), "src/styles/table-layout.css"), "utf8");

/** The token a declaration resolves to, with comments stripped. */
function valueOf(css: string, name: string): string {
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const match = stripped.match(new RegExp(`${name}:\\s*([^;]+);`));
  return match ? match[1].trim() : "";
}

describe("a card and the table inside it share one inline inset (gh#849)", () => {
  it("resolves the cell inset and the card inset to the SAME source token", () => {
    // The card's inset. Named here so a future retune of either side fails this test rather than
    // silently reopening the 4px seam.
    expect(valueOf(cardTokens, "--card-space-inset")).toBe("var(--space-section-active)");

    // The cell inset must resolve to that same source. It is declared `initial`, so the default
    // lives at the call site — assert it there.
    expect(valueOf(tableTokens, "--table-cell-space-x")).toBe("initial");
    for (const read of tableCss.matchAll(/var\(\s*--table-cell-space-x\s*,\s*([^)]+)\)/g)) {
      expect(read[1].trim(), "every read site defaults to the card's own source").toBe(
        "var(--space-section-active",
      );
    }
  });

  it("leaves NO read site without the call-site default", () => {
    // A bare `var(--table-cell-space-x)` resolves to nothing now that the knob is `initial`, so a
    // missed call site is not a 4px drift — it is zero padding.
    const stripped = tableCss.replace(/\/\*[\s\S]*?\*\//g, "");
    const bare = [...stripped.matchAll(/var\(\s*--table-cell-space-x\s*\)/g)];
    expect(bare.map((m) => m[0])).toEqual([]);
  });

  it("does not re-bind the knob at :root, which is what froze the old one", () => {
    /*
     * The previous binding was `--table-cell-space-x: var(--control-padding-x)` at `:root`, and a
     * custom property substitutes where it is DECLARED — so it froze at the root's answer.
     * Probed in Chromium before the fix: setting --control-padding-x on the card left the cell
     * padding at 12px, and on a subtree with --scaling .92 the control step resolved to 11.04px
     * while the cell still used the root's unscaled 12px. The token claimed to track another and
     * silently did not. docs/TOKENS.md — "Role-mirror knobs MUST be `initial`".
     */
    const rootBlock = tableTokens.slice(tableTokens.indexOf(":root"));
    const decl = rootBlock.match(/--table-cell-space-x:\s*([^;]+);/);
    expect(decl?.[1].trim()).toBe("initial");
    expect(decl?.[1]).not.toMatch(/var\(/);
  });
});
