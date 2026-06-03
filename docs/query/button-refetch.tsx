import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";

import {
  Badge,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  DataTable,
  type ColumnDef,
} from "@godxjp/ui/data-display";
import { Flex, PageContainer } from "@godxjp/ui/layout";
import { ButtonRefetch } from "@godxjp/ui/query";

/**
 * ButtonRefetch — a Refresh button wired directly to a useQuery result: it spins
 * and auto-disables while query.isFetching and calls query.refetch() on click.
 * Never pass onClick/disabled yourself. Composed from real @godxjp/ui +
 * @tanstack/react-query.
 */
const queryClient = new QueryClient();

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

function Block() {
  const query = useQuery({ queryKey: ["br-invoices"], queryFn: async () => invoices });
  return (
    <Card>
      <CardHeader>
        <CardTitle>請求書 一覧</CardTitle>
        <CardDescription>The header Refresh button is bound to the query.</CardDescription>
        <CardAction>
          <ButtonRefetch query={query} label="更新" />
        </CardAction>
      </CardHeader>
      <CardContent flush>
        <DataTable
          data={query.data ?? []}
          columns={columns}
          getRowId={(r) => r.id}
          loading={query.isPending}
        />
      </CardContent>
    </Card>
  );
}

export default function Demo() {
  return (
    <QueryClientProvider client={queryClient}>
      <PageContainer title="ButtonRefetch" subtitle="Refresh button bound to a useQuery — spins while fetching">
        <Flex direction="col" gap="lg">
          <Block />
        </Flex>
      </PageContainer>
    </QueryClientProvider>
  );
}
