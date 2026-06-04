/**
 * Showcase · table-compact-kintone — 高密度グリッド (V18)
 *
 * kintone 風の高密度グリッド: 28px 行 (compact density)・1px の薄い罫線・多列・
 * 数値列は tabular-nums。日次勤怠サマリを 1 画面で俯瞰する管理者向けレイアウト。
 *
 * 構成マップ (kintone のブロック → 実 @godxjp/ui プリミティブ):
 *   ページ枠 ........... PageContainer (density="compact", 小さい見出し)
 *   ツールバー ......... DataTable.Toolbar + DensityToggle + Button
 *   一括操作 ........... DataTable.BulkActions (選択 > 0 で表示)
 *   多列グリッド ....... DataTable.Content (compact = 28px 行・薄い罫線)
 *   状態セル ........... Badge tone (success 若竹 / warning 山吹 / destructive 茜 / info 群青)
 *   数値列 ............. tabular-nums (出勤/退勤/実働/残業/遅刻分)
 *   ページネーション ... DataTable.Pagination
 *
 * DNA: compact 28px 密度・固定カラーシグナリング・tabular 数値・小さい見出し・
 *      静かな日本語コピー・絵文字なし。すべて実プリミティブ。
 */
import * as React from "react";

import { Badge, DataTable, type ColumnDef } from "@godxjp/ui/data-display";
import { Button } from "@godxjp/ui/general";
import { Flex, PageContainer } from "@godxjp/ui/layout";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@godxjp/ui/navigation";
import type { SortStateProp, TableDensityProp } from "@godxjp/ui/props";
import { Check, MoreHorizontal, Pencil } from "lucide-react";

// ── 勤怠データ (日次・kintone のレコード相当) ────────────────────────────────────

type Attendance = {
  id: string; // 従業員番号
  name: string; // 氏名
  dept: string; // 部署
  shift: string; // シフト
  clockIn: string; // 出勤
  clockOut: string; // 退勤
  work: number; // 実働 (分)
  overtime: number; // 残業 (分)
  late: number; // 遅刻 (分)
  early: number; // 早退 (分)
  status: AttendanceStatus; // 勤怠区分
  approved: ApprovalState; // 承認
};

type AttendanceStatus = "present" | "late" | "early" | "leave" | "absent";
type ApprovalState = "approved" | "pending" | "rejected";

const STATUS_META: Record<
  AttendanceStatus,
  { label: string; tone: "success" | "warning" | "destructive" | "info" }
> = {
  present: { label: "出勤", tone: "success" }, // 若竹
  late: { label: "遅刻", tone: "warning" }, // 山吹
  early: { label: "早退", tone: "warning" }, // 山吹
  leave: { label: "有給", tone: "info" }, // 群青
  absent: { label: "欠勤", tone: "destructive" }, // 茜
};

const APPROVAL_META: Record<
  ApprovalState,
  { label: string; tone: "success" | "warning" | "destructive" }
> = {
  approved: { label: "承認済", tone: "success" },
  pending: { label: "未承認", tone: "warning" },
  rejected: { label: "差戻し", tone: "destructive" },
};

const ROWS: Attendance[] = [
  { id: "E-1024", name: "佐藤 健太", dept: "製造一課", shift: "日勤", clockIn: "08:58", clockOut: "18:12", work: 495, overtime: 72, late: 0, early: 0, status: "present", approved: "approved" },
  { id: "E-1031", name: "鈴木 美咲", dept: "製造一課", shift: "日勤", clockIn: "09:14", clockOut: "18:03", work: 469, overtime: 63, late: 14, early: 0, status: "late", approved: "pending" },
  { id: "E-1042", name: "高橋 大輔", dept: "製造二課", shift: "夜勤", clockIn: "21:02", clockOut: "06:01", work: 480, overtime: 60, late: 2, early: 0, status: "present", approved: "approved" },
  { id: "E-1055", name: "田中 彩花", dept: "品質保証", shift: "日勤", clockIn: "08:55", clockOut: "16:40", work: 405, overtime: 0, late: 0, early: 80, status: "early", approved: "pending" },
  { id: "E-1063", name: "伊藤 翔", dept: "物流", shift: "早番", clockIn: "06:00", clockOut: "15:02", work: 482, overtime: 62, late: 0, early: 0, status: "present", approved: "approved" },
  { id: "E-1078", name: "渡辺 真奈", dept: "品質保証", shift: "日勤", clockIn: "—", clockOut: "—", work: 0, overtime: 0, late: 0, early: 0, status: "leave", approved: "approved" },
  { id: "E-1089", name: "山本 拓也", dept: "製造二課", shift: "夜勤", clockIn: "—", clockOut: "—", work: 0, overtime: 0, late: 0, early: 0, status: "absent", approved: "rejected" },
  { id: "E-1094", name: "中村 由香", dept: "製造一課", shift: "日勤", clockIn: "09:32", clockOut: "18:20", work: 488, overtime: 80, late: 32, early: 0, status: "late", approved: "pending" },
  { id: "E-1102", name: "小林 直樹", dept: "物流", shift: "遅番", clockIn: "13:01", clockOut: "22:04", work: 483, overtime: 63, late: 1, early: 0, status: "present", approved: "approved" },
  { id: "E-1118", name: "加藤 千尋", dept: "品質保証", shift: "日勤", clockIn: "08:57", clockOut: "17:35", work: 458, overtime: 35, late: 0, early: 0, status: "present", approved: "approved" },
  { id: "E-1127", name: "吉田 颯太", dept: "製造二課", shift: "日勤", clockIn: "09:06", clockOut: "18:01", work: 475, overtime: 61, late: 6, early: 0, status: "late", approved: "pending" },
  { id: "E-1133", name: "山田 結衣", dept: "製造一課", shift: "早番", clockIn: "06:01", clockOut: "14:30", work: 449, overtime: 0, late: 1, early: 30, status: "early", approved: "pending" },
];

