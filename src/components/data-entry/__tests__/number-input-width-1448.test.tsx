import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";
import { renderWithUi } from "@/test/render";

import { NumberInput } from "../number-input";

/**
 * gh#1448 — a quantity stepper outside a FormField had no way to be sized: `.ui-number-input` is
 * `inline-size: 100%`, so a 0–99 stepper in a ListRow trailing slot took 215px at 1440px and pushed
 * the row's trailing cluster onto its own line at 390px. `width` is the Select / picker axis.
 */
const root = (container: HTMLElement) =>
  container.querySelector<HTMLElement>('[data-slot="number-input"]')!;
const controlCss = readFileSync(resolve(process.cwd(), "src/styles/control.css"), "utf8").replace(
  /\s+/g,
  " ",
);

describe("NumberInput width (gh#1448)", () => {
  it("keeps today's full-width field by default: no data-width, no character count", () => {
    const { container } = renderWithUi(<NumberInput aria-label="数量" min={0} max={99} />);
    expect(root(container)).not.toHaveAttribute("data-width");
    expect(root(container).style.getPropertyValue("--number-input-chars")).toBe("");
  });

  it('width="auto" sizes to the widest bound as shown at rest', () => {
    const { container } = renderWithUi(
      <NumberInput aria-label="数量" width="auto" min={0} max={99} />,
    );
    expect(root(container)).toHaveAttribute("data-width", "auto");
    expect(root(container).style.getPropertyValue("--number-input-chars")).toBe("2");
  });

  it("counts sign and decimals the way the field displays them at rest", () => {
    const { container } = renderWithUi(
      <NumberInput aria-label="気温" width="auto" min={-12.5} max={3} step={0.5} />,
    );
    // "-12.5" is the widest bound at rest → 5 characters.
    expect(root(container).style.getPropertyValue("--number-input-chars")).toBe("5");
  });

  it('width="auto" without bounds falls back to six characters', () => {
    const { container } = renderWithUi(<NumberInput aria-label="n" width="auto" />);
    expect(root(container).style.getPropertyValue("--number-input-chars")).toBe("6");
  });

  it('width="bounded" marks the root and writes no count', () => {
    const { container } = renderWithUi(<NumberInput aria-label="n" width="bounded" max={99} />);
    expect(root(container)).toHaveAttribute("data-width", "bounded");
    expect(root(container).style.getPropertyValue("--number-input-chars")).toBe("");
  });

  it("control.css owns both widths (count × ch + padding + stepper column; the bounded token)", () => {
    expect(controlCss).toMatch(
      /\.ui-number-input\[data-width="auto"\] \{[^}]*inline-size: calc\( var\(--number-input-chars, 6\) \* 1ch/,
    );
    expect(controlCss).toMatch(
      /\.ui-number-input\[data-width="bounded"\] \{[^}]*inline-size: var\(--control-bounded-width\)/,
    );
  });
});
