import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Descriptions,
} from "@godxjp/ui/data-display";
import { Button } from "@godxjp/ui/general";
import { Flex, PageContainer, ResponsiveGrid } from "@godxjp/ui/layout";
import { MoreHorizontal } from "lucide-react";

/**
 * Card — surface container. Body content ALWAYS goes in CardContent (a bare Card
 * has zero padding); titles in CardHeader/CardTitle; action bars in CardFooter.
 * Flat by design — 1px border, no shadow at rest. Composed only from real
 * @godxjp/ui components.
 */
const accents = ["primary", "success", "warning", "info", "attention", "destructive"] as const;

export default function Demo() {
  return (
    <PageContainer title="Card" subtitle="variant · accent · header / content / footer composition">
      <Flex direction="col" gap="lg">
        <Flex direction="col" gap="sm">
          <div className="text-sm font-medium">Variants</div>
          <ResponsiveGrid columns={{ sm: 1, md: 2, lg: 4 }}>
            <Card variant="default">
              <CardHeader>
                <CardTitle>default</CardTitle>
              </CardHeader>
              <CardContent>標準のサーフェス</CardContent>
            </Card>
            <Card variant="muted">
              <CardHeader>
                <CardTitle>muted</CardTitle>
              </CardHeader>
              <CardContent>控えめな塗り</CardContent>
            </Card>
            <Card variant="outline">
              <CardHeader>
                <CardTitle>outline</CardTitle>
              </CardHeader>
              <CardContent>枠線のみ</CardContent>
            </Card>
            <Card variant="featured">
              <CardHeader>
                <CardTitle>featured</CardTitle>
              </CardHeader>
              <CardContent>強調サーフェス</CardContent>
            </Card>
          </ResponsiveGrid>
        </Flex>

        <Flex direction="col" gap="sm">
          <div className="text-sm font-medium">Accent stripe (3px left edge)</div>
          <ResponsiveGrid columns={{ sm: 2, md: 3, lg: 6 }}>
            {accents.map((a) => (
              <Card key={a} accent={a}>
                <CardContent>{a}</CardContent>
              </Card>
            ))}
          </ResponsiveGrid>
        </Flex>

        <Flex direction="col" gap="sm">
          <div className="text-sm font-medium">Composition — banded header + separated footer</div>
          <Card accent="primary">
            <CardHeader banded>
              <CardTitle>請求書 INV-2024-0312</CardTitle>
              <CardDescription>株式会社ベトヤ · 2024-04-12</CardDescription>
              <CardAction>
                <Button variant="ghost" size="icon-sm" aria-label="メニュー">
                  <MoreHorizontal />
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent>
              <Descriptions>
                <Descriptions.Item label="小計">¥438,182</Descriptions.Item>
                <Descriptions.Item label="消費税 (10%)">¥43,818</Descriptions.Item>
                <Descriptions.Item label="合計">¥482,000</Descriptions.Item>
              </Descriptions>
            </CardContent>
            <CardFooter separated>
              <Flex direction="row" wrap gap="sm" justify="end">
                <Button variant="outline">却下</Button>
                <Button>承認</Button>
              </Flex>
            </CardFooter>
          </Card>
        </Flex>
      </Flex>
    </PageContainer>
  );
}
