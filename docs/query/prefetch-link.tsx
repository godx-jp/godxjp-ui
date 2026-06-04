import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@godxjp/ui/data-display";
import { Flex, PageContainer } from "@godxjp/ui/layout";
import { PrefetchLink } from "@godxjp/ui/query";

/**
 * PrefetchLink — a React Router Link that fires queryClient.prefetchQuery on
 * hover/focus so the detail page renders instantly on click. Requires a
 * QueryClientProvider (and a Router) in context. The queryKey/queryFn must match
 * the destination page's useQuery. Composed from real @godxjp/ui +
 * @tanstack/react-query + react-router-dom.
 */
const queryClient = new QueryClient();

type Invoice = { id: string; partner: string; status: "active" | "pending" | "draft" };
const invoices: Invoice[] = [
  { id: "INV-0312", partner: "株式会社ベトヤ", status: "active" },
  { id: "INV-0311", partner: "ハノイ物流", status: "pending" },
  { id: "INV-0310", partner: "GMO決済", status: "draft" },
];

function Block() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>請求書番号</TableHead>
          <TableHead>取引先</TableHead>
          <TableHead>状態</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((inv) => (
          <TableRow key={inv.id}>
            <TableCell>
              <PrefetchLink
                to={`/invoices/${inv.id}`}
                queryKey={["invoice", inv.id]}
                queryFn={async () => inv}
                staleTime={60_000}
                className="text-primary font-medium hover:underline"
              >
                {inv.id}
              </PrefetchLink>
            </TableCell>
            <TableCell>{inv.partner}</TableCell>
            <TableCell>
              <Badge status={inv.status} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default function Demo() {
  return (
    <QueryClientProvider client={queryClient}>
      <PageContainer
        title="PrefetchLink"
        subtitle="Router Link that prefetches the destination query on hover/focus"
      >
        <Flex direction="col" gap="lg">
          <Card>
            <CardHeader>
              <CardTitle>請求書 一覧</CardTitle>
              <CardDescription>
                Hover a 請求書番号 — its detail query is prefetched so the next page is instant.
              </CardDescription>
            </CardHeader>
            <CardContent flush>
              <Block />
            </CardContent>
          </Card>
        </Flex>
      </PageContainer>
    </QueryClientProvider>
  );
}
