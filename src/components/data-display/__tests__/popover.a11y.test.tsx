import { describe, it } from "vitest";

import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "../popover";
import { Button } from "../../general/button";
import { expectNoA11yViolations } from "@/test/a11y";

// Popover is an overlay; render it open via defaultOpen so the portaled content
// is in the DOM for axe, and give the trigger an accessible name.
describe("Popover a11y", () => {
  it("has no axe violations when open with header slots", async () => {
    await expectNoA11yViolations(
      <Popover defaultOpen>
        <PopoverTrigger asChild>
          <Button type="button">フィルター</Button>
        </PopoverTrigger>
        <PopoverContent>
          <PopoverHeader>
            <PopoverTitle>高度な絞り込み</PopoverTitle>
            <PopoverDescription>条件を選択してください。</PopoverDescription>
          </PopoverHeader>
        </PopoverContent>
      </Popover>,
    );
  });
});
