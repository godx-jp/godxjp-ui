import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@godxjp/ui/data-display";
import { Button, Text } from "@godxjp/ui/general";
import { Flex, PageContainer, Separator } from "@godxjp/ui/layout";

/**
 * Separator · Radix UI Separator wrapper for tokenized dividers. Default is
 * horizontal (section breaks). Set orientation="vertical" only when the parent
 * gives it a stable height (e.g. a row Flex with align="stretch"). decorative
 * defaults to true · set false only when the divider carries semantic meaning for
 * a11y. Composed only from real @godxjp/ui components.
 */
export default function Demo() {
  return (
    <PageContainer
      title="Separator"
      subtitle="水平・垂直区切り線 · セクション分割・ツールバーグループ"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>水平区切り（既定）</CardTitle>
            <CardDescription>
              orientation を省略すると horizontal。セクション間やフォームグループの分割に使う。 raw
              border div は使わない。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Flex direction="col" gap="xs">
                <Text weight="medium">基本情報</Text>
                <Text tone="muted">取引先名・登録番号・請求先住所</Text>
              </Flex>
              <Separator />
              <Flex direction="col" gap="xs">
                <Text weight="medium">支払条件</Text>
                <Text tone="muted">支払サイト・通貨・消費税区分</Text>
              </Flex>
              <Separator />
              <Flex direction="col" gap="xs">
                <Text weight="medium">銀行口座</Text>
                <Text tone="muted">振込先金融機関・口座番号</Text>
              </Flex>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>垂直区切り · ツールバーグループ</CardTitle>
            <CardDescription>
              orientation=&quot;vertical&quot; は親が安定した高さを与えているときのみ使用。
              align=&quot;stretch&quot; の Flex 行で自然な高さを継承する。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="row" gap="sm" align="stretch">
              <Button variant="outline" size="sm">
                インポート
              </Button>
              <Button variant="outline" size="sm">
                エクスポート
              </Button>
              <Separator orientation="vertical" />
              <Button variant="outline" size="sm">
                一括承認
              </Button>
              <Button variant="outline" size="sm">
                一括却下
              </Button>
              <Separator orientation="vertical" />
              <Button size="sm">新規作成</Button>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>decorative=&#123;false&#125; · セマンティック区切り</CardTitle>
            <CardDescription>
              decorative=&#123;false&#125; にすると role=&quot;separator&quot; が付与され
              スクリーンリーダーが読み上げる。意味のある区切りにのみ使う。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Flex direction="row" gap="sm" align="center" justify="between">
                <Text weight="medium">承認済み請求書</Text>
                <Badge tone="success">12件</Badge>
              </Flex>
              <Separator decorative={false} />
              <Flex direction="row" gap="sm" align="center" justify="between">
                <Text weight="medium">保留中請求書</Text>
                <Badge tone="warning">4件</Badge>
              </Flex>
              <Separator decorative={false} />
              <Flex direction="row" gap="sm" align="center" justify="between">
                <Text weight="medium">却下済み請求書</Text>
                <Badge tone="destructive">2件</Badge>
              </Flex>
            </Flex>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
