import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Descriptions,
} from "@godxjp/ui/data-display";
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
        <Card>
          <CardHeader>
            <CardTitle>請求書の詳細</CardTitle>
            <CardDescription>
              Place inside CardContent. Values can be any node — text, Badge, money.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Descriptions>
              <Descriptions.Item label="請求書番号">INV-2024-0312</Descriptions.Item>
              <Descriptions.Item label="取引先">株式会社ベトヤ</Descriptions.Item>
              <Descriptions.Item label="状態">
                <Badge status="active" />
              </Descriptions.Item>
              <Descriptions.Item label="発行日">2024-04-12</Descriptions.Item>
              <Descriptions.Item label="小計">
                <span className="tabular-nums">¥438,182</span>
              </Descriptions.Item>
              <Descriptions.Item label="消費税 (10%)">
                <span className="tabular-nums">¥43,818</span>
              </Descriptions.Item>
              <Descriptions.Item label="合計">
                <span className="tabular-nums font-medium">¥482,000</span>
              </Descriptions.Item>
              <Descriptions.Item label="摘要">INV-2024-0312 / 4月分 受注</Descriptions.Item>
            </Descriptions>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
