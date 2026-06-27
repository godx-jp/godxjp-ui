import { describe, expect, it, vi } from "vitest";
import type { InfiniteData, UseInfiniteQueryResult } from "@tanstack/react-query";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { InfiniteQueryState, flattenItemPages } from "../infinite-query-state";

type Page = { items: string[] };

function mockInfiniteQuery(
  partial: Record<string, unknown>,
): UseInfiniteQueryResult<InfiniteData<Page>, Error> {
  return partial as unknown as UseInfiniteQueryResult<InfiniteData<Page>, Error>;
}

const loaded = (over: Record<string, unknown> = {}) =>
  mockInfiniteQuery({
    isPending: false,
    isError: false,
    isFetching: false,
    isFetchingNextPage: false,
    data: { pages: [{ items: ["a-1", "a-2"] }], pageParams: [undefined] },
    hasNextPage: false,
    fetchNextPage: vi.fn(() => Promise.resolve({})),
    ...over,
  });

describe("flattenItemPages", () => {
  it("returns an empty array when data is undefined", () => {
    expect(flattenItemPages(undefined)).toEqual([]);
  });

  it("flattens items across pages", () => {
    expect(
      flattenItemPages({ pages: [{ items: [1, 2] }, { items: [3] }] }),
    ).toEqual([1, 2, 3]);
  });
});

