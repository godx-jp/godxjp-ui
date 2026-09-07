import * as React from "react";
import { describe, expect, it } from "vitest";

import { act, renderWithUi, screen, userEvent, waitFor } from "@/test/render";
import { OverlayBackground } from "@/test/overlay-background";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../navigation/dropdown-menu";
import { Button } from "../general/button";

/**
 * gh#385 — WHAT A MENU ITEM MOUNTS IN PLACE MUST BE USABLE THE INSTANT IT APPEARS.
 *
 * `useInertHiddenBackground` puts `inert` on the background Radix hides while an overlay is open,
 * which is what keeps axe's `aria-hidden-focus` quiet (gh#352). Releasing it used to be keyed on
 * `data-aria-hidden` going away — and Radix removes that from `hideOthers`' undo, at UNMOUNT.
 * Presence holds the content mounted for the whole exit animation, so the background stayed
 * `inert` for an animation longer than the menu was open.
 *
 * A `DropdownMenuItem` whose `onSelect` swaps a row into an inline edit form mounts that form
 * synchronously, in the click handler, INSIDE that still-`inert` background. The form paints,
 * looks ordinary, and silently refuses focus and input. The consuming app that reported this saw
 * it as a data bug: typing went nowhere, Save submitted the unchanged body, and the server stamped
 * `edited_at` anyway — a post flagged "edited" with identical content.
 *
 * The portalled case (a Dialog opened from a menu item) was fixed separately by skipping focus
 * guards; it never covered content mounted in place, because that content is a descendant of the
 * very element being inerted.
 *
 * WHY THE CONTRACT IS TESTED DIRECTLY AND NOT ONLY THROUGH THE USER FLOW. The window this bug
 * lives in is the exit ANIMATION, and jsdom has none: `getComputedStyle().animationName` is
 * always `"none"`, so Radix's Presence unmounts the content the moment the menu closes,
 * `hideOthers` undoes itself immediately, and the whole race disappears. A click-through test
 * therefore passes with or without the fix — measured, by reverting the fix and watching it stay
 * green — so on its own it would be a gate that guards nothing.
 *
 * What jsdom CAN hold exactly is the DOM state that window consists of: the content still
 * mounted, `data-state` already `"closed"`, `data-aria-hidden` still on the background. Radix
 * writes that first attribute in the same synchronous turn as the item's `onSelect`, and removes
 * the second an animation later. So the first test below pins the contract at that state, and the
 * two after it keep the end-to-end shape honest.
 */
function InlineEditMenu() {
  const [editing, setEditing] = React.useState(false);

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Thao tác</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={() => setEditing(true)}>Sửa</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {editing && <textarea aria-label="Sửa tin nhắn" defaultValue="nội dung cũ" />}
    </div>
  );
}

describe("gh#385: the background is released on close INTENT, not on unmount", () => {
  it("drops inert while the closing menu is still mounted and the background still marked", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <OverlayBackground>
        <InlineEditMenu />
      </OverlayBackground>,
    );

    await user.click(screen.getByRole("button", { name: "Thao tác" }));
    const menu = await screen.findByRole("menu");

    const background = document.querySelector("[inert]");
    expect(background, "an open menu must inert the hidden background (gh#352)").not.toBeNull();

    // Exactly what Radix does when an item is selected: `data-state` flips in the click handler,
    // while Presence keeps the content mounted and `hideOthers` keeps the background marked until
    // the exit animation ends.
    act(() => {
      menu.setAttribute("data-state", "closed");
    });

    expect(
      background?.hasAttribute("data-aria-hidden"),
      "the window under test is the one where the background is STILL marked",
    ).toBe(true);

    await waitFor(() => {
      expect(background?.hasAttribute("inert")).toBe(false);
    });
  });

  it("can take focus as soon as it appears", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <OverlayBackground>
        <InlineEditMenu />
      </OverlayBackground>,
    );

    await user.click(screen.getByRole("button", { name: "Thao tác" }));
    await user.click(await screen.findByRole("menuitem", { name: "Sửa" }));

    const box = await screen.findByLabelText("Sửa tin nhắn");
    // The failing shape, stated the way the reporter measured it.
    expect(box.closest("[inert]")).toBeNull();

    box.focus();
    expect(document.activeElement).toBe(box);
  });

  it("accepts typed text rather than discarding it", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <OverlayBackground>
        <InlineEditMenu />
      </OverlayBackground>,
    );

    await user.click(screen.getByRole("button", { name: "Thao tác" }));
    await user.click(await screen.findByRole("menuitem", { name: "Sửa" }));

    const box = await screen.findByLabelText<HTMLTextAreaElement>("Sửa tin nhắn");
    await user.clear(box);
    await user.type(box, "nội dung mới");

    // The reported symptom was the OLD value surviving the edit, which is what made it read as a
    // data bug downstream rather than as a focus bug.
    expect(box.value).toBe("nội dung mới");
  });
});
