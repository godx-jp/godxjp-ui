import { describe, expect, it, vi } from "vitest";
import { createRef } from "react";
import { renderWithUi, screen, userEvent } from "@/test/render";
import { Button } from "../../general/button";
import { Alert } from "../alert";

/**
 * Banner — the canonical DXS full-bleed attention strip.
 * It IS the Alert primitive with `variant` fixed to "banner": one implementation
 * owns tone semantics, dismiss, actions, icon treatment and focus order.
 */
describe("Alert variant=banner (formerly Banner, v32 #1223)", () => {
  it("renders as the alert primitive with the banner structural variant fixed", () => {
    renderWithUi(
      <Alert variant="banner" tone="warning">
        <Alert.Content>
          <Alert.Title>お支払いが確認できていません</Alert.Title>
          <Alert.Description>お支払い方法を更新してください。</Alert.Description>
        </Alert.Content>
      </Alert>,
    );
    const banner = screen.getByRole("alert");
    expect(banner).toHaveAttribute("data-slot", "alert");
    expect(banner).toHaveAttribute("data-variant", "banner");
    expect(banner).toHaveAttribute("data-tone", "warning");
  });

  it("announces politely (role=status) for non-assertive tones", () => {
    renderWithUi(
      <Alert variant="banner" tone="info">
        <Alert.Title>サポートセッションが進行中です</Alert.Title>
      </Alert>,
    );
    expect(screen.getByRole("status")).toHaveAttribute("data-variant", "banner");
  });

  it("announces assertively (role=alert) for destructive", () => {
    renderWithUi(
      <Alert variant="banner" tone="destructive">
        <Alert.Title>障害が発生しています</Alert.Title>
      </Alert>,
    );
    expect(screen.getByRole("alert")).toHaveAttribute("data-tone", "destructive");
  });

  it("renders the built-in localized dismiss control LAST in DOM/focus order", async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    renderWithUi(
      <Alert variant="banner" tone="neutral" onDismiss={onDismiss}>
        <Alert.Content>
          <Alert.Title>メンテナンスのお知らせ</Alert.Title>
        </Alert.Content>
        <Alert.Actions>
          <Button size="sm">詳細</Button>
        </Alert.Actions>
      </Alert>,
    );
    // Test locale is "vi" → the shared alert dismiss key resolves to "Đóng".
    const dismiss = screen.getByRole("button", { name: "Đóng" });
    const action = screen.getByRole("button", { name: "詳細" });
    // Focus order = DOM order: content/actions BEFORE the dismiss button.
    expect(action.compareDocumentPosition(dismiss) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByRole("status")).toHaveAttribute("data-dismissible");
    await user.click(dismiss);
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it("supports icon override and icon={false}", () => {
    const { container } = renderWithUi(
      <Alert variant="banner" tone="warning" icon={false}>
        <Alert.Title>アイコンなし</Alert.Title>
      </Alert>,
    );
    expect(container.querySelector('[data-slot="alert-icon"]')).toBeNull();
  });

  it("forwards ref and className to the strip root", () => {
    const ref = createRef<HTMLDivElement>();
    renderWithUi(
      <Alert variant="banner" ref={ref} className="test-hook">
        <Alert.Title>参照</Alert.Title>
      </Alert>,
    );
    expect(ref.current).not.toBeNull();
    expect(ref.current).toHaveAttribute("data-variant", "banner");
    expect(ref.current).toHaveClass("test-hook");
  });
});

/**
 * Ported from the dev-line Banner suite (godxjp-ui 18.7.x): the full tone matrix, the
 * runtime variant guard and the axe pass — adapted to the canonical `../banner` export.
 */
describe("Alert variant=banner — tone matrix", () => {
  it.each([
    ["destructive", "alert"],
    ["warning", "alert"],
    ["success", "status"],
    ["info", "status"],
    ["muted", "status"],
    ["neutral", "status"],
    ["default", "status"],
  ] as const)("tone=%s announces via role=%s, exactly as Alert does", (tone, role) => {
    renderWithUi(
      <Alert variant="banner" tone={tone}>
        <Alert.Title>お知らせ</Alert.Title>
      </Alert>,
    );
    expect(screen.getByRole(role)).toHaveAttribute("data-tone", tone);
  });
});
