import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// Guards the token-driven brand SPOTLIGHT backdrop (gh#122): the `.ui-brand-glow` utility plus the
// `--brand-glow*` tokens that drive it. jsdom does no painting, so we assert the contract (utility
// resolves to the token; every knob is themeable) is present so it can't be silently dropped. The
// actual halo is verified in a browser at ship time.
const read = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), "utf8");

describe("brand-glow CSS contract (gh#122)", () => {
  it(".ui-brand-glow paints the --brand-glow token and never steals clicks", () => {
    const css = read("../layout.css");
    const rule = css.match(/\.ui-brand-glow\s*\{[^}]*\}/)?.[0] ?? "";
    expect(rule).toMatch(/background-image:\s*var\(--brand-glow\)/);
    // it is a decorative backdrop — must not intercept pointer events from the card above it
    expect(rule).toMatch(/pointer-events:\s*none/);
  });

  it("--brand-glow is a primary radial halo, tunable via per-knob tokens", () => {
    const css = read("../../tokens/foundation.css");
    // the composed gradient + each independently overridable knob
    expect(css).toMatch(/--brand-glow:\s*radial-gradient\(/);
    expect(css).toMatch(/--brand-glow-color:\s*var\(--primary\)/);
    expect(css).toMatch(/--brand-glow-alpha:/);
    expect(css).toMatch(/--brand-glow-size:/);
    expect(css).toMatch(/--brand-glow-position:/);
    // the tint reads the colour + alpha knobs (so a service retints/softens with one override)
    expect(css).toMatch(/hsl\(var\(--brand-glow-color\)\s*\/\s*var\(--brand-glow-alpha\)\)/);
  });
});
