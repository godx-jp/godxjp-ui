/**
 * PASSWORD RECOVERY + SIGN-IN MFA CHALLENGE — composition-pattern contract test (gh#233).
 *
 * `@godxjp/ui` deliberately ships NO `PasswordRecoveryPanel` and NO `MfaChallengePanel`: both
 * failed Gate 0 of docs/COMPOSITION-VS-COMPONENT.md (they own no behaviour, and a `state` prop that
 * swaps five incompatible bodies is the screen-shaped grab-bag anti-pattern). What the package owns
 * is the MEASURE — `AuthShell preset="account-recovery"` — plus the tokens. This test pins the
 * CANONICAL composition documented in docs/layout/auth-recovery/ and served by the MCP
 * `auth-recovery-panels` pattern, so a refactor of those primitives can never silently break the
 * seven panels a consumer builds from them.
 *
 * The geometry itself is verified in headless Chromium and codified (jsdom does no layout) in
 * src/styles/__tests__/auth-recovery-panel-geometry.test.ts. What is pinned HERE is the DOM
 * contract that the browser run observed:
 *  - the shell emits `data-preset="account-recovery"` and keeps `variant="canonical"` chrome;
 *  - title + description live INSIDE the bordered surface (no AuthIdentity mark above it);
 *  - the MFA OTP row is ONE field / ONE focus stop, with all six slots filled from it;
 *  - focus order is DOM order: code field → primary → fallback A → fallback B, no positive tabindex;
 *  - `FormField error` wires aria-invalid + aria-errormessage + a role="alert" message;
 *  - `Button loading` is aria-busy and non-activatable; a cooldown resend is `disabled` but VISIBLE;
 *  - every one of the seven states is the SAME anatomy with exactly ONE primary action.
 */
import { describe, expect, it, vi } from "vitest";

import { AuthShell } from "../auth-shell";
import { AuthStack } from "../auth-stack";
import { Flex } from "../flex";
import { Alert, AlertDescription, AlertTitle } from "../../feedback/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../data-display/card";
import { FormField } from "../../data-entry/form-field";
import { Input } from "../../data-entry/input";
import { PasswordInput } from "../../data-entry/password-input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../../data-entry/input-otp";
import { Button } from "../../general/button";

import { renderWithUi, userEvent } from "@/test/render";

// input-otp polls document.elementFromPoint in a timer for its fake-caret positioning; jsdom
// doesn't implement it, which leaks post-test errors. Stub it (the visual caret is irrelevant
// here) — same guard as src/components/data-entry/__tests__/input-otp.test.tsx.
if (typeof document.elementFromPoint !== "function") {
  document.elementFromPoint = () => null;
}

/** Consumer-owned copy — in a real app every string comes from the app's own `t()`. */
const COPY = {
  ja: {
    title: "二段階認証",
    description: "認証アプリに表示されている 6 桁のコードを入力してください。",
    codeLabel: "確認コード",
    verify: "確認する",
    useRecoveryCode: "リカバリコードを使う",
    retryPasskey: "パスキーで再試行",
    error: "コードが正しくありません。",
    verifying: "検証中…",
  },
  en: {
    title: "Two-factor authentication",
    description: "Enter the 6-digit code from your authenticator app.",
    codeLabel: "Verification code",
    verify: "Verify",
    useRecoveryCode: "Use a recovery code",
    retryPasskey: "Try passkey again",
    error: "That code is not correct.",
    verifying: "Verifying…",
  },
  vi: {
    title: "Xác thực hai lớp",
    description: "Nhập mã gồm 6 chữ số trong ứng dụng xác thực của bạn.",
    codeLabel: "Mã xác minh",
    verify: "Xác minh",
    useRecoveryCode: "Dùng mã khôi phục dự phòng",
    retryPasskey: "Thử lại bằng khóa truy cập",
    error: "Mã không chính xác.",
    verifying: "Đang xác minh…",
  },
} as const;

