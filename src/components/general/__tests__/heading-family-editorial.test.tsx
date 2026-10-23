/**
 * Heading `family="editorial"` + `--font-family-editorial` — an opt-in editorial face (a serif for a
 * public page's hero and section headings) beside a sans UI. Consumer report (TCG-M): the brand
 * sets editorial headings in Noto Serif JP and every UI heading in Noto Sans JP; the only knob was
 * `--font-family-display`, which moves EVERY heading (card titles, empty states, form sections) at once.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { renderWithUi } from "@/test/render";
import { Heading } from "../typography";

const read = (file: string) => readFileSync(resolve(__dirname, file), "utf8");
const text = read("../../../styles/text-layout.css");
const layout = read("../../../styles/layout.css");
const foundation = read("../../../tokens/foundation.css");

describe("Heading family", () => {
  it("stamps data-family only for the opt-in editorial face", () => {
    const { container } = renderWithUi(
      <>
        <Heading level={2}>UI heading</Heading>
        <Heading level={2} family="display">
          Explicit display
        </Heading>
        <Heading level={2} family="editorial">
          Editorial heading
        </Heading>
      </>,
    );
    const [ui, display, editorial] = container.querySelectorAll("h2");
    expect(ui).not.toHaveAttribute("data-family");
    expect(display).not.toHaveAttribute("data-family");
    expect(editorial).toHaveAttribute("data-family", "editorial");
  });

  it("reads --font-family-editorial, falling back to the display face", () => {
    expect(text).toMatch(
      /\[data-slot="heading"\]\[data-family="editorial"\]\s*\{\s*font-family: var\(--font-family-editorial, var\(--font-family-display\)\);/,
    );
  });

  it("the display-scale page title takes the same editorial face", () => {
    const rule =
      layout.match(/\[data-header-scale="display"\] \.ui-page-title,[^{]*\{([^}]*)\}/)?.[1] ?? "";
    expect(rule).toContain("font-family: var(--font-family-editorial, var(--font-family-display))");
  });

  it("the token is declared `initial`, so nothing moves until a theme names a face", () => {
    expect(foundation).toMatch(/--font-family-editorial: initial;/);
  });
});
