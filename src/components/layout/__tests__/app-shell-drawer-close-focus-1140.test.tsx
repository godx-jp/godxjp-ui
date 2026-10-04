import { describe, expect, it, vi } from "vitest";

import { AppShell } from "../app-shell";
import { renderWithUi, screen, userEvent, waitFor } from "@/test/render";

const nextFrame = () => new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));

/* gh#1140 — the pages app focuses the new page's heading after a drawer navigation; the built-in
 * drawer had no way to take SheetContent's onCloseAutoFocus, so it kept a Sheet of its own. */
describe("AppShell mobileNavOnCloseAutoFocus (gh#1140)", () => {
  it("sends focus to the consumer's target instead of the trigger on a drawer navigation", async () => {
    const user = userEvent.setup();
    const handler = vi.fn((event: Event) => {
      event.preventDefault();
      screen.getByRole("heading", { name: "Guides" }).focus();
    });
    renderWithUi(
      <AppShell sidebar={<a href="#guides">Guides link</a>} mobileNavOnCloseAutoFocus={handler}>
        <h1 tabIndex={-1}>Guides</h1>
      </AppShell>,
    );

    await user.click(screen.getByRole("button", { name: /menu/i }));
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    await user.click(screen.getByRole("link", { name: "Guides link" }));

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    await nextFrame();
    await nextFrame();
    expect(handler).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(screen.getByRole("heading", { name: "Guides" }));
  });

  it("returns focus to the trigger when no handler is passed", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <AppShell sidebar={<a href="#guides">Guides link</a>}>
        <h1 tabIndex={-1}>Guides</h1>
      </AppShell>,
    );
    await user.click(screen.getByRole("button", { name: /menu/i }));
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(document.activeElement).toBe(document.querySelector(".app-mobile-nav-trigger"));
  });
});
