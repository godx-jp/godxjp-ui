import { describe, it } from "vitest";
import { Progress } from "../data-display/progress";
import { expectNoA11yViolations } from "@/test/a11y";

// Progress exposes a progressbar role with aria-valuenow/min/max and an
// associated label; a missing/incorrect ARIA value would mislead screen readers.
describe("Progress a11y", () => {
  it("has no axe violations with a value and label", async () => {
    await expectNoA11yViolations(<Progress value={42} label="Upload progress" />);
  });
});
