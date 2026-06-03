import { describe, it } from "vitest";
import { Timeline } from "../data-display/timeline";
import type { TimelineItem } from "../data-display/timeline";
import { expectNoA11yViolations } from "@/test/a11y";

// Timeline renders an ordered list of events with the current step marked via
// aria-current; the list semantics and decorative icons must stay AT-friendly.
const items: TimelineItem[] = [
  { title: "Order placed", time: "09:00" },
  { title: "In transit", time: "12:30", current: true },
  { title: "Delivered", time: "—" },
];

describe("Timeline a11y", () => {
  it("has no axe violations for a multi-step timeline", async () => {
    await expectNoA11yViolations(<Timeline items={items} />);
  });
});
