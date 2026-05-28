import { useInfiniteQuery } from "@tanstack/react-query";

import { SkeletonRows } from "@godxjp/ui/feedback";
import { InfiniteQueryState } from "@godxjp/ui/query";

type Page = { items: string[]; nextCursor?: number };

export default function Demo() {
  const query = useInfiniteQuery<Page>({
    queryKey: ["query-infinite-feed"],
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      Promise.resolve({
        items: [`Scan accepted #${Number(pageParam) + 1}`],
        nextCursor: undefined,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  return (
    <InfiniteQueryState
      query={query}
      skeleton={<SkeletonRows rows={3} />}
      empty={<p>Không có activity.</p>}
      flatten={(data) => data.pages.flatMap((page) => page.items)}
    >
      {(items) => (
        <ul className="grid max-w-md gap-2">
          {items.map((item) => (
            <li key={item} className="rounded-md border px-3 py-2 text-sm">
              {item}
            </li>
          ))}
        </ul>
      )}
    </InfiniteQueryState>
  );
}
