import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/*
 * gh#750 — `margin-block-start: auto` belongs to the FOOTER alone.
 *
 * `ddf6cd14` wrapped this file in `@layer` and left the accented header/content selectors with no
 * declaration; `b110214e` then appended the footer's auto margin to that orphan, so every accented
 * card taller than its content bottom-aligned its header AND its body — measured on a 1652px lane,
 * header top 252.19 → 799.97, content 300.19 → 1395.75 (twice, because two equal auto margins
 * split the free space). The padding those two bands were owed went with it, leaving their text
 * the rail's width off the shell line.
 */
const css = readFileSync(join(process.cwd(), "src/styles/card-layout.css"), "utf8");

/** A rule's selector list and body, with comments stripped and whitespace collapsed. */
function ruleWith(declaration: string): { selectors: string; body: string }[] {
  const bare = css.replace(/\/\*[\s\S]*?\*\//g, " ");
  return [...bare.matchAll(/([^{}]+)\{([^}]*)\}/g)]
    .map((match) => ({
      selectors: match[1].replace(/\s+/g, " ").trim(),
      body: match[2].replace(/\s+/g, " ").trim(),
    }))
    .filter((rule) => rule.body.includes(declaration));
}

describe("the card's vertical slack is the footer's (gh#750)", () => {
  it("gives `margin-block-start: auto` to the footer and to nothing else", () => {
    const rules = ruleWith("margin-block-start: auto");
    expect(rules.length, "expected exactly one rule to claim the slack").toBe(1);
    expect(rules[0].selectors).toContain('[data-slot="card-footer"]');
    expect(rules[0].selectors).not.toContain('[data-slot="card-header"]');
    expect(rules[0].selectors).not.toContain('[data-slot="card-content"]');
  });

  it("steps all three accented bands back by the rail width", () => {
    const rules = ruleWith(
      "padding-inline-start: calc(var(--card-space-inset) - var(--card-accent-rail-width))",
    );
    expect(rules.length).toBe(1);
    for (const slot of ["card-header", "card-content", "card-footer"]) {
      expect(rules[0].selectors, `${slot} must keep its text on the shell line`).toContain(
        `[data-slot="${slot}"]`,
      );
    }
  });
});
