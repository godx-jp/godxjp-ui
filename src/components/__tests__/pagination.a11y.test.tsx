import { describe, it } from "vitest";
import { Pagination } from "../navigation/pagination";
import { expectNoA11yViolations } from "@/test/a11y";

// Pagination is a navigation landmark with prev/next/page controls; an
// out-of-range or unlabeled control would block keyboard + screen-reader users.
describe("Pagination a11y", () => {
  it("has no axe violations on a middle page", async () => {
    await expectNoA11yViolations(
      <Pagination value={2} total={95} pageSize={10} onValueChange={() => {}} />,
    );
  });
});
