/**
 * PASSWORD RECOVERY + SIGN-IN MFA CHALLENGE — axe coverage for the composition pattern (gh#233).
 *
 * The pattern is documented in docs/layout/auth-recovery/ and served by the MCP
 * `auth-recovery-panels` pattern; it is NOT a component (Gate 0 → composition, see
 * docs/COMPOSITION-VS-COMPONENT.md). All seven canonical states are asserted at 0 axe violations
 * inside the shell they actually ship in, so the recommended composition can never teach an
 * inaccessible sign-in interruption — the single screen a locked-out user cannot route around.
 *
 * A real Chromium run over the five docs pages (1440 + 390, wcag2a/2aa/21a/21aa/22aa) also reported
 * 0 violations; this is the browser-free regression gate for the same composition.
 */
import { describe, it } from "vitest";

import { AuthShell } from "../auth-shell";
import { AuthStack } from "../auth-stack";
import { AuthFooter } from "../auth-footer";
import { Flex } from "../flex";
import { Alert, AlertDescription, AlertTitle } from "../../feedback/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../data-display/card";
import { FormField } from "../../data-entry/form-field";
import { Input } from "../../data-entry/input";
import { PasswordInput } from "../../data-entry/password-input";
import { PasswordStrength } from "../../data-entry/password-strength";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../../data-entry/input-otp";
import { Button } from "../../general/button";

import { Text } from "../../general/typography";
import { expectNoA11yViolations } from "@/test/a11y";

// input-otp polls document.elementFromPoint in a timer for its fake-caret positioning; jsdom
// doesn't implement it, which leaks post-test errors. Stub it (the visual caret is irrelevant
// here) — same guard as src/components/data-entry/__tests__/input-otp.test.tsx.
if (typeof document.elementFromPoint !== "function") {
  document.elementFromPoint = () => null;
}

/** The page a real route renders: shell + brand + ONE panel + legal footer. */
function RecoveryPage({
  title,
  description,
  notice,
  fields,
  primary,
  fallbacks,
}: {
  title: string;
  description: string;
  notice?: React.ReactNode;
  fields?: React.ReactNode;
  primary: React.ReactNode;
  fallbacks?: React.ReactNode;
}) {
  return (
    <AuthShell
      variant="canonical"
      preset="account-recovery"
      brand={<Text weight="medium">GoDX ID</Text>}
      footer={<AuthFooter product="GoDX ID" terms="利用規約" privacy="プライバシー" />}
    >
      <Card>
        <CardHeader>
          <CardTitle level={1}>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <AuthStack>
            {notice}
            {fields}
            {primary}
            {fallbacks && (
              <Flex justify="between" gap="sm" wrap>
                {fallbacks}
              </Flex>
            )}
          </AuthStack>
        </CardContent>
      </Card>
    </AuthShell>
  );
}

const otpField = (id: string, error?: string) => (
  <FormField id={id} label="確認コード" error={error} required>
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
);

const mfaFallbacks = (
  <>
    <Button variant="ghost" size="sm">
      リカバリコードを使う
    </Button>
    <Button variant="ghost" size="sm">
      パスキーで再試行
    </Button>
  </>
);