// 分 → H:MM 表記 (実働・残業列。tabular-nums で桁を揃える)
function toHm(mins: number): string {
  if (mins <= 0) return "0:00";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}:${String(m).padStart(2, "0")}`;
}

// 数値セルの共通レンダラ。0 は控えめに、値ありは右寄せ tabular-nums。
function num(value: string, muted = false) {
  return (
    <span className={muted ? "tabular-nums text-muted-foreground" : "tabular-nums"}>{value}</span>
  );
}

const columns: ColumnDef<Attendance>[] = [
  { key: "id", header: "社員番号", width: "w-24", render: (r) => <span className="font-mono text-xs tabular-nums">{r.id}</span> },
  { key: "name", header: "氏名", width: "w-28", sortable: true },
  { key: "dept", header: "部署", width: "w-24", hiddenOnMobile: true },
  { key: "shift", header: "シフト", width: "w-20", align: "center", hiddenOnMobile: true },
  { key: "clockIn", header: "出勤", width: "w-16", align: "right", render: (r) => num(r.clockIn, r.clockIn === "—") },
  { key: "clockOut", header: "退勤", width: "w-16", align: "right", render: (r) => num(r.clockOut, r.clockOut === "—") },
  { key: "work", header: "実働", width: "w-16", align: "right", sortable: true, render: (r) => num(toHm(r.work), r.work === 0) },
  { key: "overtime", header: "残業", width: "w-16", align: "right", sortable: true, render: (r) => num(toHm(r.overtime), r.overtime === 0) },
  { key: "late", header: "遅刻", width: "w-14", align: "right", hiddenOnMobile: true, render: (r) => num(r.late ? `${r.late}分` : "0", r.late === 0) },
  { key: "early", header: "早退", width: "w-14", align: "right", hiddenOnMobile: true, render: (r) => num(r.early ? `${r.early}分` : "0", r.early === 0) },
  {
    key: "status",
    header: "勤怠区分",
    width: "w-24",
    align: "center",
    render: (r) => {
      const m = STATUS_META[r.status];
      return (
        <Badge tone={m.tone} variant="outline">
          {m.label}
        </Badge>
      );
    },
  },
  {
    key: "approved",
    header: "承認",
    width: "w-24",
    align: "center",
    hiddenOnMobile: true,
    render: (r) => {
      const m = APPROVAL_META[r.approved];
      return (
        <Badge tone={m.tone} variant="outline">
          {m.label}
        </Badge>
      );
    },
  },
  {
    key: "_actions",
    header: "",
    width: "w-10",
    align: "right",
    render: (r) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label={`${r.name} の操作`}>
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <Pencil />
            打刻修正
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Check />
            承認
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

export default function Demo() {
  // 未承認の 2 行を初期選択 (一括操作バーを at rest で見せる)
  const [selected, setSelected] = React.useState<Set<string>>(new Set(["E-1031", "E-1094"]));
  // 残業の多い順に初期ソート
  const [sort, setSort] = React.useState<SortStateProp | undefined>({
    key: "overtime",
    direction: "desc",
  });
  // 高密度を明示 (controlled compact = 28px 行)
  const [density, setDensity] = React.useState<TableDensityProp>("compact");

  const rows = React.useMemo(() => {
    if (!sort) return ROWS;
    const dir = sort.direction === "asc" ? 1 : -1;
    return [...ROWS].sort((a, b) => {
      const av = a[sort.key as keyof Attendance];
      const bv = b[sort.key as keyof Attendance];
      return (av < bv ? -1 : av > bv ? 1 : 0) * dir;
    });
  }, [sort]);

  return (
    <PageContainer
      title="勤怠グリッド"
      subtitle="2026/06/04 (木) · 製造部 全課 · 高密度表示 (28px 行 · 13 列)"
      density="compact"
    >
      <Flex direction="col" gap="md">
        <DataTable
          data={rows}
          columns={columns}
          getRowId={(row) => row.id}
          selectable
          selected={selected}
          onSelectChange={setSelected}
          density={density}
          onDensityChange={setDensity}
          sort={sort}
          onSortChange={setSort}
        >
          <DataTable.Toolbar>
            <DataTable.BulkActions>
              <Button size="sm" variant="outline">
                CSV 出力
              </Button>
              <Button size="sm">一括承認</Button>
            </DataTable.BulkActions>
            <span className="text-muted-foreground text-xs tabular-nums">全 {ROWS.length} 名</span>
            <DataTable.DensityToggle />
          </DataTable.Toolbar>
          <DataTable.Content />
          <DataTable.Pagination cursor="E-1133" hasMore onChange={() => {}} />
        </DataTable>
      </Flex>
    </PageContainer>
  );
}
