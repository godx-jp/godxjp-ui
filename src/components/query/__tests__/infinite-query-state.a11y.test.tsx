import { describe, it } from "vitest";
import type { InfiniteData, UseInfiniteQueryResult } from "@tanstack/react-query";
import { InfiniteQueryState, flattenItemPages } from "../infinite-query-state";
import { EmptyState } from "../../data-display/empty-state";
import { expectNoA11yViolations } from "@/test/a11y";

type Page = { items: string[] };

function mockInfiniteQuery(
  partial: Record<string, unknown>,
): UseInfiniteQueryResult<InfiniteData<Page>, Error> {
  return partial as unknown as UseInfiniteQueryResult<InfiniteData<Page>, Error>;
}

// InfiniteQueryState covers loading / error / empty / loaded-with-load-more — the
// load-more footer button and the error alert/retry must stay accessible.
describe("InfiniteQueryState a11y", () => {
  it("loading (skeleton) has no axe violations", async () => {
    await expectNoA11yViolations(
      <InfiniteQueryState<Page, string[]>
        query={mockInfiniteQuery({ isPending: true, isError: false })}
        skeleton={<p>Đang tải…</p>}
        flatten={(d) => flattenItemPages(d)}
      >
        {() => null}
      </InfiniteQueryState>,
    );
  });

  it("error state (alert + retry) has no axe violations", async () => {
    await expectNoA11yViolations(
      <InfiniteQueryState<Page, string[]>
        query={mockInfiniteQuery({
          isPending: false,
          isError: true,
          isFetching: false,
          isFetchingNextPage: false,
          error: new Error("GET /v1/activity failed: 500"),
          refetch: () => Promise.resolve({}),
        })}
        skeleton={<p>Đang tải…</p>}
        flatten={(d) => flattenItemPages(d)}
      >
        {() => null}
      </InfiniteQueryState>,
    );
  });

  it("empty state has no axe violations", async () => {
    await expectNoA11yViolations(
      <InfiniteQueryState<Page, string[]>
        query={mockInfiniteQuery({
          isPending: false,
          isError: false,
          data: { pages: [{ items: [] }], pageParams: [undefined] },
          hasNextPage: false,
        })}
        skeleton={<p>Đang tải…</p>}
        empty={<EmptyState title="Chưa có hoạt động" />}
        flatten={(d) => flattenItemPages(d)}
        isEmpty={(flat) => flat.length === 0}
      >
        {() => null}
      </InfiniteQueryState>,
    );
  });

  it("loaded with a load-more footer has no axe violations", async () => {
    await expectNoA11yViolations(
      <InfiniteQueryState<Page, string[]>
        query={mockInfiniteQuery({
          isPending: false,
          isError: false,
          isFetchingNextPage: false,
          data: { pages: [{ items: ["a-1", "a-2"] }], pageParams: [undefined] },
          hasNextPage: true,
          fetchNextPage: () => Promise.resolve({}),
        })}
        skeleton={<p>Đang tải…</p>}
        flatten={(d) => flattenItemPages(d)}
      >
        {(items) => (
          <ul>
            {items.map((id) => (
              <li key={id}>{id}</li>
            ))}
          </ul>
        )}
      </InfiniteQueryState>,
    );
  });
});
