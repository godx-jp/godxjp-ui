import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

/**
 * The glass bar (gh#831) — `--topbar-background-alpha` + `--topbar-backdrop-blur-size`.
 *
 * Two unrelated website showcases each hand-wrote the same translucent, blurred sticky bar, so the
 * pair became knobs on the bar that owns that job. The whole design rests on ONE property of CSS
 * that jsdom cannot paint and a screenshot cannot prove: a custom property set to `initial` is
 * guaranteed-invalid, so a declaration that reads it is invalid-at-computed-value-time and the
 * property falls back to its OWN initial value. That is what keeps `Topbar` the "pure slot bar"
 * its own docblock promises — `background-color` computes to `transparent`, `backdrop-filter` to
 * `none`, and no backdrop root is created.
 *
 * `blur(0px)` would NOT have been equivalent: it still promotes the element to a backdrop root and
 * makes it the containing block for its fixed descendants. So the assertions below are about the
 * exact shape of the two declarations, not merely that the tokens exist.
 */
const read = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), "utf8");

describe("Topbar glass contract (gh#831)", () => {
  const layout = read("../shell-layout.css");
  const tokens = read("../../tokens/components/shell.css");
  const rule = layout.match(/\n {2}\.ui-topbar \{[^}]*\}/)?.[0] ?? "";

  it("reads the alpha knob, and reads --background at the CALL SITE, not through a frozen knob", () => {
    // The freeze rule (docs/TOKENS.md): binding the tint at :root would leave a dark or
    // [data-tenant] subtree wearing the root canvas colour behind its own bar.
    expect(rule).toMatch(
      /background-color:\s*hsl\(var\(--background\)\s*\/\s*var\(--topbar-background-alpha\)\);/,
    );
  });

  it("reads the blur knob through blur(), so an unset knob yields no backdrop root", () => {
    expect(rule).toMatch(/backdrop-filter:\s*blur\(var\(--topbar-backdrop-blur-size\)\);/);
    // A literal fallback would defeat the whole design — see the docblock above.
    expect(rule).not.toMatch(/blur\(var\(--topbar-backdrop-blur-size,/);
  });

  it("ships both knobs OFF, as `initial` — the bar paints nothing until a service opts in", () => {
    expect(tokens).toMatch(/--topbar-background-alpha:\s*initial;/);
    expect(tokens).toMatch(/--topbar-backdrop-blur-size:\s*initial;/);
  });
});
