import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";

import { NumberInput } from "../number-input";
import { expectNoA11yViolations } from "@/test/a11y";

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

  it("has no axe violations (basic)", async () => {
    await expectNoA11yViolations(<NumberInput aria-label="数量" defaultValue={3} />);
  });

  it("has no axe violations (min/max + prefix/suffix + steppers)", async () => {
    await expectNoA11yViolations(
      <NumberInput
        aria-label="価格"
        defaultValue={1980}
        min={0}
        max={9999}
        prefix="¥"
        suffix="%"
      />,
    );
  });

  it("has no axe violations (disabled / readOnly)", async () => {
    await expectNoA11yViolations(
      <>
        <NumberInput aria-label="確定" value={3} disabled />
        <NumberInput aria-label="参照" value={9} readOnly />
      </>,
    );
  });
});
