import { useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@godxjp/ui/feedback";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { FormField, Input, PasswordInput, PasswordStrength } from "@godxjp/ui/data-entry";
import { Button, Logo, Text } from "@godxjp/ui/general";
import { AuthFooter, AuthShell, AuthStack, Flex } from "@godxjp/ui/layout";
import { AppSettingPicker } from "@godxjp/ui/navigation";

/**
 * PASSWORD RECOVERY — the four canonical SCR-008 panel states, stacked at the real 432px measure.
 *
 * All four are the SAME anatomy; only the notice, the fields and the copy change:
 *   Card > CardHeader(CardTitle + CardDescription) > CardContent > AuthStack
 *          [notice Alert] → [fields] → [Button fullWidth] → [fallback row]
 *
 * A real route renders ONE of these panels with `CardTitle level={1}`. They are stacked here (at
 * `level={2}`, under the page's own caption line) purely so the four states can be compared at the
 * identical measure — the shell's `preset="account-recovery"` column caps every one at 432px.
 *
 * State coverage: request (idle) · sent (success notice + DISABLED resend during cooldown) ·
 * new-password (field ERROR + strength meter) · expired (destructive notice). The LOADING state is
 * covered by the MFA example. Every panel's primary action spans the panel; every fallback row is
 * `Flex justify="between" wrap`, so it collapses to a stack when the labels stop fitting.
 */
export default function Demo() {
  const [email, setEmail] = useState("hanako@example.co.jp");
  const [password, setPassword] = useState("Godx-2026");
  const [confirmation, setConfirmation] = useState("Godx-202");

  // The address is masked by the SERVER before it reaches the panel — the library never
  // reconstructs an identifier, it only renders the string the consumer sends.
  const maskedEmail = "h*****@example.co.jp";

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
          1 / 4 · request · リセットリンクの発行を依頼する
        </Text>
        <Card>
          <CardHeader>
            <CardTitle level={2}>パスワードをリセット</CardTitle>
            <CardDescription>
              登録済みのメールアドレスにリセットリンクをお送りします。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AuthStack>
              <FormField id="recovery-email" label="メールアドレス" required>
                <Input
                  type="email"
                  autoComplete="username"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </FormField>
              <Button fullWidth>リセットリンクを送信</Button>
              <Flex justify="between" gap="sm" wrap>
                <Button variant="ghost" size="sm">
                  サインインに戻る
                </Button>
                <Button variant="ghost" size="sm">
                  サポートに連絡
                </Button>
              </Flex>
            </AuthStack>
          </CardContent>
        </Card>

        <Text size="xs" tone="muted" mono>
          2 / 4 · sent · 送信済み（成功通知 + 再送クールダウン中は disabled）
        </Text>
        <Card>
          <CardHeader>
            <CardTitle level={2}>メールを確認してください</CardTitle>
            <CardDescription>
              リセットリンクを送信しました。リンクの有効期限は 30 分です。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AuthStack>
              <Alert tone="success">
                <AlertTitle>{maskedEmail} に送信しました</AlertTitle>
                <AlertDescription>
                  メールが届かない場合は、迷惑メールフォルダもご確認ください。
                </AlertDescription>
              </Alert>
              <Button fullWidth disabled>
                メールを再送する（60 秒後）
              </Button>
              <Flex justify="between" gap="sm" wrap>
                <Button variant="ghost" size="sm">
                  サインインに戻る
                </Button>
                <Button variant="ghost" size="sm">
                  別のアドレスを使う
                </Button>
              </Flex>
            </AuthStack>
          </CardContent>
        </Card>

        <Text size="xs" tone="muted" mono>
          3 / 4 · new-password · 新しいパスワードの設定（確認欄の不一致エラー）
        </Text>
        <Card>
          <CardHeader>
            <CardTitle level={2}>新しいパスワードを設定</CardTitle>
            <CardDescription>
              他のサービスで使用していないパスワードを設定してください。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AuthStack>
              <FormField id="recovery-new-password" label="新しいパスワード" required>
                <PasswordInput
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </FormField>
              <PasswordStrength value={password} />
              <FormField
                id="recovery-confirm-password"
                label="新しいパスワード（確認）"
                error="パスワードが一致しません。"
                required
              >
                <PasswordInput
                  autoComplete="new-password"
                  value={confirmation}
                  onChange={(event) => setConfirmation(event.target.value)}
                />
              </FormField>
              <Button fullWidth>パスワードを更新</Button>
              <Flex justify="between" gap="sm" wrap>
                <Button variant="ghost" size="sm">
                  サインインに戻る
                </Button>
              </Flex>
            </AuthStack>
          </CardContent>
        </Card>

        <Text size="xs" tone="muted" mono>
          4 / 4 · expired · リンクの有効期限切れ（destructive 通知）
        </Text>
        <Card>
          <CardHeader>
            <CardTitle level={2}>リンクの有効期限が切れています</CardTitle>
            <CardDescription>
              セキュリティのため、リセットリンクは発行から 30 分で失効します。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AuthStack>
              <Alert tone="destructive">
                <AlertTitle>このリンクは使用できません</AlertTitle>
                <AlertDescription>
                  期限切れ、または既に使用されたリンクです。新しいリンクを発行してください。
                </AlertDescription>
              </Alert>
              <Button fullWidth>新しいリンクを発行</Button>
              <Flex justify="between" gap="sm" wrap>
                <Button variant="ghost" size="sm">
                  サインインに戻る
                </Button>
                <Button variant="ghost" size="sm">
                  サポートに連絡
                </Button>
              </Flex>
            </AuthStack>
          </CardContent>
        </Card>
      </Flex>
    </AuthShell>
  );
}
