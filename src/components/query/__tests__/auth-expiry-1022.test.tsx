// gh#1022 — an expired session (401) must be handled centrally, not painted as a full-bleed
// destructive alert whose sign-in button is the only way the consumer's handler ever runs.
import { describe, expect, it, vi } from "vitest";
import * as React from "react";
import type { UseQueryResult } from "@tanstack/react-query";
import { act, renderWithUi, screen, userEvent, waitFor } from "@/test/render";
import { DataState } from "../data-state";
import { InfiniteQueryState } from "../infinite-query-state";
import { AlertMutationFeedback } from "../mutation-feedback";
import { AuthExpiryProvider } from "../index";
import * as root from "../../../index";

function httpError(status: number, message = ""): Error {
  return Object.assign(new Error(message || String(status)), { status });
}

function errored<T>(error: unknown): UseQueryResult<T> {
  return {
    isPending: false,
    isError: true,
    isFetching: false,
    error,
    refetch: vi.fn(),
  } as unknown as UseQueryResult<T>;
}

function Page({ error = httpError(401) }: { error?: unknown }) {
  return (
    <DataState query={errored(error)} skeleton={<div data-testid="skel">loading</div>}>
      {() => <div>data</div>}
    </DataState>
  );
}

// vi.json is the test locale (renderWithUi).
const REDIRECTING = /đang chuyển đến trang đăng nhập/i;
const SIGN_IN = /đăng nhập lại/i;

describe("AuthExpiryProvider — central session-expiry handling (gh#1022)", () => {
  it("is exported from @godxjp/ui/query and the root barrel", () => {
    expect(AuthExpiryProvider).toBeTypeOf("function");
    expect(root.AuthExpiryProvider).toBe(AuthExpiryProvider);
  });

  it("DataState: a 401 calls onAuthExpired automatically and renders the skeleton, not an alert", async () => {
    const onAuthExpired = vi.fn();
    const error = httpError(401, "Access token expired");
    renderWithUi(
      <AuthExpiryProvider onAuthExpired={onAuthExpired}>
        <Page error={error} />
      </AuthExpiryProvider>,
    );
    await waitFor(() => expect(onAuthExpired).toHaveBeenCalledOnce());
    expect(onAuthExpired).toHaveBeenCalledWith({ error });
    expect(screen.getByTestId("skel")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: SIGN_IN })).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(REDIRECTING);
  });

  it("dedupes simultaneous 401s across many surfaces into ONE handler call", async () => {
    const onAuthExpired = vi.fn();
    renderWithUi(
      <AuthExpiryProvider onAuthExpired={onAuthExpired}>
        <Page />
        <Page error={new Error("Unauthorized")} />
        <Page />
        <AlertMutationFeedback
          mutation={{ isError: true, isPending: false, error: httpError(401) }}
        />
      </AuthExpiryProvider>,
    );
    await waitFor(() => expect(onAuthExpired).toHaveBeenCalled());
    await act(() => new Promise((r) => setTimeout(r, 10)));
    expect(onAuthExpired).toHaveBeenCalledOnce();
  });

  it("fires once under StrictMode's mount/unmount/mount", async () => {
    const onAuthExpired = vi.fn();
    renderWithUi(
      <React.StrictMode>
        <AuthExpiryProvider onAuthExpired={onAuthExpired}>
          <Page />
        </AuthExpiryProvider>
      </React.StrictMode>,
    );
    await act(() => new Promise((r) => setTimeout(r, 10)));
    expect(onAuthExpired).toHaveBeenCalledOnce();
  });

  it("re-arms once every auth-errored view has gone, so a later expiry fires again", async () => {
    const onAuthExpired = vi.fn();
    function Harness({ show }: { show: boolean }) {
      return (
        <AuthExpiryProvider onAuthExpired={onAuthExpired}>
          {show ? <Page /> : <div>signed in again</div>}
        </AuthExpiryProvider>
      );
    }
    const { rerender } = renderWithUi(<Harness show />);
    await waitFor(() => expect(onAuthExpired).toHaveBeenCalledTimes(1));
    rerender(<Harness show={false} />);
    await act(() => new Promise((r) => setTimeout(r, 10)));
    rerender(<Harness show />);
    await waitFor(() => expect(onAuthExpired).toHaveBeenCalledTimes(2));
  });

  it("a rejected handler brings back the sign-in alert, whose button re-invokes the handler", async () => {
    const user = userEvent.setup();
    const onAuthExpired = vi.fn().mockRejectedValueOnce(new Error("refresh failed"));
    renderWithUi(
      <AuthExpiryProvider onAuthExpired={onAuthExpired}>
        <Page />
      </AuthExpiryProvider>,
    );
    const button = await screen.findByRole("button", { name: SIGN_IN });
    expect(onAuthExpired).toHaveBeenCalledTimes(1);
    await user.click(button);
    expect(onAuthExpired).toHaveBeenCalledTimes(2);
  });

  it("InfiniteQueryState and AlertMutationFeedback consult the provider too", async () => {
    const onAuthExpired = vi.fn();
    renderWithUi(
      <AuthExpiryProvider onAuthExpired={onAuthExpired}>
        <InfiniteQueryState
          query={
            {
              isPending: false,
              isError: true,
              isFetching: false,
              isFetchingNextPage: false,
              error: httpError(401),
              data: undefined,
              hasNextPage: false,
              fetchNextPage: vi.fn(),
              refetch: vi.fn(),
            } as never
          }
          skeleton={<div data-testid="feed-skel">loading</div>}
          flatten={(d: { pages: unknown[] }) => d.pages}
        >
          {() => <div>feed</div>}
        </InfiniteQueryState>
        <AlertMutationFeedback
          mutation={{ isError: true, isPending: false, error: httpError(401) }}
        />
      </AuthExpiryProvider>,
    );
    await waitFor(() => expect(onAuthExpired).toHaveBeenCalledOnce());
    expect(screen.getByTestId("feed-skel")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getAllByRole("status").some((n) => REDIRECTING.test(n.textContent ?? ""))).toBe(
      true,
    );
  });

  it("leaves non-auth errors alone — a 503 still offers Retry and never calls the handler", async () => {
    const onAuthExpired = vi.fn();
    renderWithUi(
      <AuthExpiryProvider onAuthExpired={onAuthExpired}>
        <Page error={httpError(503)} />
      </AuthExpiryProvider>,
    );
    expect(screen.getByRole("alert")).toHaveAttribute("data-tone", "destructive");
    expect(screen.getByRole("button", { name: /thử lại/i })).toBeInTheDocument();
    await act(() => new Promise((r) => setTimeout(r, 10)));
    expect(onAuthExpired).not.toHaveBeenCalled();
  });
});

describe("DataState without a provider — proportionate fallback (gh#1022)", () => {
  it("renders a neutral, width-capped status (not a destructive alert) and never auto-invokes onAuthError", async () => {
    const user = userEvent.setup();
    const onAuthError = vi.fn();
    renderWithUi(
      <DataState query={errored(httpError(401))} skeleton={null} onAuthError={onAuthError}>
        {() => <div>data</div>}
      </DataState>,
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    const surface = screen.getByRole("status");
    expect(surface).toHaveAttribute("data-tone", "default");
    expect(surface).toHaveAttribute("data-query-category", "auth");
    expect(onAuthError).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: SIGN_IN }));
    expect(onAuthError).toHaveBeenCalledOnce();
  });
});
