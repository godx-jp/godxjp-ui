import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";
import { AlertMutationFeedback } from "../mutation-feedback";
import { ButtonRefetch } from "../query-refetch-button";

describe("AlertMutationFeedback", () => {
  it("renders nothing when idle", () => {
    const { container } = renderWithUi(
      <AlertMutationFeedback mutation={{ isError: false, error: null, isPending: false }} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("shows Alert.QueryError when mutation failed", () => {
    renderWithUi(
      <AlertMutationFeedback
        mutation={{ isError: true, error: new Error("save failed"), isPending: false }}
        onRetry={() => undefined}
      />,
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText(/save failed/)).toBeInTheDocument();
  });

  it("shows pending slot while running", () => {
    renderWithUi(
      <AlertMutationFeedback
        mutation={{ isError: false, error: null, isPending: true }}
        pending={<div data-testid="pending">Running…</div>}
      />,
    );
    expect(screen.getByTestId("pending")).toBeInTheDocument();
  });

  it("hides retry when showRetry is false", () => {
    renderWithUi(
      <AlertMutationFeedback
        mutation={{ isError: true, error: new Error("403"), isPending: false }}
        showRetry={false}
      />,
    );
    expect(screen.queryByRole("button", { name: /thử lại/i })).not.toBeInTheDocument();
  });
});

describe("ButtonRefetch", () => {
  it("calls refetch on click", async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();
    renderWithUi(<ButtonRefetch query={{ isFetching: false, refetch }} label="Refresh list" />);
    await user.click(screen.getByRole("button", { name: /refresh list/i }));
    expect(refetch).toHaveBeenCalledOnce();
  });

  it("disables while fetching", () => {
    renderWithUi(<ButtonRefetch query={{ isFetching: true, refetch: vi.fn() }} />);
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