describe("auth recovery / MFA challenge — axe (gh#233)", () => {
  it("password recovery · request", async () => {
    await expectNoA11yViolations(
      <RecoveryPage
        title="パスワードをリセット"
        description="登録済みのメールアドレスにリセットリンクをお送りします。"
        fields={
          <FormField id="a11y-recovery-email" label="メールアドレス" required>
            <Input type="email" autoComplete="username" />
          </FormField>
        }
        primary={<Button fullWidth>リセットリンクを送信</Button>}
        fallbacks={
          <Button variant="ghost" size="sm">
            サインインに戻る
          </Button>
        }
      />,
    );
  });

  it("password recovery · sent (success notice + disabled resend)", async () => {
    await expectNoA11yViolations(
      <RecoveryPage
        title="メールを確認してください"
        description="リセットリンクを送信しました。リンクの有効期限は 30 分です。"
        notice={
          <Alert tone="success">
            <AlertTitle>h*****@example.co.jp に送信しました</AlertTitle>
            <AlertDescription>迷惑メールフォルダもご確認ください。</AlertDescription>
          </Alert>
        }
        primary={
          <Button fullWidth disabled>
            メールを再送する（60 秒後）
          </Button>
        }
      />,
    );
  });

  it("password recovery · new-password (two fields + strength + mismatch error)", async () => {
    await expectNoA11yViolations(
      <RecoveryPage
        title="新しいパスワードを設定"
        description="他のサービスで使用していないパスワードを設定してください。"
        fields={
          <>
            <FormField id="a11y-new-password" label="新しいパスワード" required>
              <PasswordInput autoComplete="new-password" />
            </FormField>
            <PasswordStrength value="Godx-2026" />
            <FormField
              id="a11y-confirm-password"
              label="新しいパスワード（確認）"
              error="パスワードが一致しません。"
              required
            >
              <PasswordInput autoComplete="new-password" />
            </FormField>
          </>
        }
        primary={<Button fullWidth>パスワードを更新</Button>}
      />,
    );
  });

  it("password recovery · expired (destructive notice)", async () => {
    await expectNoA11yViolations(
      <RecoveryPage
        title="リンクの有効期限が切れています"
        description="セキュリティのため、リセットリンクは発行から 30 分で失効します。"
        notice={
          <Alert tone="destructive">
            <AlertTitle>このリンクは使用できません</AlertTitle>
            <AlertDescription>新しいリンクを発行してください。</AlertDescription>
          </Alert>
        }
        primary={<Button fullWidth>新しいリンクを発行</Button>}
      />,
    );
  });

  it("MFA · otp", async () => {
    await expectNoA11yViolations(
      <RecoveryPage
        title="二段階認証"
        description="認証アプリに表示されている 6 桁のコードを入力してください。"
        fields={otpField("a11y-mfa-otp")}
        primary={<Button fullWidth>確認する</Button>}
        fallbacks={mfaFallbacks}
      />,
    );
  });

  it("MFA · otp error + pending primary", async () => {
    await expectNoA11yViolations(
      <RecoveryPage
        title="二段階認証"
        description="認証アプリに表示されている 6 桁のコードを入力してください。"
        fields={otpField("a11y-mfa-otp-error", "コードが正しくありません。残り 4 回入力できます。")}
        primary={
          <Button fullWidth loading loadingText="検証中…">
            確認する
          </Button>
        }
        fallbacks={mfaFallbacks}
      />,
    );
  });

  it("MFA · recovery-code", async () => {
    await expectNoA11yViolations(
      <RecoveryPage
        title="リカバリコードを入力"
        description="二段階認証の設定時に保存した、一度だけ使えるコードを入力してください。"
        fields={
          <FormField
            id="a11y-mfa-recovery-code"
            label="リカバリコード"
            helper="ハイフンを含めて入力してください。"
            required
          >
            <Input autoComplete="one-time-code" spellCheck={false} />
          </FormField>
        }
        primary={<Button fullWidth>確認する</Button>}
        fallbacks={
          <>
            <Button variant="ghost" size="sm">
              認証アプリに戻る
            </Button>
            <Button variant="ghost" size="sm">
              パスキーで再試行
            </Button>
          </>
        }
      />,
    );
  });

  it("MFA · passkey-failure", async () => {
    await expectNoA11yViolations(
      <RecoveryPage
        title="パスキーで確認できませんでした"
        description="このデバイスのパスキーを読み取れませんでした。"
        notice={
          <Alert tone="destructive">
            <AlertTitle>パスキーの認証がキャンセルされました</AlertTitle>
            <AlertDescription>対応するパスキーが見つかりませんでした。</AlertDescription>
          </Alert>
        }
        primary={<Button fullWidth>パスキーで再試行</Button>}
        fallbacks={
          <>
            <Button variant="ghost" size="sm">
              認証アプリのコードを使う
            </Button>
            <Button variant="ghost" size="sm">
              リカバリコードを使う
            </Button>
          </>
        }
      />,
    );
  });
});
