/**
 * Showcase · table-tree-rows — ツリー行 (V12)
 *
 * Tree / hierarchical rows inside the real @godxjp/ui DataTable.
 *
 * The lib's `TreeList` is a flat presentational list (fixed icons, no twirl, no
 * tabular columns) — it cannot express a *tabular* hierarchy with per-row metrics,
 * a parent-only disclosure twirl, and DataTable chrome (sticky header, density,
 * sortable columns). So this composes the behaviour from real primitives:
 *
 *   row model ........ flatten an org tree to rows carrying { depth, hasChildren,
 *                      expanded }, then derive `visibleRows` from the open set.
 *   tree column ...... ColumnDef.render draws a 14px-per-level indent (CSS var,
 *                      not a fixed layout dimension) + a twirl chevron Button
 *                      (ghost icon-sm) that rotates 90° when expanded — rendered
 *                      ONLY on parent rows; leaves get an aligning spacer.
 *   metrics .......... 出勤率 / 遅刻 / 残業 as tabular-nums columns; 承認状態 as Badge(tone).
 *   chrome ........... DataTable.Toolbar + DensityToggle + sticky header (built in).
 *
 * DNA: compact density, small headings, tabular-nums on numbers, fixed color
 * signaling (success 若竹 / warning 山吹 / attention 朱 via tone), quiet JP copy,
 * no emoji. 部署 → チーム → 従業員 の勤怠ロールアップ。
 */
import * as React from "react";
import { ChevronRight } from "lucide-react";

import { Badge, DataTable, type ColumnDef } from "@godxjp/ui/data-display";
import { Button } from "@godxjp/ui/general";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@godxjp/ui/data-display";
import { Flex, PageContainer } from "@godxjp/ui/layout";

// ── Org tree (部署 → チーム → 従業員) ───────────────────────────────────────────

type ApprovalKey = "approved" | "pending" | "late";

type Node = {
  id: string;
  /** 部署 / チーム / 従業員 名 */
  name: string;
  /** 区分ラベル（部署・チーム・従業員） */
  kind: "部署" | "チーム" | "従業員";
  /** 出勤率 (%) — ロールアップ済み */
  attendance: number;
  /** 当月の遅刻回数 */
  late: number;
  /** 当月の残業時間 (h) */
  overtime: number;
  /** 申請の承認状態 */
  approval: ApprovalKey;
  children?: Node[];
};

const TREE: Node[] = [
  {
    id: "dpt-sales",
    name: "営業部",
    kind: "部署",
    attendance: 97.2,
    late: 5,
    overtime: 142.5,
    approval: "pending",
    children: [
      {
        id: "tm-sales-1",
        name: "第一営業チーム",
        kind: "チーム",
        attendance: 98.1,
        late: 2,
        overtime: 78.0,
        approval: "approved",
        children: [
          {
            id: "emp-1001",
            name: "佐藤 健太",
            kind: "従業員",
            attendance: 100.0,
            late: 0,
            overtime: 22.5,
            approval: "approved",
          },
          {
            id: "emp-1002",
            name: "鈴木 美咲",
            kind: "従業員",
            attendance: 96.4,
            late: 2,
            overtime: 31.0,
            approval: "approved",
          },
          {
            id: "emp-1003",
            name: "高橋 大輔",
            kind: "従業員",
            attendance: 98.0,
            late: 0,
            overtime: 24.5,
            approval: "approved",
          },
        ],
      },
      {
        id: "tm-sales-2",
        name: "第二営業チーム",
        kind: "チーム",
        attendance: 96.3,
        late: 3,
        overtime: 64.5,
        approval: "pending",
        children: [
          {
            id: "emp-1004",
            name: "田中 由紀",
            kind: "従業員",
            attendance: 94.1,
            late: 3,
            overtime: 38.0,
            approval: "late",
          },
          {
            id: "emp-1005",
            name: "伊藤 翔",
            kind: "従業員",
            attendance: 98.5,
            late: 0,
            overtime: 26.5,
            approval: "pending",
          },
        ],
      },
    ],
  },
  {
    id: "dpt-cs",
    name: "カスタマーサポート部",
    kind: "部署",
    attendance: 95.0,
    late: 8,
    overtime: 96.0,
    approval: "late",
    children: [
      {
        id: "tm-cs-1",
        name: "問い合わせ窓口チーム",
        kind: "チーム",
        attendance: 94.2,
        late: 6,
        overtime: 58.0,
        approval: "late",
        children: [
          {
            id: "emp-2001",
            name: "渡辺 さくら",
            kind: "従業員",
            attendance: 92.0,
            late: 4,
            overtime: 33.5,
            approval: "late",
          },
          {
            id: "emp-2002",
            name: "山本 拓也",
            kind: "従業員",
            attendance: 96.4,
            late: 2,
            overtime: 24.5,
            approval: "pending",
          },
        ],
      },
    ],
  },
];

