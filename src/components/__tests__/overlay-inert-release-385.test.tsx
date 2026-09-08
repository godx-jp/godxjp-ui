import * as React from "react";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { renderWithUi, screen, userEvent } from "@/test/render";
import { OverlayBackground, hiddenBackgroundCount } from "@/test/overlay-background";

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
 * An overlay takes the rest of the page out of play while it is open, which is what keeps axe's
 * `aria-hidden-focus` quiet (gh#352). The bug was never in APPLYING that — it was in RELEASING it.
 * Under Radix the release was keyed on `data-aria-hidden` going away, and `hideOthers` undoes
 * itself at UNMOUNT; Presence holds the content mounted for the whole exit animation, so the
 * background stayed `inert` for an animation longer than the menu was open.
 *
 * A `DropdownMenuItem` whose `onSelect` swaps a row into an inline edit form mounts that form
 * synchronously, in the click handler, INSIDE that still-hidden background. The form paints,
 * looks ordinary, and silently refuses focus and input. The consuming app that reported this saw
 * it as a data bug: typing went nowhere, Save submitted the unchanged body, and the server stamped
 * `edited_at` anyway — a post flagged "edited" with identical content.
 *
 * WHO GUARANTEES IT NOW. The menu is react-aria-components, and RAC's `usePopover` scopes
 * `ariaHideOutside` to an effect keyed on `state.isOpen` — so the release fires on CLOSE INTENT,
 * the same synchronous turn as the item's action, and cannot drift to unmount. That is the
 * upstream version of what `components/general/inert-background.ts` still hand-rolls for the
 * overlays that are still Radix (Select, ContextMenu). This file is what proves the guarantee is
 * really there, whichever backing the menu has.
 *
 * WHY jsdom NEEDS A NUDGE. The window this bug lives in is the exit ANIMATION, and jsdom has no
 * animations: `Element.prototype.getAnimations` does not exist, and RAC's `useExitAnimation`
 * treats that as "the animation already finished" and unmounts immediately. So the whole race
 * disappears and a click-through test passes with or without the fix — measured under Radix, by
 * reverting the fix and watching it stay green.
 *
 * `beforeAll` therefore gives jsdom the one thing it is missing: an animation that never finishes.
 * That is a smaller and more faithful stand-in than poking the closing overlay's attributes by
 * hand — the component is left to close itself exactly as it would in Chrome, and it holds the
 * content mounted for the rest of the test. All three cases below run inside that window.
 */
const animationHost = Element.prototype as unknown as Record<string, unknown>;
let realGetAnimations: unknown;

beforeAll(() => {
  // `useEnterAnimation` narrows with `instanceof CSSTransition` as soon as `getAnimations` exists,
  // and jsdom has no such global; a dummy nothing is an instance of keeps that branch honest.
  (globalThis as unknown as Record<string, unknown>).CSSTransition ??= class {};
  realGetAnimations = animationHost.getAnimations;
  animationHost.getAnimations = () => [{ finished: new Promise(() => {}) }];
});

afterAll(() => {
  animationHost.getAnimations = realGetAnimations;
});
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
  it("releases the background while the closing menu is still mounted", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <OverlayBackground>
        <InlineEditMenu />
      </OverlayBackground>,
    );

    await user.click(screen.getByRole("button", { name: "Thao tác" }));
    const menu = await screen.findByRole("menu");
    const surface = menu.closest('[data-slot="dropdown-menu-content"]');

    expect(
      hiddenBackgroundCount(),
      "an open menu must take the hidden background out of play (gh#352)",
    ).toBeGreaterThan(0);

    await user.click(screen.getByRole("menuitem", { name: "Sửa" }));

    // The window under test, and the two halves of it have to be checked separately or the case
    // proves nothing. First half: the menu has NOT unmounted. Under Radix this was Presence
    // holding the content through the exit animation; here it is RAC's own exit state, which the
    // never-finishing animation above keeps latched.
    expect(menu.isConnected, "the closing menu must still be mounted").toBe(true);
    expect(surface).toHaveAttribute("data-exiting", "true");
    expect(surface).toHaveAttribute("data-state", "closed");

    // Second half: and yet the background is already back in play. That is the whole of gh#385 —
    // release on close INTENT, not on unmount.
    expect(
      hiddenBackgroundCount(),
      "close intent must release the background, without waiting for the exit animation",
    ).toBe(0);
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
    // The failing shape, stated the way the reporter measured it — widened by one mechanism,
    // because RAC falls back to a bare `aria-hidden` where the platform has no `inert` and jsdom
    // is exactly that platform. Asking only about `inert` here would pass without checking
    // anything. See `neutralisedBackground` in `src/test/overlay-background.tsx`.
    expect(box.closest("[inert]")).toBeNull();
    expect(box.closest('[aria-hidden="true"]')).toBeNull();

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
