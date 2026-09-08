import { useState } from "react";

import {
  Card,
  CardContent,
  Badge,
  DataTable,
  Descriptions,
  TableCell,
  TableRow,
  type ColumnDef,
} from "@godxjp/ui/data-display";
import { Text } from "@godxjp/ui/general";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * DataTable / Descriptions — the Ant Design 6.6.2 parity surface on one screen: frozen columns
 * (`fixed`), truncation (`ellipsis`), multi-column sort (`sorter.multiple`), header filters
 * (`filters` + `onFilter`), the full `rowSelection` object, `expandable` detail rows, a `summary`
 * totals row, a `scroll` envelope and a bordered `Descriptions` on a responsive column ladder.
 *
 * It is also the MEASUREMENT surface: the frozen columns and the scroll envelope are geometry, and
 * geometry is verified against this page in a browser, not by eye.
 */
type Line = {
  id: string;
  code: string;
  partner: string;
  note: string;
  status: "active" | "pending" | "failed";
  region: string;
  owner: string;
  updated: string;
  amount: number;
};

const STATUS_TONE = { active: "success", pending: "warning", failed: "destructive" } as const;
const STATUS_LABEL = { active: "有効", pending: "保留", failed: "失敗" } as const;

const BASE_ROWS: Line[] = [
  {
    id: "L-1",
    code: "INV-0312",
    partner: "株式会社ベトヤ",
    note: "四月分の請求。検収は完了しているが振込確認が未了のため保留にしている。",
    status: "active",
    region: "関東",
    owner: "田中",
    updated: "2024-04-12",
    amount: 482000,
  },
  {
    id: "L-2",
    code: "INV-0311",
    partner: "ハノイ物流",
    note: "越境輸送分。通関書類の差し替えを依頼済み。",
    status: "pending",
    region: "海外",
    owner: "佐藤",
    updated: "2024-04-11",
    amount: 128400,
  },
  {
    id: "L-3",
    code: "INV-0310",
    partner: "GMO決済",
    note: "決済手数料。月次で自動計上される。",
    status: "active",
    region: "関東",
    owner: "田中",
    updated: "2024-04-10",
    amount: 64800,
  },
  {
    id: "L-4",
    code: "INV-0309",
    partner: "東京ロジ",
    note: "再送分。前回の請求が差し戻されたため再発行している。",
    status: "failed",
    region: "関東",
    owner: "鈴木",
    updated: "2024-04-09",
    amount: 312000,
  },
  {
    id: "L-5",
    code: "INV-0308",
    partner: "大阪商事",
    note: "年間契約の四半期按分。",
    status: "pending",
    region: "関西",
    owner: "鈴木",
    updated: "2024-04-08",
    amount: 900500,
  },
];

/**
 * Enough rows for the `scroll.y` envelope to actually bite — five rows never reach an 18rem cap,
 * and a cap that never clips proves nothing.
 */
const ROWS: Line[] = [
  ...BASE_ROWS,
  ...BASE_ROWS.map((row, i) => ({
    ...row,
    id: `${row.id}-b`,
    code: `INV-02${String(10 + i).padStart(2, "0")}`,
    updated: `2024-03-${String(10 + i).padStart(2, "0")}`,
  })),
];

const yen = new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "JPY",
  maximumFractionDigits: 0,
});

