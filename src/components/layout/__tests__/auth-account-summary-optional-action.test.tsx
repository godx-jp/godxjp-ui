import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AuthAccountSummary } from "../auth-account-summary";

describe("AuthAccountSummary without an action", () => {
  it("renders the identity alone when actionLabel is omitted, and the button when it is set", () => {
    const { rerender } = render(<AuthAccountSummary email="yamada@example.com" />);
    expect(screen.getByText("yamada@example.com")).toBeTruthy();
    expect(screen.queryByRole("button")).toBeNull();
    rerender(
      <AuthAccountSummary email="yamada@example.com" actionLabel="変更" onAction={() => {}} />,
    );
    expect(screen.getByRole("button", { name: "変更" })).toBeTruthy();
  });
});
