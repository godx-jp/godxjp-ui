import { describe, it } from "vitest";

import { Banner } from "../banner";
import { Button } from "../../general/button";
import { expectNoA11yViolations } from "@/test/a11y";

describe("Banner a11y", () => {
  it("has no axe violations (polite tone, text only)", async () => {
    await expectNoA11yViolations(
      <Banner tone="info">
        <Banner.Title>サポートセッションが進行中です</Banner.Title>
        <Banner.Description>担当者がお客様の組織を閲覧しています。</Banner.Description>
      </Banner>,
    );
  });

  it("has no axe violations (assertive tone + actions + dismiss)", async () => {
    await expectNoA11yViolations(
      <Banner tone="warning" onDismiss={() => {}}>
        <Banner.Content>
          <Banner.Title>お支払いが確認できていません</Banner.Title>
          <Banner.Description>お支払い方法を更新してください。</Banner.Description>
        </Banner.Content>
        <Banner.Actions>
          <Button size="sm" variant="outline">
            お支払い方法を更新
          </Button>
        </Banner.Actions>
      </Banner>,
    );
  });

  it("has no axe violations (icon hidden)", async () => {
    await expectNoA11yViolations(
      <Banner tone="neutral" icon={false}>
        <Banner.Title>定期メンテナンスのお知らせ</Banner.Title>
      </Banner>,
    );
  });
});
