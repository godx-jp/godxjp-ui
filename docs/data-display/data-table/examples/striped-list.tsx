import { useState } from "react";

import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DataTable,
  Descriptions,
  type ColumnDef,
} from "@godxjp/ui/data-display";
import { Text } from "@godxjp/ui/general";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * DataTable `striped` (gh#700) — a wide issue list striped by LOGICAL record. On one screen: an
 * expanded detail row (it wears its own record's stripe and does not shift the rows after it), a
 * frozen inline-end column (its opaque cells wear the stripe too), a pre-selected row (selection
 * replaces the stripe) and a toned row (the rail and wash stay visible on the stripe).
 *
 * To stripe EVERY list table in a service, the theme sets `--table-row-striped-alpha: 100%` on
 * :root once; `striped` here is the per-table form of the same switch.
 */
type Issue = {
  id: string;
  key: string;
  subject: string;
  type: "bug" | "task" | "story";
  assignee: string;
  status: "active" | "pending" | "draft" | "failed";
  priority: "高" | "中" | "低";
  due: string;
  milestone: string;
};

const TYPE_LABEL = { bug: "バグ", task: "タスク", story: "ストーリー" } as const;

const ROWS: Issue[] = [
  {
    id: "1",
    key: "OPS-128",
    subject: "請求書 PDF の和暦表記が一部崩れる",
    type: "bug",
    assignee: "田中",
    status: "active",
    priority: "高",
    due: "2024-04-12",
    milestone: "4月リリース",
  },
  {
    id: "2",
    key: "OPS-127",
    subject: "取引先マスタの一括取込に重複チェックを追加",
    type: "story",
    assignee: "佐藤",
    status: "pending",
    priority: "中",
    due: "2024-04-15",
    milestone: "4月リリース",
  },
  {
    id: "3",
    key: "OPS-126",
    subject: "承認フローの差し戻し理由を必須にする",
    type: "task",
    assignee: "鈴木",
    status: "draft",
    priority: "中",
    due: "2024-04-18",
    milestone: "5月リリース",
  },
  {
    id: "4",
    key: "OPS-125",
    subject: "夜間バッチが月末に二重起動する",
    type: "bug",
    assignee: "高橋",
    status: "failed",
    priority: "高",
    due: "2024-04-10",
    milestone: "4月リリース",
  },
  {
    id: "5",
    key: "OPS-124",
    subject: "権限マトリクスに監査ログ閲覧を追加",
    type: "story",
    assignee: "伊藤",
    status: "active",
    priority: "低",
    due: "2024-04-22",
    milestone: "5月リリース",
  },
  {
    id: "6",
    key: "OPS-123",
    subject: "CSV 出力の文字コードを選べるようにする",
    type: "task",
    assignee: "渡辺",
    status: "pending",
    priority: "低",
    due: "2024-04-25",
    milestone: "5月リリース",
  },
];

const columns: ColumnDef<Issue>[] = [
  { key: "key", header: "キー", width: "110px" },
  { key: "type", header: "種別", width: "110px", render: (row) => TYPE_LABEL[row.type] },
  { key: "subject", header: "件名", width: "320px" },
  { key: "assignee", header: "担当者", width: "110px" },
  { key: "status", header: "状態", width: "110px", render: (row) => <Badge status={row.status} /> },
  { key: "priority", header: "優先度", width: "90px" },
  { key: "milestone", header: "マイルストーン", width: "150px" },
  // Frozen to the inline end: its cells are opaque, so they must wear the stripe themselves.
  { key: "due", header: "期日", width: "130px", fixed: "end" },
];

export default function StripedListDemo() {
  const [selected, setSelected] = useState<string[]>(["3"]);
  const [expanded, setExpanded] = useState<string[]>(["2"]);

  return (
    <PageContainer title="課題一覧" subtitle="DataTable striped · 論理行ごとの縞模様">
      <Card>
        <CardHeader>
          <CardTitle>未完了の課題</CardTitle>
        </CardHeader>
        <CardContent flush>
          <DataTable
            data={ROWS}
            columns={columns}
            getRowId={(row) => row.id}
            striped
            hoverable
            scroll={{ x: 1240 }}
            rowTone={(row) => (row.status === "failed" ? "destructive" : undefined)}
            rowSelection={{
              selectedRowKeys: selected,
              onChange: (keys) => {
                setSelected(keys);
              },
            }}
            expandable={{
              expandedRowKeys: expanded,
              onExpandedRowsChange: (keys) => {
                setExpanded(keys);
              },
              expandedRowRender: (row) => (
                <Descriptions bordered columns={{ sm: 2, lg: 3 }} layout="horizontal">
                  <Descriptions.Item label="キー" mono>
                    {row.key}
                  </Descriptions.Item>
                  <Descriptions.Item label="担当者">{row.assignee}</Descriptions.Item>
                  <Descriptions.Item label="マイルストーン">{row.milestone}</Descriptions.Item>
                </Descriptions>
              ),
            }}
          >
            <DataTable.Content />
          </DataTable>
        </CardContent>
      </Card>

      <Flex direction="col" gap="xs">
        <Text size="sm" tone="muted">
          選択中: {selected.length} 件 · 展開中: {expanded.length} 件
        </Text>
      </Flex>
    </PageContainer>
  );
}
