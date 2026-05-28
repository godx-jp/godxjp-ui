import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";
import { MutationFeedback } from "../mutation-feedback";
import { QueryRefetchButton } from "../query-refetch-button";

describe("MutationFeedback", () => {
  it("renders nothing when idle", () => {
    const { container } = renderWithUi(
      <MutationFeedback mutation={{ isError: false, error: null, isPending: false }} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("shows Alert.QueryError when mutation failed", () => {
    renderWithUi(
      <MutationFeedback
        mutation={{ isError: true, error: new Error("save failed"), isPending: false }}
        onRetry={() => undefined}
      />,
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText(/save failed/)).toBeInTheDocument();
  });

  it("shows pending slot while running", () => {
    renderWithUi(
      <MutationFeedback
        mutation={{ isError: false, error: null, isPending: true }}
        pending={<div data-testid="pending">Running…</div>}
      />,
    );
    expect(screen.getByTestId("pending")).toBeInTheDocument();
  });

  it("hides retry when showRetry is false", () => {
    renderWithUi(
      <MutationFeedback
        mutation={{ isError: true, error: new Error("403"), isPending: false }}
        showRetry={false}
      />,
    );
    expect(screen.queryByRole("button", { name: /thử lại/i })).not.toBeInTheDocument();
  });
});

describe("QueryRefetchButton", () => {
  it("calls refetch on click", async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();
    renderWithUi(
      <QueryRefetchButton query={{ isFetching: false, refetch }} label="Refresh list" />,
    );
    await user.click(screen.getByRole("button", { name: /refresh list/i }));
    expect(refetch).toHaveBeenCalledOnce();
  });

  it("disables while fetching", () => {
    renderWithUi(<QueryRefetchButton query={{ isFetching: true, refetch: vi.fn() }} />);
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
