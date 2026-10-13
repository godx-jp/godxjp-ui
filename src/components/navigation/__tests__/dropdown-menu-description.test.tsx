import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Button } from "../../general/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../dropdown-menu";

/**
 * THE TWO-LINE ROW (gh#1246) — `DropdownMenuItem description`.
 *
 * The description is a second, muted line, and it must stay SECOND to assistive technology too:
 * the row's accessible name is the label alone, the description reaches it as
 * `aria-describedby` (RAC's `<Text slot="description">`). Wrapping the label in slots also hides
 * the bare string RAC's collection reads for typeahead, so the label string is handed over as
 * `textValue` — otherwise a described row could no longer be reached by typing its first letter.
 */
describe("DropdownMenuItem — description", () => {
  const renderMenu = (onWeb = vi.fn(), onApp = vi.fn()) => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button>Services</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem description="Modern & responsive websites" onSelect={onWeb}>
            Web design
          </DropdownMenuItem>
          <DropdownMenuItem description="iOS and Android" onSelect={onApp}>
            App development
          </DropdownMenuItem>
          <DropdownMenuItem>Contact</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    return { onWeb, onApp };
  };

  it("names the row by its label and describes it by the description", async () => {
    const user = userEvent.setup();
    renderMenu();
    await user.click(screen.getByRole("button", { name: "Services" }));
    const item = await screen.findByRole("menuitem", {
      name: "Web design",
      description: "Modern & responsive websites",
    });
    expect(item.getAttribute("data-slot")).toBe("dropdown-menu-item");
    expect(item.hasAttribute("data-description")).toBe(true);
    const description = item.querySelector('[data-slot="dropdown-menu-item-description"]');
    expect(description?.textContent).toBe("Modern & responsive websites");
  });

  it("leaves a row without a description untouched", async () => {
    const user = userEvent.setup();
    renderMenu();
    await user.click(screen.getByRole("button", { name: "Services" }));
    const item = await screen.findByRole("menuitem", { name: "Contact" });
    expect(item.hasAttribute("data-description")).toBe(false);
    expect(item.hasAttribute("aria-describedby")).toBe(false);
    expect(item.querySelector('[data-slot="dropdown-menu-item-description"]')).toBeNull();
  });

  it("ArrowDown then Enter still selects a described row", async () => {
    const user = userEvent.setup();
    const { onWeb, onApp } = renderMenu();
    // Keyboard open (APG): Enter on the trigger lands on the first row, ArrowDown moves on.
    screen.getByRole("button", { name: "Services" }).focus();
    await user.keyboard("{Enter}");
    await waitFor(() => expect(screen.getByRole("menuitem", { name: "Web design" })).toHaveFocus());
    await user.keyboard("{ArrowDown}");
    await waitFor(() =>
      expect(screen.getByRole("menuitem", { name: "App development" })).toHaveFocus(),
    );
    await user.keyboard("{Enter}");
    expect(onApp).toHaveBeenCalledTimes(1);
    expect(onWeb).not.toHaveBeenCalled();
  });

  it("typeahead reaches a described row by its label", async () => {
    const user = userEvent.setup();
    renderMenu();
    await user.click(screen.getByRole("button", { name: "Services" }));
    await screen.findByRole("menu");
    await user.keyboard("a");
    await waitFor(() =>
      expect(screen.getByRole("menuitem", { name: "App development" })).toHaveFocus(),
    );
  });
});
