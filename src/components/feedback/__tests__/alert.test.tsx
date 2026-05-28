import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";
import { Button } from "../../general/button";
import { Alert, AlertActions, AlertContent, AlertDescription, AlertTitle } from "../alert";

describe("Alert", () => {
  it("renders with role=alert and variant styling", () => {
    renderWithUi(
      <Alert variant="warning">
        <AlertContent>
          <AlertTitle>Pin lithium</AlertTitle>
          <AlertDescription>MSDS bắt buộc trước khi xuất kho.</AlertDescription>
        </AlertContent>
      </Alert>,
    );
    const alert = screen.getByRole("alert");
    expect(alert).toHaveAttribute("data-variant", "warning");
    expect(screen.getByText("Pin lithium")).toBeInTheDocument();
    expect(screen.getByText(/MSDS/)).toBeInTheDocument();
  });

  it("renders destructive variant for API errors", () => {
    renderWithUi(
      <Alert variant="destructive">
        <AlertContent>
          <AlertTitle>Không tải được</AlertTitle>
          <AlertDescription>503 Service Unavailable</AlertDescription>
        </AlertContent>
      </Alert>,
    );
    expect(screen.getByRole("alert")).toHaveAttribute("data-variant", "destructive");
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
      <Alert variant="success" onDismiss={onDismiss}>
        <AlertContent>
          <AlertTitle>Đã lưu template Zalo</AlertTitle>
          <AlertDescription>Thay đổi có hiệu lực ngay.</AlertDescription>
        </AlertContent>
      </Alert>,
    );
    await user.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it("hides icon when icon={false}", () => {
    const { container } = renderWithUi(
      <Alert variant="warning" icon={false}>
        <AlertContent>
          <AlertTitle>No icon</AlertTitle>
        </AlertContent>
      </Alert>,
    );
    expect(container.querySelector("svg")).toBeNull();
  });

  it("renders success variant styling", () => {
    renderWithUi(
      <Alert variant="success">
        <AlertContent>
          <AlertTitle>Template saved</AlertTitle>
          <AlertDescription>Zalo OA preview ready.</AlertDescription>
        </AlertContent>
      </Alert>,
    );
    expect(screen.getByRole("alert")).toHaveAttribute("data-variant", "success");
  });

  it("renders default variant without destructive classes", () => {
    renderWithUi(
      <Alert variant="default">
        <AlertContent>
          <AlertTitle>Maintenance</AlertTitle>
        </AlertContent>
      </Alert>,
    );
    const alert = screen.getByRole("alert");
    expect(alert).toHaveAttribute("data-variant", "default");
  });
});

describe("Alert.QueryError", () => {
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
    expect(screen.getByRole("alert")).toHaveAttribute("data-variant", "destructive");
  });
});
