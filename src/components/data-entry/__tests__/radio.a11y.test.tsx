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

  /*
   * Hand-composed items name their control with `htmlFor`, NOT by wrapping it.
   *
   * react-aria renders its own `<label>` around the real `<input type="radio">`. A second `<label>`
   * wrapped around THAT is nested-label markup: invalid HTML, and axe resolves the implicit label
   * to the inner one — which holds only the dot — so the input comes out with no name at all.
   * `Field` (what `Radio.Group`'s `options` API uses) has always put the label BESIDE the control
   * for the same reason.
   */
  it("has no axe violations (composed items inside group, horizontal)", async () => {
    await expectNoA11yViolations(
      <RadioGroupRoot aria-label="支払方法" defaultValue="cash" data-orientation="horizontal">
        <span className="flex items-center gap-2">
          <Radio value="cash" id="pay-cash" />
          <Label htmlFor="pay-cash">現金</Label>
        </span>
        <span className="flex items-center gap-2">
          <Radio value="card" id="pay-card" />
          <Label htmlFor="pay-card">カード</Label>
        </span>
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
