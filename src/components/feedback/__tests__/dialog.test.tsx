import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent, waitFor } from "@/test/render";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  AlertDialog,
} from "../dialog";
import { Button } from "../../general/button";

function PhraseResetHarness() {
  const [open, setOpen] = React.useState(true);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Reopen
      </button>
      <AlertDialog
        open={open}
        onOpenChange={setOpen}
        title="Purge?"
        confirmPhrase="DELETE"
        confirmLabel="Purge"
        onConfirm={() => undefined}
      />
    </>
  );
}

describe("Dialog form mode", () => {
  it("opens on trigger click and closes via escape", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <Dialog>
        <DialogTrigger asChild>
          <Button type="button">Mở</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận manifest</DialogTitle>
            <DialogDescription>Chốt 12 kiện Osaka?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="ghost">
              Hủy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>,
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Mở" }));
    expect(screen.getByRole("dialog")).toHaveAttribute("data-slot", "dialog-content");
    expect(screen.getByText("Chốt 12 kiện Osaka?")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("calls onOpenChange when controlled", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    renderWithUi(
      <Dialog open onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogTitle>Controlled</DialogTitle>
        </DialogContent>
      </Dialog>,
    );
    await user.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

describe("AlertDialog", () => {
  it("renders alertdialog with title and description", () => {
    renderWithUi(
      <AlertDialog
        open
        onOpenChange={() => undefined}
        title="Chốt manifest?"
        description="47 kiện sẽ bị khóa."
        onConfirm={() => undefined}
      />,
    );

    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    expect(screen.getByText("Chốt manifest?")).toBeInTheDocument();
    expect(screen.getByText("47 kiện sẽ bị khóa.")).toBeInTheDocument();
  });

  it("calls onConfirm and closes when confirmed", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const onConfirm = vi.fn();
    renderWithUi(
      <AlertDialog
        open
        onOpenChange={onOpenChange}
        title="Confirm?"
        description="Sure?"
        onConfirm={onConfirm}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Tiếp tục" }));
    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledOnce();
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("closes on cancel without calling onConfirm", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const onConfirm = vi.fn();
    renderWithUi(
      <AlertDialog open onOpenChange={onOpenChange} title="Confirm?" onConfirm={onConfirm} />,
    );

    await user.click(screen.getByRole("button", { name: "Hủy" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("disables both buttons when pending", () => {
    renderWithUi(
      <AlertDialog
        open
        onOpenChange={() => undefined}
        title="Wait"
        pending
        onConfirm={() => undefined}
      />,
    );
    expect(screen.getByRole("button", { name: "Đang xử lý…" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Hủy" })).toBeDisabled();
  });

  it("keeps dialog open when keepOpenOnConfirm is true", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    renderWithUi(
      <AlertDialog
        open
        onOpenChange={onOpenChange}
        title="Next step"
        keepOpenOnConfirm
        onConfirm={() => undefined}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Tiếp tục" }));
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });

  describe("confirmPhrase", () => {
    it("shows type-to-confirm field and defaults confirm label to delete", () => {
      renderWithUi(
        <AlertDialog
          open
          onOpenChange={() => undefined}
          title="Purge?"
          confirmPhrase="DELETE"
          onConfirm={() => undefined}
        />,
      );

      expect(screen.getByPlaceholderText("DELETE")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Xóa" })).toBeDisabled();
    });

    it("enables confirm only when phrase matches exactly", async () => {
      const user = userEvent.setup();
      renderWithUi(
        <AlertDialog
          open
          onOpenChange={() => undefined}
          title="Purge?"
          confirmPhrase="DELETE"
          confirmLabel="Purge"
          onConfirm={() => undefined}
        />,
      );

      const confirmBtn = screen.getByRole("button", { name: "Purge" });
      const input = screen.getByPlaceholderText("DELETE");
      expect(confirmBtn).toBeDisabled();

      await user.type(input, "DELET");
      expect(confirmBtn).toBeDisabled();

      await user.type(input, "E");
      expect(confirmBtn).toBeEnabled();
    });

    it("clears typed phrase when dialog closes and reopens", async () => {
      const user = userEvent.setup();
      renderWithUi(<PhraseResetHarness />);

      await user.type(screen.getByPlaceholderText("DELETE"), "DELETE");
      await user.click(screen.getByRole("button", { name: "Hủy" }));

      await user.click(screen.getByRole("button", { name: "Reopen" }));
      expect(screen.getByPlaceholderText("DELETE")).toHaveValue("");
      expect(screen.getByRole("button", { name: "Purge" })).toBeDisabled();
    });
  });
});

describe("Dialog namespace", () => {
  it("supports shadcn showCloseButton naming", () => {
    renderWithUi(
      <Dialog open onOpenChange={() => undefined}>
        <DialogContent showCloseButton={false}>
          <DialogTitle>No close</DialogTitle>
        </DialogContent>
      </Dialog>,
    );
    expect(screen.queryByRole("button", { name: /close/i })).not.toBeInTheDocument();
  });
});
