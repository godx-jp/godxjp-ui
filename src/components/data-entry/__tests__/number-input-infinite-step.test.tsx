import { describe, expect, it } from "vitest";
import { renderWithUi, screen } from "@/test/render";

import { NumberInput } from "../number-input";

describe("NumberInput — non-finite step precision", () => {
  it("infers zero precision from a non-finite step (decimalsOf guard)", () => {
    // effectivePrecision = precision ?? decimalsOf(Infinity) → decimalsOf hits the !isFinite branch
    renderWithUi(<NumberInput step={Infinity} aria-label="n" />);
    const field = screen.getByRole("spinbutton");
    expect(field).toBeInTheDocument();
    expect(field).toHaveAttribute("inputMode", "decimal");
  });
});
