import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { anchorIndex } from "../../test/css-selector";
import { contrast, hsl, hslToRgb, over } from "./wcag-contrast";

/**
 * gh#700 — a zebra stripe has two obligations and they pull against each other:
 *
 *   · it must be SEEN. The first default, `--muted / 0.4`, measured #fdfdfc against #faf9f7 in
 *     light — a stripe nobody can see does not do what "alternate the rows so they are easy to
 *     read" asked for. Common zebra tables sit around 1.04–1.08:1 between the two rows.
 *   · every text role on it must stay at AA (SC 1.4.3, 4.5:1): body ink, muted ink, the link ink
 *     and `--primary` used as action text — and the control boundary on it at 3:1 (SC 1.4.11).
 *
 * And the hover fill must remain a visible step beyond the stripe in both themes, or pointing at a
 * striped row changes nothing. Alphas are read out of the paint rules themselves, so retuning a
 * default re-runs this against the new value instead of a copy.
 */
const foundation = readFileSync(join(process.cwd(), "src/tokens/foundation.css"), "utf8");
const layout = readFileSync(join(process.cwd(), "src/styles/table-layout.css"), "utf8");

function block(selector: string): string {
  const start = anchorIndex(foundation, selector);
  if (start === -1) throw new Error(`selector not found: ${selector}`);
  const open = foundation.indexOf("{", start);
  return foundation.slice(open + 1, foundation.indexOf("\n}", open));
}

const stripeAlpha = Number(
  layout.match(/var\(--table-row-striped-background, hsl\(var\(--muted\) \/ ([\d.]+)\)\)/)?.[1],
);
const hoverAlpha = Number(
  layout.match(/var\(--table-row-hover-background, hsl\(var\(--accent\) \/ ([\d.]+)\)\)/)?.[1],
);

/** Luminance ratio between a plain row and a striped row below which the stripe is not a stripe. */
const STRIPE_VISIBLE = 1.06;
/** Ratio between the hover fill and the stripe it replaces below which hovering changes nothing. */
const HOVER_DISTINCT = 1.05;
const AA_TEXT = 4.5;
const NON_TEXT = 3;
const TEXT_ROLES = ["foreground", "muted-foreground", "text-link", "primary"] as const;

describe("gh#700 — striped table rows", () => {
  it("reads both defaults from the paint rules", () => {
    expect(stripeAlpha).toBeGreaterThan(0);
    expect(stripeAlpha).toBeLessThanOrEqual(1);
    expect(hoverAlpha).toBeGreaterThan(0);
    expect(hoverAlpha).toBeLessThanOrEqual(1);
  });

  describe.each([
    { theme: "light", selector: ":root {" },
    { theme: "dark", selector: '.dark, :root[data-theme="dark"] {' },
  ])("$theme", ({ selector }) => {
    const body = block(selector);
    const role = (name: string) => hslToRgb(hsl(body, name));

    describe.each(["background", "card"])("on --%s", (surfaceName) => {
      const surface = role(surfaceName);
      const stripe = over(role("muted"), surface, stripeAlpha);
      const hover = over(role("accent"), surface, hoverAlpha);

      it(`the stripe is visible (≥ ${STRIPE_VISIBLE}:1 against the plain row)`, () => {
        expect(contrast(surface, stripe)).toBeGreaterThanOrEqual(STRIPE_VISIBLE);
      });

      it.each(TEXT_ROLES)("--%s as text clears AA on the plain AND the striped row", (name) => {
        expect(contrast(role(name), surface)).toBeGreaterThanOrEqual(AA_TEXT);
        expect(contrast(role(name), stripe)).toBeGreaterThanOrEqual(AA_TEXT);
      });

      it.each(TEXT_ROLES)("--%s as text clears AA on a hovered row", (name) => {
        expect(contrast(role(name), hover)).toBeGreaterThanOrEqual(AA_TEXT);
      });

      it("a control boundary on a striped or hovered row keeps 3:1", () => {
        expect(contrast(role("input"), stripe)).toBeGreaterThanOrEqual(NON_TEXT);
        expect(contrast(role("input"), hover)).toBeGreaterThanOrEqual(NON_TEXT);
      });

      it(`hover is a visible step beyond the stripe (≥ ${HOVER_DISTINCT}:1) and beyond the plain row`, () => {
        expect(contrast(hover, stripe)).toBeGreaterThanOrEqual(HOVER_DISTINCT);
        expect(contrast(hover, surface)).toBeGreaterThan(contrast(stripe, surface));
      });
    });
  });
});
