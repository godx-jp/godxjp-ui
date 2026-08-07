/**
 * Banner — the page-level Alert treatment (gh#255).
 *
 * The consumer blocker was that `@godxjp/ui@18.6.0` had no `Banner` contract, so a page-level strip
 * had to be hand-rolled. Banner is deliberately NOT a second implementation: it is `Alert` locked
 * to `variant="banner"`. These tests pin exactly that — the alias fixes the measure and inherits
 * every behaviour (tone → role/politeness, icon, actions, dismiss) verbatim, so the two can never
 * grow apart, plus the a11y contract of the strip itself.
 */
import { describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { renderWithUi, screen } from "@/test/render";

import { Alert, AlertTitle, Banner } from "../alert";
import { expectNoA11yViolations } from "@/test/a11y";

describe("Banner — it IS Alert at the page measure", () => {
  it("renders the alert slot with variant=banner", () => {
    const { container } = renderWithUi(
      <Banner tone="info">
        <Banner.Title>定期メンテナンス</Banner.Title>
      </Banner>,
    );

    const root = container.querySelector('[data-slot="alert"]');
    expect(root).toHaveAttribute("data-variant", "banner");
  });

  it("cannot be talked out of the banner measure — the alias owns `variant`", () => {
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

  it("shares Alert's subcomponents identically — Banner.Title IS AlertTitle", () => {
    expect(Banner.Title).toBe(AlertTitle);
    expect(Banner.Content).toBe(Alert.Content);
    expect(Banner.Description).toBe(Alert.Description);
    expect(Banner.Actions).toBe(Alert.Actions);
  });
});

describe("Banner — inherited behaviour", () => {
  it.each([
    ["destructive", "alert"],
    ["warning", "alert"],
    ["success", "status"],
    ["info", "status"],
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

  it("renders the built-in accessible dismiss control and calls onDismiss", async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    renderWithUi(
      <Banner tone="warning" onDismiss={onDismiss}>
        <Banner.Title>お試し期間は残り 3 日です</Banner.Title>
      </Banner>,
    );

    const dismiss = screen.getByRole("button");
    expect(dismiss).toHaveAccessibleName();
    await user.click(dismiss);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("marks the strip dismissible so the CSS can reserve the ✕ gutter at the banner inset", () => {
    const { container } = renderWithUi(
      <Banner tone="warning" onDismiss={() => undefined}>
        <Banner.Title>お知らせ</Banner.Title>
      </Banner>,
    );

    expect(container.querySelector('[data-slot="alert"]')).toHaveAttribute("data-dismissible");
  });

  it("hides the tone icon on request without touching the announcement", () => {
    const { container } = renderWithUi(
      <Banner tone="info" icon={false}>
        <Banner.Title>お知らせ</Banner.Title>
      </Banner>,
    );

    expect(container.querySelector('[data-slot="alert-icon"]')).toBeNull();
    expect(screen.getByRole("status")).toBeInTheDocument();
  });
});

describe("Banner — accessibility", () => {
  it("has no violations with title, description, actions and dismiss", async () => {
    await expectNoA11yViolations(
      <Banner tone="warning" onDismiss={() => undefined}>
        <Banner.Content>
          <Banner.Title>お試し期間は残り 3 日です</Banner.Title>
          <Banner.Description>期限までにプランを選択してください。</Banner.Description>
        </Banner.Content>
        <Banner.Actions>
          <button type="button">プランを見る</button>
        </Banner.Actions>
      </Banner>,
    );
  });
});
