import { useInfiniteQuery } from "@tanstack/react-query";

import { InfiniteQueryState, flattenItemPages } from "@godxjp/ui/query";

type Page = {
  items: string[];
  nextCursor?: number;
};

export default function Demo() {
  const query = useInfiniteQuery({
    queryKey: ["primitive-infinite-query-state"],
    queryFn: ({ pageParam = 0 }) =>
      Promise.resolve<Page>({
        items: pageParam === 0 ? ["item 1", "item 2"] : ["item 3"],
        nextCursor: pageParam === 0 ? 1 : undefined,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  return (
    <InfiniteQueryState<Page, string[]>
      query={query}
      skeleton={<div>Skeleton</div>}
      empty={<div>Empty</div>}
      flatten={flattenItemPages}
    >
      {(items) => <div>{items.join(", ")}</div>}
    </InfiniteQueryState>
  );
}
