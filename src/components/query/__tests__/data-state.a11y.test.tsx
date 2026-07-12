import { describe, it } from "vitest";
import type { UseQueryResult } from "@tanstack/react-query";
import { DataState } from "../data-state";
import { EmptyState } from "../../data-display/empty-state";
import { expectNoA11yViolations } from "@/test/a11y";

function mockQuery<T>(partial: Partial<UseQueryResult<T>>): UseQueryResult<T> {
  return partial as UseQueryResult<T>;
}

function httpError(status: number): Error {
  return Object.assign(new Error(String(status)), { status });
}

type List = { items: number[] };

// DataState orchestrates loading / error / empty / success — each branch must be
// accessible (error renders an alert + retry button, empty renders a zero-state).
describe("DataState a11y", () => {
  it("loading (skeleton) has no axe violations", async () => {
    await expectNoA11yViolations(
      <DataState<List>
        query={mockQuery({ isPending: true, isError: false })}
        skeleton={<p>Đang tải…</p>}
      >
        {(d) => <div>{d.items.length}</div>}
      </DataState>,
    );
  });

  it("error state (alert + retry) has no axe violations", async () => {
    await expectNoA11yViolations(
      <DataState<List>
        query={mockQuery({
          isPending: false,
          isError: true,
          isFetching: false,
          error: new Error("GET /v1/shipments failed: 503"),
          refetch: () => Promise.resolve({} as never),
        })}
        skeleton={<p>Đang tải…</p>}
      >
        {(d) => <div>{d.items.length}</div>}
      </DataState>,
    );
  });

  it("auth error (session renewal) has no axe violations", async () => {
    await expectNoA11yViolations(
      <DataState<List>
        query={mockQuery({
          isPending: false,
          isError: true,
          isFetching: false,
          error: new Error("Access token invalid"),
        })}
        skeleton={<p>Đang tải…</p>}
        onAuthError={() => undefined}
      >
        {(d) => <div>{d.items.length}</div>}
      </DataState>,
    );
  });

  it("forbidden error (permission-aware, no retry) has no axe violations", async () => {
    await expectNoA11yViolations(
      <DataState<List>
        query={mockQuery({
          isPending: false,
          isError: true,
          isFetching: false,
          error: httpError(403),
        })}
        skeleton={<p>Đang tải…</p>}
      >
        {(d) => <div>{d.items.length}</div>}
      </DataState>,
    );
  });

  it("prerequisite (disabled query) state has no axe violations", async () => {
    await expectNoA11yViolations(
      <DataState<List>
        query={mockQuery({ isPending: true, isError: false, fetchStatus: "idle" })}
        skeleton={<p>Đang tải…</p>}
        prerequisite={<EmptyState title="組織を選択してください" />}
      >
        {(d) => <div>{d.items.length}</div>}
      </DataState>,
    );
  });

  it("empty state has no axe violations", async () => {
    await expectNoA11yViolations(
      <DataState<List>
        query={mockQuery({ isPending: false, isError: false, data: { items: [] } })}
        skeleton={<p>Đang tải…</p>}
        empty={<EmptyState title="Không có lô hàng" description="Chưa có dữ liệu để hiển thị." />}
        isEmpty={(d) => d.items.length === 0}
      >
        {(d) => <div>{d.items.length}</div>}
      </DataState>,
    );
  });

  it("success state has no axe violations", async () => {
    await expectNoA11yViolations(
      <DataState<List>
        query={mockQuery({ isPending: false, isError: false, data: { items: [1, 2, 3] } })}
        skeleton={<p>Đang tải…</p>}
        isEmpty={(d) => d.items.length === 0}
      >
        {(d) => (
          <ul>
            {d.items.map((n) => (
              <li key={n}>Lô hàng #{n}</li>
            ))}
          </ul>
        )}
      </DataState>,
    );
  });
});
