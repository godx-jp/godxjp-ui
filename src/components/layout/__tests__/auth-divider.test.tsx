import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";

import { AuthDivider } from "../auth-divider";
import { expectNoA11yViolations } from "@/test/a11y";

describe("AuthDivider", () => {
  it("renders a named separator with two decorative rules and a centred label", () => {
    const { container, getByRole } = render(<AuthDivider label="or" />);
    expect(getByRole("separator", { name: "or" })).toBeInTheDocument();
    expect(container.querySelectorAll(".ui-separator-rule")).toHaveLength(2);
    expect(container.querySelector(".ui-separator-label")).toHaveTextContent("or");
  });

  it("merges className onto the public root", () => {
    const { container } = render(<AuthDivider label="または" className="auth-choice" />);
    expect(container.querySelector('[data-slot="auth-divider"]')).toHaveClass(
      "ui-auth-divider",
      "auth-choice",
    );
  });

  it("is a PRESET over the labelled Separator, not a parallel implementation (gh#308)", () => {
    const { container } = render(<AuthDivider label="or" />);
    const root = container.querySelector('[data-slot="auth-divider"]')!;
    // Same primitive: the Separator class, its labelled grid flag and its centred default.
    expect(root).toHaveClass("ui-separator");
    expect(root).toHaveAttribute("data-labelled", "");
    expect(root).toHaveAttribute("data-label-align", "center");
    expect(root).toHaveAttribute("data-orientation", "horizontal");
    // The auth-scoped slot name is preserved, so an existing consumer selector still resolves.
    expect(root).toHaveAttribute("data-slot", "auth-divider");
  });

  it("has no axe violations", async () => {
    await expectNoA11yViolations(<AuthDivider label="or" />);
  });
});
