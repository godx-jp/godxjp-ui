import { describe, it } from "vitest";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogRoot,
  AlertDialogTitle,
} from "../dialog";
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

// Rendered WITHOUT AlertDialogPortal so the alertdialog subtree stays inside the container axe
// sweeps. The portalled arrangement is behaviour-tested in dialog-alert-primitives.test.tsx.
describe("AlertDialogRoot compound composition a11y", () => {
  it("has no axe violations (explicit title + description children)", async () => {
    await expectNoA11yViolations(
      <AlertDialogRoot open onOpenChange={() => undefined}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm the July settlement?</AlertDialogTitle>
            <AlertDialogDescription>
              A transfer file is generated and reversing it needs an administrator.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Back</AlertDialogCancel>
            <AlertDialogAction>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogRoot>,
    );
  });

  it("has no axe violations (prop-driven header with a tone band)", async () => {
    await expectNoA11yViolations(
      <AlertDialogRoot open onOpenChange={() => undefined}>
        <AlertDialogContent showCloseButton>
          <AlertDialogHeader
            tone="destructive"
            title="Delete the imported batch?"
            subtitle="132 journal entries are removed and cannot be restored."
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Back</AlertDialogCancel>
            <AlertDialogAction>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogRoot>,
    );
  });
});
