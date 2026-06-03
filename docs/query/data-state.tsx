import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";

import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  DataTable,
  EmptyState,
  type ColumnDef,
} from "@godxjp/ui/data-display";
import { SkeletonTable } from "@godxjp/ui/feedback";
import { Flex, PageContainer } from "@godxjp/ui/layout";
import { DataState } from "@godxjp/ui/query";

/**
 * DataState — drives skeleton / error / empty / success for ONE useQuery block.
 * It IS the conditional; never branch on isPending/isError yourself. Composed
 * only from real @godxjp/ui components + @tanstack/react-query.
 */
const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

type Invoice = { id: string; partner: string; status: "active" | "pending" };

const invoices: Invoice[] = [
  { id: "INV-0312", partner: "株式会社ベトヤ", status: "active" },
  { id: "INV-0311", partner: "ハノイ物流", status: "pending" },
];

const columns: ColumnDef<Invoice>[] = [
  { key: "id", header: "請求書番号" },
  { key: "partner", header: "取引先" },
  { key: "status", header: "状態", render: (row) => <Badge status={row.status} /> },
];

function SuccessBlock() {
  const query = useQuery({ queryKey: ["ds-success"], queryFn: async () => invoices });
  return (
    <DataState
      query={query}
      skeleton={<SkeletonTable />}
      isEmpty={(d) => d.length === 0}
      empty={<EmptyState title="データがありません" />}
    >
      {(d) => <DataTable data={d} columns={columns} getRowId={(r) => r.id} />}
    </DataState>
  );
}

function LoadingBlock() {
  const query = useQuery({ queryKey: ["ds-loading"], queryFn: () => new Promise<Invoice[]>(() => {}) });
  return (
    <DataState query={query} skeleton={<SkeletonTable />}>
      {(d) => <DataTable data={d} columns={columns} getRowId={(r) => r.id} />}
    </DataState>
  );
}

function ErrorBlock() {
  const query = useQuery<Invoice[]>({
    queryKey: ["ds-error"],
    queryFn: async () => {
      throw new Error("サーバーエラー (503) — 取得に失敗しました");
    },
  });
  return (
    <DataState query={query} skeleton={<SkeletonTable />}>
      {(d) => <DataTable data={d} columns={columns} getRowId={(r) => r.id} />}
    </DataState>
  );
}

export default function Demo() {
  return (
    <QueryClientProvider client={queryClient}>
      <PageContainer title="DataState" subtitle="useQuery lifecycle — skeleton / error / empty / success in one widget">
        <Flex direction="col" gap="lg">
          <Card>
            <CardHeader>
              <CardTitle>Success</CardTitle>
              <CardDescription>Resolved data renders through the children function.</CardDescription>
            </CardHeader>
            <CardContent flush>
              <SuccessBlock />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Loading (skeleton)</CardTitle>
              <CardDescription>The skeleton prop renders during the pending phase.</CardDescription>
            </CardHeader>
            <CardContent flush>
              <LoadingBlock />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Error (retry)</CardTitle>
              <CardDescription>Built-in AlertQueryError + retry on failure.</CardDescription>
            </CardHeader>
            <CardContent>
              <ErrorBlock />
            </CardContent>
          </Card>
        </Flex>
      </PageContainer>
    </QueryClientProvider>
  );
}
