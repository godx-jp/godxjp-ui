import type { CSSProperties } from "react";

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
  const monthLabel = (month: number) =>
    new Intl.DateTimeFormat(locale, { year: "numeric", month: "long", timeZone: "UTC" }).format(
      Date.UTC(2026, month, 1),
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
              塗りつぶしドット、pending → 連番）。進捗レールの色は1つだけ：
              done・current・通過済みの線 はすべて --primary で塗られ、current
              はリング（--timeline-dot-current-ring-width）と グリフで区別します。Steps の finish /
              process と同じ約束です。
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
            <CardTitle level={2}>進捗レールの色をテーマで戻す</CardTitle>
            <CardDescription>
              done の緑と current の紫という 27.8 までの配色に戻したい場合は、塗りとインクを
              対にしてテーマで指定します。塗りだけを戻すと、若竹の緑にほぼ白のグリフが乗って 2.18:1
              になり AA を満たしません（gh#643）。同じ要領で --timeline-dot-current-background と
              --timeline-line-completed-background も再着色できます。
            </CardDescription>
          </CardHeader>
          {/* The knobs are declared on the CARD BODY, not on the Timeline: custom properties
              inherit, so one scope retints every Timeline inside it — which is how a service
              theme sets them (once, globally, or under `[data-tenant]`), not per call site. */}
          <CardContent
            style={
              {
                "--timeline-dot-done-background": "hsl(var(--success))",
                "--timeline-dot-done-foreground": "hsl(var(--success-foreground))",
              } as CSSProperties
            }
          >
            <Timeline variant="status" items={approvalItems} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>RangeTimeline</CardTitle>
            <CardDescription>
              日単位の軸。行ごとの区切り線と、列ごとの縦線が本体全体に引かれます（bordered は既定で
              true）。土日は columns[].muted
              で本体の高さいっぱいに塗り分け、表示範囲の外にある期間は、その方向の端に矢印付きで示します。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RangeTimeline
              label={t("rangeTimeline.schedule")}
              today={8}
              bands={[{ label: monthLabel(8), units: 14 }]}
              columns={Array.from({ length: 14 }, (_, index) => {
                const weekday = new Date(Date.UTC(2026, 8, index + 1)).getUTCDay();
                return {
                  label: new Intl.NumberFormat(locale).format(index + 1),
                  units: 1,
                  muted: weekday === 0 || weekday === 6,
                };
              })}
              rows={[
                { id: "design", label: "要件定義", start: 0, end: 3 },
                { id: "build", label: "実装", start: 3, end: 10 },
                { id: "review", label: "レビュー", start: 9, end: 12 },
                { id: "kickoff", label: "キックオフ（前月）", start: -12, end: -9 },
                { id: "release", label: "リリース（来月）", start: 20, end: 22 },
              ].map((row) => ({
                ...row,
                startLabel: dayLabel(row.start + 1),
                endLabel: dayLabel(row.end + 1),
              }))}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>月をまたぐ日単位の軸（bands）</CardTitle>
            <CardDescription>
              9月25日から10月7日まで。bands
              の月の境界は、その月の1日の列の境界にぴったり重なります。
              始まりが月の途中なので、最初の月の帯は6日分だけの幅です。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RangeTimeline
              label={t("rangeTimeline.schedule")}
              bands={[
                { label: monthLabel(8), units: 6 },
                { label: monthLabel(9), units: 7 },
              ]}
              columns={Array.from({ length: 13 }, (_, index) => {
                const date = new Date(Date.UTC(2026, 8, 25 + index));
                return {
                  label: new Intl.NumberFormat(locale).format(date.getUTCDate()),
                  units: 1,
                  muted: date.getUTCDay() === 0 || date.getUTCDay() === 6,
                };
              })}
              rows={[
                { id: "migration", label: "移行", start: 3, end: 8 },
                { id: "october", label: "10月の作業", start: 6, end: 12 },
              ].map((row) => ({
                ...row,
                startLabel: dayLabel(25 + row.start),
                endLabel: dayLabel(25 + row.end),
              }))}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>月単位の軸（列ごとに units が異なる）</CardTitle>
            <CardDescription>
              units
              は日数です。9月30・10月31・11月30と幅が異なっても、本体の縦線はヘッダーの列の境界に揃います。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RangeTimeline
              label={t("rangeTimeline.schedule")}
              columns={[
                { label: monthLabel(8), units: 30 },
                { label: monthLabel(9), units: 31 },
                { label: monthLabel(10), units: 30 },
              ]}
              rows={[
                { id: "phase-1", label: "第1期", start: 0, end: 44 },
                { id: "phase-2", label: "第2期", start: 45, end: 90 },
              ].map((row) => ({
                ...row,
                startLabel: dayLabel(row.start + 1),
                endLabel: dayLabel(row.end + 1),
              }))}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>罫線なし（bordered=false）</CardTitle>
            <CardDescription>
              ヘッダーの列線だけを残し、本体の罫線を外します。muted の列の塗りは残ります。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RangeTimeline
              label={t("rangeTimeline.schedule")}
              bordered={false}
              columns={Array.from({ length: 7 }, (_, index) => ({
                label: dayLabel(index + 1),
                units: 1,
                muted: index === 5,
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

        <Card>
          <CardHeader>
            <CardTitle level={2}>親子のある作業（depth と折りたたみ）</CardTitle>
            <CardDescription>
              行を深さ優先の順に並べ、depth
              を渡すと、ラベルの列の中で段ごとに字下げされます。次の行が
              より深い行は親になり、開閉ボタンが付きます。「実装」は defaultExpandedValues
              に含まれていないため折りたたまれており、子の行もそのバーも表示されません。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RangeTimeline
              label={t("rangeTimeline.schedule")}
              today={4}
              columns={Array.from({ length: 14 }, (_, index) => {
                const weekday = new Date(Date.UTC(2026, 8, index + 1)).getUTCDay();
                return {
                  label: new Intl.NumberFormat(locale).format(index + 1),
                  units: 1,
                  muted: weekday === 0 || weekday === 6,
                };
              })}
              defaultExpandedValues={["design", "api"]}
              rows={[
                { id: "design", label: "設計", depth: 0, start: 0, end: 5 },
                { id: "screens", label: "画面設計", depth: 1, start: 0, end: 2 },
                { id: "api", label: "API設計", depth: 1, start: 2, end: 5 },
                { id: "endpoints", label: "エンドポイント定義", depth: 2, start: 2, end: 3 },
                { id: "build", label: "実装", depth: 0, start: 6, end: 12 },
                { id: "frontend", label: "フロントエンド", depth: 1, start: 6, end: 10 },
                { id: "backend", label: "バックエンド", depth: 1, start: 6, end: 12 },
                { id: "release", label: "リリース", depth: 0, start: 13, end: 13 },
              ].map((row) => ({
                ...row,
                startLabel: dayLabel(row.start + 1),
                endLabel: dayLabel(row.end + 1),
              }))}
            />
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
