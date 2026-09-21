import { Badge, Card, CardContent, CardHeader, CardTitle, StatCard } from "@godxjp/ui/data-display";
import { Heading, Reveal, Text } from "@godxjp/ui/general";
import { Flex, PageContainer, ResponsiveGrid, Separator } from "@godxjp/ui/layout";

/**
 * Reveal — the official entrance-motion primitive (staggered fade-up). Reads the DS motion tokens
 * (`--duration-slow`, `--ease-emphasized`, `--reveal-distance`, `--reveal-stagger-step`) and honours
 * `prefers-reduced-motion`, replacing hand-rolled `@keyframes` + `.app-reveal`/`.d1..d6` classes.
 *
 * `on` moves the TRIGGER and nothing else (gh#829) — `mount` (default) or `view`. There is no
 * second `ScrollReveal` component: same keyframes, same tokens, same reduced-motion contract.
 *
 * This page is deliberately TALL. `on="view"` observes against the document viewport, so a demo
 * that fits on one screen would reveal everything at once and prove nothing — scroll it.
 *
 * Composed only from real @godxjp/ui components.
 */

const STATS = [
  { label: "本日の売上", value: "¥1,240,000" },
  { label: "新規顧客", value: "38" },
  { label: "未処理", value: "12" },
  { label: "承認待ち", value: "5" },
] as const;

const DELAY_LADDER = [0, 1, 2, 3, 4, 5, 6] as const;

const AMOUNTS = [
  {
    amount: "some",
    title: 'amount="some"（既定）',
    body: "1 ピクセルでも入った瞬間に入場する。IntersectionObserver の threshold: 0。最も早く、遅れて見える失敗をしない既定値。",
  },
  {
    amount: 0.5,
    title: "amount={0.5}",
    body: "0..1 の明示的な比率。半分見えてから入場する。読み始める前に動きが終わっていてほしい場面で使う。",
  },
  {
    amount: "all",
    title: 'amount="all"',
    body: "箱全体が見えてから。比率は要素自身の箱に対して測られるため、ビューポートより背の高い要素は 1 に到達できない。その場合は到達可能な最大値まで自動でクランプされ、決して隠れたままにならない。",
  },
] as const;

/** Long-form body copy. The scroll depth here is the demo, not filler around it. */
const SECTIONS = [
  {
    id: "s1",
    eyebrow: "01",
    title: "在庫の締め",
    body: "倉庫 B の棚卸しは 18 時に締め、差異は翌営業日の朝会までに共有する。締め処理の間は在庫の移動伝票を受け付けない。",
  },
  {
    id: "s2",
    eyebrow: "02",
    title: "出荷の波",
    body: "午前便と午後便で積載率が大きく変わる。午後便は返品の再出荷が混ざるため、検品の工数を 1.4 倍で見積もる。",
  },
  {
    id: "s3",
    eyebrow: "03",
    title: "差異の扱い",
    body: "実地と帳簿の差異は金額ではなく件数で追う。金額で追うと単価の高い一点が全体の傾向を隠してしまう。",
  },
  {
    id: "s4",
    eyebrow: "04",
    title: "承認の流れ",
    body: "1 万円を超える廃棄は倉庫長の承認が要る。承認待ちのまま翌月に跨いだ伝票は、月次の締めから自動で外れる。",
  },
] as const;

