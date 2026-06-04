import { describe, it } from "vitest";
import { Inbox } from "lucide-react";
import { EmptyState } from "../data-display/empty-state";
import { expectNoA11yViolations } from "@/test/a11y";

// EmptyState is a role="status" region shown when a list has no rows; its title
// and decorative icon must be exposed/hidden correctly to assistive tech.
describe("EmptyState a11y", () => {
  it("has no axe violations with icon, title and description", async () => {
    await expectNoA11yViolations(
      <EmptyState
        icon={Inbox}
        title="No records yet"
        description="Create your first record to get started."
      />,
    );
  });
});
