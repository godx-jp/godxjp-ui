import { QueryClient, QueryClientProvider, useInfiniteQuery } from "@tanstack/react-query";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  Timeline,
  type TimelineItem,
} from "@godxjp/ui/data-display";
import { SkeletonTable } from "@godxjp/ui/feedback";
import { Flex, PageContainer } from "@godxjp/ui/layout";
import { InfiniteQueryState, flattenItemPages } from "@godxjp/ui/query";

/**
 * InfiniteQueryState — useInfiniteQuery widget: flattens pages, renders the
 * skeleton/empty/error states, and a built-in load-more footer. Use
 * flattenItemPages for `{ items }` pages. Composed from real @godxjp/ui +
 * @tanstack/react-query.
 */
const queryClient = new QueryClient();

type Activity = { id: string; text: string; actor: string; time: string };
const feed: Activity[] = [
  { id: "a1", text: "請求書 INV-0312 を承認", actor: "経理 田中", time: "10:24" },
  { id: "a2", text: "仕訳 #2024-0312 を作成", actor: "システム", time: "10:20" },
  { id: "a3", text: "請求書 INV-0312 を発行", actor: "営業 グエン", time: "09:50" },
  { id: "a4", text: "受注 ORD-0455 を登録", actor: "営業 グエン", time: "09:30" },
  { id: "a5", text: "取引先 BTY-0012 を更新", actor: "管理 佐藤", time: "09:10" },
];

const PAGE = 3;

function Block() {
  const query = useInfiniteQuery({
    queryKey: ["activity-feed"],
    queryFn: async ({ pageParam }) => {
      const start = pageParam;
      return {
        items: feed.slice(start, start + PAGE),
        nextCursor: start + PAGE < feed.length ? start + PAGE : null,
      };
    },
    initialPageParam: 0,
    getNextPageParam: (last) => last.nextCursor,
  });

  return (
    <InfiniteQueryState
      query={query}
      skeleton={<SkeletonTable />}
      flatten={flattenItemPages}
      isEmpty={(items) => items.length === 0}
      empty={<EmptyState title="アクティビティがありません" />}
    >
      {(items) => (
        <Timeline
          items={items.map<TimelineItem>((a, i) => ({
            title: a.text,
            location: a.actor,
            time: a.time,
            current: i === 0,
          }))}
        />
      )}
    </InfiniteQueryState>
  );
}

export default function Demo() {
  return (
    <QueryClientProvider client={queryClient}>
      <PageContainer
        title="InfiniteQueryState"
        subtitle="useInfiniteQuery — flatten pages + load-more footer"
      >
        <Flex direction="col" gap="lg">
          <Card>
            <CardHeader>
              <CardTitle>アクティビティ</CardTitle>
              <CardDescription>Click 「もっと見る」 to append the next page.</CardDescription>
            </CardHeader>
            <CardContent>
              <Block />
            </CardContent>
          </Card>
        </Flex>
      </PageContainer>
    </QueryClientProvider>
  );
}
