import { describe, expect, it } from "vitest";

import { AuthShell } from "../auth-shell";
import { AuthFooter } from "../auth-footer";
import { AuthIdentity } from "../auth-identity";
import { AuthStack } from "../auth-stack";
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

  it("stays un-preset by default so the existing shell box is untouched (gh#220)", () => {
    const { container } = renderWithUi(
      <AuthShell variant="canonical">
        <div>x</div>
      </AuthShell>,
    );
    // No `data-preset` at all — the `[data-preset] .ui-auth-shell-card` stack rule must not reach
    // an existing consumer, and canonical keeps its own 360px/15px measure.
    expect(container.querySelector('[data-slot="auth-shell"]')).not.toHaveAttribute("data-preset");
  });

  it.each([["device-authorization"], ["context-selection"]] as const)(
    'preset="%s" is exposed on the shell root and composes with variant="canonical"',
    (preset) => {
      const { container } = renderWithUi(
        <AuthShell variant="canonical" preset={preset}>
          <div>x</div>
        </AuthShell>,
      );
      const shell = container.querySelector('[data-slot="auth-shell"]');
      // Both hooks are present: `variant` still owns control density / heading size while the
      // preset re-measures the page (they are orthogonal, gh#217/#220).
      expect(shell).toHaveAttribute("data-preset", preset);
      expect(shell).toHaveAttribute("data-variant", "canonical");
      expect(shell).toHaveAttribute("data-density", "compact");
    },
  );

  it('preset="default" is a no-op that keeps the un-preset box', () => {
    const { container } = renderWithUi(
      <AuthShell preset="default">
        <div>x</div>
      </AuthShell>,
    );
    expect(container.querySelector('[data-slot="auth-shell"]')).not.toHaveAttribute("data-preset");
  });

  it("keeps the main landmark named and the card slot present under a preset", () => {
    const { container, getByRole } = renderWithUi(
      <AuthShell variant="canonical" preset="context-selection">
        <div>組織を選択</div>
      </AuthShell>,
    );
    expect(getByRole("main")).toHaveAccessibleName();
    expect(container.querySelector(".ui-auth-shell-card")).toBeInTheDocument();
  });

  it("has no axe violations under the device-authorization preset", async () => {
    await expectNoA11yViolations(
      <AuthShell variant="canonical" preset="device-authorization" brand={<span>Brand</span>}>
        <div>Device code</div>
      </AuthShell>,
    );
  });

  it("has no axe violations under the context-selection preset", async () => {
    await expectNoA11yViolations(
      <AuthShell variant="canonical" preset="context-selection" brand={<span>Brand</span>}>
        <div>Choose organization</div>
      </AuthShell>,
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
        <AuthStack>
          <span>Passkey</span>
          <span>Email</span>
        </AuthStack>
        <AuthFooter product="Acme ID" terms="Terms" privacy="Privacy" locale="English" />
      </AuthShell>,
    );
    expect(container.querySelector('[data-slot="logo"][data-mark="godx"]')).toBeInTheDocument();
    expect(container.querySelector('[data-slot="auth-requester-icon"]')).toBeInTheDocument();
    expect(getByText("Acme ID")).toBeInTheDocument();
    expect(getByText("English")).toBeInTheDocument();
    expect(container.querySelector('[data-slot="auth-stack"]')).toBeInTheDocument();
  });
});
