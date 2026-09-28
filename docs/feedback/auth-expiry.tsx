import { useState } from "react";
import { QueryClient, QueryClientProvider, useMutation, useQuery } from "@tanstack/react-query";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  DataTable,
  type ColumnDef,
} from "@godxjp/ui/data-display";
import { SkeletonTable } from "@godxjp/ui/feedback";
import { Button, Text } from "@godxjp/ui/general";
import { useTranslation } from "@godxjp/ui/i18n";
import { Flex, PageContainer } from "@godxjp/ui/layout";
import { AlertMutationFeedback, AuthExpiryProvider, DataState } from "@godxjp/ui/query";

/**
 * AuthExpiryProvider · the app root owns an expired session (gh#1022). Every DataState /
 * InfiniteQueryState / AlertMutationFeedback / AlertQueryError underneath calls `onAuthExpired`
 * automatically, once for any number of simultaneous 401s, and shows a neutral pending state
 * instead of an error alert. A real app redirects to its IdP here:
 *   window.location.assign(`/auth/login?return_to=${encodeURIComponent(location.href)}`)
 */
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
});

type Member = { id: string; name: string };

const expired = () => Object.assign(new Error("Access token expired"), { status: 401 });

function MembersCard() {
  const { t } = useTranslation();
  const columns: ColumnDef<Member>[] = [
    { key: "id", header: "ID" },
    { key: "name", header: t("authExpiryDocs.nameColumn") },
  ];
  const query = useQuery<Member[]>({
    queryKey: ["auth-expiry-members"],
    queryFn: async () => {
      throw expired();
    },
  });
  return (
    <Card>
      <CardHeader>
        <CardTitle level={2}>{t("authExpiryDocs.membersTitle")}</CardTitle>
        <CardDescription>A 401 keeps the skeleton and announces the redirect.</CardDescription>
      </CardHeader>
      <CardContent flush>
        <DataState query={query} skeleton={<SkeletonTable rows={3} columns={2} />}>
          {(d) => <DataTable data={d} columns={columns} getRowId={(r) => r.id} />}
        </DataState>
      </CardContent>
    </Card>
  );
}

function InviteCard() {
  const { t } = useTranslation();
  const mutation = useMutation({
    mutationFn: async () => {
      throw expired();
    },
  });
  return (
    <Card>
      <CardHeader>
        <CardTitle level={2}>{t("authExpiryDocs.inviteTitle")}</CardTitle>
        <CardDescription>A 401 on submit shows a muted status line, not an alert.</CardDescription>
      </CardHeader>
      <CardContent>
        <Flex direction="col" gap="md" align="start">
          <Button onClick={() => mutation.mutate()}>{t("authExpiryDocs.send")}</Button>
          <AlertMutationFeedback mutation={mutation} />
        </Flex>
      </CardContent>
    </Card>
  );
}

export default function Demo() {
  const [calls, setCalls] = useState(0);
  return (
    <QueryClientProvider client={queryClient}>
      <AuthExpiryProvider onAuthExpired={() => setCalls((n) => n + 1)}>
        <PageContainer
          title="AuthExpiryProvider"
          subtitle="Expired session handled once at the app root, never as a page error"
        >
          <Flex direction="col" gap="lg">
            <Text size="sm" tone="muted">
              onAuthExpired calls: {calls}
            </Text>
            <MembersCard />
            <InviteCard />
          </Flex>
        </PageContainer>
      </AuthExpiryProvider>
    </QueryClientProvider>
  );
}
