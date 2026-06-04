import * as React from "react";
import { MemoryRouter } from "react-router-dom";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Descriptions,
  EmptyState,
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
 * the destination page's useQuery. The `prefetchOn` prop selects the trigger:
 * "both" (default) | "hover" | "focus" | "none". Composed from real @godxjp/ui +
 * @tanstack/react-query + react-router-dom.
 */
const queryClient = new QueryClient();

type Invoice = { id: string; partner: string; status: "active" | "pending" | "draft" };
const invoices: Invoice[] = [
  { id: "INV-0312", partner: "株式会社ベトヤ", status: "active" },
  { id: "INV-0311", partner: "ハノイ物流", status: "pending" },
  { id: "INV-0310", partner: "GMO決済", status: "draft" },
];

const invoiceById = (id: string) => invoices.find((inv) => inv.id === id)!;

/** Destination-page query: a deliberate delay so prefetch (vs cold fetch) is observable. */
async function fetchInvoice(id: string): Promise<Invoice> {
  await new Promise((resolve) => setTimeout(resolve, 1200));
  return invoiceById(id);
}

const invoiceQueryKey = (id: string) => ["invoice", id] as const;

/** List rows — hover/focus a 請求書番号 to prime ["invoice", id]. */
function InvoiceList() {
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
                queryKey={invoiceQueryKey(inv.id)}
                queryFn={() => fetchInvoice(inv.id)}
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

/**
 * Every prefetchOn union value, labelled. "none" never prefetches; "hover" and
 * "focus" prime only on that trigger; "both" (the default) primes on either.
 */
const triggerCases: { value: "hover" | "focus" | "both" | "none"; id: string; copy: string }[] = [
  { value: "both", id: "INV-0312", copy: "既定。ホバーまたはフォーカスで先読み" },
  { value: "hover", id: "INV-0311", copy: "ホバー時のみ先読み" },
  { value: "focus", id: "INV-0310", copy: "キーボードのフォーカス時のみ先読み" },
  { value: "none", id: "INV-0312", copy: "先読みを無効化（通常の Link）" },
];

function TriggerMatrix() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>prefetchOn</TableHead>
          <TableHead>リンク</TableHead>
          <TableHead>挙動</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {triggerCases.map((c) => (
          <TableRow key={c.value}>
            <TableCell>
              <Badge variant="outline">{c.value}</Badge>
            </TableCell>
            <TableCell>
              <PrefetchLink
                to={`/invoices/${c.id}`}
                prefetchOn={c.value}
                queryKey={invoiceQueryKey(c.id)}
                queryFn={() => fetchInvoice(c.id)}
                className="text-primary font-medium hover:underline"
              >
                {c.id}
              </PrefetchLink>
            </TableCell>
            <TableCell>{c.copy}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

/**
 * Observable proof — reads the QueryClient cache directly and lists every
 * ["invoice", id] entry the links above have primed. Updates as you hover/focus.
 */
function CacheObserver() {
  const client = useQueryClient();
  const [, forceRender] = React.useReducer((n: number) => n + 1, 0);

  React.useEffect(() => client.getQueryCache().subscribe(forceRender), [client]);

  const cached = client
    .getQueryCache()
    .getAll()
    .filter((q) => Array.isArray(q.queryKey) && q.queryKey[0] === "invoice");

  if (cached.length === 0) {
    return (
      <EmptyState title="まだ先読みされていません" description="上のリンクにホバーまたはフォーカスしてください。" />
    );
  }

  return (
    <Descriptions
      columns={1}
      items={cached.map((q) => ({
        label: <Badge variant="outline">{JSON.stringify(q.queryKey)}</Badge>,
        value: q.state.status === "success" ? "キャッシュ済み (cached)" : "先読み中… (fetching)",
        mono: true,
      }))}
    />
  );
}

/**
 * Destination block — the SAME queryKey/queryFn contract as the list link.
 * Because the link already primed ["invoice", "INV-0312"], this useQuery resolves
 * from cache (no skeleton) instead of paying the 1.2s fetch.
 */
function DestinationDetail() {
  const query = useQuery({
    queryKey: invoiceQueryKey("INV-0312"),
    queryFn: () => fetchInvoice("INV-0312"),
    staleTime: 60_000,
  });

  if (query.isPending) {
    return <EmptyState title="読み込み中…" description="先読みが間に合えば即時表示されます。" />;
  }

  const inv = query.data!;
  return (
    <Descriptions
      columns={1}
      items={[
        { label: "請求書番号", value: inv.id, mono: true },
        { label: "取引先", value: inv.partner },
        { label: "状態", value: <Badge status={inv.status} /> },
      ]}
    />
  );
}

export default function Demo() {
  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <PageContainer
          title="PrefetchLink"
          subtitle="Router Link that prefetches the destination query on hover/focus"
        >
          <Flex direction="col" gap="lg">
            <Card>
              <CardHeader>
                <CardTitle>請求書 一覧</CardTitle>
                <CardDescription>
                  請求書番号にホバーまたはフォーカスすると、その明細クエリが先読みされ次の画面が即時表示されます。
                </CardDescription>
              </CardHeader>
              <CardContent flush>
                <InvoiceList />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>prefetchOn — トリガーの種類</CardTitle>
                <CardDescription>
                  既定は both。hover / focus / none で先読みのきっかけを切り替えます。
                </CardDescription>
              </CardHeader>
              <CardContent flush>
                <TriggerMatrix />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>先読みキャッシュ（観測）</CardTitle>
                <CardDescription>
                  QueryClient のキャッシュから ["invoice", id] を直接読み出して表示します。
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CacheObserver />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>遷移先の明細（契約）</CardTitle>
                <CardDescription>
                  リンクと同じ queryKey/queryFn を使う useQuery。先読み済みならキャッシュから即時解決します。
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DestinationDetail />
              </CardContent>
            </Card>
          </Flex>
        </PageContainer>
      </MemoryRouter>
    </QueryClientProvider>
  );
}
