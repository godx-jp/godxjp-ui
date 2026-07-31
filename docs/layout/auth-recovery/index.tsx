import { useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { FormField, InputOTP, InputOTPGroup, InputOTPSlot } from "@godxjp/ui/data-entry";
import { Button, Logo, Reveal, Text } from "@godxjp/ui/general";
import { AuthFooter, AuthShell, AuthStack, Flex } from "@godxjp/ui/layout";
import { AppSettingPicker } from "@godxjp/ui/navigation";

/**
 * SIGN-IN MFA CHALLENGE (SCR-008) — a COMPOSITION PATTERN, not a component.
 *
 * `@godxjp/ui` ships NO MfaChallengePanel / PasswordRecoveryPanel: both failed the
 * Framework-Component Test (docs/COMPOSITION-VS-COMPONENT.md) — they own no behaviour and are
 * expressible today from `Card` + `AuthStack` + `FormField` + `InputOTP` + `Button` + `Alert`.
 * The only real gap was the 432px SCR-008 panel MEASURE, which is now a token-owned AuthShell
 * preset: `preset="account-recovery"`. Nothing on this page sets a width, an inset or a colour.
 *
 * THE CANONICAL PANEL ANATOMY (identical for all seven states — see the Examples):
 *   Card > CardHeader(CardTitle + CardDescription)      ← title + description INSIDE the surface
 *        > CardContent > AuthStack
 *            [notice]        Alert, when the state has one
 *            [fields]        FormField(s) — here ONE 6-slot InputOTP row
 *            [primary]       Button fullWidth — spans the panel
 *            [fallback]      Flex justify="between" wrap — the two fallbacks share ONE row
 *
 * There is deliberately no `AuthIdentity` above the card: the SCR-008 hierarchy puts the heading
 * INSIDE the bordered surface, and `AuthIdentity` always renders the hosted mark above it.
 * `TwoFactorSetup` is the ENROLLMENT dialog (QR / manual key / recovery output) and must never be
 * used for this sign-in challenge.
 *
 * FOCUS ORDER is DOM order: code field → verify → recovery-code fallback → passkey fallback.
 * Verify at 1440x900 · 1024x900 · 390x844 (the mobile contract is documented in the Overview —
 * the supplied 390 canonical reference is a cropped desktop composite and is NOT a valid source).
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
              <FormField id="mfa-code" label="確認コード" required>
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
              {/* FALLBACK ROW — the two recovery affordances share one horizontal row and wrap to
                  a stack only when the localized labels no longer fit the panel. */}
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
