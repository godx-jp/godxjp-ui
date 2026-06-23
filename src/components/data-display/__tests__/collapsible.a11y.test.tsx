import { describe, it } from "vitest";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../collapsible";
import { Button } from "../../general/button";
import { expectNoA11yViolations } from "@/test/a11y";

// Collapsible wires Radix disclosure semantics; the trigger needs an accessible
// name and the content must stay valid whether open or closed.
describe("Collapsible a11y", () => {
  it("has no axe violations when closed", async () => {
    await expectNoA11yViolations(
      <Collapsible>
        <CollapsibleTrigger asChild>
          <Button type="button">詳細を表示</Button>
        </CollapsibleTrigger>
        <CollapsibleContent>追加情報 GX-001</CollapsibleContent>
      </Collapsible>,
    );
  });

  it("has no axe violations when open (defaultOpen)", async () => {
    await expectNoA11yViolations(
      <Collapsible defaultOpen>
        <CollapsibleTrigger asChild>
          <Button type="button">詳細を非表示</Button>
        </CollapsibleTrigger>
        <CollapsibleContent>追加情報 GX-001</CollapsibleContent>
      </Collapsible>,
    );
  });
});
