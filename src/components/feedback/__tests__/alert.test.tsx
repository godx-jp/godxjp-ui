import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";
import { Button } from "../../general/button";
import { Alert, AlertActions, AlertContent, AlertDescription, AlertTitle } from "../alert";

describe("Alert", () => {
  it("renders with role=alert and variant styling", () => {
    renderWithUi(
      <Alert tone="warning">
        <AlertContent>
          <AlertTitle>Pin lithium</AlertTitle>
          <AlertDescription>MSDS bắt buộc trước khi xuất kho.</AlertDescription>
        </AlertContent>
      </Alert>,
    );
    const alert = screen.getByRole("alert");
    expect(alert).toHaveAttribute("data-tone", "warning");
    expect(screen.getByText("Pin lithium")).toBeInTheDocument();
    expect(screen.getByText(/MSDS/)).toBeInTheDocument();
  });

  it("renders destructive variant for API errors", () => {
    renderWithUi(
      <Alert tone="destructive">
        <AlertContent>
          <AlertTitle>Không tải được</AlertTitle>
          <AlertDescription>503 Service Unavailable</AlertDescription>
        </AlertContent>
      </Alert>,
    );
    expect(screen.getByRole("alert")).toHaveAttribute("data-tone", "destructive");
    expect(screen.getByText("Không tải được")).toHaveAttribute("data-slot", "alert-title");
  });

  it("renders actions slot", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    renderWithUi(
      <Alert variant="default">
        <AlertContent>
          <AlertTitle>Bảo trì</AlertTitle>
          <AlertDescription>Pub/Sub emulator restart lúc 02:00 JST.</AlertDescription>
        </AlertContent>
        <AlertActions>
          <Button size="sm" onClick={onAction}>
            Xem lịch
          </Button>
        </AlertActions>
      </Alert>,
    );
    await user.click(screen.getByRole("button", { name: "Xem lịch" }));
    expect(onAction).toHaveBeenCalledOnce();
  });

  it("calls onDismiss when dismiss control clicked", async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    renderWithUi(
      <Alert tone="success" onDismiss={onDismiss}>
        <AlertContent>
          <AlertTitle>Đã lưu template Zalo</AlertTitle>
          <AlertDescription>Thay đổi có hiệu lực ngay.</AlertDescription>
        </AlertContent>
      </Alert>,
    );
    // Success is a polite tone, so the container is role="status" (not "alert").
    expect(screen.getByRole("status")).toHaveAttribute("data-tone", "success");
    // The dismiss control's aria-label is now i18n'd via t("feedback.alert.dismiss");
    // the test renders in the "vi" locale, so it resolves to "Đóng".
    await user.click(screen.getByRole("button", { name: "Đóng" }));
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it("hides icon when icon={false}", () => {
    const { container } = renderWithUi(
      <Alert tone="warning" icon={false}>
        <AlertContent>
          <AlertTitle>No icon</AlertTitle>
        </AlertContent>
      </Alert>,
    );
    expect(container.querySelector("svg")).toBeNull();
  });

  it("renders success variant styling", () => {
    renderWithUi(
      <Alert tone="success">
        <AlertContent>
          <AlertTitle>Template saved</AlertTitle>
          <AlertDescription>Zalo OA preview ready.</AlertDescription>
        </AlertContent>
      </Alert>,
    );
    // Success is a polite tone → role="status" (assertive role="alert" is reserved
    // for destructive/warning).
    expect(screen.getByRole("status")).toHaveAttribute("data-tone", "success");
  });

  it("renders default variant without destructive classes", () => {
    renderWithUi(
      <Alert variant="default">
        <AlertContent>
          <AlertTitle>Maintenance</AlertTitle>
        </AlertContent>
      </Alert>,
    );
    // Default is a polite tone: it announces via role="status", never the assertive
    // role="alert", and carries neither the destructive tone nor variant.
    const alert = screen.getByRole("status");
    expect(alert).toHaveAttribute("data-variant", "default");
    expect(alert).toHaveAttribute("data-tone", "default");
    expect(alert).not.toHaveAttribute("data-tone", "destructive");
  });

  /*
   * #765. `Alert` computes its own role from the tone — assertive for
   * destructive/warning, polite otherwise — so EVERY Alert is a live region. That
   * is right for an alert and wrong for a static aside in prose: a wiki page with
   * three callouts announces all three on load.
   *
   * Until there is a separate non-live primitive, the escape hatch consumers use is
   * `<Alert role="note">`. It works because `{...props}` is spread AFTER the computed
   * `role` in `alert.tsx` — which was an accident of ordering, promised nowhere. A
   * refactor that spread props before the role would silently restore the live region
   * with nothing failing, and godx-task had pinned the ordering in a CONSUMER test to
   * notice — a consumer guarding a package internal.
   *
   * These two cases move that guarantee into the package, where it belongs. They do
   * NOT close #765: the API question (a `Callout` primitive, or an explicit non-live
   * axis on `Alert`) is still open. They only stop the current escape hatch from
   * breaking silently while it is decided.
   */
  it.each([
    ["warning", "alert"],
    ["info", "status"],
  ] as const)("tone=%s computes role=%s when the consumer passes none", (tone, expected) => {
    renderWithUi(
      <Alert tone={tone}>
        <AlertContent>
          <AlertTitle>Computed</AlertTitle>
        </AlertContent>
      </Alert>,
    );
    expect(screen.getByRole(expected)).toHaveAttribute("data-tone", tone);
  });

  it.each(["warning", "info"] as const)(
    "an explicit role wins over the tone-computed one (tone=%s), so a prose callout is not a live region",
    (tone) => {
      renderWithUi(
        <Alert tone={tone} role="note">
          <AlertContent>
            <AlertTitle>Static aside</AlertTitle>
          </AlertContent>
        </Alert>,
      );
      expect(screen.getByRole("note")).toHaveAttribute("data-tone", tone);
      expect(screen.queryByRole("alert")).toBeNull();
      expect(screen.queryByRole("status")).toBeNull();
    },
  );
});

