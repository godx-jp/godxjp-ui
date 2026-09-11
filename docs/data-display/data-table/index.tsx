import { useMemo, useState } from "react";

import { AppProvider } from "@godxjp/ui/app";
import { Badge, Card, CardContent, DataTable, type ColumnDef } from "@godxjp/ui/data-display";
import { Button, Text } from "@godxjp/ui/general";
import { Flex, PageContainer } from "@godxjp/ui/layout";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@godxjp/ui/navigation";
import type { DensityProp, SortStateProp } from "@godxjp/ui/props";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

/**
 * DataTable — the admin list primitive: sticky header, sorting, bulk selection,
 * density toggle, per-row click navigation, a loading row, and a built-in empty
 * state (never hand-roll a data.length===0 guard). Composed only from real
 * @godxjp/ui components.
 */
type Invoice = {
  id: string;
  partner: string;
  amount: number;
  status: "active" | "pending" | "draft" | "failed";
  date: string;
};

const invoices: Invoice[] = [
  {
    id: "INV-0312",
    partner: "株式会社ベトヤ",
    amount: 482000,
    status: "active",
    date: "2024-04-12",
  },
  { id: "INV-0311", partner: "ハノイ物流", amount: 128400, status: "pending", date: "2024-04-11" },
  { id: "INV-0310", partner: "GMO決済", amount: 64800, status: "draft", date: "2024-04-10" },
  { id: "INV-0309", partner: "東京ロジ", amount: 312000, status: "failed", date: "2024-04-09" },
];

const yen = new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "JPY",
  maximumFractionDigits: 0,
});

