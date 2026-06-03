import { describe, it } from "vitest";
import { Steps } from "../navigation/steps";
import type { StepItemProp } from "../navigation/steps";
import { expectNoA11yViolations } from "@/test/a11y";

// Steps communicate progress through a multi-stage flow; the active step and
// labels must be reachable in the accessibility tree (uses value/onValueChange).
const items: StepItemProp[] = [{ title: "Details" }, { title: "Review" }, { title: "Confirm" }];

describe("Steps a11y", () => {
  it("has no axe violations in an informational (read-only) step list", async () => {
    await expectNoA11yViolations(<Steps items={items} value={1} />);
  });

  it("has no axe violations when steps are interactive controls", async () => {
    await expectNoA11yViolations(<Steps items={items} value={1} onValueChange={() => {}} />);
  });
});
