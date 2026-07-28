import { describe, expect, it } from "vitest";

import { AuthShell } from "../auth-shell";
import { AuthFooter } from "../auth-footer";
import { AuthIdentity } from "../auth-identity";
import { renderWithUi } from "@/test/render";
import { expectNoA11yViolations } from "@/test/a11y";

describe("AuthShell", () => {
  it("renders the centred main landmark with its children", () => {
    const { getByRole, getByText } = renderWithUi(
      <AuthShell>
        <div>ログインフォーム</div>
      </AuthShell>,
    );
    expect(getByRole("main")).toBeInTheDocument();
    expect(getByText("ログインフォーム")).toBeInTheDocument();
  });

  it("renders the brand banner and footer contentinfo when provided", () => {
    const { getByRole, getByText } = renderWithUi(
      <AuthShell brand={<span>ブランド</span>} footer={<span>フッタ</span>}>
        x
      </AuthShell>,
    );
    expect(getByRole("banner")).toBeInTheDocument();
    expect(getByRole("contentinfo")).toBeInTheDocument();
    expect(getByText("ブランド")).toBeInTheDocument();
    expect(getByText("フッタ")).toBeInTheDocument();
  });

  it("omits the brand + footer landmarks when their slots are absent", () => {
    const { queryByRole } = renderWithUi(
      <AuthShell>
        <div>x</div>
      </AuthShell>,
    );
    expect(queryByRole("banner")).toBeNull();
    expect(queryByRole("contentinfo")).toBeNull();
  });

  it("forwards className to the shell root", () => {
    const { container } = renderWithUi(
      <AuthShell className="tenant-scope">
        <div>x</div>
      </AuthShell>,
    );
    expect(container.querySelector('[data-slot="auth-shell"]')).toHaveClass(
      "ui-auth-shell",
      "tenant-scope",
    );
  });

  it("exposes the canonical token preset and its compact default density", () => {
    const { container } = renderWithUi(
      <AuthShell variant="canonical">
        <div>x</div>
      </AuthShell>,
    );
    const shell = container.querySelector('[data-slot="auth-shell"]');
    expect(shell).toHaveAttribute("data-variant", "canonical");
    expect(shell).toHaveAttribute("data-density", "compact");
  });

  it("preserves comfortable defaults and accepts an explicit density override", () => {
    const { container, rerender } = renderWithUi(
      <AuthShell>
        <div>x</div>
      </AuthShell>,
    );
    expect(container.querySelector('[data-slot="auth-shell"]')).toHaveAttribute(
      "data-density",
      "comfortable",
    );

    rerender(
      <AuthShell variant="canonical" density="comfortable">
        <div>x</div>
      </AuthShell>,
    );
    expect(container.querySelector('[data-slot="auth-shell"]')).toHaveAttribute(
      "data-density",
      "comfortable",
    );
  });

  it("has no axe violations", async () => {
    await expectNoA11yViolations(
      <AuthShell brand={<span>Brand</span>} footer={<span>© 2026</span>}>
        <div>Form</div>
      </AuthShell>,
    );
  });

  it("renders canonical identity requester and legal footer composites", () => {
    const { container, getByText } = renderWithUi(
      <AuthShell variant="canonical">
        <AuthIdentity title="GoDX ID" requester="Attendance is requesting sign in" />
        <AuthFooter product="console.godx.jp" terms="Terms" privacy="Privacy" locale="English" />
      </AuthShell>,
    );
    expect(container.querySelector('[data-slot="logo"][data-mark="godx"]')).toBeInTheDocument();
    expect(container.querySelector('[data-slot="auth-requester-icon"]')).toBeInTheDocument();
    expect(getByText("console.godx.jp")).toBeInTheDocument();
    expect(getByText("English")).toBeInTheDocument();
  });
});