// ── Flatten + visibility ───────────────────────────────────────────────────────

type Row = {
  id: string;
  name: string;
  kind: Node["kind"];
  attendance: number;
  late: number;
  overtime: number;
  approval: ApprovalKey;
  depth: number;
  hasChildren: boolean;
};

/** Depth-first flatten; only descend into expanded parents. */
function flatten(nodes: Node[], open: Set<string>, depth = 0, out: Row[] = []): Row[] {
  for (const n of nodes) {
    const hasChildren = !!n.children && n.children.length > 0;
    out.push({
      id: n.id,
      name: n.name,
      kind: n.kind,
      attendance: n.attendance,
      late: n.late,
      overtime: n.overtime,
      approval: n.approval,
      depth,
      hasChildren,
    });
    if (hasChildren && open.has(n.id)) {
      flatten(n.children!, open, depth + 1, out);
    }
  }
  return out;
}

/** All parent ids — for the fully-expanded static demo. */
function allParentIds(nodes: Node[], acc: Set<string> = new Set()): Set<string> {
  for (const n of nodes) {
    if (n.children && n.children.length > 0) {
      acc.add(n.id);
      allParentIds(n.children, acc);
    }
  }
  return acc;
}

// ── Approval badge mapping (fixed color signaling) ───────────────────────────────

const APPROVAL: Record<
  ApprovalKey,
  { label: string; tone: "success" | "warning" | "destructive" }
> = {
  // 承認済み → 若竹 / 申請中 → 山吹 / 遅刻あり要確認 → 朱(attention, non-destructive)
  approved: { label: "承認済み", tone: "success" },
  pending: { label: "申請中", tone: "warning" },
  late: { label: "遅刻あり", tone: "destructive" },
};

