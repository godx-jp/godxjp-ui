import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";

import { NumberInput } from "../number-input";

describe("NumberInput a11y", () => {
  it("exposes the spinbutton role with the accessible name and value range", () => {
    const { getByRole } = render(
      <NumberInput aria-label="数量" defaultValue={3} min={0} max={10} />,
    );
    const spin = getByRole("spinbutton", { name: "数量" });
    expect(spin).toHaveAttribute("aria-valuenow", "3");
    expect(spin).toHaveAttribute("aria-valuemin", "0");
    expect(spin).toHaveAttribute("aria-valuemax", "10");
  });
});
