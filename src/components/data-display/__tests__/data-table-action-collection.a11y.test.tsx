import { describe, it } from "vitest";

import { DataTable, type ColumnDef } from "../data-table";
import { Badge } from "../badge";
import { Button, Text } from "../../general";
import { Flex } from "../../layout/flex";
import { expectNoA11yViolations } from "@/test/a11y";

// The SCR-105 access-approval queue (gh#253) driven through the TanStack DataTable. The preset
// changes only the SIZING model, so this guards that the table axe sees at 390 is the SAME table
// it sees at 1440: real header cells, a named (visually empty) actions column, an accessible name
// on the icon-only row action, and `aria-sort` on the sortable headers.
type AccessRequest = {
  id: string;
  requester: string;
  target: string;
  reason: string;
  requestedAt: string;
  escalated: boolean;
};

const requestedAtFormat = new Intl.DateTimeFormat("ja-JP", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "Asia/Tokyo",
});

const requests: AccessRequest[] = [
  {
    id: "req-1041",
    requester: "田中 太郎",
    target: "会計 / 請求書エクスポート",
    reason: "月次決算のため請求データの一括出力権限が必要です。",
    requestedAt: "2026-08-03T09:12:00+09:00",
    escalated: false,
  },
  {
    id: "req-1042",
    requester: "Nguyễn Thị Hồng Ánh",
    target: "Kho vận / Quản trị phiếu xuất kho khu vực miền Nam",
    reason: "Cần quyền quản trị để xử lý phiếu xuất kho tồn đọng của chi nhánh miền Nam.",
    requestedAt: "2026-08-03T11:47:00+09:00",
    escalated: true,
  },
];

const columns: ColumnDef<AccessRequest>[] = [
  { key: "requester", header: "申請者", priority: "primary", sortable: true },
  {
    key: "target",
    header: "対象",
    priority: "secondary",
    render: (row) => (
      <Flex direction="col" gap="xs" align="start">
        <Text size="sm">{row.target}</Text>
        {row.escalated && <Badge tone="warning">エスカレーション</Badge>}
      </Flex>
    ),
  },
  { key: "reason", header: "理由", render: (row) => <Text size="sm">{row.reason}</Text> },
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
    // A visually empty header still needs a screen-reader name (axe: empty-table-header).
    ariaLabel: "操作",
    priority: "actions",
    enableHiding: false,
    render: (row) => (
      <Button variant="ghost" size="xs" aria-label={`${row.requester} の申請の操作`}>
        ⋯
      </Button>
    ),
  },
];

describe("DataTable action-collection a11y (gh#253)", () => {
  it("has no axe violations for the canonical approval queue", async () => {
    await expectNoA11yViolations(
      <DataTable
        data={requests}
        columns={columns}
        getRowId={(row) => row.id}
        preset="action-collection"
        collapseBelow="sm"
      />,
    );
  });

  it("has no axe violations with selection and the compact collapse step", async () => {
    await expectNoA11yViolations(
      <DataTable
        data={requests}
        columns={columns}
        getRowId={(row) => row.id}
        preset="action-collection"
        collapseBelow="lg"
        selectable
      />,
    );
  });
});
