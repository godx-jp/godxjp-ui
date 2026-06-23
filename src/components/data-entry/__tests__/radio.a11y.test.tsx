import { describe, it } from "vitest";

import { Radio, RadioGroup, RadioGroupRoot } from "../radio";
import { Label } from "../label";
import { expectNoA11yViolations } from "@/test/a11y";

describe("Radio a11y", () => {
  it("has no axe violations (options API with labels + descriptions)", async () => {
    await expectNoA11yViolations(
      <RadioGroup
        aria-label="配送方法"
        defaultValue="air"
        options={[
          { value: "air", label: "航空便", description: "1〜2営業日" },
          { value: "sea", label: "船便", description: "2〜4週間" },
          { value: "ground", label: "陸送", disabled: true },
        ]}
      />,
    );
  });

  it("has no axe violations (composed items inside group, horizontal)", async () => {
    await expectNoA11yViolations(
      <RadioGroupRoot aria-label="支払方法" defaultValue="cash" data-orientation="horizontal">
        <Label className="flex items-center gap-2">
          <Radio value="cash" />
          現金
        </Label>
        <Label className="flex items-center gap-2">
          <Radio value="card" />
          カード
        </Label>
      </RadioGroupRoot>,
    );
  });

  it("has no axe violations (disabled group)", async () => {
    await expectNoA11yViolations(
      <RadioGroup
        aria-label="区分"
        defaultValue="a"
        disabled
        options={[
          { value: "a", label: "区分A" },
          { value: "b", label: "区分B" },
        ]}
      />,
    );
  });
});
