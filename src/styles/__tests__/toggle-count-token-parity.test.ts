import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = join(import.meta.dirname, "../..");

const toggleTokens = readFileSync(join(root, "tokens/components/toggle.css"), "utf8");
const controlTokens = readFileSync(join(root, "tokens/components/control.css"), "utf8");
const toggleStyles = readFileSync(join(root, "styles/toggle.css"), "utf8");
const controlStyles = readFileSync(join(root, "styles/control.css"), "utf8");

function tokenValue(css: string, token: string): string | undefined {
  return css.match(new RegExp(`^\\s*${token}:\\s*([^;]+);`, "m"))?.[1].trim();
}

/**
 * gh#312 — Toggle carries Button's counter-pill vocabulary, so the two pills must LOOK the same.
 *
 * They deliberately do not share a token: rule #45 gives each component its own knob, and
 * check:typography forbids the `var(--toggle-…, var(--button-…))` call-site-fallback shape for a
 * font-size. What keeps them together is this test — the moment someone retunes one pill's
 * geometry and forgets the other, a "Toggle count beside a Button count" stops being
 * indistinguishable and CI says so.
 *
 * COLOUR is explicitly NOT asserted equal: Toggle's pill sits on a surface that inverts when
 * pressed, and Button's translucent-tint treatment cannot clear WCAG 1.4.3 AA over it (measured
 * 3.82:1 at the xs step). Those knobs are Toggle's own on purpose — see tokens/components/toggle.css.
 */
describe("Toggle counter pill ↔ Button counter pill (gh#312)", () => {
  it.each([
    ["--toggle-count-min-width", "--button-count-min-width"],
    ["--toggle-count-space-inline", "--button-count-space-inline"],
    ["--toggle-count-font-size", "--button-count-font-size"],
  ])("%s carries Button's %s value", (toggleToken, buttonToken) => {
    const mine = tokenValue(toggleTokens, toggleToken);
    const theirs = tokenValue(controlTokens, buttonToken);
    expect(theirs, `${buttonToken} disappeared from control.css`).toBeDefined();
    expect(mine, `${toggleToken} must equal ${buttonToken} (${theirs})`).toBe(theirs);
  });

  it("uses the same pill corner as Button's counter", () => {
    expect(tokenValue(toggleTokens, "--toggle-count-radius")).toBe("var(--radius-pill)");
    expect(controlStyles).toMatch(
      /\.ui-button-count\s*\{[^}]*border-radius:\s*var\(--radius-pill\)/,
    );
  });

  it("uses the same digit metrics as Button's counter (tabular-nums, unit line-height)", () => {
    for (const css of [toggleStyles, controlStyles]) {
      expect(css).toMatch(/font-variant-numeric:\s*tabular-nums/);
    }
    expect(toggleStyles).toMatch(/\.ui-toggle-count\s*\{[^}]*line-height:\s*1;/);
  });

  it("keeps every counter-pill COLOUR knob a role-mirror knob (`initial` at :root)", () => {
    for (const token of [
      "--toggle-count-background",
      "--toggle-count-color",
      "--toggle-pressed-count-background",
      "--toggle-pressed-count-color",
      "--toggle-pressed-border-color",
    ]) {
      // A `:root` binding to a role freezes at the :root value, so a scoped [data-tenant]/.dark
      // override of that role would never reach the pill. docs/TOKENS.md · role-mirror knobs.
      expect(tokenValue(toggleTokens, token), `${token} must be declared initial`).toBe("initial");
      expect(toggleStyles, `${token} needs its role default at the call site`).toContain(
        `var(${token}, hsl(var(--`,
      );
    }
  });

  it("encodes the pressed state with more than a hue change (WCAG 1.4.1)", () => {
    // The pill fill/text INVERT, the chip border becomes themeable, and forced-colors gets an
    // outline — three encodings that survive greyscale and a flattened palette.
    expect(toggleStyles).toMatch(
      /\.ui-toggle\[data-state="on"\] \.ui-toggle-count\s*\{[^}]*background:[^}]*color:/,
    );
    expect(toggleStyles).toMatch(/@media \(forced-colors: active\)/);
    expect(toggleStyles).toMatch(/outline:\s*var\(--toggle-count-forced-outline-width\)/);
  });
});
