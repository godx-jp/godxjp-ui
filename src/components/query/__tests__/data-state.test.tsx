import { describe, expect, it, vi } from "vitest";
import * as React from "react";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";
import { renderWithUi, screen, userEvent, waitFor } from "@/test/render";
import { DataState } from "../data-state";

type ShipmentList = { items: number[] };

function mockQuery<T>(partial: Partial<UseQueryResult<T>>): UseQueryResult<T> {
  return partial as UseQueryResult<T>;
}

/** An Error carrying an HTTP `status` (fetch/axios-style), typed as Error for the query mock. */
function httpError(status: number, message = ""): Error {
  return Object.assign(new Error(message || String(status)), { status });
}

function withQueryClient(ui: React.ReactElement, client: QueryClient) {
  return <QueryClientProvider client={client}>{ui}</QueryClientProvider>;
}

function EmptyWarehouseHarness() {
  const query = useQuery<ShipmentList>({
    queryKey: ["data-state-test", "empty"],
    queryFn: () => Promise.resolve({ items: [] }),
  });
  return (
    <DataState
      query={query}
      skeleton={<div data-testid="hawb-skeleton">loading</div>}
      empty={<div>Không có kiện chờ gom</div>}
      isEmpty={(data) => data.items.length === 0}
    >
      {(data) => <div data-testid="hawb-list">{data.items.length} kiện</div>}
    </DataState>
  );
}

function LoadedWarehouseHarness() {
  const query = useQuery<ShipmentList>({
    queryKey: ["data-state-test", "loaded"],
    queryFn: () => Promise.resolve({ items: [1, 2] }),
  });
  return (
    <DataState
      query={query}
      skeleton={<div data-testid="hawb-skeleton">loading</div>}
      empty={<div>Không có kiện chờ gom</div>}
      isEmpty={(data) => data.items.length === 0}
    >
      {(data) => <div data-testid="hawb-list">{data.items.length} kiện</div>}
    </DataState>
  );
}

