import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Clock } from "lucide-react";

import { expectNoA11yViolations } from "@/test/a11y";
import { Button } from "../../general/button";
import {
  ServiceCatalogCta,
  ServiceLauncherCard,
  ServiceLauncherCardSkeleton,
} from "../service-launcher-card";

describe("ServiceLauncherCard", () => {
  it("renders semantic content without inferring service state", () => {
    const { container } = render(
      <ServiceLauncherCard
        icon={Clock}
        title="勤怠管理"
        statusLabel="LIVE"
        statusTone="success"
        description="打刻・シフト・休暇申請。"
        metadata="kintai.godx.jp · スタンダード"
        action={<Button>起動</Button>}
      />,
    );

    expect(screen.getByRole("heading", { level: 2, name: "勤怠管理" })).toBeInTheDocument();
    expect(
      screen.getByText("LIVE").closest('[data-slot="service-launcher-status"]'),
    ).toHaveAttribute("data-tone", "success");
    expect(screen.getByText("kintai.godx.jp · スタンダード")).toBeInTheDocument();
    expect(container.querySelector('[data-slot="service-launcher-icon"] svg')).toBeTruthy();
  });

  it("renders an optional disabled reason supplied by the consumer", () => {
    render(
      <ServiceLauncherCard
        icon={Clock}
        title="会計"
        action={<Button disabled>起動</Button>}
        disabledReason="Your organization has no active subscription."
      />,
    );

    expect(screen.getByText("Your organization has no active subscription.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "起動" })).toBeDisabled();
  });

  it("renders a token-owned catalog CTA and shape-matched loading state", () => {
    const { rerender, container } = render(
      <ServiceCatalogCta
        title="サービスカタログから追加"
        action={<Button>カタログを見る</Button>}
      />,
    );
    expect(container.querySelector("[data-service-catalog-cta]")).toBeTruthy();
    expect(screen.getByRole("button", { name: "カタログを見る" })).toBeInTheDocument();

    rerender(<ServiceLauncherCardSkeleton label="サービスを読み込み中" />);
    expect(screen.getByLabelText("サービスを読み込み中")).toHaveAttribute("aria-busy", "true");
    expect(container.querySelectorAll(".ui-skeleton-block")).toHaveLength(6);
  });

  it("has no axe violations for launcher and catalog tiles", async () => {
    await expectNoA11yViolations(
      <main>
        <h1>サービス</h1>
        <ServiceLauncherCard
          icon={Clock}
          title="勤怠管理"
          statusLabel="LIVE"
          statusTone="success"
          description="打刻・シフト・休暇申請。"
          metadata="kintai.godx.jp · スタンダード"
          action={<Button>起動</Button>}
        />
        <ServiceCatalogCta
          title="サービスカタログから追加"
          action={<Button variant="outline">カタログを見る</Button>}
        />
      </main>,
    );
  });
});
