import { describe, it } from "vitest";
import { AlertMutationFeedback } from "../mutation-feedback";
import type { AlertMutationFeedbackProp } from "../mutation-feedback";
import { expectNoA11yViolations } from "@/test/a11y";

type MutationLike = AlertMutationFeedbackProp["mutation"];

function mockMutation(partial: Partial<MutationLike>): MutationLike {
  return partial as MutationLike;
}

// AlertMutationFeedback renders nothing on idle/success and an alert + retry on
// error; the error branch is the one with a11y surface to validate.
describe("AlertMutationFeedback a11y", () => {
  it("error state (alert + retry) has no axe violations", async () => {
    await expectNoA11yViolations(
      <AlertMutationFeedback
        mutation={mockMutation({
          isPending: false,
          isError: true,
          error: new Error("POST /v1/invoices failed: 422"),
        })}
        onRetry={() => {}}
      />,
    );
  });

  it("pending slot has no axe violations", async () => {
    await expectNoA11yViolations(
      <AlertMutationFeedback
        mutation={mockMutation({ isPending: true, isError: false, error: null })}
        pending={<p role="status">Đang lưu…</p>}
      />,
    );
  });
});
