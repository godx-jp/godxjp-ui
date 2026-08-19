import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import {
  FormField,
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@godxjp/ui/data-entry";
import { Button, Logo, Reveal, Text } from "@godxjp/ui/general";
import {
  AuthAccountSummary,
  AuthFooter,
  AuthIdentity,
  AuthShell,
  AuthStack,
  Flex,
} from "@godxjp/ui/layout";
import { AppSettingPicker, Steps } from "@godxjp/ui/navigation";

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
 *
 * gh#12 — the preset also owns the CODE FIELD now: `--otp-slot-{inline,block}-size` come from
 * `--auth-shell-device-otp-slot-*`, so each 4-slot grouped box measures the canonical 112x54
 * instead of the 146x38 the square control tier produced. Nothing on this page sets it. The row is
 * centred with `align="center"` (not a wrapper div) and the progress marker is the canonical
 * `separator="arrow"`.
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
            <Steps
              type="inline"
              separator="arrow"
              value={0}
              items={[{ title: "コード入力" }, { title: "確認" }, { title: "完了" }]}
            />
            <AuthIdentity
              title="デバイスを認証"
              requester="勤怠管理 (TV アプリ) が認証を要求しています"
            />
            <CardTitle level={2}>確認コードを入力</CardTitle>
            <CardDescription>
              デバイスの画面に表示されている 8 桁のコードを入力してください。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AuthStack>
              <AuthAccountSummary
                email="signed-in.user@example.com"
                actionLabel="切り替え"
                onAction={() => {}}
              />
              <FormField id="device-otp" label="デバイス確認コード" required>
                <InputOTP maxLength={8} align="center">
                  <InputOTPGroup appearance="grouped">
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup appearance="grouped">
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                    <InputOTPSlot index={6} />
                    <InputOTPSlot index={7} />
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
