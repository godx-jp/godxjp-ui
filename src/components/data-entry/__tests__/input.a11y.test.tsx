import { describe, it } from "vitest";

import { Input } from "../input";
import { Label } from "../label";
import { expectNoA11yViolations } from "@/test/a11y";

describe("Input a11y", () => {
  it("has no axe violations (associated <Label htmlFor>)", async () => {
    await expectNoA11yViolations(
      <>
        <Label htmlFor="hawb">HAWB番号</Label>
        <Input id="hawb" defaultValue="180-12345678" />
      </>,
    );
  });

  it("has no axe violations (aria-label, allowClear with text)", async () => {
    await expectNoA11yViolations(
      <Input aria-label="検索" defaultValue="現金" allowClear onClear={() => undefined} />,
    );
  });

  it("has no axe violations (invalid / disabled / readOnly)", async () => {
    await expectNoA11yViolations(
      <>
        <Input aria-label="無効" value="abc" aria-invalid onChange={() => undefined} />
        <Input aria-label="確定" value="def" disabled onChange={() => undefined} />
        <Input aria-label="参照" value="ghi" readOnly />
      </>,
    );
  });
});
