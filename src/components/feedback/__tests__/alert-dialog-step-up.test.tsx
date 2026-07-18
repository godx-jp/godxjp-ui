import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent, waitFor } from "@/test/render";
import { AlertDialog } from "../dialog";

function Harness(props: Partial<React.ComponentProps<typeof AlertDialog>>) {
  const [open, setOpen] = React.useState(true);
  return (
    <AlertDialog
      open={open}
      onOpenChange={setOpen}
      title="Delete organization?"
      confirmLabel="Delete"
      onConfirm={() => undefined}
      {...props}
    />
  );
}

describe("AlertDialog challenge (typed slug)", () => {
  it("arms confirm only when the challenge token matches exactly", async () => {
    const user = userEvent.setup();
    renderWithUi(<Harness challenge="acme-inc" />);

    const confirmBtn = screen.getByRole("button", { name: "Delete" });
    const input = screen.getByPlaceholderText("acme-inc");
    expect(confirmBtn).toBeDisabled();

    await user.type(input, "acme");
    expect(confirmBtn).toBeDisabled();

    await user.type(input, "-inc");
    expect(confirmBtn).toBeEnabled();
  });
});

describe("AlertDialog stepUp (re-auth gate)", () => {
  it("runs stepUp before onConfirm and closes on success", async () => {
    const user = userEvent.setup();
    const order: string[] = [];
    const stepUp = vi.fn(async () => {
      order.push("stepUp");
      return true;
    });
    const onConfirm = vi.fn(() => {
      order.push("confirm");
    });
    const onOpenChange = vi.fn();

    renderWithUi(
      <AlertDialog
        open
        onOpenChange={onOpenChange}
        title="Issue refund?"
        confirmLabel="Refund"
        variant="destructive"
        stepUp={stepUp}
        onConfirm={onConfirm}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Refund" }));

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledOnce();
    });
    expect(order).toEqual(["stepUp", "confirm"]);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("blocks onConfirm and announces failure when stepUp resolves false", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onOpenChange = vi.fn();

    renderWithUi(
      <AlertDialog
        open
        onOpenChange={onOpenChange}
        title="Issue refund?"
        confirmLabel="Refund"
        variant="destructive"
        stepUp={async () => false}
        onConfirm={onConfirm}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Refund" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
    expect(onConfirm).not.toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });
});
