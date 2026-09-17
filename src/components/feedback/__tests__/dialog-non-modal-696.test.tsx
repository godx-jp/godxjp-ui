import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, renderWithUi, screen, userEvent, waitFor } from "@/test/render";

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTrigger } from "../dialog";
import { Button } from "../../general/button";

/*
 * gh#696 — `<Dialog modal={false}>` was accepted by the type and dropped at runtime once the
 * surface moved onto react-aria-components: RAC's `Modal` always locks scroll, hides the rest of
 * the page from assistive tech, and closes on an outside press. A non-modal dialog is a pattern
 * WAI-ARIA APG allows (Dialog (Modal) pattern · "non-modal dialogs"), so the prop is honoured again.
 *
 * The harness is the reported shape: a list behind the dialog that must stay editable while the
 * dialog is open.
 */
function ListBehindDialog({
  modal,
  onOpenChange,
}: {
  modal?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [quantity, setQuantity] = React.useState(1);

  return (
    <div data-testid="page">
      <Button
        onClick={() => {
          setQuantity((q) => q + 1);
        }}
      >
        増やす
      </Button>
      <p data-testid="quantity">{quantity}</p>
      <Dialog
        modal={modal}
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          onOpenChange?.(next);
        }}
      >
        <DialogTrigger asChild>
          <Button>お支払い</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader title="お会計" />
          <DialogFooter>
            <Button>確定</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function hiddenFromAssistiveTech(node: Element): boolean {
  return node.closest('[aria-hidden="true"], [inert]') != null;
}

function scrollLocked(): boolean {
  return (
    document.documentElement.style.overflow === "hidden" ||
    document.body.style.overflow === "hidden"
  );
}

async function openDialog(user: ReturnType<typeof userEvent.setup>): Promise<HTMLElement> {
  await user.click(screen.getByRole("button", { name: "お支払い" }));
  return screen.getByRole("dialog", { name: "お会計" });
}

describe("gh#696 — Dialog modal={false} is a real non-modal dialog", () => {
  it("keeps the page behind interactive: an outside button's handler fires and the dialog stays open", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    renderWithUi(<ListBehindDialog modal={false} onOpenChange={onOpenChange} />);

    const dialog = await openDialog(user);
    onOpenChange.mockClear();

    await user.click(screen.getByRole("button", { name: "増やす" }));

    expect(screen.getByTestId("quantity")).toHaveTextContent("2");
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(dialog).toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: "お会計" })).toBeInTheDocument();
  });

  it("does not close on a raw outside pointer press either", async () => {
    const user = userEvent.setup();
    renderWithUi(<ListBehindDialog modal={false} />);
    await openDialog(user);

    const outside = screen.getByTestId("quantity");
    fireEvent.pointerDown(outside, { button: 0, pointerId: 1, detail: 1 });
    fireEvent.mouseDown(outside, { button: 0, detail: 1 });
    fireEvent.pointerUp(outside, { button: 0, pointerId: 1, detail: 1 });
    fireEvent.mouseUp(outside, { button: 0, detail: 1 });
    fireEvent.click(outside, { button: 0, detail: 1 });

    expect(screen.getByRole("dialog", { name: "お会計" })).toBeInTheDocument();
  });

  it("leaves outside content in the accessibility tree, sets no aria-modal, renders no scrim and locks no scroll", async () => {
    const user = userEvent.setup();
    renderWithUi(<ListBehindDialog modal={false} />);
    const dialog = await openDialog(user);

    expect(hiddenFromAssistiveTech(screen.getByTestId("page"))).toBe(false);
    // Reachable by role = not hidden from the accessibility tree.
    expect(screen.getByRole("button", { name: "増やす" })).toBeInTheDocument();
    expect(dialog.getAttribute("aria-modal")).not.toBe("true");
    expect(document.querySelector('[data-slot="dialog-overlay"]')).toBeNull();
    expect(scrollLocked()).toBe(false);
  });

  it("moves focus into the dialog on open, and Tab can leave it", async () => {
    const user = userEvent.setup();
    renderWithUi(<ListBehindDialog modal={false} />);
    const dialog = await openDialog(user);

    await waitFor(() => {
      expect(dialog).toContainElement(document.activeElement as HTMLElement);
    });

    screen.getByRole("button", { name: "確定" }).focus();
    await user.tab({ shift: true });

    expect(dialog).not.toContainElement(document.activeElement as HTMLElement);
    expect(document.activeElement).not.toBe(document.body);
    expect(screen.getByRole("dialog", { name: "お会計" })).toBeInTheDocument();
  });

  it("closes on Escape with focus inside and returns focus to the trigger", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    renderWithUi(<ListBehindDialog modal={false} onOpenChange={onOpenChange} />);
    const dialog = await openDialog(user);
    await waitFor(() => {
      expect(dialog).toContainElement(document.activeElement as HTMLElement);
    });

    await user.keyboard("{Escape}");

    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "お支払い" }));
  });
});

describe("gh#696 — the default (modal) Dialog is unchanged", () => {
  it("hides outside content, locks scroll, and closes on an outside press", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    renderWithUi(<ListBehindDialog onOpenChange={onOpenChange} />);
    await openDialog(user);

    expect(hiddenFromAssistiveTech(screen.getByTestId("page"))).toBe(true);
    expect(scrollLocked()).toBe(true);

    const scrim = document.querySelector('[data-slot="dialog-overlay"]');
    expect(scrim).not.toBeNull();
    fireEvent.pointerDown(scrim as Element, { button: 0, pointerId: 1, detail: 1 });
    fireEvent.mouseDown(scrim as Element, { button: 0, detail: 1 });
    fireEvent.pointerUp(scrim as Element, { button: 0, pointerId: 1, detail: 1 });
    fireEvent.mouseUp(scrim as Element, { button: 0, detail: 1 });
    fireEvent.click(scrim as Element, { button: 0, detail: 1 });

    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });
});

describe("gh#696 — an alertdialog stays modal", () => {
  it("ignores modal={false} under variant=destructive and says so in development", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    renderWithUi(
      <div data-testid="page">
        <Button>外のボタン</Button>
        <Dialog open modal={false}>
          <DialogContent variant="destructive">
            <DialogHeader title="削除しますか？" />
          </DialogContent>
        </Dialog>
      </div>,
    );

    expect(screen.getByRole("alertdialog", { name: "削除しますか？" })).toBeInTheDocument();
    expect(hiddenFromAssistiveTech(screen.getByTestId("page"))).toBe(true);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("alertdialog is always modal"));
    warn.mockRestore();
  });
});
