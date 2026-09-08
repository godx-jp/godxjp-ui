import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";

import {
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogRoot,
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "../dialog";

describe("Dialog wrappers", () => {
  it("uses the shared dialog surface and overlay slots for token-owned responsive geometry", () => {
    renderWithUi(
      <Dialog open>
        <DialogContent>
          <DialogTitle>Canonical form</DialogTitle>
        </DialogContent>
      </Dialog>,
    );

    expect(screen.getByRole("dialog")).toHaveAttribute("data-slot", "dialog-content");
    expect(document.querySelector(".ui-dialog-overlay")).toHaveAttribute(
      "data-slot",
      "dialog-overlay",
    );
  });

  it("DialogClose dismisses the dialog", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    renderWithUi(
      <Dialog open onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogTitle>確認</DialogTitle>
          <DialogClose>閉じる</DialogClose>
        </DialogContent>
      </Dialog>,
    );
    await user.click(screen.getByRole("button", { name: "閉じる" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("AlertDialogContent — not AlertDialogOverlay — emits the overlay slot", () => {
    renderWithUi(
      // Root/Portal are SCAFFOLDING, not the subject: this case pins that
      // AlertDialogOverlay emits its slot. It used to instantiate them from
      // `@radix-ui/react-alert-dialog` because back then AlertDialogRoot was a
      // thin wrapper over that very primitive, so the two were interchangeable.
      // They no longer are — the root now carries react-aria's context — so the
      // scaffolding moves to the public root. The assertion is untouched.
      <AlertDialogRoot open>
        <AlertDialogPortal>
          <AlertDialogOverlay />
          <AlertDialogContent>
            <AlertDialogHeader title="削除" />
          </AlertDialogContent>
        </AlertDialogPortal>
      </AlertDialogRoot>,
    );
    expect(document.querySelector('[data-slot="dialog-overlay"]')).not.toBeNull();
  });

  it("AlertDialogOverlay renders nothing, and that is the contract", () => {
    // react-aria requires ModalOverlay to WRAP Modal, so the backdrop can only be emitted from
    // inside Content. AlertDialogOverlay survives as an empty shell purely so consumer JSX that
    // still lists it keeps compiling. Pinning the emptiness matters: "fixing" it to render a
    // backdrop of its own would stack two overlays, and the case above would not catch that
    // because it only asks whether the slot exists at all.
    const { container } = renderWithUi(<AlertDialogOverlay />);
    expect(container).toBeEmptyDOMElement();
  });
});
