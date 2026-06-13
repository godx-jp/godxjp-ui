import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Timeline,
  type TimelineItem,
} from "@godxjp/ui/data-display";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * Timeline — vertical event list with an icon rail; the current item gets a
 * highlighted glyph. Composed only from real @godxjp/ui components.
 */
const items: TimelineItem[] = [
  {
    title: "承認待ち",
    location: "経理 田中",
    time: "10:24",
    note: "金額が20万円を超えるため部長承認が必要",
    current: true,
  },
  { title: "仕訳を作成", location: "システム", time: "10:20" },
  { title: "請求書を発行", location: "営業 グエン", time: "09:50" },
  { title: "受注を登録", location: "営業 グエン", time: "09:30" },
];

// Second shape: a title-only minimal item, and the current step at the END
// (so the connector line is omitted on the highlighted item).
const compactItems: TimelineItem[] = [
  { title: "出荷完了", location: "東京倉庫", time: "14:02" },
  { title: "梱包" },
  { title: "ピッキング中", current: true },
];

// Pattern A — route stepper: numbered circles via variant="ordinal";
// status drives colour only, `location` reads "from → to".
const routeItems: TimelineItem[] = [
  { title: "集荷", location: "東京 → 名古屋", status: "pending" },
  { title: "幹線輸送", location: "名古屋 → 大阪", status: "pending" },
  { title: "ラストマイル", location: "大阪 → 配達先", status: "pending" },
];

// Pattern B — VAT / approval tracker: variant="status" picks the glyph by
// status (done → check, current → filled dot, pending → number).
const approvalItems: TimelineItem[] = [
  { title: "請求書を発行", location: "営業 グエン", time: "09:50", status: "done" },
  { title: "仕訳を作成", location: "システム", time: "10:20", status: "done" },
  { title: "承認待ち", location: "経理 田中", time: "10:24", status: "current" },
  { title: "消費税を計上", location: "経理", status: "pending" },
];

export default function Demo() {
  return (
    <PageContainer title="Timeline" subtitle="現在のステップを強調する縦型のイベント一覧">
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>承認フロー</CardTitle>
            <CardDescription>
              items 配列を渡し、進行中のステップに current: true を付与します。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Timeline items={items} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>出荷ステータス</CardTitle>
            <CardDescription>
              タイトルのみの最小項目と、最後尾の current（接続線が省略される）を示します。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Timeline items={compactItems} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>配送ルート進捗</CardTitle>
            <CardDescription>
              variant="ordinal" で各ステップを連番（1,2,3…）で表示し、status
              で色だけを切り替えます。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Timeline variant="ordinal" items={routeItems} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>承認・消費税トラッカー</CardTitle>
            <CardDescription>
              variant="status" は status ごとにグリフを切り替えます（done → チェック、current →
              塗りつぶしドット、pending → 連番）。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Timeline variant="status" items={approvalItems} />
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
