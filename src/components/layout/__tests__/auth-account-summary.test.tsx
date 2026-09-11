import { describe, expect, it, vi } from "vitest";

import { renderWithUi, screen, userEvent } from "@/test/render";
import { AuthAccountSummary } from "../auth-account-summary";

describe("AuthAccountSummary", () => {
  it("renders the authoritative email, missing-avatar fallback and keyboard action", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    const { container } = renderWithUi(
      <AuthAccountSummary
        email="signed-in@example.com"
        actionLabel="切り替える"
        onAction={onAction}
      />,
    );
    expect(screen.getByText("signed-in@example.com")).toHaveAttribute("dir", "auto");
    expect(container.querySelector(".ui-auth-account-fallback-icon")).not.toBeNull();
    await user.tab();
    expect(screen.getByRole("button", { name: "切り替える" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onAction).toHaveBeenCalledOnce();
  });

  it("keeps a long email available through its title while CSS owns truncation", () => {
    const email = "very.long.authoritative.account.address@example.enterprise.invalid";
    renderWithUi(
      <AuthAccountSummary
        email={email}
        avatarFallback="VA"
        actionLabel="Switch"
        onAction={() => {}}
      />,
    );
    expect(screen.getByText(email)).toHaveClass("ui-auth-account-email");
    expect(screen.getByText(email)).toHaveAttribute("title", email);
    expect(screen.getByText("VA")).toBeInTheDocument();
  });
});
