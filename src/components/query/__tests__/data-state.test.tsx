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
      >
        {() => <div>data</div>}
      </DataState>,
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText(/503/)).toBeInTheDocument();
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
