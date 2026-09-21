import { useState } from "react";

import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Marquee,
} from "@godxjp/ui/data-display";
import { Switch } from "@godxjp/ui/data-entry";
import { Heading, Link, Text } from "@godxjp/ui/general";
import { Flex, PageContainer, Separator } from "@godxjp/ui/layout";

/**
 * Marquee · a track of content that travels continuously, and the WCAG 2.2.2 pause control that
 * makes that legal.
 *
 * Every card on this page is an EDGE, because the tidy demo is the one that hides the defects this
 * component actually has:
 * · ONE item in a full-width track, which is the case that needs the most clones;
 * · FORTY items, which is the case that proves the pace is measured and not per-cycle;
 * · a 71-character unbreakable string, wider than a phone;
 * · a track NARROWER than one item, where there is nothing to clone into;
 * · CJK beside Latin beside Vietnamese, at three different optical widths;
 * · the paused state, which is where the content has to stay readable;
 * · a controlled "stop all motion" switch driving two tracks at once.
 *
 * Composed only from real @godxjp/ui components. All copy is consumer-owned and localized.
 */

const PARTNERS = [
  "フジワラ運輸",
  "Meridian Foods",
  "Công ty Đại Việt",
  "北陸電機",
  "Halden Systems",
  "三和商会",
  "Vinh Phat Logistics",
  "東海システム",
];

/** Forty items · the case a per-cycle duration would send across the screen forty times too fast. */
const FORTY = Array.from({ length: 40 }, (_, index) => `SKU-${String(index + 1).padStart(4, "0")}`);

/** 71 characters, no break opportunity anywhere in it. */
const UNBREAKABLE = "SUPPLYCHAINRECONCILIATIONBATCHIDENTIFIER2026Q3NOBREAKOPPORTUNITY0000001";

