import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Swatch } from "../swatch";

const read = (relativePath: string) =>
  readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), "utf8");
const displayCss = read("../../../styles/data-display-layout.css");
const displayTokens = read("../../../tokens/components/data-display.css");

/** The one rule that paints the mark. */
const swatchRule = displayCss.match(/\.ui-swatch\s*\{[^}]*\}/)![0];

/**
 * Swatch — the read-only sample of a colour a person chose (gh#527).
 *
 * The consumer move it replaces was a hand-rolled square, which ui-audit blocks three ways at once
 * (no-arbitrary-size, no-arbitrary-radius, no-arbitrary-hex) — so before this component the only
 * way to show a brand's own colour was a suppression comment.
 */
describe("Swatch", () => {
  it("carries the caller's colour as a VALUE on the element, never as a class", () => {
    const { container } = render(<Swatch color="#7C3AED" />);
    const swatch = container.querySelector(".ui-swatch") as HTMLElement;

    expect(swatch.style.getPropertyValue("--swatch-color")).toBe("#7C3AED");
    expect(swatch.className).toBe("ui-swatch");
  });

  it("takes any CSS colour, not only a hex", () => {
    const { container } = render(<Swatch color="oklch(0.7 0.15 200)" />);

    expect(
      (container.querySelector(".ui-swatch") as HTMLElement).style.getPropertyValue(
        "--swatch-color",
      ),
    ).toBe("oklch(0.7 0.15 200)");
  });

  it("announces the colour when given a name — the whole point of a label-less sample", () => {
    render(<Swatch color="#7C3AED" aria-label="ブランドカラー: #7C3AED" />);

    expect(screen.getByRole("img", { name: "ブランドカラー: #7C3AED" })).toBeInTheDocument();
  });

  it("is hidden from assistive tech when it has no name, so it never announces a bare square", () => {
    const { container } = render(<Swatch color="#7C3AED" />);
    const swatch = container.querySelector(".ui-swatch")!;

    expect(swatch).toHaveAttribute("aria-hidden", "true");
    expect(swatch).not.toHaveAttribute("role");
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("takes its name from aria-labelledby too — the FormField/Descriptions path", () => {
    render(
      <>
        <span id="brand-primary-label">プライマリカラー</span>
        <Swatch color="#7C3AED" aria-labelledby="brand-primary-label" />
      </>,
    );

    expect(screen.getByRole("img", { name: "プライマリカラー" })).toBeInTheDocument();
  });

  it("keeps a caller's own style and merges the colour into it", () => {
    const { container } = render(<Swatch color="#7C3AED" style={{ opacity: 0.5 }} />);
    const swatch = container.querySelector(".ui-swatch") as HTMLElement;

    expect(swatch.style.opacity).toBe("0.5");
    expect(swatch.style.getPropertyValue("--swatch-color")).toBe("#7C3AED");
  });

  /**
   * The colour is DATA and must stay out of the stylesheet: a hex in a rule is a value nobody can
   * theme and the exact thing `no-arbitrary-hex` forbids a consumer from writing.
   */
  it("paints from the custom property alone — no colour literal in the rule", () => {
    expect(swatchRule).toContain("background: var(--swatch-color)");
    expect(swatchRule).not.toMatch(/#[0-9a-fA-F]{3,8}/);
  });

  /** An undeclared custom property has nothing to fall back to — the whole rule drops instead. */
  it("declares every knob the rule reads, so the paint always resolves", () => {
    for (const token of [
      "--swatch-color",
      "--swatch-size",
      "--swatch-radius",
      "--swatch-border-width",
      "--swatch-border-color",
    ]) {
      expect(swatchRule).toContain(`var(${token}`);
      expect(displayTokens).toMatch(new RegExp(`${token}:`));
    }
  });

  /**
   * The hairline is the reason a WHITE value is still a visible sample on a white card, and
   * forced-colors must not repaint a colour that IS the content.
   */
  it("keeps the hairline and the real colour under forced colors", () => {
    expect(swatchRule).toContain("box-shadow: inset 0 0 0 var(--swatch-border-width)");
    expect(swatchRule).toContain("forced-color-adjust: none");
  });

  it("sizes and rounds from tokens only — no literal geometry in the rule", () => {
    expect(swatchRule).toContain("inline-size: var(--swatch-size)");
    expect(swatchRule).toContain("block-size: var(--swatch-size)");
    expect(swatchRule).toContain("border-radius: var(--swatch-radius)");
    expect(swatchRule).not.toMatch(/:\s*[\d.]+(px|rem|em)\b/);
  });
});