describe("DataState", () => {
  it("shows skeleton while pending", () => {
    renderWithUi(
      <DataState
        query={mockQuery({ isPending: true, isError: false })}
        skeleton={<div data-testid="skel">loading</div>}
      >
        {() => <div>data</div>}
      </DataState>,
    );
    expect(screen.getByTestId("skel")).toBeInTheDocument();
  });

  it("shows prerequisite rather than false loading for a disabled query", () => {
    renderWithUi(
      <DataState
        query={mockQuery({ isPending: true, isError: false, fetchStatus: "idle" })}
        skeleton={<div>loading</div>}
        prerequisite={<div>Select an organization</div>}
      >
        {() => <div>data</div>}
      </DataState>,
    );
    expect(screen.getByText("Select an organization")).toBeInTheDocument();
    expect(screen.queryByText("loading")).not.toBeInTheDocument();
  });

  it("renders children when data loaded", () => {
    renderWithUi(
      <DataState
        query={mockQuery({ isPending: false, isError: false, data: { items: [1] } })}
        skeleton={<div>loading</div>}
        empty={<div>empty</div>}
      >
        {(data) => <div>count:{data.items.length}</div>}
      </DataState>,
    );
    expect(screen.getByText("count:1")).toBeInTheDocument();
  });

  it("shows empty state when isEmpty", () => {
    renderWithUi(
      <DataState
        query={mockQuery({ isPending: false, isError: false, data: { items: [] } })}
        skeleton={<div>loading</div>}
        empty={<div>No items</div>}
      >
        {() => <div>data</div>}
      </DataState>,
    );
    expect(screen.getByText("No items")).toBeInTheDocument();
  });

  it("renders Alert.QueryError and refetches on retry when query errors", async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();
    renderWithUi(
      <DataState
        query={mockQuery({
          isPending: false,
          isError: true,
          isFetching: false,
          error: new Error("GET /v1/customers failed: 503"),
          refetch,
        })}
        skeleton={<div data-testid="skel">loading</div>}
        showRetry
      >
        {() => <div>data</div>}
      </DataState>,
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();
    // The endpoint/status is never dumped as the user-facing detail.
    expect(screen.queryByText(/503/)).not.toBeInTheDocument();
    expect(screen.queryByText(/customers/)).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /thử lại/i }));
    expect(refetch).toHaveBeenCalledOnce();
  });

  it("shows skeleton while retrying after error", () => {
    renderWithUi(
      <DataState
        query={mockQuery({
          isPending: false,
          isError: true,
          isFetching: true,
          error: new Error("503"),
        })}
        skeleton={<div data-testid="retry-skel">loading</div>}
      >
        {() => <div>data</div>}
      </DataState>,
    );
    expect(screen.getByTestId("retry-skel")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("omits retry when showRetry is false", () => {
    renderWithUi(
      <DataState
        query={mockQuery({
          isPending: false,
          isError: true,
          isFetching: false,
          error: new Error("403"),
        })}
        skeleton={<div>loading</div>}
        showRetry={false}
      >
        {() => <div>data</div>}
      </DataState>,
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /thử lại/i })).not.toBeInTheDocument();
  });

  it("calls onRetry override instead of refetch", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    const refetch = vi.fn();
    renderWithUi(
      <DataState
        query={mockQuery({
          isPending: false,
          isError: true,
          isFetching: false,
          error: new Error("fail"),
          refetch,
        })}
        skeleton={<div>loading</div>}
        onRetry={onRetry}
      >
        {() => <div>data</div>}
      </DataState>,
    );
    await user.click(screen.getByRole("button", { name: /thử lại/i }));
    expect(onRetry).toHaveBeenCalledOnce();
    expect(refetch).not.toHaveBeenCalled();
  });

  it("uses custom errorRenderer when provided", () => {
    renderWithUi(
      <DataState
        query={mockQuery({
          isPending: false,
          isError: true,
          isFetching: false,
          error: new Error("fail"),
        })}
        skeleton={<div>loading</div>}
        errorRenderer={(err) => <div data-testid="custom-err">{String(err)}</div>}
      >
        {() => <div>data</div>}
      </DataState>,
    );
    expect(screen.getByTestId("custom-err")).toHaveTextContent("fail");
  });
});

