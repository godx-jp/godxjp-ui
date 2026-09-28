import { useState } from "react";
import { QueryClient, QueryClientProvider, useQuery, useQueryClient } from "@tanstack/react-query";

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
import { Button, Text } from "@godxjp/ui/general";
import { Flex, PageContainer } from "@godxjp/ui/layout";
import { AuthExpiryProvider, DataState } from "@godxjp/ui/query";

/**
 * DataState · drives skeleton / error / empty / success for ONE useQuery block.
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

/** Loads for 2s and comes back empty — the whole lifecycle: skeleton → EmptyState. */
const LOAD_MS = 2000;

function LoadingBlock() {
  const client = useQueryClient();
  const query = useQuery({
    queryKey: ["ds-loading"],
    queryFn: () => new Promise<Invoice[]>((resolve) => setTimeout(() => resolve([]), LOAD_MS)),
  });
  return (
    <Flex direction="col" gap="sm">
      <DataState
        query={query}
        skeleton={<SkeletonTable rows={4} columns={3} />}
        isEmpty={(d) => d.length === 0}
        empty={
          <EmptyState title="データがありません" description="条件に合う請求書はありません。" />
        }
      >
        {(d) => <DataTable data={d} columns={columns} getRowId={(r) => r.id} />}
      </DataState>
      {/* resetQueries puts the query back to pending, so the skeleton plays again. */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => void client.resetQueries({ queryKey: ["ds-loading"] })}
      >
        もう一度読み込む
      </Button>
    </Flex>
  );
}

function ErrorBlock() {
  const query = useQuery<Invoice[]>({
    queryKey: ["ds-error"],
    queryFn: async () => {
      throw new Error("サーバーエラー (503) · 取得に失敗しました");
    },
  });
  return (
    <DataState query={query} skeleton={<SkeletonTable />}>
      {(d) => <DataTable data={d} columns={columns} getRowId={(r) => r.id} />}
    </DataState>
  );
}

function PrerequisiteBlock() {
  // A tenant-scoped query stays disabled until an organization is selected (`enabled:false`).
  // It reads as pending with fetchStatus "idle" — DataState shows the prerequisite, not a skeleton.
  const query = useQuery<Invoice[]>({
    queryKey: ["ds-prerequisite"],
    queryFn: async () => invoices,
    enabled: false,
  });
  return (
    <DataState
      query={query}
      skeleton={<SkeletonTable />}
      prerequisite={
        <EmptyState
          title="組織を選択してください"
          description="表示するデータを絞り込むために組織を選択してください。"
        />
      }
    >
      {(d) => <DataTable data={d} columns={columns} getRowId={(r) => r.id} />}
    </DataState>
  );
}

function ExpiredSessionQuery({ queryKey }: { queryKey: string }) {
  const query = useQuery<Invoice[]>({
    queryKey: [queryKey],
    queryFn: async () => {
      throw Object.assign(new Error("Access token expired"), { status: 401 });
    },
  });
  return (
    <DataState query={query} skeleton={<SkeletonTable rows={3} />}>
      {(d) => <DataTable data={d} columns={columns} getRowId={(r) => r.id} />}
    </DataState>
  );
}

function AuthExpiryBlock() {
  // The app root owns session expiry (gh#1022). A real app redirects to the IdP here:
  //   window.location.assign(`/auth/login?return_to=${encodeURIComponent(location.href)}`)
  // Two queries 401 at once — the handler still runs exactly once, and no alert is painted.
  const [calls, setCalls] = useState(0);
  return (
    <AuthExpiryProvider onAuthExpired={() => setCalls((n) => n + 1)}>
      <Flex direction="col" gap="md">
        <Text size="sm" tone="muted">
          onAuthExpired calls: {calls}
        </Text>
        <ExpiredSessionQuery queryKey="ds-auth-expiry-a" />
        <ExpiredSessionQuery queryKey="ds-auth-expiry-b" />
      </Flex>
    </AuthExpiryProvider>
  );
}

function AuthErrorBlock() {
  // Without an AuthExpiryProvider: the proportionate fallback — a neutral sign-in prompt.
  const query = useQuery<Invoice[]>({
    queryKey: ["ds-auth-error"],
    queryFn: async () => {
      throw new Error("Access token invalid");
    },
  });
  return (
    <DataState
      query={query}
      skeleton={<SkeletonTable />}
      onAuthError={() => window.location.assign("/login")}
    >
      {(d) => <DataTable data={d} columns={columns} getRowId={(r) => r.id} />}
    </DataState>
  );
}

export default function Demo() {
  return (
    <QueryClientProvider client={queryClient}>
      <PageContainer
        title="DataState"
        subtitle="useQuery lifecycle · skeleton / error / empty / success in one widget"
      >
        <Flex direction="col" gap="lg">
          <Card>
            <CardHeader>
              <CardTitle level={2}>Success</CardTitle>
              <CardDescription>
                Resolved data renders through the children function.
              </CardDescription>
            </CardHeader>
            <CardContent flush>
              <SuccessBlock />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle level={2}>Loading → empty</CardTitle>
              <CardDescription>
                The skeleton (animated) renders while pending; when the data arrives empty the
                skeleton goes away and the `empty` slot renders.
              </CardDescription>
            </CardHeader>
            <CardContent flush>
              <LoadingBlock />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle level={2}>Prerequisite (disabled query)</CardTitle>
              <CardDescription>
                An `enabled:false` query is unstarted, not loading. The prerequisite slot renders
                instead of an endless skeleton.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PrerequisiteBlock />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle level={2}>Error · transient (retry)</CardTitle>
              <CardDescription>
                A 5xx/network failure is retryable, so AlertQueryError offers Retry automatically.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ErrorBlock />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle level={2}>Session expired · AuthExpiryProvider (recommended)</CardTitle>
              <CardDescription>
                Mount `AuthExpiryProvider` once at the app root. A 401 calls `onAuthExpired`
                automatically, once for any number of simultaneous 401s, while each DataState keeps
                its skeleton and announces the redirect to sign-in through a live region.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AuthExpiryBlock />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle level={2}>Session expired · fallback without a provider</CardTitle>
              <CardDescription>
                Without a provider a 401 renders a neutral, width-capped sign-in prompt whose button
                calls `onAuthError`. It never offers a blind retry or shows the raw token message.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AuthErrorBlock />
            </CardContent>
          </Card>
        </Flex>
      </PageContainer>
    </QueryClientProvider>
  );
}
