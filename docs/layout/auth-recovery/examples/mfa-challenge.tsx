import { useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@godxjp/ui/feedback";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { FormField, Input, InputOTP, InputOTPGroup, InputOTPSlot } from "@godxjp/ui/data-entry";
import { Button, Logo, Text } from "@godxjp/ui/general";
import { AuthFooter, AuthShell, AuthStack, Flex } from "@godxjp/ui/layout";
import { AppSettingPicker } from "@godxjp/ui/navigation";

/**
 * SIGN-IN MFA CHALLENGE — the three canonical SCR-008 states plus the error / loading paths,
 * stacked at the real 432px measure.
 *
 * This is the SIGN-IN challenge, not enrollment. `TwoFactorSetup` is the enrollment Dialog (QR /
 * manual key / recovery output) and must never be reused here: a challenge has no secret to reveal
 * and no dialog to dismiss — it IS the page.
 *
 * FOCUS ORDER is DOM order, and DOM order is the task order:
 *   1. the code field (OTP row / recovery-code Input)  2. the primary action
 *   3. fallback A                                      4. fallback B
 * The OTP row is ONE field — `InputOTP` owns paste, arrow keys and the caret; six separate
 * `Input`s would put six stops in the tab ring and break paste.
 *
 * State coverage: otp (idle) · otp ERROR (wrong code) · otp LOADING (verifying) · recovery-code ·
 * passkey-failure. Stacked at `level={2}`; a real route renders ONE panel at `level={1}`.
 */
export default function Demo() {
  const [code, setCode] = useState("");
  const [wrongCode, setWrongCode] = useState("140228");
  const [pendingCode, setPendingCode] = useState("482915");
  const [recoveryCode, setRecoveryCode] = useState("");

  return (
    <AuthShell
      variant="canonical"
      preset="account-recovery"
      brand={
        <Flex align="center" gap="sm">
          <Logo mark="godx" tone="success" />
          <Text weight="medium">GoDX ID</Text>
        </Flex>
      }
      footer={
        <AuthFooter
          product="GoDX ID"
          terms="利用規約"
          privacy="プライバシー"
          locale={<AppSettingPicker kind="locale" appearance="labeled" compact />}
        />
      }
    >
      <Flex direction="col" gap="lg">
        <Text size="xs" tone="muted" mono>
          1 / 5 · otp · 認証アプリの 6 桁コード（1 行 6 スロット）
        </Text>
        <Card>
          <CardHeader>
            <CardTitle level={2}>二段階認証</CardTitle>
            <CardDescription>
              認証アプリに表示されている 6 桁のコードを入力してください。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AuthStack>
              <FormField id="mfa-otp-idle" label="確認コード" required>
                <InputOTP maxLength={6} pattern="^[0-9]+$" value={code} onChange={setCode}>
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
              <Button fullWidth>確認する</Button>
              <Flex justify="between" gap="sm" wrap>
                <Button variant="ghost" size="sm">
                  リカバリコードを使う
                </Button>
                <Button variant="ghost" size="sm">
                  パスキーで再試行
                </Button>
              </Flex>
            </AuthStack>
          </CardContent>
        </Card>

        <Text size="xs" tone="muted" mono>
          2 / 5 · otp（error）— コード不一致 · aria-invalid + role=alert
        </Text>
        <Card>
          <CardHeader>
            <CardTitle level={2}>二段階認証</CardTitle>
            <CardDescription>
              認証アプリに表示されている 6 桁のコードを入力してください。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AuthStack>
              <FormField
                id="mfa-otp-error"
                label="確認コード"
                error="コードが正しくありません。残り 4 回入力できます。"
                required
              >
                <InputOTP
                  maxLength={6}
                  pattern="^[0-9]+$"
                  value={wrongCode}
                  onChange={setWrongCode}
                >
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
              <Button fullWidth>確認する</Button>
              <Flex justify="between" gap="sm" wrap>
                <Button variant="ghost" size="sm">
                  リカバリコードを使う
                </Button>
                <Button variant="ghost" size="sm">
                  パスキーで再試行
                </Button>
              </Flex>
            </AuthStack>
          </CardContent>
        </Card>

        <Text size="xs" tone="muted" mono>
          3 / 5 · otp（loading）— 検証中 · 入力をロックし、ボタンの箱は動かさない
        </Text>
        <Card>
          <CardHeader>
            <CardTitle level={2}>二段階認証</CardTitle>
            <CardDescription>コードを検証しています。しばらくお待ちください。</CardDescription>
          </CardHeader>
          <CardContent>
            <AuthStack>
              <FormField id="mfa-otp-loading" label="確認コード" required>
                <InputOTP
                  disabled
                  maxLength={6}
                  pattern="^[0-9]+$"
                  value={pendingCode}
                  onChange={setPendingCode}
                >
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
              <Button fullWidth loading loadingText="検証中…">
                確認する
              </Button>
              <Flex justify="between" gap="sm" wrap>
                <Button variant="ghost" size="sm" disabled>
                  リカバリコードを使う
                </Button>
                <Button variant="ghost" size="sm" disabled>
                  パスキーで再試行
                </Button>
              </Flex>
            </AuthStack>
          </CardContent>
        </Card>

        <Text size="xs" tone="muted" mono>
          4 / 5 · recovery-code · 一度きりのリカバリコード（1 つのテキスト入力）
        </Text>
        <Card>
          <CardHeader>
            <CardTitle level={2}>リカバリコードを入力</CardTitle>
            <CardDescription>
              二段階認証の設定時に保存した、一度だけ使えるコードを入力してください。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AuthStack>
              <FormField
                id="mfa-recovery-code"
                label="リカバリコード"
                helper="ハイフンを含めて入力してください（例: 4f7c-92ab-30de）。"
                required
              >
                <Input
                  autoComplete="one-time-code"
                  inputMode="text"
                  spellCheck={false}
                  placeholder="4f7c-92ab-30de"
                  value={recoveryCode}
                  onChange={(event) => setRecoveryCode(event.target.value)}
                />
              </FormField>
              <Button fullWidth>確認する</Button>
              <Flex justify="between" gap="sm" wrap>
                <Button variant="ghost" size="sm">
                  認証アプリに戻る
                </Button>
                <Button variant="ghost" size="sm">
                  パスキーで再試行
                </Button>
              </Flex>
            </AuthStack>
          </CardContent>
        </Card>

        <Text size="xs" tone="muted" mono>
          5 / 5 · passkey-failure · パスキー認証に失敗（destructive 通知 + 代替手段）
        </Text>
        <Card>
          <CardHeader>
            <CardTitle level={2}>パスキーで確認できませんでした</CardTitle>
            <CardDescription>
              このデバイスのパスキーを読み取れませんでした。別の方法で本人確認を続けられます。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AuthStack>
              <Alert tone="destructive">
                <AlertTitle>パスキーの認証がキャンセルされました</AlertTitle>
                <AlertDescription>
                  デバイスのロック解除が完了しなかったか、対応するパスキーが見つかりませんでした。
                </AlertDescription>
              </Alert>
              <Button fullWidth>パスキーで再試行</Button>
              <Flex justify="between" gap="sm" wrap>
                <Button variant="ghost" size="sm">
                  認証アプリのコードを使う
                </Button>
                <Button variant="ghost" size="sm">
                  リカバリコードを使う
                </Button>
              </Flex>
            </AuthStack>
          </CardContent>
        </Card>
      </Flex>
    </AuthShell>
  );
}
