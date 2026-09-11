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
            <CardTitle level={2}>shape=&quot;ring&quot;</CardTitle>
            <CardDescription>
              同じメーターを弧で描きます。バーと同じ value / tone / size / ARIA
              のまま、label がリングの内側に入ります。狭いアプリバーで「18 / 42
              件」を見出しの横に出したいとき、バー＋キャプションの 2
              段ではなく 1 マスで済むのが理由です。数値が重要なときではなく、
              場所が正方形のときに選びます。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="row" wrap align="center" gap="lg">
              {/* label はリング内の表示であり、同時に読み上げ名でもあります。「何の 18/42 か」を
                  名前にしたいときは、画面にすでにある見出しを aria-labelledby で指します
                  — bar と同じ規約です。 */}
              <Progress shape="ring" value={43} label="18/42" />
              <Progress shape="ring" value={43} size="sm" label="18/42" />
              <Progress shape="ring" value={0} label="0/42" />
              <Progress shape="ring" value={100} label="42/42" />
              <Progress shape="ring" value={62} tone="warning" label="26/42" />
              <Progress shape="ring" value={88} tone="destructive" label="37/42" />
              {/* label なし＝読み出しのないリング。名前は aria-label から。 */}
              <Progress shape="ring" value={43} aria-label="実施済みの点検" />
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Breakdown（segments）</CardTitle>
            <CardDescription>
              1 つの合計を状態ごとに分割します。割合ではなく実数を渡すと、各スライスの比率は
              コンポーネントが計算します。メーターより背の高いトラックになるのは、0.5rem の pill
              上に 3 色を並べると比率が読めなくなるためです。role=&quot;img&quot;
              として、全スライスを 1 つの名前で読み上げます。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Progress
                segments={[
                  { value: 2, tone: "destructive", label: "期限超過" },
                  { value: 3, tone: "warning", label: "期限間近" },
                  { value: 12, tone: "success", label: "対応済" },
                ]}
                label="株式会社山田製作所"
              />
              <Progress
                segments={[
                  { value: 0, tone: "destructive", label: "期限超過" },
                  { value: 1, tone: "warning", label: "期限間近" },
                  { value: 6, tone: "success", label: "対応済" },
                ]}
                label="みどり農産株式会社（0 件のスライスは幅 0）"
              />
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
