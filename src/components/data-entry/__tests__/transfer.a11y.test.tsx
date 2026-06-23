import { describe, it } from "vitest";

import { Transfer } from "../transfer";
import type { TransferItemProp } from "../transfer";
import { expectNoA11yViolations } from "@/test/a11y";

const DATA: TransferItemProp[] = [
  { key: "a", title: "大阪倉庫", description: "OSA-01" },
  { key: "b", title: "東京倉庫", description: "TYO-02" },
  { key: "c", title: "名古屋倉庫", description: "NGO-03", disabled: true },
  { key: "d", title: "福岡倉庫", description: "FUK-04" },
];

describe("Transfer a11y", () => {
  it("has no axe violations (with items, search, titles)", async () => {
    await expectNoA11yViolations(
      <Transfer
        dataSource={DATA}
        targetKeys={["b"]}
        titles={["未割当", "割当済み"]}
        showSearch
        onValueChange={() => undefined}
      />,
    );
  });

  it("has no axe violations (disabled)", async () => {
    await expectNoA11yViolations(<Transfer dataSource={DATA} targetKeys={["a", "d"]} disabled />);
  });

  it("has no axe violations (oneWay)", async () => {
    await expectNoA11yViolations(<Transfer dataSource={DATA} targetKeys={[]} oneWay />);
  });
});
