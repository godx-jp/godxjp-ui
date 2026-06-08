import { describe, expect, it, vi } from "vitest";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { renderWithUi, screen, userEvent } from "@/test/render";

import {
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogOverlay,
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "../dialog";

describe("Dialog wrappers", () => {
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

  it("AlertDialogOverlay renders its overlay slot", () => {
    renderWithUi(
      <AlertDialogPrimitive.Root open>
        <AlertDialogPrimitive.Portal>
          <AlertDialogOverlay />
          <AlertDialogContent>
            <AlertDialogHeader title="削除" />
          </AlertDialogContent>
        </AlertDialogPrimitive.Portal>
      </AlertDialogPrimitive.Root>,
    );
    expect(document.querySelector('[data-slot="dialog-overlay"]')).not.toBeNull();
  });
});
