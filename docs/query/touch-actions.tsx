import { useState } from "react";
import {
  AlertMutationFeedback,
  ButtonRefetch,
  DataState,
  InfiniteQueryState,
} from "@godxjp/ui/query";
import { PageContainer } from "@godxjp/ui/layout";

export default function Demo() {
  const [retry, setRetry] = useState(0);
  const [more, setMore] = useState(0);
  const [mutation, setMutation] = useState(0);
  const [refresh, setRefresh] = useState(0);
  const errorQuery = {
    isPending: false,
    isError: true,
    isFetching: false,
    error: new Error("503 Service unavailable"),
    refetch: async () => ({}),
  } as never;
  const infinite = {
    isPending: false,
    isError: false,
    isFetching: false,
    isFetchingNextPage: false,
    data: { pages: [{ items: ["one"] }], pageParams: [0] },
    hasNextPage: true,
    fetchNextPage: async () => {
      setMore((n) => n + 1);
      return {} as never;
    },
  } as never;
  return (
    <PageContainer title="Query touch actions">
      <DataState query={errorQuery} skeleton={null} onRetry={() => setRetry((n) => n + 1)}>
        {() => null}
      </DataState>
      <output aria-label="Retry result">{retry}</output>
      <InfiniteQueryState
        query={infinite}
        skeleton={null}
        flatten={(data: { pages: { items: string[] }[] }) => data.pages.flatMap((p) => p.items)}
      >
        {() => null}
      </InfiniteQueryState>
      <output aria-label="Load more result">{more}</output>
      <AlertMutationFeedback
        mutation={{ isPending: false, isError: true, error: new Error("503") } as never}
        onRetry={() => setMutation((n) => n + 1)}
      />
      <output aria-label="Mutation result">{mutation}</output>
      <ButtonRefetch
        query={
          {
            isFetching: false,
            refetch: async () => {
              setRefresh((n) => n + 1);
              return {} as never;
            },
          } as never
        }
        label="Refresh touch"
      />
      <output aria-label="Refresh result">{refresh}</output>
    </PageContainer>
  );
}