/** THE canonical panel anatomy — every one of the seven states is this shape. */
function MfaChallengePanel({
  copy = COPY.ja,
  error,
  pending = false,
  onVerify,
}: {
  copy?: (typeof COPY)[keyof typeof COPY];
  error?: string;
  pending?: boolean;
  onVerify?: () => void;
}) {
  return (
    <AuthShell variant="canonical" preset="account-recovery">
      <Card>
        <CardHeader>
          <CardTitle level={1}>{copy.title}</CardTitle>
          <CardDescription>{copy.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <AuthStack>
            <FormField id="mfa-code" label={copy.codeLabel} error={error} required>
              <InputOTP maxLength={6} pattern="^[0-9]+$">
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </FormField>
            <Button fullWidth loading={pending} loadingText={copy.verifying} onClick={onVerify}>
              {copy.verify}
            </Button>
            <Flex justify="between" gap="sm" wrap>
              <Button variant="ghost" size="sm">
                {copy.useRecoveryCode}
              </Button>
              <Button variant="ghost" size="sm">
                {copy.retryPasskey}
              </Button>
            </Flex>
          </AuthStack>
        </CardContent>
      </Card>
    </AuthShell>
  );
}

describe("auth recovery / MFA challenge — composition pattern (gh#233)", () => {
  it("selects the SCR-008 panel measure through the preset, never a page-local width", () => {
    const { container } = renderWithUi(<MfaChallengePanel />);

    const shell = container.querySelector('[data-slot="auth-shell"]');
    expect(shell).toHaveAttribute("data-preset", "account-recovery");
    // The preset only re-measures — `variant` still owns control density + heading size.
    expect(shell).toHaveAttribute("data-variant", "canonical");
    expect(shell).toHaveAttribute("data-density", "compact");
    // Nothing sets an inline width: the 432px measure is `--auth-shell-recovery-card-max-width`.
    expect(container.querySelector(".ui-auth-shell-card")).not.toHaveAttribute("style");
  });

  it("puts the title and description INSIDE the bordered surface, with no identity mark above it", () => {
    const { container, getByRole, getByText } = renderWithUi(<MfaChallengePanel />);

    const card = container.querySelector('[data-slot="card"]');
    expect(card).toBeTruthy();
    // Both live inside the Card — this is the SCR-008 hierarchy, unlike the hosted login layout
    // where AuthIdentity renders the mark + heading OUTSIDE the card.
    expect(card).toContainElement(getByRole("heading", { level: 1, name: COPY.ja.title }));
    expect(card).toContainElement(getByText(COPY.ja.description));
    expect(container.querySelector('[data-slot="auth-identity"]')).toBeNull();
    expect(container.querySelector('[data-slot="logo"]')).toBeNull();
  });

  it("renders the OTP challenge as ONE field with six slots, not six inputs", () => {
    const { container, getByRole } = renderWithUi(<MfaChallengePanel />);

    expect(container.querySelectorAll(".ui-otp-slot")).toHaveLength(6);
    // One field ⇒ one textbox in the a11y tree ⇒ one tab stop; six Inputs would break paste.
    const field = getByRole("textbox", { name: COPY.ja.codeLabel });
    expect(field).toHaveClass("ui-otp-input");
    expect(container.querySelectorAll("input.ui-otp-input")).toHaveLength(1);
    expect(field).toHaveAttribute("aria-required", "true");
  });

  it("fills all six slots from that single focus stop", async () => {
    const user = userEvent.setup();
    const { container, getByRole } = renderWithUi(<MfaChallengePanel />);

    await user.click(getByRole("textbox", { name: COPY.ja.codeLabel }));
    await user.keyboard("482915");

    expect([...container.querySelectorAll(".ui-otp-slot")].map((s) => s.textContent)).toEqual([
      "4",
      "8",
      "2",
      "9",
      "1",
      "5",
    ]);
  });

  it("keeps focus order = DOM order: code → primary → fallback A → fallback B", async () => {
    const user = userEvent.setup();
    const { getByRole } = renderWithUi(<MfaChallengePanel />);

    const code = getByRole("textbox", { name: COPY.ja.codeLabel });
    const verify = getByRole("button", { name: COPY.ja.verify });
    const recovery = getByRole("button", { name: COPY.ja.useRecoveryCode });
    const passkey = getByRole("button", { name: COPY.ja.retryPasskey });

    code.focus();
    expect(code).toHaveFocus();
    await user.tab();
    expect(verify).toHaveFocus();
    await user.tab();
    expect(recovery).toHaveFocus();
    await user.tab();
    expect(passkey).toHaveFocus();

    // No positive tabindex anywhere — the ring is pure DOM order (WCAG 2.4.3).
    for (const el of [code, verify, recovery, passkey]) {
      const tabindex = el.getAttribute("tabindex");
      expect(tabindex === null || Number(tabindex) <= 0).toBe(true);
    }
  });

  it("keeps the two fallbacks in ONE row that is allowed to wrap", () => {
    const { getByRole } = renderWithUi(<MfaChallengePanel />);

    const row = getByRole("button", { name: COPY.ja.useRecoveryCode }).parentElement;
    expect(row).toHaveAttribute("data-direction", "row");
    expect(row).toHaveAttribute("data-justify", "between");
    // `wrap` is the whole responsive-fallback contract: the row stacks when the localized labels
    // exceed the panel's content column (measured: vi wraps at 432px, all locales wrap at 360px).
    expect(row).toHaveAttribute("data-wrap", "true");
    expect(row?.children).toHaveLength(2);
  });

  it("wires the error state to aria-invalid + aria-errormessage + role=alert (never colour alone)", () => {
    const { getByRole } = renderWithUi(<MfaChallengePanel error={COPY.ja.error} />);

    const field = getByRole("textbox", { name: COPY.ja.codeLabel });
    expect(field).toHaveAttribute("aria-invalid", "true");
    const message = getByRole("alert");
    expect(message).toHaveTextContent(COPY.ja.error);
    expect(field.getAttribute("aria-errormessage")).toBe(message.id);
  });

  it("marks the pending primary action busy and blocks a second submit", async () => {
    const user = userEvent.setup();
    const onVerify = vi.fn();
    const { getByRole } = renderWithUi(<MfaChallengePanel pending onVerify={onVerify} />);

    const verify = getByRole("button", { name: COPY.ja.verifying });
    expect(verify).toHaveAttribute("aria-busy", "true");
    await user.click(verify);
    expect(onVerify).not.toHaveBeenCalled();
  });

  it.each(["ja", "en", "vi"] as const)(
    "renders the same anatomy with %s copy and exactly ONE primary action",
    (locale) => {
      const copy = COPY[locale];
      const { getByRole, getAllByRole } = renderWithUi(<MfaChallengePanel copy={copy} />);

      expect(getByRole("heading", { level: 1, name: copy.title })).toBeInTheDocument();
      expect(getByRole("textbox", { name: copy.codeLabel })).toBeInTheDocument();
      // primary + two ghost fallbacks — one, and only one, full-width primary.
      const buttons = getAllByRole("button");
      expect(buttons.map((b) => b.textContent)).toEqual([
        copy.verify,
        copy.useRecoveryCode,
        copy.retryPasskey,
      ]);
      expect(getByRole("button", { name: copy.verify })).toHaveAttribute("data-full-width");
    },
  );
});

describe("password recovery — the same anatomy, four states (gh#233)", () => {
  const shell = (children: React.ReactNode) => (
    <AuthShell variant="canonical" preset="account-recovery">
      {children}
    </AuthShell>
  );

  it("request: one email field, one full-width primary", () => {
    const { getByRole, getAllByRole } = renderWithUi(
      shell(
        <Card>
          <CardHeader>
            <CardTitle level={1}>パスワードをリセット</CardTitle>
            <CardDescription>登録済みのメールアドレスに送信します。</CardDescription>
          </CardHeader>
          <CardContent>
            <AuthStack>
              <FormField id="recovery-email" label="メールアドレス" required>
                <Input type="email" autoComplete="username" />
              </FormField>
              <Button fullWidth>リセットリンクを送信</Button>
            </AuthStack>
          </CardContent>
        </Card>,
      ),
    );

    expect(getByRole("textbox", { name: "メールアドレス" })).toHaveAttribute(
      "autocomplete",
      "username",
    );
    expect(getAllByRole("button")).toHaveLength(1);
  });

  it("sent: a success notice and a resend that is DISABLED but still visible", () => {
    const { getByRole } = renderWithUi(
      shell(
        <Card>
          <CardHeader>
            <CardTitle level={1}>メールを確認してください</CardTitle>
          </CardHeader>
          <CardContent>
            <AuthStack>
              <Alert tone="success">
                <AlertTitle>h*****@example.co.jp に送信しました</AlertTitle>
                <AlertDescription>迷惑メールフォルダもご確認ください。</AlertDescription>
              </Alert>
              <Button fullWidth disabled>
                メールを再送する（60 秒後）
              </Button>
            </AuthStack>
          </CardContent>
        </Card>,
      ),
    );

    // A success notice is POLITE (role="status"); only destructive/warning tones are assertive.
    // The masked address is produced by the SERVER — the panel renders the string it is given.
    expect(getByRole("status")).toHaveTextContent("h*****@example.co.jp");
    const resend = getByRole("button", { name: /メールを再送する/ });
    expect(resend).toBeDisabled();
    // A cooldown hides nothing: the affordance stays in the DOM so the user knows it exists.
    expect(resend).toBeVisible();
  });

  it("new-password: two new-password fields with the mismatch error on the confirmation", () => {
    const { getByLabelText, getByRole } = renderWithUi(
      shell(
        <Card>
          <CardHeader>
            <CardTitle level={1}>新しいパスワードを設定</CardTitle>
          </CardHeader>
          <CardContent>
            <AuthStack>
              <FormField id="new-password" label="新しいパスワード" required>
                <PasswordInput autoComplete="new-password" />
              </FormField>
              <FormField
                id="confirm-password"
                label="新しいパスワード（確認）"
                error="パスワードが一致しません。"
                required
              >
                <PasswordInput autoComplete="new-password" />
              </FormField>
              <Button fullWidth>パスワードを更新</Button>
            </AuthStack>
          </CardContent>
        </Card>,
      ),
    );

    expect(getByLabelText("新しいパスワード")).toHaveAttribute("autocomplete", "new-password");
    expect(getByLabelText("新しいパスワード（確認）")).toHaveAttribute("aria-invalid", "true");
    expect(getByRole("alert")).toHaveTextContent("パスワードが一致しません。");
  });

  it("expired: a destructive notice and a single re-request action", () => {
    const { getAllByRole, getByRole } = renderWithUi(
      shell(
        <Card>
          <CardHeader>
            <CardTitle level={1}>リンクの有効期限が切れています</CardTitle>
          </CardHeader>
          <CardContent>
            <AuthStack>
              <Alert tone="destructive">
                <AlertTitle>このリンクは使用できません</AlertTitle>
              </Alert>
              <Button fullWidth>新しいリンクを発行</Button>
            </AuthStack>
          </CardContent>
        </Card>,
      ),
    );

    expect(getByRole("alert")).toHaveTextContent("このリンクは使用できません");
    expect(getAllByRole("button")).toHaveLength(1);
  });
});
