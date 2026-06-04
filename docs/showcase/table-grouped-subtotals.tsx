/**
 * Showcase · table-grouped-subtotals — グループ集計 (V11)
 *
 * 勤怠の部署別グループ集計。グループヘッダー行（部署名 + 人数 + 右寄せ数値小計）と
 * 折りたたみ可能なグループ、最下部に総計行を備えた DataTable パターン。
 *
 * GAP: DataTable には「グループ行 / 折りたたみグループ / グループ小計 / 総計フッター」が
 * ないため、real な Table ファミリ（Table/TableHeader/TableBody/TableRow/TableHead/
 * TableCell）+ Button(折りたたみトグル) + Badge(人数/状態) + Card で COMPOSE している。
 * 生の <table> や手書きコントロールは一切使わず、全て @godxjp/ui プリミティブのみ。
 *
 * DNA: compact 密度・小見出し・tabular-nums の数値列・固定カラーシグナル
 * (success 若竹 / warning 山吹 / attention 朱 = 遅刻 / info 群青)・静かな JP コピー・絵文字なし。
 */
import * as React from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

import { Button } from "@godxjp/ui/general";
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@godxjp/ui/data-display";
import { Flex, PageContainer } from "@godxjp/ui/layout";

// ── 型 ────────────────────────────────────────────────────────────────────────

type AttendanceStatus = "present" | "late" | "leave-early";

type Employee = {
  id: string;
  name: string;
  /** 勤務日数 */
  days: number;
  /** 総労働時間（時間） */
  work: number;
  /** 残業時間（時間） */
  overtime: number;
  /** 遅刻回数 */
  late: number;
  status: AttendanceStatus;
};

type Group = {
  id: string;
  /** 部署名 */
  label: string;
  members: Employee[];
};

// ── ダミーデータ（2026年5月度・部署別）─────────────────────────────────────────

const GROUPS: Group[] = [
  {
    id: "sales",
    label: "営業部",
    members: [
      { id: "E-1042", name: "佐藤 健一", days: 21, work: 176.5, overtime: 12.0, late: 0, status: "present" },
      { id: "E-1051", name: "鈴木 美咲", days: 20, work: 168.0, overtime: 4.5, late: 2, status: "late" },
      { id: "E-1063", name: "高橋 涼", days: 21, work: 171.0, overtime: 8.0, late: 0, status: "present" },
      { id: "E-1077", name: "田中 由美", days: 19, work: 152.5, overtime: 0.0, late: 0, status: "leave-early" },
    ],
  },
  {
    id: "dev",
    label: "開発部",
    members: [
      { id: "E-2008", name: "伊藤 大輔", days: 21, work: 180.0, overtime: 22.5, late: 0, status: "present" },
      { id: "E-2015", name: "渡辺 翔太", days: 21, work: 178.5, overtime: 18.0, late: 1, status: "late" },
      { id: "E-2031", name: "山本 彩", days: 20, work: 165.0, overtime: 9.5, late: 0, status: "present" },
    ],
  },
  {
    id: "support",
    label: "カスタマーサポート部",
    members: [
      { id: "E-3004", name: "中村 拓也", days: 22, work: 176.0, overtime: 6.0, late: 0, status: "present" },
      { id: "E-3019", name: "小林 結衣", days: 20, work: 160.0, overtime: 2.0, late: 3, status: "late" },
    ],
  },
];

// ── フォーマッタ ────────────────────────────────────────────────────────────────