describe("DataState state matrix", () => {
  it("active initial fetch (pending + fetchStatus fetching) renders the skeleton", () => {
    renderWithUi(
      <DataState
        query={mockQuery({ isPending: true, isError: false, fetchStatus: "fetching" })}
        skeleton={<div data-testid="skel">loading</div>}
        prerequisite={<div>prereq</div>}
      >
        {() => <div>data</div>}
      </DataState>,
    );
    expect(screen.getByTestId("skel")).toBeInTheDocument();
    expect(screen.queryByText("prereq")).not.toBeInTheDocument();
  });

  it("paused (offline, pending + fetchStatus paused) renders the skeleton, not the prerequisite", () => {
    renderWithUi(
      <DataState
        query={mockQuery({ isPending: true, isError: false, fetchStatus: "paused" })}
        skeleton={<div data-testid="skel">loading</div>}
        prerequisite={<div>prereq</div>}
      >
        {() => <div>data</div>}
      </DataState>,
    );
    expect(screen.getByTestId("skel")).toBeInTheDocument();
    expect(screen.queryByText("prereq")).not.toBeInTheDocument();
  });

  it("offers retry for a transient (5xx) error even without showRetry", async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();
    renderWithUi(
      <DataState
        query={mockQuery({
          isPending: false,
          isError: true,
          isFetching: false,
          error: new Error("Service Unavailable: 503"),
          refetch,
        })}
        skeleton={<div>loading</div>}
      >
        {() => <div>data</div>}
      </DataState>,
    );
    await user.click(screen.getByRole("button", { name: /thử lại/i }));
    expect(refetch).toHaveBeenCalledOnce();
  });

  it("routes a 401 to session renewal (onAuthError), never a blind retry", async () => {
    const user = userEvent.setup();
    const onAuthError = vi.fn();
    const refetch = vi.fn();
    renderWithUi(
      <DataState
        query={mockQuery({
          isPending: false,
          isError: true,
          isFetching: false,
          error: new Error("Access token invalid"),
          refetch,
        })}
        skeleton={<div>loading</div>}
        showRetry
        onAuthError={onAuthError}
      >
        {() => <div>data</div>}
      </DataState>,
    );
    expect(screen.queryByRole("button", { name: /thử lại/i })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /đăng nhập lại/i }));
    expect(onAuthError).toHaveBeenCalledOnce();
    expect(refetch).not.toHaveBeenCalled();
  });

  it("does not offer retry for a 403 even when showRetry is set", () => {
    renderWithUi(
      <DataState
        query={mockQuery({
          isPending: false,
          isError: true,
          isFetching: false,
          error: httpError(403, "Forbidden"),
        })}
        skeleton={<div>loading</div>}
        showRetry
      >
        {() => <div>data</div>}
      </DataState>,
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /thử lại/i })).not.toBeInTheDocument();
  });

  it("does not offer retry for a 404 not-found error", () => {
    renderWithUi(
      <DataState
        query={mockQuery({
          isPending: false,
          isError: true,
          isFetching: false,
          error: httpError(404),
        })}
        skeleton={<div>loading</div>}
      >
        {() => <div>data</div>}
      </DataState>,
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /thử lại/i })).not.toBeInTheDocument();
  });

  it("does not offer retry for a 422 validation error", () => {
    renderWithUi(
      <DataState
        query={mockQuery({
          isPending: false,
          isError: true,
          isFetching: false,
          error: httpError(422, "declared_value must be > 0"),
        })}
        skeleton={<div>loading</div>}
      >
        {() => <div>data</div>}
      </DataState>,
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /thử lại/i })).not.toBeInTheDocument();
  });

  it("preserves existing content with a polite busy status during a background refetch", () => {
    renderWithUi(
      <DataState
        query={mockQuery({
          isPending: false,
          isError: false,
          isFetching: true,
          data: { items: [1, 2] },
        })}
        skeleton={<div data-testid="skel">loading</div>}
      >
        {(d) => <div data-testid="content">count:{d.items.length}</div>}
      </DataState>,
    );
    // Content stays visible (no skeleton flash) and the refetch is announced politely.
    expect(screen.getByTestId("content")).toHaveTextContent("count:2");
    expect(screen.queryByTestId("skel")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(/đang cập nhật/i);
  });

  it("shows placeholder/stale data (not skeleton) while the real fetch is in flight", () => {
    renderWithUi(
      <DataState
        query={mockQuery({
          isPending: false,
          isError: false,
          isFetching: true,
          data: { items: [7] },
        })}
        skeleton={<div data-testid="skel">loading</div>}
      >
        {(d) => <div data-testid="content">count:{d.items.length}</div>}
      </DataState>,
    );
    expect(screen.getByTestId("content")).toHaveTextContent("count:1");
    expect(screen.queryByTestId("skel")).not.toBeInTheDocument();
  });
});

describe("DataState integration (useQuery)", () => {
  it("shows empty warehouse after query resolves", async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    renderWithUi(withQueryClient(<EmptyWarehouseHarness />, client));

    expect(screen.getByTestId("hawb-skeleton")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText("Không có kiện chờ gom")).toBeInTheDocument();
    });
    expect(screen.queryByTestId("hawb-list")).not.toBeInTheDocument();
  });

  it("shows list when warehouse has shipments", async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    renderWithUi(withQueryClient(<LoadedWarehouseHarness />, client));

    await waitFor(() => {
      expect(screen.getByTestId("hawb-list")).toHaveTextContent("2 kiện");
    });
  });
});
