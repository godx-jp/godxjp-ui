import { describe, expect, it, vi } from "vitest";
import type { InfiniteData, UseInfiniteQueryResult } from "@tanstack/react-query";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderWithUi, screen, userEvent, waitFor } from "@/test/render";
import { InfiniteQueryState, flattenItemPages } from "../infinite-query-state";
import { PrefetchLink } from "../prefetch-link";

type Page = { items: string[]; next_cursor?: string };

function mockInfiniteQuery(partial: Record<string, unknown>) {
  return partial as unknown as UseInfiniteQueryResult<InfiniteData<Page>, Error>;
}

describe("flattenItemPages", () => {
  it("concatenates items across pages", () => {
    expect(
      flattenItemPages({
        pages: [{ items: ["a"] }, { items: ["b", "c"] }],
      }),
    ).toEqual(["a", "b", "c"]);
  });
});

describe("InfiniteQueryState", () => {
  it("shows skeleton while pending", () => {
    renderWithUi(
      <InfiniteQueryState<Page, string[]>
        query={mockInfiniteQuery({ isPending: true, isError: false })}
        skeleton={<div data-testid="skel">loading</div>}
        flatten={(d) => flattenItemPages(d)}
      >
        {() => null}
      </InfiniteQueryState>,
    );
    expect(screen.getByTestId("skel")).toBeInTheDocument();
  });

  it("renders flattened items and load more", async () => {
    const user = userEvent.setup();
    const fetchNextPage = vi.fn();
    renderWithUi(
      <InfiniteQueryState<Page, string[]>
        query={mockInfiniteQuery({
          isPending: false,
          isError: false,
          isFetchingNextPage: false,
          data: { pages: [{ items: ["note-1"] }], pageParams: [undefined] },
          hasNextPage: true,
          fetchNextPage,
        })}
        skeleton={<div>loading</div>}
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
    expect(screen.getByText("note-1")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /tải thêm/i }));
    expect(fetchNextPage).toHaveBeenCalledOnce();
  });

  it("shows empty state", () => {
    renderWithUi(
      <InfiniteQueryState<Page, string[]>
        query={mockInfiniteQuery({
          isPending: false,
          isError: false,
          data: { pages: [{ items: [] }], pageParams: [undefined] },
          hasNextPage: false,
        })}
        skeleton={<div>loading</div>}
        empty={<div>No notes</div>}
        flatten={(d) => flattenItemPages(d)}
      >
        {() => null}
      </InfiniteQueryState>,
    );
    expect(screen.getByText("No notes")).toBeInTheDocument();
  });
});

describe("PrefetchLink", () => {
  it("prefetches on hover", async () => {
    const user = userEvent.setup();
    const queryFn = vi.fn(() => Promise.resolve({ id: "cust_1" }));
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    renderWithUi(
      <QueryClientProvider client={client}>
        <PrefetchLink to="/customers/cust_1" queryKey={["customer", "cust_1"]} queryFn={queryFn}>
          Mai Nguyen
        </PrefetchLink>
      </QueryClientProvider>,
    );

    await user.hover(screen.getByRole("link", { name: "Mai Nguyen" }));
    await waitFor(() => expect(queryFn).toHaveBeenCalledOnce());
  });
});
