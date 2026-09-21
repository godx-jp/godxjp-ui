import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// Guards the token-driven brand SPOTLIGHT backdrop: the `.ui-brand-glow` utility plus the
// `--brand-glow*` tokens that drive it. jsdom does no painting, so we assert the contract (utility
// resolves to the token; every knob is themeable) is present so it can't be silently dropped. The
// actual halo is verified in a browser at ship time.
const read = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), "utf8");

describe("brand-glow CSS contract (gh#122)", () => {
  it(".ui-brand-glow paints the --brand-glow token and never steals clicks", () => {
    const css = read("../layout.css");
    const rule = css.match(/\.ui-brand-glow\s*\{[^}]*\}/)?.[0] ?? "";
    // The halo is composed HERE, at the painting element, as the knob's fallback (gh#687): composed
    // on :root it froze on the root's --primary and a nested [data-tenant] glow kept the root hue.
    expect(rule).toMatch(/background-image:\s*var\(\s*--brand-glow,\s*radial-gradient\(/);
    expect(rule).toMatch(
      /hsl\(var\(\s*--brand-glow-color, var\(\s*--primary\)\)\s*\/\s*var\(\s*--brand-glow-alpha\)\)/,
    );
    // it is a decorative backdrop — must not intercept pointer events from the card above it
    expect(rule).toMatch(/pointer-events:\s*none/);
  });

  it("--brand-glow is tunable via per-knob tokens", () => {
    const css = read("../../tokens/foundation.css");
    // the whole-gradient override + each independently overridable knob; the two that carry a
    // role are `initial` so their defaults resolve at the call site (see layout.css)
    expect(css).toMatch(/--brand-glow:\s*initial;/);
    expect(css).toMatch(/--brand-glow-color:\s*initial;/);
    expect(css).toMatch(/--brand-glow-alpha:/);
    expect(css).toMatch(/--brand-glow-size:/);
    expect(css).toMatch(/--brand-glow-position:/);
  });
});
