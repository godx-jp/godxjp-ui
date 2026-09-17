import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, renderWithUi, screen, userEvent, waitFor } from "@/test/render";

import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTrigger } from "../sheet";
import { Button } from "../../general/button";

/*
 * gh#701 — `<Sheet modal={false}>` was accepted by the type and dropped at runtime, the same defect
 * gh#696 fixed for Dialog. A non-modal dialog is a pattern WAI-ARIA APG allows, so the prop now
 * gives the same contract: the list behind the sheet stays editable while the sheet is open.
 */
function ListBehindSheet({
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
      <Sheet
        modal={modal}
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          onOpenChange?.(next);
        }}
      >
        <SheetTrigger asChild>
          <Button>明細</Button>
        </SheetTrigger>
        <SheetContent side="right">
          <SheetHeader title="注文明細" />
          <SheetFooter>
            <Button>確定</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
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

function pressOn(target: Element): void {
  fireEvent.pointerDown(target, { button: 0, pointerId: 1, detail: 1 });
  fireEvent.mouseDown(target, { button: 0, detail: 1 });
  fireEvent.pointerUp(target, { button: 0, pointerId: 1, detail: 1 });
  fireEvent.mouseUp(target, { button: 0, detail: 1 });
  fireEvent.click(target, { button: 0, detail: 1 });
}

async function openSheet(user: ReturnType<typeof userEvent.setup>): Promise<HTMLElement> {
  await user.click(screen.getByRole("button", { name: "明細" }));
  return screen.getByRole("dialog", { name: "注文明細" });
}

describe("gh#701 — Sheet modal={false} is a real non-modal dialog", () => {
  it("keeps the page behind interactive: an outside button's handler fires and the sheet stays open", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    renderWithUi(<ListBehindSheet modal={false} onOpenChange={onOpenChange} />);

    await openSheet(user);
    onOpenChange.mockClear();

    await user.click(screen.getByRole("button", { name: "増やす" }));

    expect(screen.getByTestId("quantity")).toHaveTextContent("2");
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog", { name: "注文明細" })).toBeInTheDocument();
  });

  it("does not close on a raw outside pointer press either", async () => {
    const user = userEvent.setup();
    renderWithUi(<ListBehindSheet modal={false} />);
    await openSheet(user);

    pressOn(screen.getByTestId("quantity"));

    expect(screen.getByRole("dialog", { name: "注文明細" })).toBeInTheDocument();
  });

  it("leaves outside content in the accessibility tree, sets no aria-modal, renders no scrim and locks no scroll", async () => {
    const user = userEvent.setup();
    renderWithUi(<ListBehindSheet modal={false} />);
    const sheet = await openSheet(user);

    expect(hiddenFromAssistiveTech(screen.getByTestId("page"))).toBe(false);
    expect(screen.getByRole("button", { name: "増やす" })).toBeInTheDocument();
    expect(sheet.getAttribute("aria-modal")).not.toBe("true");
    expect(document.querySelector('[data-slot="sheet-overlay"]')).toBeNull();
    expect(scrollLocked()).toBe(false);
    // Placement is unchanged: same side hook the modal sheet carries.
    expect(sheet).toHaveAttribute("data-slot", "sheet-content");
    expect(sheet).toHaveAttribute("data-side", "right");
  });

  it("moves focus into the sheet on open, and Tab can leave it", async () => {
    const user = userEvent.setup();
    renderWithUi(<ListBehindSheet modal={false} />);
    const sheet = await openSheet(user);

    await waitFor(() => {
      expect(sheet).toContainElement(document.activeElement as HTMLElement);
    });

    screen.getByRole("button", { name: "確定" }).focus();
    await user.tab({ shift: true });

    expect(sheet).not.toContainElement(document.activeElement as HTMLElement);
    expect(document.activeElement).not.toBe(document.body);
    expect(screen.getByRole("dialog", { name: "注文明細" })).toBeInTheDocument();
  });

  it("closes on Escape with focus inside and returns focus to the trigger", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    renderWithUi(<ListBehindSheet modal={false} onOpenChange={onOpenChange} />);
    const sheet = await openSheet(user);
    await waitFor(() => {
      expect(sheet).toContainElement(document.activeElement as HTMLElement);
    });

    await user.keyboard("{Escape}");

    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "明細" }));
  });
});

describe("gh#701 — the default (modal) Sheet is unchanged", () => {
  it("hides outside content, locks scroll, and closes on an outside press", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    renderWithUi(<ListBehindSheet onOpenChange={onOpenChange} />);
    await openSheet(user);

    expect(hiddenFromAssistiveTech(screen.getByTestId("page"))).toBe(true);
    expect(scrollLocked()).toBe(true);

    const scrim = document.querySelector('[data-slot="sheet-overlay"]');
    expect(scrim).not.toBeNull();
    pressOn(scrim as Element);

    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });
});
