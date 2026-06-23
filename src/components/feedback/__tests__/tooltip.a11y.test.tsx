import { describe, it } from "vitest";

import { Tooltip, TooltipContent, TooltipTrigger } from "../tooltip";
import { Button } from "../../general/button";
import { expectNoA11yViolations } from "@/test/a11y";

describe("Tooltip a11y", () => {
  it("has no axe violations (open tooltip on a button trigger)", async () => {
    await expectNoA11yViolations(
      <Tooltip open>
        <TooltipTrigger asChild>
          <Button type="button">エクスポート</Button>
        </TooltipTrigger>
        <TooltipContent>CSV としてエクスポート</TooltipContent>
      </Tooltip>,
    );
  });

  it("has no axe violations (closed tooltip)", async () => {
    await expectNoA11yViolations(
      <Tooltip>
        <TooltipTrigger asChild>
          <Button type="button" aria-label="削除">
            削除
          </Button>
        </TooltipTrigger>
        <TooltipContent>項目を削除</TooltipContent>
      </Tooltip>,
    );
  });
});
