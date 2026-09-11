import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";

import { Slider } from "../slider";
import { expectNoA11yViolations } from "@/test/a11y";

describe("Slider a11y", () => {
  it("puts the accessible name on the thumb (role=slider), not just the root", () => {
    const { getByRole } = render(<Slider aria-label="音量" defaultValue={[40]} />);
    expect(getByRole("slider", { name: "音量" })).toBeInTheDocument();
  });

  it("distinguishes each thumb of a range by index", () => {
    const { getByRole } = render(<Slider aria-label="価格帯" defaultValue={[20, 80]} />);
    expect(getByRole("slider", { name: "価格帯 1" })).toBeInTheDocument();
    expect(getByRole("slider", { name: "価格帯 2" })).toBeInTheDocument();
  });

  it("names the input itself, not only through aria-labelledby", async () => {
    // A Slider inside a FormField is named by `aria-labelledby` (a span, because a `for`
    // pointing at a composite child dangles) and described by `aria-describedby`. axe's
    // `label-title-only` looks for a `<label>` or an `aria-label` and nothing else, so that
    // combination read as an unnamed control — measured on the docs frame at 375px, and it
    // reached `main` because the axe lane runs on push, not on a PR.
    const { container } = render(
      <>
        <span id="vol-label">音量</span>
        <span id="vol-helper">0 から 100</span>
        <Slider
          aria-label="音量"
          aria-labelledby="vol-label"
          aria-describedby="vol-helper"
          defaultValue={[40]}
        />
      </>,
    );
    const input = container.querySelector<HTMLInputElement>('input[type="range"]');

    expect(input).not.toBeNull();
    expect(input).toHaveAttribute("aria-label", "音量");
    // aria-labelledby still wins the accessible name, so nothing is announced twice.
    expect(input?.getAttribute("aria-labelledby")).toContain("vol-label");
  });

  it("has no axe violations", async () => {
    await expectNoA11yViolations(<Slider aria-label="音量" defaultValue={[40]} />);
  });
});
