import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Progress,
} from "@godxjp/ui/data-display";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * Progress — horizontal 0–100 bar with an optional label and a semantic tone.
 * Composed only from real @godxjp/ui components.
 */
export default function Demo() {
  return (
    <PageContainer title="Progress" subtitle="0–100 bar · optional label + semantic tone">
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle level={2}>Tones</CardTitle>
            <CardDescription>
              Tone carries meaning。success（既定）/ warning / destructive。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Progress value={72} tone="success" label="処理スループット" />
              <Progress value={28} tone="warning" label="SLA 超過リスク" />
              <Progress value={84} tone="destructive" label="エラー率の上限接近" />
              <Progress value={60} label="（tone 指定なし → success）" />
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Over capacity</CardTitle>
            <CardDescription>
              over=true で 100% を超えた実値を aria-valuetext
              に残し、破壊的なストライプで区別します。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={132} over label="予約容量 132%" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Labelled / unlabelled</CardTitle>
            <CardDescription>
              label を渡すと bar 下にテキストを表示し aria-labelledby で関連付け。省略時は
              aria-label=&quot;Progress&quot;。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Progress value={45} label="アップロード進捗" />
              <Progress value={45} />
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Edge values &amp; clamping</CardTitle>
            <CardDescription>
              value は 0–100 にクランプ（Math.max(0, Math.min(100, value))）。範囲外でも安全に描画。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Progress value={0} label="0%（空）" />
              <Progress value={100} tone="success" label="100%（完了）" />
              <Progress value={130} tone="warning" label="130 → 100 にクランプ" />
              <Progress value={-5} label="-5 → 0 にクランプ" />
            </Flex>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
