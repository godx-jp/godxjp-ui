import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CredentialReveal,
  QrCode,
} from "@godxjp/ui/data-display";
import { Text } from "@godxjp/ui/general";
import { Flex, PageContainer } from "@godxjp/ui/layout";

const TOTP_URI =
  "otpauth://totp/GoDX:admin@example.com?secret=JBSWY3DPEHPK3PXP&issuer=GoDX&digits=6&period=30";

export default function Demo() {
  return (
    <PageContainer title="QrCode" subtitle="ネットワーク送信なしで機密値を端末内エンコード">
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle level={2}>二要素認証の登録</CardTitle>
            <CardDescription>
              認証アプリでQRコードを読み取ります。読み取れない場合は手動キーを使用できます。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <QrCode value={TOTP_URI} label="二要素認証の登録用QRコード" size="lg" />
              <CredentialReveal
                secret="JBSWY3DPEHPK3PXP"
                label="手動設定キー"
                warning={null}
                defaultRevealed
                size="sm"
              />
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Size</CardTitle>
            <CardDescription>
              xs / sm / md / lg。SVGのため高DPIでも鮮明で、狭い画面では利用可能幅に収まります。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="row" gap="lg" wrap align="start">
              {(["xs", "sm", "md", "lg"] as const).map((size) => (
                <Flex key={size} direction="col" gap="xs" align="center">
                  <QrCode
                    value={`https://godx.jp/qr/${size}`}
                    label={`${size} QRコード`}
                    size={size}
                  />
                  <Text as="span" size="sm" tone="muted">
                    {size}
                  </Text>
                </Flex>
              ))}
            </Flex>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
