import { describe, it } from "vitest";

import { Descriptions } from "../descriptions";
import { expectNoA11yViolations } from "@/test/a11y";

// Descriptions renders a dl/dt/dd metadata list; each item must pair a label
// with its value so the association is exposed to assistive tech.
describe("Descriptions a11y", () => {
  it("has no axe violations for a 2-column metadata list", async () => {
    await expectNoA11yViolations(
      <Descriptions>
        <Descriptions.Item label="氏名">山田 太郎</Descriptions.Item>
        <Descriptions.Item label="メール">taro@example.com</Descriptions.Item>
        <Descriptions.Item label="注文 ID" mono>
          ord_123456
        </Descriptions.Item>
        <Descriptions.Item label="備考" span={2}>
          配送先住所の変更を希望
        </Descriptions.Item>
      </Descriptions>,
    );
  });

  it("has no axe violations for a single-column list", async () => {
    await expectNoA11yViolations(
      <Descriptions columns={1}>
        <Descriptions.Item label="ステータス">配送中</Descriptions.Item>
      </Descriptions>,
    );
  });
});
