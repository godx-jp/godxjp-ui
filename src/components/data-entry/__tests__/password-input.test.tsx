import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { PasswordInput } from "../password-input";
import { expectNoA11yViolations } from "@/test/a11y";

describe("PasswordInput", () => {
  it("masks the value by default (type=password)", () => {
    const { container } = render(<PasswordInput aria-label="パスワード" defaultValue="secret" />);
    expect(container.querySelector("input")).toHaveAttribute("type", "password");
  });

  it("the toggle reveals + re-hides the value and tracks aria-pressed", async () => {
    const user = userEvent.setup();
    const { container, getByRole } = render(<PasswordInput aria-label="パスワード" />);
    const input = container.querySelector("input")!;
    const toggle = getByRole("button");
    expect(toggle).toHaveAttribute("aria-pressed", "false");

    await user.click(toggle);
    expect(input).toHaveAttribute("type", "text");
    expect(toggle).toHaveAttribute("aria-pressed", "true");

    await user.click(toggle);
    expect(input).toHaveAttribute("type", "password");
    expect(toggle).toHaveAttribute("aria-pressed", "false");
  });

  it("the toggle exposes an accessible name that changes with state", async () => {
    const user = userEvent.setup();
    const { getByRole } = render(<PasswordInput aria-label="パスワード" />);
    const before = getByRole("button").getAttribute("aria-label");
    await user.click(getByRole("button"));
    const after = getByRole("button").getAttribute("aria-label");
    expect(before).toBeTruthy();
    expect(after).toBeTruthy();
    expect(after).not.toBe(before);
  });

  it("forwards input props (placeholder, disabled, onChange)", async () => {
    const { container } = render(
      <PasswordInput aria-label="パスワード" placeholder="8文字以上" disabled />,
    );
    const input = container.querySelector("input")!;
    expect(input).toHaveAttribute("placeholder", "8文字以上");
    expect(input).toBeDisabled();
  });

  it("has no axe violations", async () => {
    await expectNoA11yViolations(<PasswordInput aria-label="パスワード" />);
  });
});
