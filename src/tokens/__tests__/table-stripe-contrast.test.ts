import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { contrast, hsl, hslToRgb, over } from "./wcag-contrast";

/**
 * gh#700 — body text on a striped table must clear WCAG 2.2 SC 1.4.3 (4.5:1) on BOTH row
 * backgrounds, in light and dark, on BOTH surfaces a list table sits on: the page (`--background`)
 * and a flush Card (`--card`). The stripe alpha is read out of the paint rule itself, so retuning
 * the default in table-layout.css re-runs this gate against the new value instead of a copy.
 */
const foundation = readFileSync(join(process.cwd(), "src/tokens/foundation.css"), "utf8");
const layout = readFileSync(join(process.cwd(), "src/styles/table-layout.css"), "utf8");

function block(selector: string): string {
  const start = foundation.indexOf(selector);
  if (start === -1) throw new Error(`selector not found: ${selector}`);
  const open = foundation.indexOf("{", start);
  return foundation.slice(open + 1, foundation.indexOf("\n}", open));
}

const stripeAlpha = Number(
  layout.match(/var\(--table-row-striped-background, hsl\(var\(--muted\) \/ ([\d.]+)\)\)/)?.[1],
);

describe("gh#700 — striped table text contrast", () => {
  it("reads the stripe default from the paint rule", () => {
    expect(stripeAlpha).toBeGreaterThan(0);
    expect(stripeAlpha).toBeLessThan(1);
  });

  describe.each([
    { theme: "light", selector: ":root {" },
    { theme: "dark", selector: '.dark,\n:root[data-theme="dark"] {' },
  ])("$theme", ({ selector }) => {
    const body = block(selector);
    const foreground = hslToRgb(hsl(body, "foreground"));
    const muted = hslToRgb(hsl(body, "muted"));

    it.each(["background", "card"])("body text on --%s: plain AND striped row ≥ 4.5:1", (name) => {
      const surface = hslToRgb(hsl(body, name));
      const plain = contrast(foreground, surface);
      const striped = contrast(foreground, over(muted, surface, stripeAlpha));
      expect(plain).toBeGreaterThanOrEqual(4.5);
      expect(striped).toBeGreaterThanOrEqual(4.5);
    });

    it("the stripe is actually visible — the two row backgrounds differ", () => {
      const surface = hslToRgb(hsl(body, "background"));
      expect(contrast(surface, over(muted, surface, stripeAlpha))).toBeGreaterThan(1);
    });
  });
});
