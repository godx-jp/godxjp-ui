import { useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { FormField, InputOTP, InputOTPGroup, InputOTPSlot } from "@godxjp/ui/data-entry";
import { Button, Logo, Reveal, Text } from "@godxjp/ui/general";
import { AuthFooter, AuthShell, AuthStack, Flex } from "@godxjp/ui/layout";
import { AppSettingPicker } from "@godxjp/ui/navigation";

/**
 * Viewport fixture — 390x844 (mobile). THE MOBILE CONTRACT, decided here.
 *
 * ⚠️ The 390 canonical reference supplied with gh#233 is a desktop 2x2 COMPOSITE that overflows and
 * crops horizontally. It is not a route-level mobile artboard and it was NOT traced. The behaviour
 * below is a decided, documented contract — see the Overview page.
 *
 * At <=30rem the `account-recovery` preset switches its page gutter to
 * `--auth-shell-recovery-main-padding-mobile` (15px inline), so the panel is x=15, width=360 — the
 * SAME page rhythm as the canonical Login flow, so moving from Login to Recovery on a phone never
 * makes the surface jump. The panel keeps its full 24px card inset, giving a 310px content column;
 * the 6-slot OTP row (6 x 36px = 216px) fits that column at every supported width with no scroll,
 * no shrunken slots and no horizontal overflow.
 */
export default function Demo() {
  const [code, setCode] = useState("");

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
      <Reveal>
        <Card>
          <CardHeader>
            <CardTitle level={1}>二段階認証</CardTitle>
            <CardDescription>
              認証アプリに表示されている 6 桁のコードを入力してください。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AuthStack>
              <FormField id="mfa-code-mobile" label="確認コード" required>
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
      </Reveal>
    </AuthShell>
  );
}
