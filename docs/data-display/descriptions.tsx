import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Descriptions,
} from "@godxjp/ui/data-display";
import { Text } from "@godxjp/ui/general";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * Descriptions — responsive label/value grid for detail-page metadata. COMPOUND:
 * the value goes in Descriptions.Item children. Never hand-roll a dl/dt/dd grid.
 * Composed only from real @godxjp/ui components.
 */
export default function Demo() {
  return (
    <PageContainer title="Descriptions" subtitle="Label / value metadata grid for detail pages">
      <Flex direction="col" gap="lg">
        {/* Default columns=2 — the canonical 2-column metadata grid.
            mono for the ID; span=2 + a long URL value shows full-row + break-all overflow. */}
        <Card>
          <CardHeader>
            <CardTitle>請求書の詳細</CardTitle>
            <CardDescription>
              既定は
              columns=2。値は任意のノード（テキスト・Badge・金額）。狭い画面では1列に折り返します。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Descriptions>
              <Descriptions.Item label="請求書番号" mono>
                INV-2024-0312
              </Descriptions.Item>
              <Descriptions.Item label="取引先">株式会社ベトヤ</Descriptions.Item>
              <Descriptions.Item label="状態">
                <Badge status="active" />
              </Descriptions.Item>
              <Descriptions.Item label="発行日">2024-04-12</Descriptions.Item>
              <Descriptions.Item label="小計">
                <Text tabular>¥438,182</Text>
              </Descriptions.Item>
              <Descriptions.Item label="消費税 (10%)">
                <Text tabular>¥43,818</Text>
              </Descriptions.Item>
              <Descriptions.Item label="合計">
                <Text weight="medium" tabular>
                  ¥482,000
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="PDF リンク" mono span={2}>
                https://invoices.vetoya.example.co.jp/2024/04/INV-2024-0312-rev2.pdf
              </Descriptions.Item>
            </Descriptions>
          </CardContent>
        </Card>

        {/* layout="horizontal" — label BESIDE value (token-aligned label column), like <Form layout>.
            Default layout is "vertical" (label over value, the cards above). */}
        <Card>
          <CardHeader>
            <CardTitle>横並び (layout=&quot;horizontal&quot;)</CardTitle>
            <CardDescription>
              ラベルを値の左に揃える。`--descriptions-label-width` でラベル列幅を調整。既定は
              layout=&quot;vertical&quot;（ラベルを上に積む、上のカード）。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Descriptions columns={1} layout="horizontal">
              <Descriptions.Item label="請求書番号" mono>
                INV-2024-0312
              </Descriptions.Item>
              <Descriptions.Item label="取引先">株式会社ベトヤ</Descriptions.Item>
              <Descriptions.Item label="状態">
                <Badge status="active" />
              </Descriptions.Item>
              <Descriptions.Item label="合計">
                <Text weight="medium" tabular>
                  ¥482,000
                </Text>
              </Descriptions.Item>
            </Descriptions>
          </CardContent>
        </Card>

        {/* columns=1 — stacked detail panel: every item on its own row. */}
        <Card>
          <CardHeader>
            <CardTitle>取引先の詳細</CardTitle>
            <CardDescription>columns=1。各項目を縦積みにする詳細パネル向けの構成。</CardDescription>
          </CardHeader>
          <CardContent>
            <Descriptions columns={1}>
              <Descriptions.Item label="会社名">株式会社ベトヤ</Descriptions.Item>
              <Descriptions.Item label="法人番号" mono>
                1180001052731
              </Descriptions.Item>
              <Descriptions.Item label="住所">
                東京都渋谷区神宮前5-52-2 青山オーバルビル7F
              </Descriptions.Item>
              <Descriptions.Item label="担当者">山田 太郎（経理部）</Descriptions.Item>
            </Descriptions>
          </CardContent>
        </Card>

        {/* columns=3 — dense metadata grid; span=3 makes the JSON value occupy the full width. */}
        <Card>
          <CardHeader>
            <CardTitle>システムメタデータ</CardTitle>
            <CardDescription>
              columns=3。識別子の多い密なメタデータ向け。mono と span でIDやJSONを整列。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Descriptions columns={3}>
              <Descriptions.Item label="リソースID" mono>
                inv_8f3a21c0
              </Descriptions.Item>
              <Descriptions.Item label="リビジョン" mono>
                v3
              </Descriptions.Item>
              <Descriptions.Item label="状態">
                <Badge status="active" />
              </Descriptions.Item>
              <Descriptions.Item label="作成日時" mono>
                2024-04-12T09:31:00+09:00
              </Descriptions.Item>
              <Descriptions.Item label="更新日時" mono>
                2024-04-12T14:07:55+09:00
              </Descriptions.Item>
              <Descriptions.Item label="作成者">山田 太郎</Descriptions.Item>
              <Descriptions.Item label="メタデータ" mono span={3}>
                {'{ "channel": "web", "tax_rate": 0.1, "currency": "JPY" }'}
              </Descriptions.Item>
            </Descriptions>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
