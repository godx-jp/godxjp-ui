import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { AccountChip } from "../account-chip";

describe("AccountChip", () => {
  it("renders the name, the first-character fallback and the email as title", () => {
    render(<AccountChip name="Satoshi" email="satoshi@example.com" />);
    expect(screen.getByText("Satoshi")).toBeInTheDocument();
    expect(screen.getByText("S")).toBeInTheDocument();
    expect(screen.getByText("Satoshi").closest("[data-slot=account-chip]")).toHaveAttribute(
      "title",
      "satoshi@example.com",
    );
  });

  it("renders one ghost icon action with the given accessible name and calls onAction", async () => {
    const onAction = vi.fn();
    render(<AccountChip name="Satoshi" actionLabel="Sign out" onAction={onAction} />);
    const btn = screen.getByRole("button", { name: "Sign out" });
    expect(btn.className).toContain("ui-button");
    await userEvent.click(btn);
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it("renders no button without onAction", () => {
    render(<AccountChip name="Satoshi" />);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("is a Flex row of primitives, not a hand-rolled surface", () => {
    const { container } = render(<AccountChip name="Satoshi" />);
    const root = container.querySelector("[data-slot=account-chip]") as HTMLElement;
    expect(root.className).toContain("ui-flex");
    expect(root.className).not.toMatch(/rounded|border|px-|py-/);
  });
});