const columns: ColumnDef<Line>[] = [
  // Frozen to the inline start — the identity column stays put while the grid scrolls.
  { key: "code", header: "伝票番号", fixed: "start", width: "150px", sorter: { multiple: 2 } },
  { key: "partner", header: "取引先", width: "220px" },
  // One line, truncated, with the full text kept as the cell's title.
  { key: "note", header: "備考", ellipsis: true, width: "260px" },
  {
    key: "status",
    header: "状態",
    width: "140px",
    filters: [
      { text: "有効", value: "active" },
      { text: "保留", value: "pending" },
      { text: "失敗", value: "failed" },
    ],
    onFilter: (value, row) => row.status === value,
    render: (row) => <Badge tone={STATUS_TONE[row.status]}>{STATUS_LABEL[row.status]}</Badge>,
  },
  {
    key: "region",
    header: "地域",
    width: "140px",
    filters: [
      { text: "関東", value: "関東" },
      { text: "関西", value: "関西" },
      { text: "海外", value: "海外" },
    ],
    filterMultiple: false,
    onFilter: (value, row) => row.region === value,
  },
  { key: "owner", header: "担当", width: "140px", sorter: { multiple: 1 } },
  {
    key: "updated",
    header: "更新日",
    width: "160px",
    sorter: true,
    sortDirections: ["desc", "asc"],
  },
  // Frozen to the inline end — the amount stays readable at any scroll position.
  {
    key: "amount",
    header: "金額",
    align: "right",
    fixed: "end",
    width: "160px",
    sorter: (a, b) => a.amount - b.amount,
    render: (row) => yen.format(row.amount),
  },
];

export default function AntdParityDemo() {
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <PageContainer title="Ant Design パリティ" subtitle="DataTable / Descriptions">
      <Flex direction="col" gap="lg">
        <Card>
          <CardContent flush>
            <DataTable
              data={ROWS}
              columns={columns}
              getRowId={(row) => row.id}
              bordered
              showSorterTooltip
              scroll={{ x: 1400, y: "18rem" }}
              sticky
              rowSelection={{
                selectedRowKeys: selected,
                onChange: (keys) => {
                  setSelected(keys);
                },
                selections: true,
                getCheckboxProps: (row) => ({ disabled: row.status === "failed" }),
                preserveSelectedRowKeys: true,
              }}
              expandable={{
                expandedRowRender: (row) => (
                  <Descriptions bordered columns={{ sm: 2, lg: 3 }} layout="horizontal">
                    <Descriptions.Item label="伝票番号" mono>
                      {row.code}
                    </Descriptions.Item>
                    <Descriptions.Item label="担当">{row.owner}</Descriptions.Item>
                    <Descriptions.Item label="地域">{row.region}</Descriptions.Item>
                    <Descriptions.Item label="備考" span="filled">
                      {row.note}
                    </Descriptions.Item>
                  </Descriptions>
                ),
                rowExpandable: (row) => row.status !== "failed",
              }}
              summary={(rows) => (
                <TableRow>
                  <TableCell />
                  <TableCell />
                  <TableCell>合計</TableCell>
                  <TableCell />
                  <TableCell />
                  <TableCell />
                  <TableCell />
                  <TableCell />
                  <TableCell>
                    {yen.format(rows.reduce((sum, row) => sum + row.amount, 0))}
                  </TableCell>
                </TableRow>
              )}
              onRow={(row) => ({ "data-row-key": row.id })}
            >
              <DataTable.Toolbar>
                <DataTable.Search />
                <Flex direction="row" gap="sm" align="center">
                  <DataTable.ViewOptions />
                  <DataTable.DensityToggle />
                </Flex>
              </DataTable.Toolbar>
              <DataTable.Content />
              <DataTable.Pagination />
            </DataTable>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Text size="sm" tone="muted">
              選択中: {selected.length} 件
            </Text>
            <Descriptions bordered columns={{ sm: 2, lg: 4 }}>
              <Descriptions.Item label="伝票数">{ROWS.length}</Descriptions.Item>
              <Descriptions.Item label="通貨">JPY</Descriptions.Item>
              <Descriptions.Item label="期間">2024-04-08 ～ 2024-04-12</Descriptions.Item>
              <Descriptions.Item label="ステータス">確定前</Descriptions.Item>
              <Descriptions.Item label="メモ" span="filled">
                Ant Design 6.6.2 の `bordered` と `column` レスポンシブ指定をそのまま受ける。
              </Descriptions.Item>
            </Descriptions>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