const columns: ColumnDef<Invoice>[] = [
  { key: "id", header: "請求書番号", width: "w-32" },
  { key: "partner", header: "取引先", sortable: true },
  {
    key: "amount",
    header: "金額",
    align: "right",
    sortable: true,
    render: (row) => <Text tabular>{yen.format(row.amount)}</Text>,
  },
  {
    key: "status",
    header: "状態",
    align: "center",
    render: (row) => <Badge status={row.status} />,
  },
  { key: "date", header: "発行日", align: "right", hiddenOnMobile: true },
  {
    key: "_actions",
    header: "",
    ariaLabel: "操作",
    align: "right",
    enableHiding: false,
    render: (row) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label={`${row.id} の操作`}>
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <Pencil />
            編集
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">
            <Trash2 />
            削除
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

/* Five 240px columns: wider than the frame at every viewport the gates sweep, and wide for a
 * reason no font can change — the width is declared, so the overflow is deterministic in CI. */
const wideColumns: ColumnDef<Invoice>[] = [
  { key: "id", header: "請求書番号", width: "240px" },
  { key: "partner", header: "取引先", width: "240px" },
  { key: "amount", header: "金額", align: "right", width: "240px" },
  { key: "status", header: "状態", width: "240px" },
  { key: "date", header: "期限日", width: "240px" },
];

export default function Demo() {
  const [selected, setSelected] = useState<Set<string>>(new Set(["INV-0311"]));
  const [sort, setSort] = useState<SortStateProp | undefined>({
    key: "amount",
    direction: "desc",
  });
  const [density, setDensity] = useState<DensityProp>("comfortable");

  const rows = useMemo(() => {
    if (!sort) return invoices;
    const dir = sort.direction === "asc" ? 1 : -1;
    return [...invoices].sort((a, b) => {
      const av = a[sort.key as keyof Invoice];
      const bv = b[sort.key as keyof Invoice];
      return (av < bv ? -1 : av > bv ? 1 : 0) * dir;
    });
  }, [sort]);

  return (
    <PageContainer
      title="DataTable"
      subtitle="sortable · selectable · bulk actions · row actions · loading · clickable rows · empty state"
    >
      <Flex direction="col" gap="lg">
        {/* A table WIDER than its frame, inside a flush Card — the shape a list page uses. It must
            scroll inside its own box with the fade at the inline end, never cut its last columns
            (WCAG 1.4.10). `check:data-table-overflow` measures this section. */}
        <Flex direction="col" gap="sm" id="wide-overflow" className="max-w-3xl">
          <Text weight="medium">枠より広い表（横スクロール · 列を切らない）</Text>
          <Card>
            <CardContent flush>
              <DataTable
                data={invoices}
                columns={wideColumns}
                getRowId={(row) => row.id}
                selectable
              />
            </CardContent>
          </Card>
        </Flex>
        <Flex direction="col" gap="sm" id="text-action-width">
          <Text weight="medium">日本語の行アクション</Text>
          <DataTable
            preset="action-collection"
            columns={[
              { key: "partner", header: "取引先" },
              { key: "date", header: "期限日", width: "104px" },
              {
                key: "action",
                header: "操作",
                priority: "actions",
                width: "104px",
                render: () => (
                  <Button size="sm" variant="ghost">
                    対応する
                  </Button>
                ),
              },
            ]}
            data={invoices}
            getRowId={(row) => row.id}
          />
        </Flex>
        {/* Row TONE — the leading-edge rail + wash for a row in a named state. The status Badge
            stays in its own cell: the rail makes the row findable, it does not carry the meaning
            (WCAG 1.4.1). */}
        <Flex direction="col" gap="sm" id="row-tone">
          <Text weight="medium">行のトーン（要対応の行）</Text>
          <DataTable
            data={invoices}
            columns={columns}
            getRowId={(row) => row.id}
            rowTone={(row) =>
              row.status === "failed"
                ? "destructive"
                : row.status === "pending"
                  ? "attention"
                  : undefined
            }
          />
        </Flex>
        {/* Primary: sorted (amount desc), one row preselected, clickable rows,
            controlled density (comfortable), kebab row actions, pagination footer. */}
        <DataTable
          data={rows}
          columns={columns}
          getRowId={(row) => row.id}
          selectable
          selected={selected}
          onSelectChange={setSelected}
          onRowClick={() => {}}
          density={density}
          onDensityChange={setDensity}
          sort={sort}
          onSortChange={setSort}
        >
          <DataTable.Toolbar>
            <DataTable.BulkActions>
              <Button size="sm" variant="outline">
                エクスポート
              </Button>
              <Button size="sm">入金消込</Button>
            </DataTable.BulkActions>
            <DataTable.DensityToggle />
          </DataTable.Toolbar>
          <DataTable.Content />
          <DataTable.Pagination cursor="INV-0309" hasMore onChange={() => {}} />
        </DataTable>

        {/* The three density branches rendered statically. The DensityToggle above reaches the
            same values, but a toggle only proves them after a click; these prove them at rest. */}
        <Flex direction="col" gap="sm">
          <Text as="div" weight="medium">
            密度 compact（明細の一覧 · 行高さを最小に）
          </Text>
          <DataTable
            data={invoices}
            columns={columns}
            getRowId={(row) => row.id}
            density="compact"
          />
        </Flex>

        <Flex direction="col" gap="sm">
          <Text as="div" weight="medium">
            密度 default（既定 · 管理画面の標準）
          </Text>
          <DataTable
            data={invoices}
            columns={columns}
            getRowId={(row) => row.id}
            density="default"
          />
        </Flex>

        <Flex direction="col" gap="sm">
          <Text as="div" weight="medium">
            密度 comfortable（少数行 · 承認画面など読み取り重視）
          </Text>
          <DataTable
            data={invoices}
            columns={columns}
            getRowId={(row) => row.id}
            density="comfortable"
          />
        </Flex>

        <Flex direction="col" gap="sm">
          <Text as="div" weight="medium">
            読み込み中（loading=true で行を置き換え）
          </Text>
          <DataTable data={invoices} columns={columns} getRowId={(row) => row.id} loading />
        </Flex>

        <Flex direction="col" gap="sm" className="max-w-sm">
          <Text as="div" weight="medium">
            Narrow footer · VI expanded rows-per-page label
          </Text>
          <AppProvider defaultLocale="vi" persist={false}>
            <DataTable data={invoices} columns={columns} getRowId={(row) => row.id}>
              <DataTable.Pagination pageSizeOptions={[10, 20]} />
            </DataTable>
          </AppProvider>
        </Flex>

        <Flex direction="col" gap="sm" className="max-w-sm">
          <Text as="div" weight="medium">
            Narrow footer · JA rows-per-page label
          </Text>
          <AppProvider defaultLocale="ja" persist={false}>
            <DataTable data={invoices} columns={columns} getRowId={(row) => row.id}>
              <DataTable.Pagination pageSizeOptions={[10, 20]} />
            </DataTable>
          </AppProvider>
        </Flex>

        <Flex direction="col" gap="sm" className="max-w-sm">
          <Text as="div" weight="medium">
            Narrow footer · EN longest supported rows-per-page label
          </Text>
          <AppProvider defaultLocale="en" persist={false}>
            <DataTable data={invoices} columns={columns} getRowId={(row) => row.id}>
              <DataTable.Pagination pageSizeOptions={[10, 20]} />
            </DataTable>
          </AppProvider>
        </Flex>

        <Flex direction="col" gap="sm" id="empty-builtin">
          <Text as="div" weight="medium">
            空の状態（data が空のとき自動表示）
          </Text>
          <DataTable data={[]} columns={columns} getRowId={(row) => row.id} />
        </Flex>

        {/* The SAME cell with consumer content in it. `empty` takes a ReactNode, so a plain string
            is a legal call — and the lifecycle cell used to be `padding: 0`, which put that string
            flush against the table's edge. Measured here; see check:data-table-empty-inset. */}
        <Flex direction="col" gap="sm" id="empty-plain-string">
          <Text as="div" weight="medium">
            空の状態（empty に文字列を渡す）
          </Text>
          <DataTable
            data={[]}
            columns={columns}
            getRowId={(row) => row.id}
            empty="まだ登録がありません"
          />
        </Flex>

        {/* — the two failure states, in the same table grid as empty/loading. */}
        <Flex direction="col" gap="sm">
          <Text as="div" weight="medium">
            エラー（error · role=&quot;alert&quot; · onRetry で再試行を表示）
          </Text>
          <DataTable
            data={[]}
            columns={columns}
            getRowId={(row) => row.id}
            error
            onRetry={() => {}}
          />
        </Flex>

        <Flex direction="col" gap="sm">
          <Text as="div" weight="medium">
            エラー（onRetry なし · 再試行ボタンは出さない）
          </Text>
          <DataTable data={[]} columns={columns} getRowId={(row) => row.id} error />
        </Flex>

        <Flex direction="col" gap="sm" id="error-custom-node">
          <Text as="div" weight="medium">
            エラー（error にノードを渡して文言を差し替え）
          </Text>
          <DataTable
            data={[]}
            columns={columns}
            getRowId={(row) => row.id}
            error={<Text tone="muted">コード INV_FETCH_504 · リクエストID req_7f3a91c0d2</Text>}
          />
        </Flex>

        <Flex direction="col" gap="sm">
          <Text as="div" weight="medium">
            権限なし（denied · 403 は再試行を出さない）
          </Text>
          <DataTable data={[]} columns={columns} getRowId={(row) => row.id} denied />
        </Flex>

        <Flex direction="col" gap="sm">
          <Text as="div" weight="medium">
            0 件 + numbered pagination（境界状態）
          </Text>
          <DataTable data={[]} columns={columns} getRowId={(row) => row.id}>
            <DataTable.Content />
            <DataTable.Pagination pageSizeOptions={[10, 20]} />
          </DataTable>
        </Flex>

        <Flex direction="col" gap="sm">
          <Text as="div" weight="medium">
            1 件 / 1 ページ + numbered pagination（境界状態）
          </Text>
          <DataTable data={invoices.slice(0, 1)} columns={columns} getRowId={(row) => row.id}>
            <DataTable.Content />
            <DataTable.Pagination pageSizeOptions={[10, 20]} />
          </DataTable>
        </Flex>
      </Flex>
    </PageContainer>
  );
}