const hours = new Intl.NumberFormat("ja-JP", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const fmtH = (n: number) => `${hours.format(n)}h`;

const STATUS_LABEL: Record<AttendanceStatus, string> = {
  present: "出勤",
  late: "遅刻あり",
  "leave-early": "早退あり",
};

// 固定カラーシグナル: 出勤=success若竹 / 遅刻=attention(=warning 山吹) / 早退=info群青
const STATUS_TONE: Record<AttendanceStatus, "success" | "warning" | "info"> = {
  present: "success",
  late: "warning",
  "leave-early": "info",
};

type Subtotal = { days: number; work: number; overtime: number; late: number };

function subtotal(members: Employee[]): Subtotal {
  return members.reduce<Subtotal>(
    (acc, m) => ({
      days: acc.days + m.days,
      work: acc.work + m.work,
      overtime: acc.overtime + m.overtime,
      late: acc.late + m.late,
    }),
    { days: 0, work: 0, overtime: 0, late: 0 },
  );
}

function grandTotal(groups: Group[]): Subtotal {
  return groups.reduce<Subtotal>(
    (acc, g) => {
      const s = subtotal(g.members);
      return {
        days: acc.days + s.days,
        work: acc.work + s.work,
        overtime: acc.overtime + s.overtime,
        late: acc.late + s.late,
      };
    },
    { days: 0, work: 0, overtime: 0, late: 0 },
  );
}

// ── グループヘッダー行（部署名 + 人数バッジ + 右寄せ数値小計 + 折りたたみ）──────────

function GroupHeaderRow({
  group,
  open,
  onToggle,
}: {
  group: Group;
  open: boolean;
  onToggle: () => void;
}) {
  const s = subtotal(group.members);
  const Chevron = open ? ChevronDown : ChevronRight;
  return (
    <TableRow className="bg-secondary hover:bg-secondary border-b">
      <TableCell className="py-2 pr-0 pl-2" colSpan={2}>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={`grp-${group.id}`}
          className="h-7 gap-2 font-medium"
        >
          <Chevron className="size-4 text-muted-foreground" aria-hidden="true" />
          {group.label}
          <Badge variant="outline" tone="neutral" className="ml-1">
            {group.members.length}名
          </Badge>
        </Button>
      </TableCell>
      <TableCell className="py-2 text-right font-medium tabular-nums">{s.days}日</TableCell>
      <TableCell className="py-2 text-right font-medium tabular-nums">{fmtH(s.work)}</TableCell>
      <TableCell className="py-2 text-right font-medium tabular-nums">{fmtH(s.overtime)}</TableCell>
      <TableCell className="py-2 text-right tabular-nums">
        {s.late > 0 ? (
          <Badge variant="outline" tone="warning">
            {s.late}回
          </Badge>
        ) : (
          <span className="text-muted-foreground font-medium">0回</span>
        )}
      </TableCell>
      <TableCell className="py-2" />
    </TableRow>
  );
}

// ── 明細行 ──────────────────────────────────────────────────────────────────────

function MemberRow({ m }: { m: Employee }) {
  return (
    <TableRow>
      <TableCell className="pl-10 font-mono text-xs text-muted-foreground">{m.id}</TableCell>
      <TableCell>{m.name}</TableCell>
      <TableCell className="text-right tabular-nums">{m.days}日</TableCell>
      <TableCell className="text-right tabular-nums">{fmtH(m.work)}</TableCell>
      <TableCell className="text-right tabular-nums">{fmtH(m.overtime)}</TableCell>
      <TableCell className="text-right tabular-nums">
        {m.late > 0 ? m.late : <span className="text-muted-foreground">—</span>}
        {m.late > 0 ? "回" : ""}
      </TableCell>
      <TableCell className="text-center">
        <Badge variant="outline" tone={STATUS_TONE[m.status]}>
          {STATUS_LABEL[m.status]}
        </Badge>
      </TableCell>
    </TableRow>
  );
}

// ── 集計テーブル ────────────────────────────────────────────────────────────────

function GroupedTable({
  groups,
  defaultClosed = [],
}: {
  groups: Group[];
  /** 初期状態で折りたたむグループ ID（静的に閉じた状態を見せる）*/
  defaultClosed?: string[];
}) {
  const [closed, setClosed] = React.useState<Set<string>>(new Set(defaultClosed));
  const toggle = (id: string) => {
    setClosed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const total = grandTotal(groups);

  return (
    <div className="ui-data-table-root">
      <Table>
        <TableHeader className="bg-background sticky top-0 z-10">
          <TableRow>
            <TableHead className="w-40">従業員番号</TableHead>
            <TableHead>氏名 / 部署</TableHead>
            <TableHead className="w-20 text-right">勤務日数</TableHead>
            <TableHead className="w-24 text-right">総労働</TableHead>
            <TableHead className="w-24 text-right">残業</TableHead>
            <TableHead className="w-20 text-right">遅刻</TableHead>
            <TableHead className="w-28 text-center">状態</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groups.map((g) => {
            const open = !closed.has(g.id);
            return (
              <React.Fragment key={g.id}>
                <GroupHeaderRow group={g} open={open} onToggle={() => toggle(g.id)} />
                {open &&
                  g.members.map((m) => <MemberRow key={m.id} m={m} />)}
              </React.Fragment>
            );
          })}
          {/* 総計フッター行 */}
          <TableRow className="bg-muted/40 hover:bg-muted/40 border-t-2">
            <TableCell className="py-2 font-medium" colSpan={2}>
              総計 · 全{groups.reduce((n, g) => n + g.members.length, 0)}名
            </TableCell>
            <TableCell className="py-2 text-right font-bold tabular-nums">{total.days}日</TableCell>
            <TableCell className="py-2 text-right font-bold tabular-nums">{fmtH(total.work)}</TableCell>
            <TableCell className="py-2 text-right font-bold tabular-nums">{fmtH(total.overtime)}</TableCell>
            <TableCell className="py-2 text-right font-bold tabular-nums">{total.late}回</TableCell>
            <TableCell className="py-2" />
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}

export default function Demo() {
  return (
    <PageContainer
      title="グループ集計"
      subtitle="部署別の勤怠サマリ — グループヘッダー（部署名 + 人数 + 右寄せ小計）+ 折りたたみ + 総計"
      density="compact"
    >
      <Flex direction="col" gap="lg">
        {/* 全展開（既定）— 各グループの小計と明細が同時に見える */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>2026年5月度 勤怠集計</CardTitle>
            <span className="text-xs text-muted-foreground tabular-nums">締め: 2026-05-31</span>
          </CardHeader>
          <CardContent flush>
            <GroupedTable groups={GROUPS} />
          </CardContent>
        </Card>

        {/* 折りたたみ済みの状態を静的に提示 — 「カスタマーサポート部」は閉じて小計のみ表示 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>折りたたみ状態</CardTitle>
            <span className="text-xs text-muted-foreground">
              閉じたグループは小計のみ表示（クリックで展開）
            </span>
          </CardHeader>
          <CardContent flush>
            <GroupedTable groups={GROUPS} defaultClosed={["support"]} />
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
