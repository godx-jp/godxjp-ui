import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { contrast, declaration, hsl, hslToRgb, over } from "./wcag-contrast";

const css = readFileSync(resolve(__dirname, "../../styles/layout.css"), "utf8");
const tokens = readFileSync(resolve(__dirname, "../components/flex.css"), "utf8");
const surface = css.slice(css.indexOf("/* Opt-in material surfaces."));
const body = surface.slice(
  surface.indexOf("{", surface.indexOf('.ui-flex[data-surface="felt"]')) + 1,
  surface.indexOf("}", surface.indexOf('.ui-flex[data-surface="felt"]')),
);

describe("Material control contrast", () => {
  it("rebinds inherited brand control overrides to local material roles", () => {
    expect(declaration(body, "button-outline-foreground")).toBe("hsl(var(--foreground))");
    expect(declaration(body, "control-surface-background")).toBe("hsl(var(--background))");
    expect(declaration(body, "accent")).toBe("var(--foreground)");
    expect(declaration(body, "accent-foreground")).toBe("var(--background)");
    expect(declaration(body, "slider-range-background")).toBe("hsl(var(--foreground))");
  });
  it("keeps enabled text, focus and slider boundaries legible on a dark material", () => {
    const ink = hslToRgb([340, 24, 10]);
    const ivory = hslToRgb([40, 27, 94]);
    const brass = hslToRgb([42, 35, 58]);
    const focus = hslToRgb([42, 48, 68]);
    expect(contrast(ivory, ink)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(ink, ivory)).toBeGreaterThanOrEqual(4.5); // inverse hover / primary action
    expect(contrast(focus, ink)).toBeGreaterThanOrEqual(3);
    expect(
      contrast(over(brass, ink, Number(declaration(tokens, "flex-felt-track-alpha"))), ink),
    ).toBeGreaterThanOrEqual(3);
    expect(
      contrast(ivory, over(brass, ink, Number(declaration(tokens, "flex-felt-track-alpha")))),
    ).toBeGreaterThan(1);
  });
});

describe("Default felt material in shipped theme scopes", () => {
  const foundation = readFileSync(resolve(__dirname, "../foundation.css"), "utf8");
  for (const [theme, selector] of [
    ["light", ":root {"],
    ["dark", ':root[data-theme="dark"] {'],
  ]) {
    it(`maintains AA text and focus in ${theme}`, () => {
      const start = foundation.indexOf(selector);
      expect(start).toBeGreaterThanOrEqual(0);
      const scope = foundation.slice(start, foundation.indexOf("\n}", start));
      expect(declaration(body, "background")).toBe("var(--flex-felt-background, var(--primary))");
      expect(declaration(body, "muted-foreground")).toBe(
        "var(--flex-felt-muted-foreground, var(--primary-foreground))",
      );
      const background = hslToRgb(hsl(scope, "primary"));
      const foreground = hslToRgb(hsl(scope, "primary-foreground"));
      expect(declaration(body, "foreground")).toBe(
        "var(--flex-felt-foreground, var(--primary-foreground))",
      );
      expect(declaration(body, "ring")).toBe(
        "var(--flex-felt-focus-color, var(--primary-foreground))",
      );
      // Worst-case overlap of both grain directions and the central highlight.
      const alpha =
        1 -
        (1 - Number(declaration(tokens, "flex-felt-grain-alpha"))) ** 2 *
          (1 - Number(declaration(tokens, "flex-felt-highlight-alpha")));
      const painted = over(foreground, background, alpha);
      expect(contrast(foreground, painted)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(foreground, painted)).toBeGreaterThanOrEqual(3);
    });
  }
});
