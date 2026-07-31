import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { FormField, InputOTP, InputOTPGroup, InputOTPSlot } from "@godxjp/ui/data-entry";
import { Button, Logo, Text } from "@godxjp/ui/general";
import { AuthFooter, AuthShell, AuthStack, Flex } from "@godxjp/ui/layout";
import { AppSettingPicker } from "@godxjp/ui/navigation";

/**
 * LONG-LABEL WRAPPING — the same MFA challenge panel in ja / en / vi at the identical 432px measure.
 *
 * Vietnamese is the stress case: its fallback labels are the longest of the three, so the fallback
 * row is where the reflow shows. `Flex justify="between" wrap` keeps the two fallbacks on ONE row
 * while they fit the panel and stacks them when they do not — the decision is made by the CONTENT,
 * so it is right for every locale without a media query or a per-locale override.
 *
 * The title and description wrap inside the panel and grow its height; the panel width never
 * changes, because 432px is a max-width owned by `--auth-shell-recovery-card-max-width` and not a
 * function of the copy.
 */
export default function Demo() {
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
          ja · 認証アプリのコード
        </Text>
        <Card>
          <CardHeader>
            <CardTitle level={2}>二段階認証コードを入力してください</CardTitle>
            <CardDescription>
              お使いの認証アプリに表示されている 6
              桁の確認コードを入力すると、サインインが完了します。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AuthStack>
              <FormField id="wrap-otp-ja" label="確認コード" required>
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
              <Button fullWidth>コードを確認してサインイン</Button>
              <Flex justify="between" gap="sm" wrap>
                <Button variant="ghost" size="sm">
                  リカバリコードを使う
                </Button>
                <Button variant="ghost" size="sm">
                  パスキーで再試行する
                </Button>
              </Flex>
            </AuthStack>
          </CardContent>
        </Card>

        <Text size="xs" tone="muted" mono>
          en · authenticator app code
        </Text>
        <Card>
          <CardHeader>
            <CardTitle level={2}>Enter your two-factor authentication code</CardTitle>
            <CardDescription>
              Type the 6-digit verification code shown in your authenticator app to finish signing
              in to your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AuthStack>
              <FormField id="wrap-otp-en" label="Verification code" required>
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
              <Button fullWidth>Verify code and sign in</Button>
              <Flex justify="between" gap="sm" wrap>
                <Button variant="ghost" size="sm">
                  Use a recovery code
                </Button>
                <Button variant="ghost" size="sm">
                  Try passkey again
                </Button>
              </Flex>
            </AuthStack>
          </CardContent>
        </Card>

        <Text size="xs" tone="muted" mono>
          vi · mã ứng dụng xác thực（最長ラベル）
        </Text>
        <Card>
          <CardHeader>
            <CardTitle level={2}>Nhập mã xác thực hai lớp của bạn</CardTitle>
            <CardDescription>
              Nhập mã xác minh gồm 6 chữ số hiển thị trong ứng dụng xác thực của bạn để hoàn tất
              việc đăng nhập vào tài khoản.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AuthStack>
              <FormField id="wrap-otp-vi" label="Mã xác minh" required>
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
              <Button fullWidth>Xác minh mã và đăng nhập</Button>
              <Flex justify="between" gap="sm" wrap>
                <Button variant="ghost" size="sm">
                  Dùng mã khôi phục dự phòng
                </Button>
                <Button variant="ghost" size="sm">
                  Thử lại bằng khóa truy cập
                </Button>
              </Flex>
            </AuthStack>
          </CardContent>
        </Card>
      </Flex>
    </AuthShell>
  );
}
