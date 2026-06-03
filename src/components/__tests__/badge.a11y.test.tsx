import { describe, it } from "vitest";
import { Badge } from "../data-display/badge";
import { expectNoA11yViolations } from "@/test/a11y";

// Badges convey status with a tone + optional icon; the decorative icon must be
// hidden while the text label stays readable to assistive tech.
describe("Badge a11y", () => {
  it("has no axe violations for a toned badge", async () => {
    await expectNoA11yViolations(<Badge tone="success">Active</Badge>);
  });
});
