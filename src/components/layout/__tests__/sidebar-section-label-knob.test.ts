import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * The sidebar is paintable — `--sidebar-gradient` is a published knob and
 * consumers use it to carry a project's colour. Every piece of text on it has
 * a colour knob so it can follow: item, hover, active, icon.
 *
 * The section label did not, and hardcoded `muted-foreground`. On a painted
 * sidebar that measured 1.50 against a mid-tone blue, where 11px text needs
 * 4.5 — a heading nobody could read, and nothing a consumer could do about it
 * without targeting a design-system class, which the rules forbid.
 */
describe("sidebar section label", () => {
  const css = readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), "../../../styles/shell-layout.css"),
    "utf8",
  );

  const rule = (() => {
    const start = css.indexOf(".sb-section-label {");
    return css.slice(start, css.indexOf("}", start));
  })();

  it("takes its colour from a knob", () => {
    expect(rule).toMatch(/color:\s*var\(--sidebar-section-label-foreground/);
  });

  it("falls back to what it used to be, so an unpainted sidebar is unchanged", () => {
    expect(rule).toMatch(
      /var\(--sidebar-section-label-foreground,\s*hsl\(var\(--muted-foreground\)\)\)/,
    );
  });

  it("leaves no sidebar text colour hardcoded", () => {
    // The gap was one rule among many that already had knobs; this is the
    // check that says so for the next one added.
    const section = css.slice(css.indexOf(".sb-section-label"), css.indexOf(".sb-nav {"));

    expect(section).not.toMatch(/color:\s*hsl\(var\(--[a-z-]+\)\);/);
  });
});
