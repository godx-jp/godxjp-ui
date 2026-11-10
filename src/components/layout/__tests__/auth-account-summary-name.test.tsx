import { describe, expect, it } from "vitest";

import { AppProvider } from "@/app/app-provider";
import { render, screen } from "@/test/render";
import { AuthAccountSummary } from "../auth-account-summary";

describe("AuthAccountSummary name", () => {
  it("renders the name and a localized signed-in · email line", () => {
    const { container } = render(
      <AppProvider defaultLocale="ja" persist={false}>
        <AuthAccountSummary
          name="山田 花子"
          email="yamada@example.com"
          avatarFallback="山"
          actionLabel="切替"
        />
      </AppProvider>,
    );
    expect(screen.getByText("山田 花子")).toHaveClass("ui-auth-account-name");
    const status = screen.getByText("ログイン中 · yamada@example.com");
    expect(status).toHaveAttribute("title", "yamada@example.com");
    expect(container.querySelector(".ui-auth-account-email")).toBeNull();
    expect(screen.getByRole("button", { name: "切替" })).toBeInTheDocument();
  });

  it("follows the active locale", () => {
    render(
      <AppProvider defaultLocale="en" persist={false}>
        <AuthAccountSummary name="Hanako" email="h@example.com" />
      </AppProvider>,
    );
    expect(screen.getByText("Signed in · h@example.com")).toBeInTheDocument();
  });

  it("keeps the single email line without name (unchanged default)", () => {
    const { container } = render(
      <AppProvider defaultLocale="en" persist={false}>
        <AuthAccountSummary email="h@example.com" />
      </AppProvider>,
    );
    expect(container.querySelector(".ui-auth-account-email")?.textContent).toBe("h@example.com");
    expect(container.querySelector(".ui-auth-account-text")).toBeNull();
  });

  it("surface=card marks the row as its own card; the default emits nothing", () => {
    const { container, rerender } = render(
      <AppProvider defaultLocale="en" persist={false}>
        <AuthAccountSummary email="h@example.com" surface="card" />
      </AppProvider>,
    );
    expect(container.querySelector('[data-slot="auth-account-summary"]')).toHaveAttribute(
      "data-surface",
      "card",
    );
    rerender(
      <AppProvider defaultLocale="en" persist={false}>
        <AuthAccountSummary email="h@example.com" />
      </AppProvider>,
    );
    expect(container.querySelector('[data-slot="auth-account-summary"]')).not.toHaveAttribute(
      "data-surface",
    );
  });
});
