import { describe, expect, it, vi } from "vitest";
import type { InfiniteData, UseInfiniteQueryResult } from "@tanstack/react-query";
import { renderWithUi, screen } from "@/test/render";

import { InfiniteQueryState, flattenItemPages } from "../infinite-query-state";

/**
 * gh#1044 (1) — the built-in load-more button always read 「さらに読み込む」. A consumer paging an
 * activity log needs 「さらに表示」 or 「さらに古い版を表示」, and the only escape was `loadMore`,
 * which replaces the whole footer and makes the consumer re-implement the pending state.
 */
type Page = { items: string[] };

const query = (over: Record<string, unknown> = {}) =>
  ({
    isPending: false,
    isError: false,
    isFetching: false,
    isFetchingNextPage: false,
    data: { pages: [{ items: ["a"] }], pageParams: [undefined] },
    hasNextPage: true,
    fetchNextPage: vi.fn(() => Promise.resolve({})),
    ...over,
  }) as unknown as UseInfiniteQueryResult<InfiniteData<Page>, Error>;

function renderState(q: ReturnType<typeof query>) {
  return renderWithUi(
    <InfiniteQueryState<Page, string[]>
      query={q}
      skeleton={null}
      flatten={(d) => flattenItemPages(d)}
      loadMoreLabel="さらに古い版を表示"
    >
      {(items) => items.map((item) => <p key={item}>{item}</p>)}
    </InfiniteQueryState>,
  );
}

describe("InfiniteQueryState · loadMoreLabel (gh#1044)", () => {
  it("names the built-in button with the consumer's label", () => {
    renderState(query());
    expect(screen.getByRole("button", { name: "さらに古い版を表示" })).toBeEnabled();
  });

  it("keeps the component's own pending state while the next page loads", () => {
    renderState(query({ isFetchingNextPage: true }));
    const button = screen.getByRole("button", { name: /working|処理中|đang/i });
    expect(button).toBeDisabled();
    expect(screen.queryByRole("button", { name: "さらに古い版を表示" })).toBeNull();
  });
});
