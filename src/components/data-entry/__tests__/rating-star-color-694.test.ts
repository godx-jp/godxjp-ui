import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/*
 * gh#694 — the star paint had no knob. `.ui-rating-star-filled` read `hsl(var(--warning))`
 * directly, so a brand whose stars are its own gold could only keep them by overriding an internal
 * class. The paint now reads `--rating-star-filled-color` / `--rating-star-empty-color`, `initial`
 * on :root with the old role as the call-site fallback — unset is byte-for-byte the old colour, and
 * a scoped override re-tints only that scope.
 */
const read = (rel: string) => readFileSync(join(process.cwd(), rel), "utf8");
const tokens = read("src/tokens/components/control.css");
const control = read("src/styles/control.css");
/** A rule's body with runs of whitespace collapsed — Prettier may wrap a long declaration. */
const rule = (selector: string) =>
  (control.match(new RegExp(`\\n\\s*${selector.replace(/\./g, "\\.")}\\s*\\{([^}]*)\\}`))?.[1] ?? "")
    .replace(/\s+/g, " ")
    .trim();

describe("Rating star colour knobs (gh#694)", () => {
  it("declares both colour knobs `initial`, so neither freezes a role at :root", () => {
    expect(tokens).toMatch(/--rating-star-filled-color:\s*initial;/);
    expect(tokens).toMatch(/--rating-star-empty-color:\s*initial;/);
    expect(tokens).toMatch(/--rating-star-empty-alpha:\s*0\.45;/);
  });

  it("paints a filled and a half-filled star from the knob, defaulting to --warning", () => {
    for (const selector of [".ui-rating-star-filled", ".ui-rating-star-half-filled"]) {
      expect(rule(selector)).toContain("color: hsl(var(--rating-star-filled-color, var(--warning)))");
    }
  });

  it("paints an empty star from the knob, defaulting to the old muted ink at the old alpha", () => {
    expect(rule(".ui-rating-star")).toContain(
      "color: hsl( var(--rating-star-empty-color, var(--muted-foreground)) / var(--rating-star-empty-alpha) )".replace(
        /\s+/g,
        " ",
      ),
    );
  });
});
