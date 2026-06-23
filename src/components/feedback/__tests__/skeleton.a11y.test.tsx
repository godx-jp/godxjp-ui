import { describe, it } from "vitest";

import { Skeleton, SkeletonDetail, SkeletonRows, SkeletonStat, SkeletonTable } from "../skeleton";
import { expectNoA11yViolations } from "@/test/a11y";

describe("Skeleton a11y", () => {
  it("has no axe violations (single block)", async () => {
    await expectNoA11yViolations(<Skeleton className="h-4 w-32" />);
  });

  it("has no axe violations (rows)", async () => {
    await expectNoA11yViolations(<SkeletonRows rows={4} columns={3} />);
  });

  it("has no axe violations (table)", async () => {
    await expectNoA11yViolations(<SkeletonTable rows={3} columns={4} />);
  });

  it("has no axe violations (detail + stat)", async () => {
    await expectNoA11yViolations(
      <>
        <SkeletonDetail />
        <SkeletonStat />
      </>,
    );
  });
});
