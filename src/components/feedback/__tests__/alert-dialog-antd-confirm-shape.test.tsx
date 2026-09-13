import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";

import { AlertDialog } from "../dialog";

/**
 * ANT DESIGN PARITY: the danger signal is a GLYPH beside the title, not a tinted surface.
 *
 * antd's `Modal.confirm` paints a status icon to the inline-start of the title and leaves the
 * surface at `colorBgElevated`. It never tints a modal header — its soft `colorErrorBg` belongs to
 * `Alert`/`Tag`/`message`, and always arrives with padding and a border. This preset used to force
 * `tone="destructive"` on the header, which put a THIRD danger signal on a screen that already has
 * a destructive confirm button and a type-to-confirm challenge (the strongest of the three), while
 * matching neither antd nor a properly padded band.
 *
 * `DialogHeader tone` stays a published seven-value axis; the preset simply stops imposing it.
 *
 * Measured in Chromium on `/isolate/feedback-danger-confirm` after the change: header background
 * `rgba(0, 0, 0, 0)`, `data-tone="default"`, glyph 24×24 at `rgb(184, 40, 48)`, icon top and title
 * top both 349.3, 12px between them, console clean, Escape still closes.
 */

const renderChallenge = (extra: Partial<React.ComponentProps<typeof AlertDialog>> = {}) => {
  const onConfirm = vi.fn().mockResolvedValue(undefined);
  render(
    <AlertDialog
      open
      onOpenChange={() => undefined}
      title="Delete “Acme Inc.” permanently?"
      description="This removes every workspace, member and billing record."
      challenge="acme-inc"
      onConfirm={onConfirm}
      {...extra}
    />,
  );
  return { onConfirm };
};

describe("AlertDialog preset — antd Modal.confirm shape", () => {
  it("does NOT tint the header: the tone stays default", () => {
    renderChallenge();
    const header = document.querySelector('[data-slot="dialog-header"]');
    expect(header).not.toBeNull();
    expect(header).toHaveAttribute("data-tone", "default");
    // The tint class is what painted the band; its absence is the whole change.
    expect(header?.className ?? "").not.toContain("bg-destructive");
  });

  it("paints a leading status glyph instead", () => {
    renderChallenge();
    const icon = document.querySelector(".ui-dialog-confirm-icon");
    expect(icon).not.toBeNull();
    // Decorative: the accessible name comes from the title, so the glyph must not be announced.
    expect(icon).toHaveAttribute("aria-hidden", "true");
  });

  it("puts the glyph BEFORE the title in reading order, as antd does", () => {
    renderChallenge();
    const body = document.querySelector(".ui-dialog-confirm-body");
    const icon = body?.querySelector(".ui-dialog-confirm-icon");
    const title = body?.querySelector('[data-slot="dialog-title"]');
    expect(icon).not.toBeNull();
    expect(title).not.toBeNull();
    expect(icon!.compareDocumentPosition(title!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("keeps the title and description wired to the dialog's accessible name", () => {
    renderChallenge();
    const dialog = screen.getByRole("alertdialog");
    const title = document.querySelector('[data-slot="dialog-title"]');
    const description = document.querySelector('[data-slot="dialog-description"]');
    expect(dialog).toHaveAttribute("aria-labelledby", title?.id);
    expect(dialog).toHaveAttribute("aria-describedby", description?.id);
  });

  it("shows NO glyph for a non-destructive confirm — the glyph IS the danger signal", () => {
    render(
      <AlertDialog
        open
        onOpenChange={() => undefined}
        title="Publish this schedule?"
        description="Members will be notified."
        onConfirm={vi.fn().mockResolvedValue(undefined)}
      />,
    );
    expect(document.querySelector(".ui-dialog-confirm-icon")).toBeNull();
  });

  it("shows the glyph for an explicit destructive variant without a challenge", () => {
    render(
      <AlertDialog
        open
        onOpenChange={() => undefined}
        variant="destructive"
        title="Revoke this API key?"
        onConfirm={vi.fn().mockResolvedValue(undefined)}
      />,
    );
    expect(document.querySelector(".ui-dialog-confirm-icon")).not.toBeNull();
  });

  it("still gates the confirm button behind the typed challenge", async () => {
    const user = userEvent.setup();
    const { onConfirm } = renderChallenge({ confirmLabel: "Delete organization" });
    const confirm = screen.getByRole("button", { name: "Delete organization" });

    await user.click(confirm);
    expect(onConfirm).not.toHaveBeenCalled();

    await user.type(screen.getByRole("textbox"), "acme-inc");
    await user.click(confirm);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
