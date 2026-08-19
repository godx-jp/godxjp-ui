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
 * ButtonRefetch · a Refresh button wired directly to a useQuery result: it spins
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

/** Each card owns its own query so the matrices never refetch in lockstep. */
function useInvoiceQuery(key: string) {
  return useQuery({ queryKey: [key], queryFn: async () => invoices });
}

function Block() {
  const query = useInvoiceQuery("br-invoices");
  return (
    <Card>
      <CardHeader>
        <CardTitle level={2}>請求書 一覧</CardTitle>
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

function VariantBlock() {
  const query = useInvoiceQuery("br-variants");
  return (
    <Card>
      <CardHeader>
        <CardTitle level={2}>variant</CardTitle>
        <CardDescription>
          Button の構造バリアントをそのまま受け取る。既定は outline · ページヘッダーでは outline か
          ghost を使い、default は主要操作のために空けておく。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Flex direction="row" gap="sm" wrap>
          <ButtonRefetch query={query} variant="default" label="default" />
          <ButtonRefetch query={query} variant="secondary" label="secondary" />
          <ButtonRefetch query={query} variant="outline" label="outline" />
          <ButtonRefetch query={query} variant="dashed" label="dashed" />
          <ButtonRefetch query={query} variant="ghost" label="ghost" />
          <ButtonRefetch query={query} variant="destructive" label="destructive" />
          <ButtonRefetch query={query} variant="link" label="link" />
        </Flex>
      </CardContent>
    </Card>
  );
}

function SizeBlock() {
  const query = useInvoiceQuery("br-sizes");
  return (
    <Card>
      <CardHeader>
        <CardTitle level={2}>size</CardTitle>
        <CardDescription>
          テキスト付きの 5 段階と、正方形のアイコンのみ 4 段階。アイコンのみの場合は label
          を外し、aria-label で名前を与える。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Flex direction="col" gap="md">
          <Flex direction="row" gap="sm" wrap>
            <ButtonRefetch query={query} size="xs" label="xs" />
            <ButtonRefetch query={query} size="sm" label="sm" />
            <ButtonRefetch query={query} size="md" label="md" />
            <ButtonRefetch query={query} size="default" label="default" />
            <ButtonRefetch query={query} size="lg" label="lg" />
          </Flex>
          <Flex direction="row" gap="sm" wrap>
            <ButtonRefetch query={query} size="icon-xs" label={null} aria-label="更新 icon-xs" />
            <ButtonRefetch query={query} size="icon-sm" label={null} aria-label="更新 icon-sm" />
            <ButtonRefetch query={query} size="icon" label={null} aria-label="更新 icon" />
            <ButtonRefetch query={query} size="icon-lg" label={null} aria-label="更新 icon-lg" />
          </Flex>
        </Flex>
      </CardContent>
    </Card>
  );
}

function ShapeBlock() {
  const query = useInvoiceQuery("br-shapes");
  return (
    <Card>
      <CardHeader>
        <CardTitle level={2}>shape</CardTitle>
        <CardDescription>
          角の形状。既定は制御半径 · pill は完全な丸み · sharp は直角で、隣接するツールバーの
          角に合わせる。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Flex direction="row" gap="sm" wrap>
          <ButtonRefetch query={query} shape="default" label="default" />
          <ButtonRefetch query={query} shape="pill" label="pill" />
          <ButtonRefetch query={query} shape="sharp" label="sharp" />
        </Flex>
      </CardContent>
    </Card>
  );
}

export default function Demo() {
  return (
    <QueryClientProvider client={queryClient}>
      <PageContainer
        title="ButtonRefetch"
        subtitle="Refresh button bound to a useQuery · spins while fetching"
      >
        <Flex direction="col" gap="lg">
          <Block />
          <VariantBlock />
          <SizeBlock />
          <ShapeBlock />
        </Flex>
      </PageContainer>
    </QueryClientProvider>
  );
}
