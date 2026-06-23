import { describe, it } from "vitest";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../select";
import { Label } from "../label";
import { expectNoA11yViolations } from "@/test/a11y";

const OPTIONS = [
  { value: "osaka", label: "大阪" },
  { value: "tokyo", label: "東京" },
  { value: "kyoto", label: "京都", disabled: true },
];

describe("Select a11y", () => {
  it("has no axe violations (compound API with label)", async () => {
    await expectNoA11yViolations(
      <div>
        <Label htmlFor="branch">支店</Label>
        <Select defaultValue="osaka">
          <SelectTrigger id="branch">
            <SelectValue placeholder="支店を選択" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="osaka">大阪</SelectItem>
            <SelectItem value="tokyo">東京</SelectItem>
            <SelectItem value="kyoto" disabled>
              京都
            </SelectItem>
          </SelectContent>
        </Select>
      </div>,
    );
  });

  it("has no axe violations (data-driven options, no search)", async () => {
    await expectNoA11yViolations(
      <Select aria-label="支店" options={OPTIONS} defaultValue="tokyo" placeholder="支店を選択" />,
    );
  });

  it("has no axe violations (disabled)", async () => {
    await expectNoA11yViolations(
      <Select aria-label="支店" options={OPTIONS} defaultValue="osaka" disabled />,
    );
  });
});
