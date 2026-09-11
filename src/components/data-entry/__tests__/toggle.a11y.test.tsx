import { describe, expect, it } from "vitest";

import { Toggle } from "../toggle";
import { renderWithUi, screen } from "@/test/render";

describe("Toggle a11y", () => {
  // The counted, pressed chip.
  it("announces label + count once, and carries pressed on aria-pressed only", () => {
    renderWithUi(
      <Toggle count={42} countLabel="件" pressed>
        未読
      </Toggle>,
    );
    const chip = screen.getByRole("button", { name: "未読, 42 件" });
    expect(chip).toHaveAttribute("aria-pressed", "true");
    // The visible digits are hidden from the a11y tree, so "42" cannot be announced twice…
    expect(chip.querySelector('[data-slot="toggle-count"]')).toHaveAttribute("aria-hidden", "true");
    // …and the pressed state is never appended to the NAME as text.
    expect(chip).not.toHaveAccessibleName(expect.stringContaining("押下"));
  });
});
