import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Input } from "../input";
import { PasswordInput } from "../password-input";

describe("Input size tier", () => {
  it("Input: size=sm lands on the element as data-size and md emits no attribute", () => {
    const { container, rerender } = render(<Input size="sm" aria-label="code" />);
    const sm = container.querySelector("input")!;
    expect(sm).toHaveAttribute("data-size", "sm");
    expect(sm.className).toContain("ui-input");
    rerender(<Input aria-label="code" />);
    expect(container.querySelector("input")).not.toHaveAttribute("data-size");
  });

  it("PasswordInput: forwards size=sm to its input", () => {
    const { container } = render(<PasswordInput size="sm" aria-label="password" />);
    expect(container.querySelector("input")).toHaveAttribute("data-size", "sm");
  });
});
