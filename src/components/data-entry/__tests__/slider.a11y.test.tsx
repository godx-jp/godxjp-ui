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

  it("has no axe violations", async () => {
    await expectNoA11yViolations(<Slider aria-label="音量" defaultValue={[40]} />);
  });
});
