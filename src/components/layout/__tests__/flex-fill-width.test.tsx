import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render } from "@testing-library/react";

import { Flex } from "../flex";

/**
 * `fill` / `width` — the `fixed | elastic | fixed` row (gh#405 §2).
 *
 * Without them the only way to write a row whose middle column grows is `className="flex-1
 * min-w-0"` plus `className="w-[180px]"`, and `ui-audit` blocks both, so the correct layout was
 * the illegal one. Measured on the screen that surfaced this: the row came out 85.99px tall
 * (three stacked lines) where the design is 22px (one line).
 *
 * jsdom does no layout, so this pins the contract — the attributes, the inline size, and the
 * stylesheet rules keyed on them.
 */
describe("Flex fill / width axes", () => {
  it("emits nothing by default, so no rule can match an ordinary Flex", () => {
    const { container } = render(<Flex>row</Flex>);
    const flex = container.querySelector(".ui-flex")!;

    expect(flex).not.toHaveAttribute("data-fill");
    expect(flex).not.toHaveAttribute("data-width-raw");
    expect(flex.getAttribute("style")).toBeNull();
  });

  it("marks the elastic column with data-fill", () => {
    const { container } = render(<Flex fill>bar</Flex>);

    expect(container.querySelector(".ui-flex")).toHaveAttribute("data-fill", "");
  });

  it("takes a number as px and marks the escape so it stays countable", () => {
    const { container } = render(<Flex width={180}>name</Flex>);
    const flex = container.querySelector(".ui-flex")!;

    expect(flex).toHaveStyle({ inlineSize: "180px" });
    expect(flex).toHaveAttribute("data-width-raw", "");
  });

  // Read off the style attribute rather than through `toHaveStyle`: jsdom resolves no font size,
  // so a rem length computes to nothing there and the assertion would pass for the wrong reason.
  it("passes a string width through as the CSS length it is", () => {
    const { container } = render(<Flex width="12rem">name</Flex>);

    expect(container.querySelector<HTMLElement>(".ui-flex")!.style.inlineSize).toBe("12rem");
  });

  it("keeps width beside the other inline-style axes instead of replacing them", () => {
    const { container } = render(
      <Flex width={150} gapRaw={12}>
        counts
      </Flex>,
    );
    const flex = container.querySelector(".ui-flex")!;

    expect(flex).toHaveStyle({ inlineSize: "150px", gap: "12px" });
    expect(flex).toHaveAttribute("data-gap-raw", "12");
  });

  /**
   * Read from the stylesheet: `min-inline-size: 0` is the half of `fill` that is easy to drop and
   * impossible to notice in a unit test. Without it a flex item floors at its content size, so a
   * truncating child widens the row instead of ellipsing, and the row overflows its card.
   */
  it("the stylesheet gives fill BOTH the growth and the shrink floor", () => {
    const css = readFileSync(join(process.cwd(), "src/styles/layout.css"), "utf8");
    const scoped = css.match(/\.ui-flex\[data-fill\][^{]*\{[^}]*\}/g)?.join("\n") ?? "";

    expect(scoped).toMatch(/flex:\s*1 1 0/);
    expect(scoped).toMatch(/min-inline-size:\s*0/);
  });

  /** A width a sibling can still squeeze is not a column — six rows would start at six x offsets. */
  it("the stylesheet pins a width-bearing Flex out of the flex negotiation", () => {
    const css = readFileSync(join(process.cwd(), "src/styles/layout.css"), "utf8");
    const scoped = css.match(/\.ui-flex\[data-width-raw\][^{]*\{[^}]*\}/g)?.join("\n") ?? "";

    expect(scoped).toMatch(/flex:\s*none/);
  });
});
