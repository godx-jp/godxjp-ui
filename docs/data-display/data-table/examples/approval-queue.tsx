import { useState } from "react";

import { Badge, Card, CardContent, DataTable, type ColumnDef } from "@godxjp/ui/data-display";
import { Button, Text } from "@godxjp/ui/general";
import {
  AppShell,
  Flex,
  PageContainer,
  Sidebar,
  type SidebarSectionProp,
  Topbar,
} from "@godxjp/ui/layout";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@godxjp/ui/navigation";
import { ClipboardCheck, LayoutDashboard, MoreHorizontal, ScrollText } from "lucide-react";

/**
 * Access-approval queue (SCR-105 / gh#253) — the canonical five-column approval collection driven
 * by the TanStack-powered DataTable, at 1440 · 1024 · 390 with ONLY public API.
 *
 * The whole responsive contract is two props: `preset="action-collection"` on the DataTable and a
 * `priority` on each `ColumnDef`. Below the collapse step the package swaps the desktop intrinsic
 * column widths for the token-owned priority measures (`--table-action-collection-*`) under
 * `table-layout: fixed`, lets cells wrap, and releases the surface's
 * `--table-surface-min-inline-size` floor — so 申請者 · 対象 · 理由 · 申請日時 · 操作 all stay
 * inside the initial 390px frame. No page-local CSS, no consumer width, no hidden column, no
 * horizontal scroll.
 *
 * It stays a REAL table at every width — `<thead>` / `<th scope>` / `<tr>` / `<td>` are untouched,
 * sorting keeps `aria-sort`, and the row-action affordance is the column whose measure is reserved
 * first, so it can never be pushed outside the viewport. Content is JA + EN + VI, including a
 * deliberately long reason and a long resource path.
 */
type AccessRequest = {
  id: string;
  requester: string;
  requesterMail: string;
  target: string;
  reason: string;
  requestedAt: string;
  state: "pending" | "escalated";
};

const requests: AccessRequest[] = [
  {
    id: "req-1041",
    requester: "田中 太郎",
    requesterMail: "taro.tanaka@example.co.jp",
    target: "会計 / 請求書エクスポート",
    reason: "月次決算のため請求データの一括出力権限が必要です。",
    requestedAt: "2026-08-03T09:12:00+09:00",
    state: "pending",
  },
  {
    id: "req-1042",
    requester: "Nguyễn Thị Hồng Ánh",
    requesterMail: "hong.anh.nguyen@example.vn",
    target: "Kho vận / Quản trị phiếu xuất kho khu vực miền Nam",
    reason:
      "Cần quyền quản trị để xử lý phiếu xuất kho tồn đọng của chi nhánh miền Nam trong kỳ kiểm kê quý III.",
    requestedAt: "2026-08-03T11:47:00+09:00",
    state: "escalated",
  },
  {
    id: "req-1043",
    requester: "Margaret Whitmore-Ashcombe",
    requesterMail: "margaret.whitmore@example.com",
    target: "Identity / Service account administration",
    reason: "Rotating the service-account credentials scheduled for the August maintenance window.",
    requestedAt: "2026-08-04T02:05:00+09:00",
    state: "pending",
  },
  {
    id: "req-1044",
    requester: "佐藤 花子",
    requesterMail: "hanako.sato@example.co.jp",
    target: "勤怠 / 部門レポート",
    reason: "部門別の残業集計を確認するため。",
    requestedAt: "2026-08-04T08:30:00+09:00",
    state: "pending",
  },
];

// ISO-8601 input → locale/timezone-aware display via Intl (never hand-built).
const requestedAtFormat = new Intl.DateTimeFormat("ja-JP", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "Asia/Tokyo",
});

const sections: SidebarSectionProp[] = [
  {
    label: "運用",
    items: [
      { id: "dashboard", label: "ダッシュボード", icon: LayoutDashboard },
      { id: "approvals", label: "アクセス承認", icon: ClipboardCheck },
      { id: "audit", label: "監査ログ", icon: ScrollText },
    ],
  },
];

// `priority` is the column-priority contract: primary = the row's subject, secondary = its target,
// meta = a low-priority stamp, actions = the affordance whose measure is reserved first. The
// free-text 理由 column is deliberately UNMARKED — it takes whatever space is left.
const columns: ColumnDef<AccessRequest>[] = [
  {
    key: "requester",
    header: "申請者",
    priority: "primary",
    sortable: true,
    render: (row) => (
      <Flex direction="col" gap="xs" align="start">
        <Text size="sm">{row.requester}</Text>
        <Text size="xs" tone="muted">
          {row.requesterMail}
        </Text>
      </Flex>
    ),
  },
  {
    key: "target",
    header: "対象",
    priority: "secondary",
    render: (row) => (
      <Flex direction="col" gap="xs" align="start">
        <Text size="sm">{row.target}</Text>
        {row.state === "escalated" && <Badge tone="warning">エスカレーション</Badge>}
      </Flex>
    ),
  },
  {
    key: "reason",
    header: "理由",
    render: (row) => <Text size="sm">{row.reason}</Text>,
  },
  {
    key: "requestedAt",
    header: "申請日時",
    priority: "meta",
    sortable: true,
    render: (row) => (
      <Text size="xs" tone="muted">
        <time dateTime={row.requestedAt}>
          {requestedAtFormat.format(new Date(row.requestedAt))}
        </time>
      </Text>
    ),
  },
  {
    key: "actions",
    header: "",
    ariaLabel: "操作",
    priority: "actions",
    enableHiding: false,
    render: (row) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="xs" aria-label={`${row.requester} の申請の操作`}>
            <MoreHorizontal aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>承認する</DropdownMenuItem>
          <DropdownMenuItem>却下する</DropdownMenuItem>
          <DropdownMenuItem>詳細を表示</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

export default function DataTableApprovalQueue() {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  return (
    <AppShell
      sidebar={
        <Sidebar
          product={{ name: "GodX Platform", role: "運用管理" }}
          activeId="approvals"
          sections={sections}
        />
      }
      topbar={<Topbar start={<Text weight="medium">アクセス承認</Text>} />}
    >
      <PageContainer
        title="アクセス承認"
        subtitle="Access approval · Phê duyệt truy cập"
        density="compact"
        variant="flush"
      >
        <Card>
          <CardContent flush>
            <DataTable
              data={requests}
              columns={columns}
              getRowId={(row) => row.id}
              preset="action-collection"
              collapseBelow="sm"
              selected={selected}
              onSelectChange={setSelected}
            />
          </CardContent>
        </Card>
      </PageContainer>
    </AppShell>
  );
}
