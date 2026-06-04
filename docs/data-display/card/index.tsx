import {
  Card,
  CardAction,
  CardContent,
  CardCover,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Descriptions,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@godxjp/ui/data-display";
import { Button } from "@godxjp/ui/general";
import { AspectRatio, Flex, PageContainer, ResponsiveGrid } from "@godxjp/ui/layout";
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

        <Flex direction="col" gap="sm">
          <div className="text-sm font-medium">Size — md (default) vs compact</div>
          <ResponsiveGrid columns={{ sm: 1, md: 2 }}>
            <Card size="md">
              <CardHeader>
                <CardTitle>size=md</CardTitle>
              </CardHeader>
              <CardContent>標準のインセット（16px）</CardContent>
            </Card>
            <Card size="compact">
              <CardHeader>
                <CardTitle>size=compact</CardTitle>
              </CardHeader>
              <CardContent>密なインセット（KPI タイルの既定）</CardContent>
            </Card>
          </ResponsiveGrid>
        </Flex>

        <Flex direction="col" gap="sm">
          <div className="text-sm font-medium">Density — tight 12px · base 16px · cozy 20px</div>
          <ResponsiveGrid columns={{ sm: 1, md: 3 }}>
            <Card density="tight">
              <CardHeader>
                <CardTitle>tight</CardTitle>
              </CardHeader>
              <CardContent>余白を詰めた密度</CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>base</CardTitle>
              </CardHeader>
              <CardContent>既定の密度</CardContent>
            </Card>
            <Card density="cozy">
              <CardHeader>
                <CardTitle>cozy</CardTitle>
              </CardHeader>
              <CardContent>ゆったりした密度</CardContent>
            </Card>
          </ResponsiveGrid>
        </Flex>

        <Flex direction="col" gap="sm">
          <div className="text-sm font-medium">
            CardContent — flush (edge-to-edge table) · solo (no header)
          </div>
          <ResponsiveGrid columns={{ sm: 1, lg: 2 }}>
            <Card>
              <CardHeader banded>
                <CardTitle>仕訳明細</CardTitle>
              </CardHeader>
              <CardContent flush>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>勘定科目</TableHead>
                      <TableHead className="text-right">借方</TableHead>
                      <TableHead className="text-right">貸方</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>売掛金</TableCell>
                      <TableCell className="text-right tabular-nums">¥482,000</TableCell>
                      <TableCell className="text-right">—</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>売上高</TableCell>
                      <TableCell className="text-right">—</TableCell>
                      <TableCell className="text-right tabular-nums">¥438,182</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>仮受消費税</TableCell>
                      <TableCell className="text-right">—</TableCell>
                      <TableCell className="text-right tabular-nums">¥43,818</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <Card>
              <CardContent solo>
                ヘッダーのない本文。solo はトップパディングをカードのシェルに合わせます。
              </CardContent>
            </Card>
          </ResponsiveGrid>
        </Flex>

        <Flex direction="col" gap="sm">
          <div className="text-sm font-medium">CardCover — full-bleed media, header below</div>
          <ResponsiveGrid columns={{ sm: 1, md: 2, lg: 3 }}>
            <Card>
              <CardCover>
                <AspectRatio ratio={16 / 9}>
                  <img
                    src="https://picsum.photos/seed/godxjp-card/480/270"
                    alt="オフィスビルの外観"
                    className="h-full w-full object-cover"
                  />
                </AspectRatio>
              </CardCover>
              <CardHeader>
                <CardTitle>渋谷オフィス</CardTitle>
                <CardDescription>東京都渋谷区 · 内見受付中</CardDescription>
              </CardHeader>
              <CardFooter flush separated>
                <Button variant="ghost">詳細を見る</Button>
              </CardFooter>
            </Card>
          </ResponsiveGrid>
        </Flex>
      </Flex>
    </PageContainer>
  );
}