const pct = new Intl.NumberFormat("ja-JP", {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const hours = new Intl.NumberFormat("ja-JP", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

// ── Tree name cell ───────────────────────────────────────────────────────────────
// 14px indent per level via a CSS custom property (data-driven, not a fixed layout
// dimension). Twirl chevron is rendered ONLY on parent rows; leaves get a spacer so
// names stay aligned at the same depth.

function TreeCell({
  row,
  expanded,
  onToggle,
}: {
  row: Row;
  expanded: boolean;
  onToggle: (id: string) => void;
}) {
  return (
    <span
      className="flex items-center gap-1"
      style={{ paddingInlineStart: `calc(${row.depth} * 14px)` }}
    >
      {row.hasChildren ? (
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={expanded ? `${row.name} を折りたたむ` : `${row.name} を展開`}
          aria-expanded={expanded}
          onClick={(e) => {
            e.stopPropagation();
            onToggle(row.id);
          }}
        >
          <ChevronRight
            aria-hidden="true"
            className="transition-transform"
            style={{ transform: expanded ? "rotate(90deg)" : undefined }}
          />
        </Button>
      ) : (
        // leaf spacer: same footprint as the icon-sm button so titles align
        <span
          aria-hidden="true"
          className="inline-block size-[calc(var(--control-height)-0.5rem)] shrink-0"
        />
      )}
      <span className="flex min-w-0 items-center gap-2">
        <span
          className={
            row.kind === "従業員"
              ? "truncate"
              : "truncate font-medium"
          }
        >
          {row.name}
        </span>
        <Badge variant="outline" tone="neutral" className="shrink-0">
          {row.kind}
        </Badge>
      </span>
    </span>
  );
}

// ── Shared metric columns (used by both demos) ───────────────────────────────────

function metricColumns(): ColumnDef<Row>[] {
  return [
    {
      key: "attendance",
      header: "出勤率",
      align: "right",
      width: "w-24",
      render: (row) => <span className="tabular-nums">{pct.format(row.attendance / 100)}</span>,
    },
    {
      key: "late",
      header: "遅刻",
      align: "right",
      width: "w-20",
      hiddenOnMobile: true,
      render: (row) =>
        row.late > 0 ? (
          <span className="tabular-nums text-warning">{row.late}回</span>
        ) : (
          <span className="tabular-nums text-muted-foreground">0回</span>
        ),
    },
    {
      key: "overtime",
      header: "残業",
      align: "right",
      width: "w-24",
      hiddenOnMobile: true,
      render: (row) => <span className="tabular-nums">{hours.format(row.overtime)}h</span>,
    },
    {
      key: "approval",
      header: "承認状態",
      align: "center",
      width: "w-28",
      render: (row) => {
        const a = APPROVAL[row.approval];
        return (
          <Badge tone={a.tone} variant="outline">
            {a.label}
          </Badge>
        );
      },
    },
  ];
}

// ── Interactive tree DataTable ───────────────────────────────────────────────────

function InteractiveTree() {
  // One branch pre-expanded at rest (Rule #2 — tree behaviour visible without clicks).
  const [open, setOpen] = React.useState<Set<string>>(
    () => new Set(["dpt-sales", "tm-sales-1"]),
  );

  const toggle = React.useCallback((id: string) => {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const rows = React.useMemo(() => flatten(TREE, open), [open]);

  const columns: ColumnDef<Row>[] = React.useMemo(
    () => [
      {
        key: "name",
        header: "組織 / 従業員",
        render: (row) => (
          <TreeCell row={row} expanded={open.has(row.id)} onToggle={toggle} />
        ),
      },
      ...metricColumns(),
    ],
    [open, toggle],
  );

  return (
    <DataTable data={rows} columns={columns} getRowId={(row) => row.id} density="compact">
      <DataTable.Toolbar>
        <span className="text-xs text-muted-foreground">
          {rows.length} 行表示 · 部署 {TREE.length} 件
        </span>
        <DataTable.DensityToggle />
      </DataTable.Toolbar>
      <DataTable.Content />
    </DataTable>
  );
}

// ── Fully-expanded static tree (proves all depth levels + the 14px indent) ───────

function ExpandedTree() {
  const open = React.useMemo(() => allParentIds(TREE), []);
  const rows = React.useMemo(() => flatten(TREE, open), [open]);

  const columns: ColumnDef<Row>[] = React.useMemo(
    () => [
      {
        key: "name",
        header: "組織 / 従業員",
        // Static demo: twirls are all open and inert (no toggle handler wired).
        render: (row) => <TreeCell row={row} expanded onToggle={() => {}} />,
      },
      ...metricColumns(),
    ],
    [],
  );

  return (
    <DataTable data={rows} columns={columns} getRowId={(row) => row.id} density="compact" />
  );
}

export default function Demo() {
  return (
    <PageContainer
      title="ツリー行"
      subtitle="階層行 (部署 → チーム → 従業員) · 14px/階層インデント · 親行のみ開閉トグル · 勤怠ロールアップ"
      density="compact"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>開閉可能なツリー</CardTitle>
          </CardHeader>
          <CardContent flush>
            <InteractiveTree />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>全展開（3階層・インデントの確認）</CardTitle>
          </CardHeader>
          <CardContent flush>
            <ExpandedTree />
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
