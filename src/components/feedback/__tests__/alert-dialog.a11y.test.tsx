import { describe, it } from "vitest";

import { AlertDialog } from "../dialog";
import { expectNoA11yViolations } from "@/test/a11y";

describe("AlertDialog DangerConfirm a11y", () => {
  it("has no axe violations (typed challenge / danger header)", async () => {
    await expectNoA11yViolations(
      <AlertDialog
        open
        onOpenChange={() => undefined}
        title="Delete “Acme Inc.” permanently?"
        description="This removes every workspace and cannot be undone."
        challenge="acme-inc"
        confirmLabel="Delete organization"
        onConfirm={() => undefined}
      />,
    );
  });

  it("has no axe violations (step-up destructive confirm)", async () => {
    await expectNoA11yViolations(
      <AlertDialog
        open
        onOpenChange={() => undefined}
        title="Issue a full refund?"
        description="The charge is reversed immediately."
        variant="destructive"
        confirmLabel="Refund now"
        stepUp={async () => true}
        onConfirm={() => undefined}
      />,
    );
  });
});
