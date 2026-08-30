import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * gh#254 — `.sb-label` clips with `overflow: hidden` but declared no line-height, so it inherited
 * `line-height: 1` from `.sb-nav-item`. On a clipping element the line box IS the clip box, and a
 * 1em box is shorter than the font's ascent+descent: every glyph reaching below the baseline was
 * sheared off. In Vietnamese that silently misspells the label — "Dịch vụ" lost both tone marks
 * and rendered as "Dich vu"; in Latin the tails of g/y/p were cut.
 *
 * Measured in Chromium against the bundled M PLUS 2 at the row's 0.8125rem, comparing canvas ink
 * extents (`actualBoundingBoxDescent`) with the element's own clip box:
 *
 *   line-height 1     → 1.6–1.9px of glyph destroyed
 *   line-height 1.2   → fits
 *   line-height 1.5   → fits, 1.4px headroom
 *
 * jsdom cannot lay out glyphs, so this guard pins the CSS contract instead: the invariant is that
 * NO single-line clipping box in the shell may inherit its line-height, because whatever it
 * inherits is invisible at the call site and one tight value silently destroys text.
 */

const styles = readFileSync(join(process.cwd(), "src/styles/shell-layout.css"), "utf8");
const shellTokens = readFileSync(join(process.cwd(), "src/tokens/components/shell.css"), "utf8");

/** Every flat `selector { … }` block in the sheet (these rules have no nested braces). */
function rules(): { selector: string; body: string }[] {
  return Array.from(styles.matchAll(/([^{}]+)\{([^{}]*)\}/g)).map((match) => ({
    selector: match[1].trim().split("\n").at(-1)!.trim(),
    body: match[2],
  }));
}

function rule(selector: string): string {
  const found = rules().find((candidate) => candidate.selector === selector);
  expect(found, `rule not found: ${selector}`).toBeDefined();
  return found!.body;
}

describe("gh#254 — a clipping single-line box owns its line-height", () => {
  it("no rule clips one line of text while inheriting its line box", () => {
    const inheriting = rules()
      .filter(
        ({ body }) =>
          body.includes("overflow: hidden") &&
          body.includes("white-space: nowrap") &&
          !body.includes("line-height"),
      )
      .map(({ selector }) => selector);

    expect(
      inheriting,
      "these clip text at a line box they never declared — a tight inherited value shears descenders and Vietnamese tone marks",
    ).toEqual([]);
  });

  it("the sidebar nav label reads the row's line-height knob, not the row's `line-height: 1`", () => {
    expect(rule(".sb-label")).toContain("line-height: var(--sidebar-nav-item-line-height);");
    expect(rule(".sb-nav-item")).toContain("line-height: 1;");
  });

  it("the knob defaults tall enough to clear the descenders it exists to protect", () => {
    const declared = shellTokens.match(/--sidebar-nav-item-line-height:\s*([\d.]+);/);
    expect(
      declared,
      "--sidebar-nav-item-line-height must be a documented component token",
    ).not.toBeNull();
    // 1.2 is the measured floor for the bundled face; the default keeps real headroom above it.
    expect(Number(declared![1])).toBeGreaterThanOrEqual(1.35);
  });

  it("changes the LABEL's line box only — row geometry is untouched", () => {
    expect(shellTokens).toMatch(/--sidebar-nav-item-height:\s*2rem;/);
    const row = rule(".sb-nav-item");
    expect(row).toContain("height: var(--sidebar-nav-item-height);");
    expect(row).toContain("align-items: center;");
    // 1.5 × --font-size-xs (≈12.47px) = 18.7px, comfortably inside the 32px row, so nothing
    // reflows — the same headroom the pre-gh#329 19.5px had, one step lower.
    expect(shellTokens).toMatch(/--sidebar-nav-item-font-size:\s*var\(--font-size-xs\);/);
  });
});