export default function Demo() {
  return (
    <PageContainer
      title="Reveal"
      subtitle="入場モーション · on=mount | view · モーショントークン準拠 · prefers-reduced-motion で静止"
    >
      <Flex direction="col" gap="lg">
        {/* ── on × both union values, side by side ── */}
        <Card>
          <CardHeader>
            <CardTitle level={2}>on · 引き金はこの 2 つだけ</CardTitle>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Flex direction="col" gap="xs">
                <Text size="xs" tone="muted">
                  on=&quot;mount&quot;（既定）· 描画された瞬間に入場する。従来の挙動そのままなので、
                  既存の呼び出し側は一切動かない。
                </Text>
                <Reveal on="mount">
                  <Card>
                    <CardContent>読み込み時にフェードアップします。</CardContent>
                  </Card>
                </Reveal>
              </Flex>

              <Flex direction="col" gap="xs">
                <Text size="xs" tone="muted">
                  on=&quot;view&quot; ·
                  ビューポートに入るまで入場を待つ。このカードは画面内にあるので、
                  読み込み直後に一度だけ入場する。下までスクロールすると本来の挙動が見られる。
                </Text>
                <Reveal on="view">
                  <Card>
                    <CardContent>ビューポートに入ってからフェードアップします。</CardContent>
                  </Card>
                </Reveal>
              </Flex>
            </Flex>
          </CardContent>
        </Card>

        {/* ── delay × the whole 0..6 ladder ── */}
        <Card>
          <CardHeader>
            <CardTitle level={2}>delay · 0..6 の段差（ms ではなく序数）</CardTitle>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="sm">
              <Text size="xs" tone="muted">
                各段が --reveal-stagger-step 一つ分の遅延を足す。引き金が view
                でも同じ梯子がそのまま効く。
              </Text>
              {DELAY_LADDER.map((step) => (
                <Reveal key={step} on="view" delay={step}>
                  <Card>
                    <CardContent>
                      <Flex direction="row" gap="sm" align="center">
                        <Badge>{`delay=${step}`}</Badge>
                        <Text tone="muted">
                          {step === 0 ? "遅延なし · 即時" : `--reveal-stagger-step × ${step}`}
                        </Text>
                      </Flex>
                    </CardContent>
                  </Card>
                </Reveal>
              ))}
            </Flex>
          </CardContent>
        </Card>

        {/* ── the canonical cascade: a stat row ── */}
        <Card>
          <CardHeader>
            <CardTitle level={2}>段送り · 行がカスケードする</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveGrid columns={{ sm: 2, lg: 4 }}>
              {STATS.map((stat, index) => (
                <Reveal key={stat.label} on="view" delay={(index + 1) as 1 | 2 | 3 | 4}>
                  <StatCard label={stat.label} value={stat.value} />
                </Reveal>
              ))}
            </ResponsiveGrid>
          </CardContent>
        </Card>

        {/* ── amount × every union shape ── */}
        <Card>
          <CardHeader>
            <CardTitle level={2}>amount · どれだけ見えたら入場するか</CardTitle>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Text size="xs" tone="muted">
                Motion の useInView から名前と型をそのまま借りている（some | all | 0..1
                の数値）。借りなかったのは margin（rootMargin は px/%
                しか受け付けず、デザイントークンを読めない）と
                initial（この実装の静止状態は常に「見えている」方なので意味を持たない）。
              </Text>
              {AMOUNTS.map((entry) => (
                <Flex key={entry.title} direction="col" gap="xs">
                  <Text size="xs" tone="muted">
                    {entry.title}
                  </Text>
                  <Reveal on="view" amount={entry.amount}>
                    <Card>
                      <CardContent>
                        <Text tone="muted">{entry.body}</Text>
                      </CardContent>
                    </Card>
                  </Reveal>
                </Flex>
              ))}
            </Flex>
          </CardContent>
        </Card>

        {/* ── once × both values ── */}
        <Card>
          <CardHeader>
            <CardTitle level={2}>once · 一度きりか、毎回か</CardTitle>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Flex direction="col" gap="xs">
                <Text size="xs" tone="muted">
                  once（既定 true）· 一度入場したら二度と隠れない。Reveal
                  はどちらの引き金でも「一度きりの入場」なので、mount と view
                  の意味を揃える既定値。Motion の useInView は false
                  が既定だが、あれは汎用の観測フックで、入場プリミティブではない。
                </Text>
                <Reveal on="view">
                  <Card>
                    <CardContent>上下にスクロールしても再入場しません。</CardContent>
                  </Card>
                </Reveal>
              </Flex>
              <Flex direction="col" gap="xs">
                <Text size="xs" tone="muted">
                  once=&#123;false&#125; · ビューポートを出るたびに隠れ、戻るたびに入場し直す。
                </Text>
                <Reveal on="view" once={false}>
                  <Card>
                    <CardContent>画面外に出して戻すと、もう一度フェードアップします。</CardContent>
                  </Card>
                </Reveal>
              </Flex>
            </Flex>
          </CardContent>
        </Card>

        {/* ── asChild, under the view trigger: the observed node is the child itself ── */}
        <Card>
          <CardHeader>
            <CardTitle level={2}>asChild · 観測されるのは子要素そのもの</CardTitle>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="xs">
              <Text size="xs" tone="muted">
                ラッパーの div を挟まず、子要素に直接マージする。grid / flex
                の直下で余計な箱が組版を壊す場面用。観測対象もその子要素の箱になる。
              </Text>
              <ResponsiveGrid columns={{ sm: 2 }}>
                <Reveal on="view" asChild delay={1}>
                  <StatCard label="粗利率" value="31.4%" />
                </Reveal>
                <Reveal on="view" asChild delay={2}>
                  <StatCard label="返品率" value="1.8%" />
                </Reveal>
              </ResponsiveGrid>
            </Flex>
          </CardContent>
        </Card>

        <Separator />

        {/* ── The real reason the page is long: scroll-triggered entrances in prose ── */}
        <Flex direction="col" gap="md">
          <Heading level={2}>スクロールして確かめる区間</Heading>
          <Text tone="muted">
            ここから下の各節は on=&quot;view&quot;
            で、画面に入ったときに初めて入場する。スクロールを止めずに一気に流すと、入場が「遅れて」見えないことも確認できる。
            既定の amount=&quot;some&quot; は threshold 0 で、最初の 1 ピクセルで発火する。
          </Text>

          {SECTIONS.map((section, index) => (
            <Reveal key={section.id} on="view" delay={((index % 3) + 1) as 1 | 2 | 3}>
              <Card>
                <CardHeader>
                  <CardTitle level={3}>
                    {section.eyebrow} · {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Text tone="muted">{section.body}</Text>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </Flex>

        {/* ── The contract that matters most ── */}
        <Card>
          <CardHeader>
            <CardTitle level={2}>prefers-reduced-motion と、観測できない環境</CardTitle>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="sm">
              <Heading level={3}>
                観測器が支配するのはアニメーションであって、可視性ではない
              </Heading>
              <Text tone="muted">
                スタイルシート側の静止状態は「完成後の、完全に見えている」状態で、opacity: 0
                が静止状態になることは一度もない。隠れた状態（data-reveal-state=&quot;out&quot;）を書くのは、
                ブラウザに IntersectionObserver があり、要素がまだ画面外だと実測できた
                マウント済みコンポーネントだけ。したがってサーバーレンダリング、jsdom、
                IntersectionObserver を持たないブラウザ、そして OS
                のモーション低減設定のいずれでも、内容は最初から見えている。
              </Text>
              <Text tone="muted">
                モーション低減時は観測器そのものを一切生成しない（animation を止めるだけではない）。
                「入場しないまま永久に隠れている」が、この種のコンポーネントで最も多く、最も重い壊れ方だから
                （WCAG 2.2 SC 2.3.3 / SC 2.2.2）。
              </Text>
              <Text tone="muted">
                テーマ側のつまみ: --duration-slow · --ease-emphasized · --reveal-distance ·
                --reveal-stagger-step。on=&quot;view&quot; で新しいトークンは一つも増えていない。
              </Text>
            </Flex>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
