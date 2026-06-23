import { describe, it } from "vitest";
import { ButtonRefetch } from "../query-refetch-button";
import type { ButtonRefetchProp } from "../query-refetch-button";
import { expectNoA11yViolations } from "@/test/a11y";

type QueryLike = ButtonRefetchProp["query"];

function mockQuery(partial: Partial<QueryLike>): QueryLike {
  return { refetch: () => Promise.resolve({} as never), ...partial } as QueryLike;
}

// ButtonRefetch is a Button with a decorative spinner icon; the button must keep
// an accessible name in both idle and fetching (disabled) states.
describe("ButtonRefetch a11y", () => {
  it("idle state has no axe violations", async () => {
    await expectNoA11yViolations(
      <ButtonRefetch query={mockQuery({ isFetching: false })} label="Làm mới" />,
    );
  });

  it("fetching (disabled) state has no axe violations", async () => {
    await expectNoA11yViolations(
      <ButtonRefetch query={mockQuery({ isFetching: true })} label="Làm mới" />,
    );
  });
});
