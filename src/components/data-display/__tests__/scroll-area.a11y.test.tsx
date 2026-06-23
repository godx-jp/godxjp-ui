import { describe, it } from "vitest";

import { ScrollArea } from "../scroll-area";
import { expectNoA11yViolations } from "@/test/a11y";

// ScrollArea wraps content in a Radix viewport with custom scrollbars; the
// scrollable region must keep its content reachable to assistive tech.
describe("ScrollArea a11y", () => {
  it("has no axe violations for a scrollable list", async () => {
    await expectNoA11yViolations(
      <ScrollArea className="h-24 w-48">
        <ul>
          {Array.from({ length: 20 }, (_, i) => (
            <li key={i}>行 {i + 1}</li>
          ))}
        </ul>
      </ScrollArea>,
    );
  });
});
