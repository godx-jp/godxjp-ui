import { formatDate } from "@godxjp/ui/datetime";
import {
  Avatar,
  AvatarFallback,
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
 * a11y.
 *
 * gh#308 — `label` INTERRUPTS the rule: a message stream's day divider, a "new messages"
 * watermark, an auth conjunction. A labelled rule flips `decorative` to false, so it is a real
 * role="separator" NAMED by the label (the visible node is aria-hidden, so the string is announced
 * exactly once). `labelAlign` is a controlled vocabulary value — start | center | end, logical, so
 * it flips under dir="rtl" — and `tone` moves the rule AND the label together, never colour alone.
 *
 * Composed only from real @godxjp/ui components; every date below is formatted with the package's
 * Intl/CLDR date subsystem on the active locale, never hand-built.
 */

/** Fixed ISO-8601 instants so the page is deterministic across runs and locales. */
const YESTERDAY_ISO = "2026-08-21";
const TODAY_ISO = "2026-08-22";

const LABEL_ALIGNMENTS = ["start", "center", "end"] as const;
const TONES = ["default", "muted", "primary", "success", "warning", "destructive", "info"] as const;

/** Stream fixtures — plain data, split by the calendar boundary each divider marks. */
const BEFORE_YESTERDAY = [
  {
    initial: "佐",
    name: "佐藤 智",
    time: "09:12",
    body: "おはようございます。昨夜のデプロイは無事完了しました。",
  },
  {
    initial: "Ng",
    name: "Nguyễn Minh",
    time: "09:20",
    body: "Cảm ơn anh. Em sẽ theo dõi log trong buổi sáng.",
  },
];

const YESTERDAY = [
  {
    initial: "佐",
    name: "佐藤 智",
    time: "14:03",
    body: "請求バッチの再実行を 15:00 に予定しています。",
  },
];

const TODAY = [
  {
    initial: "Ng",
    name: "Nguyễn Minh",
    time: "08:41",
    body: "Batch đã chạy xong, không có bản ghi lỗi nào.",
  },
  {
    initial: "佐",
    name: "佐藤 智",
    time: "09:02",
    body: "ありがとうございます。今週分のレポートにまとめます。",
  },
];

export default function Demo() {
  return (
    <PageContainer
      title="Separator"
      subtitle="水平・垂直区切り線 · セクション分割・ツールバーグループ・ラベル付き区切り"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle level={2}>水平区切り（既定）</CardTitle>
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
            <CardTitle level={2}>垂直区切り · ツールバーグループ</CardTitle>
            <CardDescription>
              orientation=&quot;vertical&quot; は親が安定した高さを与えているときのみ使用。
              align=&quot;stretch&quot; の Flex 行で自然な高さを継承する。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="row" gap="sm" align="stretch" wrap>
              <Flex direction="row" gap="sm">
                <Button variant="outline" size="sm">
                  インポート
                </Button>
                <Button variant="outline" size="sm">
                  エクスポート
                </Button>
              </Flex>
              <Separator orientation="vertical" className="hidden sm:block" />
              <Flex direction="row" gap="sm">
                <Button variant="outline" size="sm">
                  一括承認
                </Button>
                <Button variant="outline" size="sm">
                  一括却下
                </Button>
              </Flex>
              <Separator orientation="vertical" className="hidden sm:block" />
              <Button size="sm">新規作成</Button>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>decorative=&#123;false&#125; · セマンティック区切り</CardTitle>
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

        {/* ── gh#308 — the real screen the labelled rule exists for ─────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle level={2}>実画面 · チャンネルの投稿ストリーム</CardTitle>
            <CardDescription>
              日付が変わる境目に label 付きの区切りを置き、未読の先頭に &quot;新しいメッセージ&quot;
              の透かしを置く（Slack / Mattermost の慣例）。日付は必ず Intl / CLDR
              の日付サブシステムで整形する。未読の透かしは tone=&quot;primary&quot;
              で線とラベルの両方が動くので、色だけの区別にならない。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              {BEFORE_YESTERDAY.map((post) => (
                <Flex key={post.time} direction="row" gap="sm" align="start">
                  <Avatar>
                    <AvatarFallback>{post.initial}</AvatarFallback>
                  </Avatar>
                  <Flex direction="col" gap="xs">
                    <Flex direction="row" gap="sm" align="baseline">
                      <Text weight="medium">{post.name}</Text>
                      <Text size="xs" tone="muted">
                        {post.time}
                      </Text>
                    </Flex>
                    <Text>{post.body}</Text>
                  </Flex>
                </Flex>
              ))}

              {/* Day divider — the label is the calendar boundary, formatted on the active locale. */}
              <Separator label={formatDate(YESTERDAY_ISO, { kind: "long" })} labelAlign="start" />

              {YESTERDAY.map((post) => (
                <Flex key={post.time} direction="row" gap="sm" align="start">
                  <Avatar>
                    <AvatarFallback>{post.initial}</AvatarFallback>
                  </Avatar>
                  <Flex direction="col" gap="xs">
                    <Flex direction="row" gap="sm" align="baseline">
                      <Text weight="medium">{post.name}</Text>
                      <Text size="xs" tone="muted">
                        {post.time}
                      </Text>
                    </Flex>
                    <Text>{post.body}</Text>
                  </Flex>
                </Flex>
              ))}

              {/* Unread watermark — content, not decoration, so it is announced. */}
              <Separator label="新しいメッセージ" tone="primary" />
              <Separator label={formatDate(TODAY_ISO, { kind: "long" })} labelAlign="start" />

              {TODAY.map((post) => (
                <Flex key={post.time} direction="row" gap="sm" align="start">
                  <Avatar>
                    <AvatarFallback>{post.initial}</AvatarFallback>
                  </Avatar>
                  <Flex direction="col" gap="xs">
                    <Flex direction="row" gap="sm" align="baseline">
                      <Text weight="medium">{post.name}</Text>
                      <Text size="xs" tone="muted">
                        {post.time}
                      </Text>
                    </Flex>
                    <Text>{post.body}</Text>
                  </Flex>
                </Flex>
              ))}
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>labelAlign · start | center | end</CardTitle>
            <CardDescription>
              boolean ではなく controlled vocabulary。短い側の線だけが --separator-label-inset
              で測られるグリッドトラックなので、dir=&quot;rtl&quot; では start と end
              が自動的に入れ替わる。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="lg">
              {LABEL_ALIGNMENTS.map((align) => (
                <Flex key={align} direction="col" gap="xs">
                  <Text size="xs" tone="muted">
                    labelAlign=&quot;{align}&quot;
                  </Text>
                  <Separator label="2026年8月22日" labelAlign={align} />
                </Flex>
              ))}
              <Flex direction="col" gap="xs">
                <Text size="xs" tone="muted">
                  dir=&quot;rtl&quot; · labelAlign=&quot;start&quot;（短い側が右に反転）
                </Text>
                <div dir="rtl">
                  <Separator label="رسائل جديدة" labelAlign="start" />
                </div>
              </Flex>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>tone · 線とラベルが一緒に動く</CardTitle>
            <CardDescription>
              tone は線の色だけでなくラベルの色も変える。色だけの区別にしないことで forced-colors
              や色覚特性のある読者にも意味が残る（WCAG 1.4.1）。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="lg">
              {TONES.map((tone) => (
                <Flex key={tone} direction="col" gap="xs">
                  <Text size="xs" tone="muted">
                    tone=&quot;{tone}&quot;
                  </Text>
                  <Separator label="新しいメッセージ" tone={tone} />
                </Flex>
              ))}
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>content stress · 長いラベル・空ラベル</CardTitle>
            <CardDescription>
              両側の線は minmax(0, 1fr)
              なので、翻訳が伸びても線が潰れるだけでコンテナからはみ出さない。 空文字や空白だけの
              label はラベル無しと同じ扱いになり、素の線に戻る。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="lg">
              <Separator label="ここから新しいメッセージが表示されています" />
              <Separator label="Đây là nơi bắt đầu những tin nhắn chưa đọc của bạn" />
              <Flex direction="col" gap="xs">
                <Text size="xs" tone="muted">
                  label=&quot; &quot;（空白のみ）→ 素の区切り線
                </Text>
                <Separator label=" " />
              </Flex>
            </Flex>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
