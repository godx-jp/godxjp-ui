import { describe, expect, it, vi } from "vitest";
import { createRef } from "react";
import { renderWithUi, screen, userEvent } from "@/test/render";
import { expectNoA11yViolations } from "@/test/a11y";
import { Button } from "../../general/button";
import { Banner, type BannerProp, type BannerProps } from "../banner";

/**
 * Banner — the canonical DXS full-bleed attention strip (godxjp-ui#255).
 * It IS the Alert primitive with `variant` fixed to "banner": one implementation
 * owns tone semantics, dismiss, actions, icon treatment and focus order.
 */
describe("Banner", () => {
  it("renders as the alert primitive with the banner structural variant fixed", () => {
    renderWithUi(
      <Banner tone="warning">
        <Banner.Content>
          <Banner.Title>お支払いが確認できていません</Banner.Title>
          <Banner.Description>お支払い方法を更新してください。</Banner.Description>
        </Banner.Content>
      </Banner>,
    );
    const banner = screen.getByRole("alert");
    expect(banner).toHaveAttribute("data-slot", "alert");
    expect(banner).toHaveAttribute("data-variant", "banner");
    expect(banner).toHaveAttribute("data-tone", "warning");
  });

  it("announces politely (role=status) for non-assertive tones", () => {
    renderWithUi(
      <Banner tone="info">
        <Banner.Title>サポートセッションが進行中です</Banner.Title>
      </Banner>,
    );
    expect(screen.getByRole("status")).toHaveAttribute("data-variant", "banner");
  });

  it("announces assertively (role=alert) for destructive", () => {
    renderWithUi(
      <Banner tone="destructive">
        <Banner.Title>障害が発生しています</Banner.Title>
      </Banner>,
    );
    expect(screen.getByRole("alert")).toHaveAttribute("data-tone", "destructive");
  });

  it("renders the built-in localized dismiss control LAST in DOM/focus order", async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    renderWithUi(
      <Banner tone="neutral" onDismiss={onDismiss}>
        <Banner.Content>
          <Banner.Title>メンテナンスのお知らせ</Banner.Title>
        </Banner.Content>
        <Banner.Actions>
          <Button size="sm">詳細</Button>
        </Banner.Actions>
      </Banner>,
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
      <Banner tone="warning" icon={false}>
        <Banner.Title>アイコンなし</Banner.Title>
      </Banner>,
    );
    expect(container.querySelector('[data-slot="alert-icon"]')).toBeNull();
  });

  it("forwards ref and className to the strip root", () => {
    const ref = createRef<HTMLDivElement>();
    renderWithUi(
      <Banner ref={ref} className="test-hook">
        <Banner.Title>参照</Banner.Title>
      </Banner>,
    );
    expect(ref.current).not.toBeNull();
    expect(ref.current).toHaveAttribute("data-variant", "banner");
    expect(ref.current).toHaveClass("test-hook");
  });

  it("pins the public declaration contract (BannerProps, no variant knob)", () => {
    // BannerProp/BannerProps are the same public type: tone/icon/onDismiss owned,
    // `variant` structurally excluded — the banner presentation cannot be unfixed.
    const props: BannerProps = { tone: "success", onDismiss: () => {} };
    const alias: BannerProp = props;
    expect(alias).toBe(props);
    // @ts-expect-error — `variant` is not part of the Banner contract (fixed to "banner").
    const invalid: BannerProps = { variant: "default" };
    expect(invalid).toBeDefined();
  });
});

/**
 * Ported from the dev-line Banner suite (godxjp-ui 18.7.x, gh#255): the full tone matrix, the
 * runtime variant guard and the axe pass — adapted to the canonical `../banner` export.
 */
describe("Banner — tone matrix and runtime guards", () => {
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
      <Banner tone={tone}>
        <Banner.Title>お知らせ</Banner.Title>
      </Banner>,
    );
    expect(screen.getByRole(role)).toHaveAttribute("data-tone", tone);
  });

  it("cannot be talked out of the banner measure — the alias owns `variant` at runtime too", () => {
    // The prop is `Omit<AlertProp, "variant">` at the type level; this is the runtime half of the
    // same guarantee, so a spread of leftover Alert props can't silently downgrade the strip.
    const { container } = renderWithUi(
      // @ts-expect-error — `variant` is not part of BannerProp; asserted here as a runtime guard.
      <Banner tone="info" variant="default">
        <Banner.Title>定期メンテナンス</Banner.Title>
      </Banner>,
    );
    expect(container.querySelector('[data-slot="alert"]')).toHaveAttribute(
      "data-variant",
      "banner",
    );
  });

  it("has no axe violations with title, description, actions and dismiss", async () => {
    await expectNoA11yViolations(
      <Banner tone="warning" onDismiss={() => undefined}>
        <Banner.Content>
          <Banner.Title>お試し期間は残り 3 日です</Banner.Title>
          <Banner.Description>期限までにプランを選択してください。</Banner.Description>
        </Banner.Content>
        <Banner.Actions>
          <Button size="sm">プランを見る</Button>
        </Banner.Actions>
      </Banner>,
    );
  });
});
