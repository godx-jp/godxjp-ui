import * as React from "react";
import { describe, expect, it, vi } from "vitest";

import { renderWithUi, screen, userEvent, waitFor } from "@/test/render";
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from "../sheet";

const nextFrame = () => new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));

function Harness({ onCloseAutoFocus }: { onCloseAutoFocus?: (event: Event) => void }) {
  return (
    <>
      <Sheet>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent onCloseAutoFocus={onCloseAutoFocus}>
          <SheetHeader title="Nav" />
        </SheetContent>
      </Sheet>
      <h1 tabIndex={-1}>Page title</h1>
    </>
  );
}

/* gh#1134 — the pages app focuses the new page's heading after a drawer navigation, and the
 * Sheet's own return-to-trigger raced it with no way to opt out. */
describe("SheetContent onCloseAutoFocus (gh#1134)", () => {
  it("sends focus to the consumer's target when the handler prevents the default", async () => {
    const user = userEvent.setup();
    const handler = vi.fn((event: Event) => {
      event.preventDefault();
      screen.getByRole("heading", { name: "Page title" }).focus();
    });
    renderWithUi(<Harness onCloseAutoFocus={handler} />);

    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    await user.keyboard("{Escape}");

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    await nextFrame();
    await nextFrame();
    expect(handler).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(screen.getByRole("heading", { name: "Page title" }));
  });

  it("still returns focus to the trigger when the handler does not prevent it", async () => {
    const user = userEvent.setup();
    const handler = vi.fn();
    renderWithUi(<Harness onCloseAutoFocus={handler} />);

    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    await user.keyboard("{Escape}");

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(handler).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Open" }));
  });
});

void React;
