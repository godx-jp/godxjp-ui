import { Activity, Heading, Text } from "@godxjp/ui/general";
import {
  Avatar,
  AvatarFallback,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@godxjp/ui/data-display";
import { Textarea } from "@godxjp/ui/data-entry";
import { Flex, PageContainer, Separator } from "@godxjp/ui/layout";

/**
 * Activity · the official AMBIENT-motion primitive: a continuous, unbounded "something is happening
 * right now, elsewhere". The LOOP counterpart to `Reveal`'s one-shot entrance (gh#313).
 *
 * Reads the DS motion tokens (`--activity-interval`, `--activity-stagger-step`,
 * `--activity-mark-offset`, `--activity-color`, `--ease-standard`) so a consumer never hand-rolls a
 * looping `@keyframes` + its own `prefers-reduced-motion` guard. Under reduced motion the loop is
 * dropped and each mark falls back to a DESIGNED resting state · three solid dots, a solid pulse
 * mark, a bar segment parked at the reading-start · never to nothing.
 *
 * Composed only from real @godxjp/ui components. All copy is consumer-owned and localized.
 */

const MESSAGES = [
  { id: "m1", who: "田中", initials: "田", body: "在庫の締めは今日の18時でお願いします。" },
  { id: "m2", who: "佐藤", initials: "佐", body: "了解しました。倉庫Bの棚卸しを先に片付けます。" },
  { id: "m3", who: "田中", initials: "田", body: "助かります。差異があれば共有してください。" },
];

const TONES = [
  { tone: "muted", label: "muted · 既定（環境音）" },
  { tone: "default", label: "default · 前景色" },
  { tone: "primary", label: "primary · 主要導線" },
  { tone: "success", label: "success · 接続中" },
  { tone: "warning", label: "warning · 再接続中" },
  { tone: "destructive", label: "destructive · 録画中" },
  { tone: "info", label: "info · 同期中" },
] as const;

const SIZES = [
  { size: "xs", label: "xs" },
  { size: "sm", label: "sm（既定）" },
  { size: "md", label: "md" },
  { size: "lg", label: "lg" },
] as const;

export default function Demo() {
  return (
    <PageContainer
      title="Activity"
      subtitle="環境モーション（無限ループ）· モーショントークン準拠 · prefers-reduced-motion で静止フレームに退避"
    >
      <Flex direction="col" gap="lg">
        {/* ── The real screen: a channel with a live typing affordance under the composer ── */}
        <Card>
          <CardHeader>
            <CardTitle level={2}>#倉庫-運用</CardTitle>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              {/* Ambient sync state at the top of the channel · the same primitive, `bar` mark. */}
              <Activity variant="bar" tone="info" label="同期中…" />

              {MESSAGES.map((message) => (
                <Flex key={message.id} direction="row" gap="sm" align="start">
                  <Avatar>
                    <AvatarFallback>{message.initials}</AvatarFallback>
                  </Avatar>
                  <Flex direction="col" gap="xs">
                    <Text weight="medium">{message.who}</Text>
                    <Text tone="muted">{message.body}</Text>
                  </Flex>
                </Flex>
              ))}

              <Separator />

              {/*
               * The typing affordance. `announce` is left at its default `false`: typing flickers
               * on and off with every socket event, and a live region there re-announces
               * continuously. The row sits ABOVE the composer and keeps its own height, so the
               * composer does not jump when the indicator appears or disappears.
               */}
              <Activity label="佐藤さんが入力しています…" />

              <Textarea aria-label="メッセージを入力" placeholder="メッセージを入力…" rows={2} />
            </Flex>
          </CardContent>
        </Card>

        {/* ── variant × every union value ── */}
        <Card>
          <CardHeader>
            <CardTitle level={2}>variant · 3 つのマーク</CardTitle>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Flex direction="col" gap="xs">
                <Text size="xs" tone="muted">
                  dots（既定）— 3 点が順に浮く。&ldquo;入力中&rdquo; の省略記号の慣習。
                </Text>
                <Activity variant="dots" label="佐藤さんが入力しています…" />
              </Flex>
              <Flex direction="col" gap="xs">
                <Text size="xs" tone="muted">
                  pulse · 単一の呼吸するマーク。ライブ / 録画中。
                </Text>
                <Activity variant="pulse" tone="destructive" label="録画中" />
              </Flex>
              <Flex direction="col" gap="xs">
                <Text size="xs" tone="muted">
                  bar · 不確定スイープ。同期中 / ストリーミング中。
                </Text>
                <Activity variant="bar" tone="info" label="仕訳を同期しています…" />
              </Flex>
            </Flex>
          </CardContent>
        </Card>

        {/* ── size × every union value ── */}
        <Card>
          <CardHeader>
            <CardTitle level={2}>size · マークとラベルが同時にスケール</CardTitle>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="sm">
              {SIZES.map((step) => (
                <Activity key={step.size} size={step.size} label={`入力中… (${step.label})`} />
              ))}
            </Flex>
          </CardContent>
        </Card>

        {/* ── tone × every union value ── */}
        <Card>
          <CardHeader>
            <CardTitle level={2}>tone · 意味づけされた配色（既定は muted）</CardTitle>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="sm">
              {TONES.map((entry) => (
                <Activity key={entry.tone} tone={entry.tone} label={entry.label} />
              ))}
            </Flex>
          </CardContent>
        </Card>

        {/* ── children / label / announce ── */}
        <Card>
          <CardHeader>
            <CardTitle level={2}>ラベルと読み上げ</CardTitle>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Flex direction="col" gap="xs">
                <Text size="xs" tone="muted">
                  label のみ —
                  マークの隣に可視テキストとして描画される。アニメーションだけで意味を運ばせない。
                </Text>
                <Activity label="佐藤さんが入力しています…" />
              </Flex>

              <Flex direction="col" gap="xs">
                <Text size="xs" tone="muted">
                  children + label · children が可視スロットを持ち、label は sr-only の説明になる。
                </Text>
                <Activity label="佐藤さんが入力しています…">
                  <Text size="xs" tone="muted">
                    <Text as="strong" size="xs" weight="medium">
                      佐藤
                    </Text>
                    ほか 2 名
                  </Text>
                </Activity>
              </Flex>

              <Flex direction="col" gap="xs">
                <Text size="xs" tone="muted">
                  announce=&quot;polite&quot; · ライブリージョンは label だけを包む。既定は
                  false（リージョンを一切出さない）。ソケットのたびに読み上げが走る面では使わないこと。
                </Text>
                <Activity announce="polite" tone="warning" label="接続を再試行しています…" />
              </Flex>

              <Flex direction="col" gap="xs">
                <Text size="xs" tone="muted">
                  label なし · 装飾のみ。支援技術には何も伝わらないので、意味を持つ場面では必ず
                  label を渡す。
                </Text>
                <Activity variant="pulse" />
              </Flex>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>prefers-reduced-motion</CardTitle>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="sm">
              <Heading level={3}>静止フレームは「設計されたもの」であって「無」ではない</Heading>
              <Text tone="muted">
                OS
                のモーション低減設定では、ループを止めるだけでマークは可視の休止状態に落ちる。dots
                は 3 点が実体のまま並ぶ静的な省略記号、pulse は塗りつぶしのマーク、bar
                は読み始め側に停めたセグメント（満杯にすると「完了」に読めてしまう）。ラベルはどちらの場合も可視テキストなので、意味は必ず伝わる。レイアウトシフトも起きない（WCAG
                2.2 SC 2.3.3 / SC 2.2.2）。
              </Text>
              <Text tone="muted">
                テーマ側のつまみ: --activity-interval · --activity-stagger-step ·
                --activity-mark-size · --activity-mark-offset · --activity-mark-rest-alpha ·
                --activity-pulse-mark-size · --activity-gap · --activity-font-size · --activity-bar
                · --activity-color（--duration-loop がループ全体の基準間隔）。
              </Text>
            </Flex>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
