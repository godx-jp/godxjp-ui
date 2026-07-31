import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { FormField, InputOTP, InputOTPGroup, InputOTPSlot } from "@godxjp/ui/data-entry";
import { Button, Logo, Reveal, Text } from "@godxjp/ui/general";
import { AuthFooter, AuthIdentity, AuthShell, AuthStack, Flex } from "@godxjp/ui/layout";
import { AppSettingPicker } from "@godxjp/ui/navigation";

/**
 * AuthShell preset="device-authorization" (gh#220) — the canonical OAuth device-grant screen.
 *
 * The whole page measure is owned by the preset: a 380px card at 1440/1024 and a 5px inline page
 * gutter at 390 (card x=5px, width=380px). Nothing here sets a width, an inset or a colour — a
 * consumer that previously forked `.canonical-auth-shell--wide` to override
 * `--auth-shell-card-max-width` deletes that CSS and passes `preset` instead.
 *
 * `variant="canonical"` still owns control density + heading size; the preset only re-measures.
 * Verify at 1440x900 · 1024x900 · 390x844.
 */
export default function Demo() {
  return (
    <AuthShell
      variant="canonical"
      preset="device-authorization"
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
      <Reveal>
        <Card>
          <CardHeader>
            <AuthIdentity
              title="デバイスを認証"
              requester="勤怠管理 (TV アプリ) が認証を要求しています"
            />
            <CardTitle level={2}>確認コードを入力</CardTitle>
            <CardDescription>
              デバイスの画面に表示されている 6 桁のコードを入力してください。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AuthStack>
              <FormField id="device-otp" label="デバイス確認コード" required>
                <InputOTP maxLength={6}>
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
              <Button fullWidth>デバイスを承認</Button>
              <Button fullWidth variant="ghost">
                キャンセル
              </Button>
              <Text size="xs" tone="muted">
                このコードは 15 分間有効です。
              </Text>
            </AuthStack>
          </CardContent>
        </Card>
      </Reveal>
    </AuthShell>
  );
}
