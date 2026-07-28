import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";

import { AuthDivider } from "../auth-divider";
import { expectNoA11yViolations } from "@/test/a11y";

describe("AuthDivider", () => {
  it("renders a named separator with two decorative rules and a centred label", () => {
    const { container, getByRole } = render(<AuthDivider label="or" />);
    expect(getByRole("separator", { name: "or" })).toBeInTheDocument();
    expect(container.querySelectorAll(".ui-auth-divider-rule")).toHaveLength(2);
    expect(container.querySelector(".ui-auth-divider-label")).toHaveTextContent("or");
  });

  it("merges className onto the public root", () => {
    const { container } = render(<AuthDivider label="または" className="auth-choice" />);
    expect(container.querySelector('[data-slot="auth-divider"]')).toHaveClass(
      "ui-auth-divider",
      "auth-choice",
    );
  });

  it("has no axe violations", async () => {
    await expectNoA11yViolations(<AuthDivider label="or" />);
  });
});
