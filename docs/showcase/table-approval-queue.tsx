/**
 * Showcase · アクセス承認キュー / Access approval queue (gh#253) — the canonical five-column
 * approval collection at 1440 · 1024 · 390 using ONLY public API.
 *
 * The whole responsive contract is `Table preset="action-collection"` plus a `priority` on each
 * column's `TableHead`/`TableCell`. Below the collapse step the package swaps the desktop
 * intrinsic column widths for the token-owned priority measures under `table-layout: fixed` and
 * lets cells wrap, so 申請者 · 対象 · 理由 · 申請日時 · 操作 all stay inside the initial 390px
 * frame — no page-local CSS, no consumer width, no hidden column, no horizontal scroll.
 *
 * The table stays a REAL table at every width: `<thead>` / `<th scope>` / `<tr>` / `<td>` are
 * untouched, so header association and screen-reader table navigation are identical at 390 and at
 * 1440. Row actions are a single kebab menu, the affordance whose measure the preset reserves
 * first — it can never be pushed outside the viewport.
 *
 * Content is JA + EN + VI, including a deliberately long reason and a long resource path.
 */
import { ClipboardCheck, LayoutDashboard, MoreHorizontal, ScrollText } from "lucide-react";

import {
  Badge,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@godxjp/ui/data-display";
import { Button, Text } from "@godxjp/ui/general";
import { AppShell, Flex, PageContainer, Sidebar, Topbar } from "@godxjp/ui/layout";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@godxjp/ui/navigation";

type Request = {
  id: string;
  requester: string;
  requesterMail: string;
  target: string;
  reason: string;
  requestedAt: string;
  state: "pending" | "escalated";
};

const REQUESTS: Request[] = [
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

const REQUESTED_AT = new Intl.DateTimeFormat("ja-JP", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "Asia/Tokyo",
});

export default function TableApprovalQueue() {
  return (
    <AppShell
      sidebar={
        <Sidebar
          product={{ name: "GodX Platform", role: "運用管理" }}
          activeId="approvals"
          sections={[
            {
              label: "運用",
              items: [
                { id: "dashboard", label: "ダッシュボード", icon: LayoutDashboard },
                { id: "approvals", label: "アクセス承認", icon: ClipboardCheck },
                { id: "audit", label: "監査ログ", icon: ScrollText },
              ],
            },
          ]}
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
            <Table preset="action-collection" collapseBelow="sm">
              <TableHeader>
                <TableRow>
                  <TableHead priority="primary" scope="col">
                    申請者
                  </TableHead>
                  <TableHead priority="secondary" scope="col">
                    対象
                  </TableHead>
                  <TableHead scope="col">理由</TableHead>
                  <TableHead priority="meta" scope="col">
                    申請日時
                  </TableHead>
                  <TableHead priority="actions" scope="col">
                    <span className="sr-only">操作</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {REQUESTS.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell priority="primary">
                      <Flex direction="col" gap="xs">
                        <Text size="sm">{request.requester}</Text>
                        <Text size="xs" tone="muted">
                          {request.requesterMail}
                        </Text>
                      </Flex>
                    </TableCell>
                    <TableCell priority="secondary">
                      <Flex direction="col" gap="xs" align="start">
                        <Text size="sm">{request.target}</Text>
                        {request.state === "escalated" && (
                          <Badge tone="warning">エスカレーション</Badge>
                        )}
                      </Flex>
                    </TableCell>
                    <TableCell>
                      <Text size="sm">{request.reason}</Text>
                    </TableCell>
                    <TableCell priority="meta">
                      <Text size="xs" tone="muted">
                        <time dateTime={request.requestedAt}>
                          {REQUESTED_AT.format(new Date(request.requestedAt))}
                        </time>
                      </Text>
                    </TableCell>
                    <TableCell priority="actions">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="xs"
                            aria-label={`${request.requester} の申請の操作`}
                          >
                            <MoreHorizontal aria-hidden />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>承認する</DropdownMenuItem>
                          <DropdownMenuItem>却下する</DropdownMenuItem>
                          <DropdownMenuItem>詳細を表示</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </PageContainer>
    </AppShell>
  );
}
