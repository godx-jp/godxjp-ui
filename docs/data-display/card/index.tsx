import {
  Card,
  CardAction,
  CardBar,
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
  StatCard,
} from "@godxjp/ui/data-display";
import { Button, Text } from "@godxjp/ui/general";
import { AspectRatio, Flex, PageContainer, ResponsiveGrid } from "@godxjp/ui/layout";
import { MoreHorizontal } from "lucide-react";

import coverTerrain from "../../assets/cover-terrain.svg";

/* A committed SVG under docs/assets, imported so the bundler rewrites the URL against
 * PREVIEW_BASE. It replaces a picsum.photos fetch that hung `networkidle` and timed this page out
 * at 30s in CI (gh#333); it was briefly an inline data: URI, which fixed the hang but put 700
 * unreadable characters in the middle of the example a consumer is meant to copy. */

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
          <Text as="div" weight="medium">
            CardBar · scrollable controls + pinned action
          </Text>
          <Card>
            <CardBar
              extra={
                <Button size="sm" variant="outline">
                  保存
                </Button>
              }
            >
              <Button size="sm" variant="ghost">
                すべて
              </Button>
              <Button size="sm" variant="ghost">
                未払い
              </Button>
              <Button size="sm" variant="ghost">
                超過
              </Button>
            </CardBar>
            <CardContent>
              main が混み合うと main のみ横スクロールし、extra は末尾に固定されます。
            </CardContent>
          </Card>
        </Flex>

        <Flex direction="col" gap="sm">
          <Text as="div" weight="medium">
            StatCard · stacked / inline / inverse
          </Text>
          <ResponsiveGrid columns={{ sm: 1, md: 3 }}>
            <StatCard label="月間売上" value="¥12,840,000" delta="+12.4%" hint="前月比" />
            <StatCard label="未払い" value="28" delta="-3" accent="warning" />
            <StatCard
              label="平均処理時間"
              value="2.8日"
              delta="-0.4日"
              inverse
              layout="inline"
              align="end"
            />
          </ResponsiveGrid>
        </Flex>

        <Flex direction="col" gap="sm">
          <Text as="div" weight="medium">
            Variants
          </Text>
          <ResponsiveGrid columns={{ sm: 1, md: 2, lg: 4 }}>
            <Card variant="default">
              <CardHeader>
                <CardTitle level={2}>default</CardTitle>
              </CardHeader>
              <CardContent>標準のサーフェス</CardContent>
            </Card>
            <Card variant="muted">
              <CardHeader>
                <CardTitle level={2}>muted</CardTitle>
              </CardHeader>
              <CardContent>控えめな塗り</CardContent>
            </Card>
            <Card variant="outline">
              <CardHeader>
                <CardTitle level={2}>outline</CardTitle>
              </CardHeader>
              <CardContent>枠線のみ</CardContent>
            </Card>
            <Card variant="featured">
              <CardHeader>
                <CardTitle level={2}>featured</CardTitle>
              </CardHeader>
              <CardContent>強調サーフェス</CardContent>
            </Card>
          </ResponsiveGrid>
        </Flex>

        <Flex direction="col" gap="sm">
          <Text as="div" weight="medium">
            Accent · accentPlacement=&quot;edge&quot; (既定 · 先頭エッジのレール)
          </Text>
          <ResponsiveGrid columns={{ sm: 2, md: 3, lg: 6 }}>
            {accents.map((a) => (
              <Card key={a} accent={a}>
                <CardContent>{a}</CardContent>
              </Card>
            ))}
          </ResponsiveGrid>
        </Flex>

        {/* accentPlacement="perimeter" — the semantic attention border (gh#12) */}
        <Flex direction="col" gap="sm">
          <Text as="div" weight="medium">
            Accent · accentPlacement=&quot;perimeter&quot; (全周のアテンションボーダー)
          </Text>
          <Text size="xs" tone="muted">
            variant=&quot;featured&quot;
            は定義上ブランド色の全周ボーダー。トーンを自分で決めたいとき —
            「対応が必要」「失敗した」— は accent と accentPlacement の 2
            語で表す。本文の左インセットは レール版と同じ位置に戻るので、placement
            を切り替えても文字は動かない。
          </Text>
          <ResponsiveGrid columns={{ sm: 2, md: 3, lg: 6 }}>
            {accents.map((a) => (
              <Card key={a} accent={a} accentPlacement="perimeter">
                <CardContent>{a}</CardContent>
              </Card>
            ))}
          </ResponsiveGrid>
        </Flex>

        <Flex direction="col" gap="sm">
          <Text as="div" weight="medium">
            Composition · banded header + separated footer
          </Text>
          <Card accent="primary">
            <CardHeader banded>
              <CardTitle level={2}>請求書 INV-2024-0312</CardTitle>
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
          <Text as="div" weight="medium">
            Density · tight 12px · base 16px · cozy 20px
          </Text>
          <ResponsiveGrid columns={{ sm: 1, md: 3 }}>
            <Card density="tight">
              <CardHeader>
                <CardTitle level={2}>tight</CardTitle>
              </CardHeader>
              <CardContent>余白を詰めた密度</CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle level={2}>base</CardTitle>
              </CardHeader>
              <CardContent>既定の密度</CardContent>
            </Card>
            <Card density="cozy">
              <CardHeader>
                <CardTitle level={2}>cozy</CardTitle>
              </CardHeader>
              <CardContent>ゆったりした密度</CardContent>
            </Card>
          </ResponsiveGrid>
        </Flex>

        <Flex direction="col" gap="sm">
          <Text as="div" weight="medium">
            CardContent · flush (edge-to-edge table) · solo (no header)
          </Text>
          <ResponsiveGrid columns={{ sm: 1, lg: 2 }}>
            <Card>
              <CardHeader banded>
                <CardTitle level={2}>仕訳明細</CardTitle>
              </CardHeader>
              <CardContent flush>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>勘定科目</TableHead>
                      <TableHead className="text-end">借方</TableHead>
                      <TableHead className="text-end">貸方</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>売掛金</TableCell>
                      <TableCell className="text-end tabular-nums">¥482,000</TableCell>
                      <TableCell className="text-end">—</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>売上高</TableCell>
                      <TableCell className="text-end">—</TableCell>
                      <TableCell className="text-end tabular-nums">¥438,182</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>仮受消費税</TableCell>
                      <TableCell className="text-end">—</TableCell>
                      <TableCell className="text-end tabular-nums">¥43,818</TableCell>
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
          <Text as="div" weight="medium">
            CardCover · full-bleed media, header below
          </Text>
          <ResponsiveGrid columns={{ sm: 1, md: 2, lg: 3 }}>
            <Card>
              <CardCover>
                <AspectRatio ratio={16 / 9}>
                  <img
                    src={coverTerrain}
                    alt="オフィスビルの外観"
                    className="h-full w-full object-cover"
                  />
                </AspectRatio>
              </CardCover>
              <CardHeader>
                <CardTitle level={2}>渋谷オフィス</CardTitle>
                <CardDescription>東京都渋谷区 · 内見受付中</CardDescription>
              </CardHeader>
              <CardFooter separated>
                <Button variant="ghost">詳細を見る</Button>
              </CardFooter>
            </Card>
          </ResponsiveGrid>
        </Flex>
      </Flex>
    </PageContainer>
  );
}
