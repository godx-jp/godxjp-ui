import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * A RULED Calendar's weekday header keeps its text off the rule above it.
 *
 * Measured in Chromium before the fix, `<Calendar bordered>`: the header cell had no block padding,
 * so its line box started right at the 1px top border — text 1px from the rule, 2.19px from the
 * one below, an inset below the smallest step of the spacing scale. gino-cloud's `/ui-review`
 * found it. jsdom does no layout, so the pixel is not observable here; what is observable, and
 * what broke, is the stylesheet: which rule carries the inset and what the inset reads.
 */
describe("Calendar bordered — weekday header inset", () => {
  const css = readFileSync(join(process.cwd(), "src/styles/control.css"), "utf8").replace(
    /\/\*[\s\S]*?\*\//g,
    "",
  );
  const tokens = readFileSync(join(process.cwd(), "src/tokens/components/control.css"), "utf8");
  const bodies = (selector: RegExp) =>
    [...css.matchAll(new RegExp(`${selector.source}\\s*\\{([^}]*)\\}`, "g"))].map((m) => m[1]);

  it("insets the ruled header cell's text from the rule above it", () => {
    const ruled = bodies(/\.ui-calendar\[data-bordered="true"\] \.ui-calendar-weekday/);
    expect(
      ruled.some((body) =>
        /padding-block:\s*var\(--calendar-bordered-weekday-padding-block\);/.test(body),
      ),
    ).toBe(true);
  });

  it("takes the inset from a named step of the spacing scale, never a literal", () => {
    expect(tokens).toMatch(/--calendar-bordered-weekday-padding-block:\s*var\(--space-1\);/);
  });

  it("leaves the unruled header alone — it has no edge for its text to sit against", () => {
    const unruled = bodies(/\n\s*\.ui-calendar-weekday/);
    expect(unruled.length).toBeGreaterThan(0);
    for (const body of unruled) expect(body).not.toMatch(/padding/);
  });
});