export default function MarqueeDoc() {
  const [motion, setMotion] = useState(true);

  return (
    <PageContainer title="Marquee" subtitle="連続して流れるトラックと、それを止める操作">
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle level={2}>ロゴウォール · 既定のかたち</CardTitle>
            <CardDescription>
              `fade` で両端をマスクし、`pauseOnHover` を足した 8 件。コピー数は測って決まる（内容幅
              ÷ 表示幅 + 1）ので、ウィンドウを横に伸ばせばクローンが増える。停止ボタンは常にあり、
              Tab で到達できる。各社名はリンクなので、トラック内にフォーカスが入ると自動で止まる
              （動いているリンクは押せないため）。クローン側のリンクは Tab の順路に出てこない。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Marquee fade pauseOnHover label="取引先ロゴ">
              {PARTNERS.map((name) => (
                <Link key={name} href={`#partner-${encodeURIComponent(name)}`}>
                  {name}
                </Link>
              ))}
            </Marquee>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>1 件 と 40 件 · 速度は件数で変わらない</CardTitle>
            <CardDescription>
              1 周の所要時間ではなく「1 画面ぶんを流れる時間」が `--marquee-interval` なので、1
              件でも 40 件でも見た目の速さは同じ。1 件のトラックはクローンが最も多く、 40
              件のトラックはクローンが 1 枚で足りる。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Heading level={3}>1 件</Heading>
              <Marquee label="在庫同期の状態">
                <Badge tone="info">在庫同期 · 実行中</Badge>
              </Marquee>
              <Separator />
              <Heading level={3}>40 件</Heading>
              <Marquee label="処理中の SKU">
                {FORTY.map((sku) => (
                  <Text key={sku} size="xs" tone="muted">
                    {sku}
                  </Text>
                ))}
              </Marquee>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>折り返せない 71 文字と、1 件より狭いトラック</CardTitle>
            <CardDescription>
              分割点のない 71 文字は電話の画面より広い。狭い枠に入れると「表示幅 ÷ 内容幅」は 1
              を下回るので、クローンは最小の 1 枚になり、それでも継ぎ目なく回る。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Heading level={3}>全幅</Heading>
              <Marquee label="照合バッチ識別子">
                <Text size="sm">{UNBREAKABLE}</Text>
              </Marquee>
              <Separator />
              <Heading level={3}>幅 14rem · 1 件より狭い枠</Heading>
              <div style={{ inlineSize: "14rem", maxInlineSize: "100%" }}>
                <Marquee label="照合バッチ識別子・狭い枠">
                  <Text size="sm">{UNBREAKABLE}</Text>
                </Marquee>
              </div>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>日本語 · Latin · Tiếng Việt が同じ行に並ぶ</CardTitle>
            <CardDescription>
              全角の仮名漢字、欧文、そしてダイアクリティカルの付いたベトナム語は 1 文字あたりの幅も
              行の高さも違う。同じトラックに置いたときの継ぎ目とベースラインはここで見る。
              `direction="end"` は読み方向の逆に流れる版で、`dir="rtl"` では両方が反転する。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Marquee gap={6} speed="slow" label="多言語の見出し">
                <Text size="sm">品質保証部 · 月次レビュー</Text>
                <Text size="sm">Quality Assurance · Monthly review</Text>
                <Text size="sm">Đảm bảo chất lượng · Đánh giá hàng tháng</Text>
              </Marquee>
              <Separator />
              <Marquee gap={6} speed="fast" direction="end" label="多言語の見出し・逆方向">
                <Text size="sm">品質保証部 · 月次レビュー</Text>
                <Text size="sm">Quality Assurance · Monthly review</Text>
                <Text size="sm">Đảm bảo chất lượng · Đánh giá hàng tháng</Text>
              </Marquee>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>止まった状態 · WebAIM の推奨する既定</CardTitle>
            <CardDescription>
              `defaultPlay={false}` で始めると、内容は止まったまま読める。停止中もリンクは Tab
              で辿れて、押せる。動いている最中にトラック内へフォーカスが入った場合も自動で止まる
              （動いているリンクは押せないため）。ボタンの名前は「次に起きること」を言う。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Marquee defaultPlay={false} fade label="社内のお知らせ">
              <Text size="sm">2026-10-01 · 社内システム定期メンテナンス</Text>
              <Link href="#maintenance">詳細</Link>
              <Text size="sm">2026-10-14 · 新しい経費申請フォームに切替</Text>
              <Link href="#expense">申請の手順</Link>
            </Marquee>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>`play` で外から止める</CardTitle>
            <CardDescription>
              制御された `play` / `onPlayChange` は、画面全体の「動きを止める」1
              つのスイッチから複数のトラックを同時に止めるためにある。各トラックの停止ボタンは
              そのまま残る（2.2.2 の要件は個々の操作で満たす）。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Flex align="center" gap="sm">
                <Switch
                  id="stop-all-motion"
                  checked={motion}
                  onCheckedChange={setMotion}
                  aria-label="このページの動きを有効にする"
                />
                <Text size="sm">
                  {motion ? "このページの動きは有効" : "このページの動きは停止中"}
                </Text>
              </Flex>
              <Marquee play={motion} onPlayChange={setMotion} label="取引先ロゴ・上段">
                {PARTNERS.slice(0, 4).map((name) => (
                  <Text key={name} size="sm" tone="muted">
                    {name}
                  </Text>
                ))}
              </Marquee>
              <Marquee
                play={motion}
                onPlayChange={setMotion}
                direction="end"
                label="取引先ロゴ・下段"
              >
                {PARTNERS.slice(4).map((name) => (
                  <Text key={name} size="sm" tone="muted">
                    {name}
                  </Text>
                ))}
              </Marquee>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>使う前に読むこと</CardTitle>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="sm">
              <Heading level={3}>止められる動きでも、止まっている方が良いことは多い</Heading>
              <Text tone="muted">
                自動で流れる内容は Nielsen Norman Group も WebAIM も勧めていない。NN/g
                は「ユーザーが操作していないのに画面が動くのは不快で、読み終える前に消える」と書き、
                WebAIM は「アニメーションは既定で止めておくことを勧める」と書いている。この
                コンポーネントはその判断を奪わない。止める操作は必ず付いてくるし、`defaultPlay=
                {"{false}"}` は 1 つのプロパティで済む。動かす理由が言えないなら、静止した `Flex
                wrap` や `ResponsiveGrid` のロゴウォールの方が良い。
              </Text>
              <Heading level={3}>OS のモーション低減設定では一切動かない</Heading>
              <Text tone="muted">
                `prefers-reduced-motion: reduce` のとき、クローンも停止ボタンも作らず、1
                件ぶんの内容を横スクロールできる領域として出す。横方向の平行移動は前庭系の
                トリガーそのもので、控えめにする版というものが無いため（WCAG 2.2 SC 2.2.2 / SC
                2.3.3）。
              </Text>
              <Heading level={3}>テーマ側のつまみ</Heading>
              <Text tone="muted">
                --marquee-interval · --marquee-interval-slow · --marquee-interval-fast ·
                --marquee-gap-inline · --marquee-mask-width。時間はモーション層
                （foundation.css）に、幾何はコンポーネント層（tokens/components/marquee.css）にある。
              </Text>
            </Flex>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
