import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";

import { Separator } from "../separator";
import { expectNoA11yViolations } from "@/test/a11y";

describe("Separator", () => {
  it("is decorative (role=none) by default and horizontal", () => {
    const { container } = render(<Separator />);
    const sep = container.querySelector('[data-slot="separator"]')!;
    expect(sep).toHaveAttribute("data-orientation", "horizontal");
    // decorative separators expose role="none" (no semantic separator role)
    expect(sep.getAttribute("role")).toBe("none");
  });

  it("vertical orientation sets the data attribute", () => {
    const { container } = render(<Separator orientation="vertical" />);
    expect(container.querySelector('[data-slot="separator"]')).toHaveAttribute(
      "data-orientation",
      "vertical",
    );
  });

  it("non-decorative exposes the semantic separator role", () => {
    const { getByRole } = render(<Separator decorative={false} />);
    expect(getByRole("separator")).toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    await expectNoA11yViolations(
      <div>
        上<Separator />下
      </div>,
    );
  });
});
