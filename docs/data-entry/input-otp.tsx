import { useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import {
  FormField,
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@godxjp/ui/data-entry";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * InputOTP — compound one-time-code input: InputOTP > InputOTPGroup > InputOTPSlot.
 * ONE field with paste, arrow-key, and caret handling built in.
 * Never use N separate Input fields for OTP. Composed only from real @godxjp/ui components.
 */
export default function Demo() {
  const [emailCode, setEmailCode] = useState("");
  const [smsCode, setSmsCode] = useState("");
  const [inviteCode, setInviteCode] = useState("");

  // Auto-submit pattern — onComplete fires when every slot is filled.
  const [completeCode, setCompleteCode] = useState("123456");
  const [verified, setVerified] = useState("123456");

  // Error path — a wrong code seeded at rest so the invalid styling is visible
  // without typing. FormField wires aria-invalid + aria-errormessage onto the field.
  const [wrongCode, setWrongCode] = useState("000000");

  return (
    <PageContainer title="InputOTP" subtitle="ワンタイムコード入力 · 2FA・SMS認証・招待コード">
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>メール認証コード（6桁）</CardTitle>
            <CardDescription>
              6スロット 1グループ · ペースト・矢印キー操作に対応。autoFocus でコード入力画面の初期フォーカスを設定。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField id="email-otp" label="認証コード" required>
              <InputOTP autoFocus maxLength={6} value={emailCode} onChange={setEmailCode}>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>SMS認証コード（3+3）</CardTitle>
            <CardDescription>
              InputOTPSeparator で 2 グループに分割して視認性を高める。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField id="sms-otp" label="SMSコード" required>
              <InputOTP maxLength={6} value={smsCode} onChange={setSmsCode}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>招待コード（4桁PIN）</CardTitle>
            <CardDescription>4スロット · 数字のみ許可する pattern を指定。</CardDescription>
          </CardHeader>
          <CardContent>
            <FormField id="invite-pin" label="招待PIN" helper="メールに記載された4桁の数字">
              <InputOTP
                maxLength={4}
                pattern="^[0-9]+$"
                value={inviteCode}
                onChange={setInviteCode}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                </InputOTPGroup>
              </InputOTP>
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>自動送信（onComplete）</CardTitle>
            <CardDescription>
              全スロットが埋まると onComplete が発火し、ボタンを押さずに検証を実行する。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              id="autosubmit-otp"
              label="認証コード"
              helper={verified ? `${verified} を検証済み · 自動送信されました。` : "6桁を入力すると自動で送信されます。"}
              required
            >
              <InputOTP
                maxLength={6}
                value={completeCode}
                onChange={setCompleteCode}
                onComplete={(code) => setVerified(code)}
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>エラー（コードが一致しない）</CardTitle>
            <CardDescription>
              FormField の error で aria-invalid を付与 · スロットの枠が destructive 色に変わる。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              id="error-otp"
              label="認証コード"
              error="コードが正しくありません。もう一度入力してください。"
              required
            >
              <InputOTP maxLength={6} value={wrongCode} onChange={setWrongCode}>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>無効（再送クールダウン中）</CardTitle>
            <CardDescription>
              disabled · コード再送のクールダウンや検証中は入力をロックする。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField id="disabled-otp" label="認証コード" helper="60秒後に再入力できます。">
              <InputOTP disabled maxLength={6} value="42" onChange={() => {}}>
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
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