describe("Alert.QueryError — legacy (no category) mode", () => {
  it("shows message and retry", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    renderWithUi(<Alert.QueryError error={new Error("boom")} onRetry={onRetry} />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText(/boom/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /thử lại/i }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("omits retry button when onRetry is omitted", () => {
    renderWithUi(<Alert.QueryError error="Validation failed: declared_value must be > 0" />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /thử lại/i })).not.toBeInTheDocument();
  });

  it("uses destructive Alert styling", () => {
    renderWithUi(<Alert.QueryError error={new Error("503")} onRetry={() => undefined} />);
    expect(screen.getByRole("alert")).toHaveAttribute("data-tone", "destructive");
  });
});

describe("Alert.QueryError — cause-aware (category) mode", () => {
  it("offers session renewal — not retry — for an auth error, hiding raw token text", async () => {
    const user = userEvent.setup();
    const onAuthAction = vi.fn();
    const onRetry = vi.fn();
    renderWithUi(
      <Alert.QueryError
        error={new Error("Access token invalid")}
        category="auth"
        onAuthAction={onAuthAction}
        onRetry={onRetry}
      />,
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.queryByText(/access token/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /thử lại/i })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /đăng nhập lại/i }));
    expect(onAuthAction).toHaveBeenCalledOnce();
    expect(onRetry).not.toHaveBeenCalled();
  });

  it("renders a permission-aware (warning) state without retry for forbidden", () => {
    renderWithUi(
      <Alert.QueryError error={new Error("403")} category="forbidden" onRetry={() => undefined} />,
    );
    const alert = screen.getByRole("alert");
    expect(alert).toHaveAttribute("data-tone", "warning");
    expect(screen.queryByRole("button", { name: /thử lại/i })).not.toBeInTheDocument();
  });

  it("offers Retry with destructive styling for a transient error", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    renderWithUi(
      <Alert.QueryError error={new Error("503")} category="transient" onRetry={onRetry} />,
    );
    expect(screen.getByRole("alert")).toHaveAttribute("data-tone", "destructive");
    await user.click(screen.getByRole("button", { name: /thử lại/i }));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
