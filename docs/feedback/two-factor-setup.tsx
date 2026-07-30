import { useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { TwoFactorSetup, type TwoFactorSetupLabels } from "@godxjp/ui/feedback";
import { Button, Text } from "@godxjp/ui/general";
import { Flex, PageContainer } from "@godxjp/ui/layout";

const labels: TwoFactorSetupLabels = {
  title: "二要素認証を有効にする",
  description: "認証アプリでQRコードを読み取り、表示された6桁のコードを入力します。",
  qrLabel: "認証アプリ登録用QRコード",
  manualKeyLabel: "手動セットアップキー",
  codeLabel: "確認コード",
  codePlaceholder: "123 456",
  recoveryNotice: "復旧コードは安全な場所に保存してください。再表示できません。",
  cancel: "キャンセル",
  confirm: "確認して有効化",
  acknowledge: "保存しました",
};

/**
 * TwoFactorSetup — controlled enrollment and one-time recovery-code journey. Persistence and
 * network requests remain consumer-owned; this frame demonstrates the public state boundary.
 */
export default function Demo() {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);

  const beginEnrollment = () => {
    setCode("");
    setRecoveryCodes([]);
    setOpen(true);
  };

  return (
    <PageContainer title="TwoFactorSetup" subtitle="登録 · OTP確認 · 復旧コード受領">
      <Card>
        <CardHeader>
          <CardTitle level={2}>認証アプリを登録</CardTitle>
          <CardDescription>6桁の確認コードが揃うまで有効化操作は利用できません。</CardDescription>
        </CardHeader>
        <CardContent>
          <Flex direction="col" gap="md">
            <Button onClick={beginEnrollment}>二要素認証を設定</Button>
            <Text size="sm" tone="muted" aria-live="polite">
              {recoveryCodes.length > 0
                ? "復旧コードを表示しています。"
                : "二要素認証はまだ設定されていません。"}
            </Text>
          </Flex>
          <TwoFactorSetup
            open={open}
            onOpenChange={setOpen}
            qrValue="otpauth://totp/Godx:tanaka@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Godx"
            manualKey="JBSW Y3DP EHPK 3PXP"
            code={code}
            onCodeChange={setCode}
            onConfirm={() => setRecoveryCodes(["alpha-7k2m", "bravo-9p4x", "charlie-3d8q"])}
            recoveryCodes={recoveryCodes}
            onAcknowledge={() => setOpen(false)}
            labels={labels}
          />
        </CardContent>
      </Card>
    </PageContainer>
  );
}
