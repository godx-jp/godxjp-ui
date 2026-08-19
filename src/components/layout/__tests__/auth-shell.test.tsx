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

  it.each([
    ["login"],
    ["registration"],
    ["device-authorization"],
    ["context-selection"],
    ["account-recovery"],
  ] as const)(
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

  it("has no axe violations under the login preset with a wrapped real requester", async () => {
    await expectNoA11yViolations(
      <AuthShell variant="canonical" preset="login">
        <AuthIdentity
          title="GoDX ID"
          requester="Platform console browser BFF is requesting sign in to this organization"
        />
        <div>Login form</div>
        <AuthFooter product="GoDX ID" terms="Terms" privacy="Privacy" />
      </AuthShell>,
    );
  });

  it.each([
    // JA/EN/VI long-label coverage (gh#256): each locale's longest realistic sign-up heading and
    // hint copy must render inside the registration identity slot without the shell truncating or
    // rearranging the column — copy length is absorbed by the fixed identity track.
    [
      "ja",
      "新しいアカウントを作成して組織に参加する",
      "すでにアカウントをお持ちの場合はこちらからサインインしてください（組織の管理者から招待を受けている場合も同じです）",
    ],
    [
      "en",
      "Create a new account and join your organization",
      "If you already have an account, sign in here instead — the same applies when you have received an invitation from your organization administrator",
    ],
    [
      "vi",
      "Tạo tài khoản mới và tham gia tổ chức của bạn",
      "Nếu bạn đã có tài khoản, hãy đăng nhập tại đây — điều này cũng áp dụng khi bạn đã nhận được lời mời từ quản trị viên của tổ chức",
    ],
  ] as const)(
    "registration preset carries long %s identity copy without truncation markup",
    (_locale, title, requester) => {
      const { container, getByText } = renderWithUi(
        <AuthShell variant="canonical" preset="registration">
          <AuthIdentity title={title} requester={requester} />
          <div>Sign-up form</div>
          <AuthFooter product="GoDX ID" terms="Terms" privacy="Privacy" />
        </AuthShell>,
      );
      expect(getByText(title)).toBeInTheDocument();
      expect(getByText(requester)).toBeInTheDocument();
      // The identity block is a DIRECT child of the card slot, where the preset's fixed track
      // rule can reach it — wrapping it would detach the anchor.
      expect(
        container.querySelector(".ui-auth-shell-card > .ui-auth-identity"),
      ).toBeInTheDocument();
    },
  );

  it("has no axe violations under the registration preset with a full sign-up column", async () => {
    await expectNoA11yViolations(
      <AuthShell variant="canonical" preset="registration">
        <AuthIdentity
          title="アカウントを作成"
          requester="すでにアカウントをお持ちの場合はサインインしてください"
        />
        <div>Registration form</div>
        <AuthFooter product="GoDX ID" terms="利用規約" privacy="プライバシー" />
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
