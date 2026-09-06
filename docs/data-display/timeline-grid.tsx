import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  TimelineGrid,
  type TimelineGridColumnProp,
  type TimelineGridEventProp,
} from "@godxjp/ui/data-display";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * TimelineGrid — a vertical hour axis, one column per day, and event blocks placed by start time
 * and duration. It is the time-axis half of the Timeline family; Timeline itself is one lane of
 * ordered events with no scale.
 */
const WEEK: TimelineGridColumnProp[] = [
  { id: "05-11", label: "月 11" },
  { id: "05-12", label: "火 12" },
  { id: "05-13", label: "水 13" },
  { id: "05-14", label: "木 14", description: "本日", current: true },
  { id: "05-15", label: "金 15" },
];

const SHIFTS: TimelineGridEventProp[] = [
  { id: "s1", columnId: "05-11", start: "09:00", end: "22:00", title: "通し", description: "佐藤" },
  { id: "s2", columnId: "05-12", start: "06:00", end: "22:00", title: "有給", description: "鈴木" },
  { id: "s3", columnId: "05-14", start: "09:00", end: "17:30", title: "早番", description: "田中" },
  { id: "s4", columnId: "05-14", start: "13:00", end: "22:00", title: "遅番", description: "高橋" },
  // end at or before start = the shift runs into the next day (夜勤 22:00–06:00).
  { id: "s5", columnId: "05-14", start: "22:00", end: "06:00", title: "夜勤", description: "伊藤" },
  { id: "s6", columnId: "05-15", start: "09:00", end: "17:30", title: "早番", description: "佐藤" },
  { id: "s7", columnId: "05-15", start: "18:00", end: "21:00", title: "残業", description: "鈴木" },
];

// One column, a finer axis, and a colour carried by the record itself — the day view of the same
// data. `color` is decorative: the block still prints its hours and its title as text.
const ROOMS: TimelineGridColumnProp[] = [
  { id: "a", label: "会議室 A", description: "12名" },
  { id: "b", label: "会議室 B", description: "6名" },
];

const BOOKINGS: TimelineGridEventProp[] = [
  {
    id: "b1",
    columnId: "a",
    start: "09:30",
    end: "10:30",
    title: "定例会",
    description: "営業部",
    color: "var(--wa-gunjo)",
  },
  {
    id: "b2",
    columnId: "a",
    start: "10:00",
    end: "11:00",
    title: "面談",
    description: "人事",
    color: "var(--wa-akane)",
  },
  {
    id: "b3",
    columnId: "b",
    start: "13:00",
    end: "14:30",
    title: "設計レビュー",
    description: "開発部",
    color: "var(--wa-wakatake)",
  },
];

export default function Demo() {
  return (
    <PageContainer title="TimelineGrid" subtitle="時間軸に沿って予定ブロックを置く週／日グリッド">
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle level={2}>週シフト</CardTitle>
            <CardDescription>
              start / end で軸を 06:00–24:00 に固定し、interval=2
              で2時間ごとに目盛りを引きます。木曜の早番と遅番は時間が重なるため、自動で横に並びます。
            </CardDescription>
          </CardHeader>
          <CardContent flush>
            <TimelineGrid
              label="週シフト 2026年5月11日〜15日"
              columns={WEEK}
              events={SHIFTS}
              start="06:00"
              end="24:00"
              interval={2}
              now="14:35"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>会議室の予約</CardTitle>
            <CardDescription>
              start / end を省略すると、軸は予定の範囲から自動で決まります。onEventSelect
              を渡すと各ブロックが button になり、キーボードでも選べます。
            </CardDescription>
          </CardHeader>
          <CardContent flush>
            <TimelineGrid
              label="会議室の予約 5月14日"
              columns={ROOMS}
              events={BOOKINGS}
              onEventSelect={() => {}}
            />
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