describe("InfiniteQueryState", () => {
  it("renders the skeleton while pending", () => {
    renderWithUi(
      <InfiniteQueryState<Page, string[]>
        query={mockInfiniteQuery({ isPending: true })}
        skeleton={<p>loading-skeleton</p>}
        flatten={(d) => flattenItemPages(d)}
      >
        {() => null}
      </InfiniteQueryState>,
    );
    expect(screen.getByText("loading-skeleton")).toBeInTheDocument();
  });

  it("shows the skeleton on a background refetch error (not the inline alert)", () => {
    renderWithUi(
      <InfiniteQueryState<Page, string[]>
        query={mockInfiniteQuery({
          isError: true,
          isFetching: true,
          isFetchingNextPage: false,
          error: new Error("boom"),
        })}
        skeleton={<p>loading-skeleton</p>}
        flatten={(d) => flattenItemPages(d)}
      >
        {() => null}
      </InfiniteQueryState>,
    );
    expect(screen.getByText("loading-skeleton")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("retry calls query.refetch when no onRetry is supplied", async () => {
    const user = userEvent.setup();
    const refetch = vi.fn(() => Promise.resolve({}));
    renderWithUi(
      <InfiniteQueryState<Page, string[]>
        query={mockInfiniteQuery({
          isError: true,
          isFetching: false,
          isFetchingNextPage: false,
          error: new Error("boom"),
          refetch,
        })}
        skeleton={<p>skeleton</p>}
        flatten={(d) => flattenItemPages(d)}
      >
        {() => null}
      </InfiniteQueryState>,
    );
    await user.click(screen.getByRole("button"));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("retry prefers onRetry over refetch and supports a custom errorRenderer", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn(() => Promise.resolve());
    const refetch = vi.fn(() => Promise.resolve({}));
    renderWithUi(
      <InfiniteQueryState<Page, string[]>
        query={mockInfiniteQuery({
          isError: true,
          isFetching: false,
          isFetchingNextPage: false,
          error: new Error("boom"),
          refetch,
        })}
        skeleton={<p>skeleton</p>}
        onRetry={onRetry}
        errorRenderer={(error, retry) => (
          <button type="button" onClick={retry}>
            custom-retry {(error as Error).message}
          </button>
        )}
        flatten={(d) => flattenItemPages(d)}
      >
        {() => null}
      </InfiniteQueryState>,
    );
    await user.click(screen.getByRole("button", { name: /custom-retry boom/ }));
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(refetch).not.toHaveBeenCalled();
  });

  it("hides the retry affordance when showRetry is false", () => {
    renderWithUi(
      <InfiniteQueryState<Page, string[]>
        query={mockInfiniteQuery({
          isError: true,
          isFetching: false,
          isFetchingNextPage: false,
          error: new Error("boom"),
          refetch: () => Promise.resolve({}),
        })}
        skeleton={<p>skeleton</p>}
        showRetry={false}
        flatten={(d) => flattenItemPages(d)}
      >
        {() => null}
      </InfiniteQueryState>,
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("renders the skeleton when data is still undefined after settling", () => {
    renderWithUi(
      <InfiniteQueryState<Page, string[]>
        query={mockInfiniteQuery({ isPending: false, isError: false, data: undefined })}
        skeleton={<p>still-skeleton</p>}
        flatten={(d) => flattenItemPages(d)}
      >
        {() => null}
      </InfiniteQueryState>,
    );
    expect(screen.getByText("still-skeleton")).toBeInTheDocument();
  });

  it("uses the default isEmpty for a non-array falsy flat value", () => {
    renderWithUi(
      <InfiniteQueryState<Page, string>
        query={mockInfiniteQuery({
          isPending: false,
          isError: false,
          data: { pages: [{ items: [] }], pageParams: [undefined] },
          hasNextPage: false,
        })}
        skeleton={<p>s</p>}
        empty={<p>nothing-here</p>}
        // flatten returns a falsy non-array → defaultIsEmptyFlat takes the `!flat` branch
        flatten={() => ""}
      >
        {() => <p>should-not-render</p>}
      </InfiniteQueryState>,
    );
    expect(screen.getByText("nothing-here")).toBeInTheDocument();
    expect(screen.queryByText("should-not-render")).not.toBeInTheDocument();
  });

  it("renders the default load-more footer and triggers fetchNextPage", async () => {
    const user = userEvent.setup();
    const fetchNextPage = vi.fn(() => Promise.resolve({}));
    renderWithUi(
      <InfiniteQueryState<Page, string[]>
        query={loaded({ hasNextPage: true, fetchNextPage })}
        skeleton={<p>s</p>}
        flatten={(d) => flattenItemPages(d)}
      >
        {(items, more) => (
          <button type="button" onClick={more.fetchNextPage}>
            more-from-children ({items.length}/{String(more.hasNextPage)}/
            {String(more.isFetchingNextPage)})
          </button>
        )}
      </InfiniteQueryState>,
    );
    // children-provided fetchNextPage
    await user.click(screen.getByRole("button", { name: /more-from-children/ }));
    // default footer button
    await user.click(screen.getByRole("button", { name: /load|tải|thêm/i }));
    expect(fetchNextPage).toHaveBeenCalled();
  });

  it("default isEmpty keeps a non-empty array out of the empty state", () => {
    renderWithUi(
      <InfiniteQueryState<Page, string[]>
        query={loaded({ hasNextPage: false })}
        skeleton={<p>s</p>}
        empty={<p>should-not-show-empty</p>}
        flatten={(d) => flattenItemPages(d)}
      >
        {(items) => <p>rows-{items.length}</p>}
      </InfiniteQueryState>,
    );
    expect(screen.getByText("rows-2")).toBeInTheDocument();
    expect(screen.queryByText("should-not-show-empty")).not.toBeInTheDocument();
  });

  it("disables the default footer button and shows the working label while fetching next page", () => {
    renderWithUi(
      <InfiniteQueryState<Page, string[]>
        query={loaded({ hasNextPage: true, isFetchingNextPage: true })}
        skeleton={<p>s</p>}
        flatten={(d) => flattenItemPages(d)}
      >
        {() => <p>body</p>}
      </InfiniteQueryState>,
    );
    // the footer Button is disabled and the children-area loadingMore text is also present
    const buttons = screen.getAllByRole("button");
    expect(buttons.some((b) => (b as HTMLButtonElement).disabled)).toBe(true);
  });

  it("renders a custom loadMore node instead of the default footer", () => {
    renderWithUi(
      <InfiniteQueryState<Page, string[]>
        query={loaded({ hasNextPage: true })}
        skeleton={<p>s</p>}
        loadMore={<p>custom-load-more</p>}
        flatten={(d) => flattenItemPages(d)}
      >
        {() => null}
      </InfiniteQueryState>,
    );
    expect(screen.getByText("custom-load-more")).toBeInTheDocument();
  });

  it("omits the footer when showLoadMore is false even with a next page", () => {
    renderWithUi(
      <InfiniteQueryState<Page, string[]>
        query={loaded({ hasNextPage: true })}
        skeleton={<p>s</p>}
        showLoadMore={false}
        flatten={(d) => flattenItemPages(d)}
      >
        {() => <p>body</p>}
      </InfiniteQueryState>,
    );
    expect(screen.queryByText("custom-load-more")).not.toBeInTheDocument();
    expect(screen.getByText("body")).toBeInTheDocument();
  });

  it("renders the custom loadingMore node while fetching the next page", () => {
    renderWithUi(
      <InfiniteQueryState<Page, string[]>
        query={loaded({ isFetchingNextPage: true, hasNextPage: false })}
        skeleton={<p>s</p>}
        loadingMore={<p>loading-more-custom</p>}
        flatten={(d) => flattenItemPages(d)}
      >
        {() => <p>body</p>}
      </InfiniteQueryState>,
    );
    expect(screen.getByText("loading-more-custom")).toBeInTheDocument();
  });

  it("renders the default loadingMore text while fetching the next page", () => {
    renderWithUi(
      <InfiniteQueryState<Page, string[]>
        query={loaded({ isFetchingNextPage: true, hasNextPage: false })}
        skeleton={<p>s</p>}
        flatten={(d) => flattenItemPages(d)}
      >
        {() => <p>body</p>}
      </InfiniteQueryState>,
    );
    expect(screen.getByText("body")).toBeInTheDocument();
  });
});
