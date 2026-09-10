import { useTranslation } from "@godxjp/ui/i18n";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Timeline,
  RangeTimeline,
  type TimelineItem,
} from "@godxjp/ui/data-display";
import { Text } from "@godxjp/ui/general";
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

// Fourth shape: `title` is a NODE WITH A WIDTH OF ITS OWN, which is the only shape that can
// show whether the title actually spans the row. Every case above passes a bare string, and a
// string is already narrower than the row, so a title that shrink-wraps looks identical to one
// that fills — the defect hides in plain sight. A Card as the title makes the width visible; the
// truncating id is the other half, a title whose intrinsic width EXCEEDS the row, which must
// shrink rather than push `time` off the end. Measured by check:timeline-title-fill.
const richItems: TimelineItem[] = [
  {
    title: (
      <Card>
        <CardContent>
          <Text weight="medium">請求書 INV-2026-0912 を承認しました</Text>
        </CardContent>
      </Card>
    ),
    time: "11:05",
    status: "done",
  },
  {
    title: (
      <Text truncate mono>
        INV-2026-09-0001-APPROVAL-CHAIN-SEGMENT-0007-RECONCILIATION
      </Text>
    ),
    // A full CJK timestamp on purpose: it breaks between any two glyphs, so nothing floors its
    // width and a title with an `auto` flex-basis would squeeze it onto three lines.
    time: "2026年9月12日 11:18",
    status: "current",
  },
];

export default function Demo() {
  const { t, locale } = useTranslation();
  const dayLabel = (day: number) =>
    new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", timeZone: "UTC" }).format(
      Date.UTC(2026, 8, day),
    );
  return (
    <PageContainer title="Timeline" subtitle="現在のステップを強調する縦型のイベント一覧">
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle level={2}>承認フロー</CardTitle>
            <CardDescription>
              items 配列を渡し、進行中のステップに current: true
              を付与します。variant=&quot;icon&quot;
              が既定で、全ステップ共通のドットグリフを描きます。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Timeline variant="icon" items={items} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>出荷ステータス</CardTitle>
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
            <CardTitle level={2}>配送ルート進捗</CardTitle>
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
            <CardTitle level={2}>承認・消費税トラッカー</CardTitle>
            <CardDescription>
              variant="status" は status ごとにグリフを切り替えます（done → チェック、current →
              塗りつぶしドット、pending → 連番）。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Timeline variant="status" items={approvalItems} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle level={2}>タイトルにノードを渡す</CardTitle>
            <CardDescription>
              title は ReactNode です。自身の幅を持つノード（Card
              など）を渡しても行いっぱいに広がり、内容が行より広い場合は time
              を押し出さずに切り詰められます。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Timeline variant="status" items={richItems} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>RangeTimeline</CardTitle>
          </CardHeader>
          <CardContent>
            <RangeTimeline
              label={t("rangeTimeline.schedule")}
              bands={[
                {
                  label: new Intl.DateTimeFormat(locale, {
                    year: "numeric",
                    month: "long",
                    timeZone: "UTC",
                  }).format(Date.UTC(2026, 8, 1)),
                  units: 7,
                },
              ]}
              columns={Array.from({ length: 7 }, (_, index) => ({
                label: dayLabel(index + 1),
                units: 1,
              }))}
              rows={[
                {
                  id: "example",
                  label: "期日確認",
                  start: 1,
                  end: 4,
                  startLabel: dayLabel(2),
                  endLabel: dayLabel(5),
                },
              ]}
            />
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
