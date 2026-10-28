import * as React from "react";
import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";
import { Button } from "../../general/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../dropdown-menu";

/**
 * react-aria-components' `MenuItem` picks its element from its own props — `href ? 'a' : 'div'` —
 * and warns in dev when a `render` prop returns anything else ("Unexpected DOM element returned by
 * custom `render` function. Expected <div>, got <a>"). `asChild` borrowed a link without telling
 * `MenuItem`, so every link item warned and was treated as an action item instead of a link.
 */
const RENDER_MISMATCH = /Unexpected DOM element returned by custom `render` function/;

/** A router link the library cannot see inside: it renders `<a>` but takes `to`, not `href`. */
const RouterLink = React.forwardRef<
  HTMLAnchorElement,
  { to: string; children?: React.ReactNode } & Omit<
    React.AnchorHTMLAttributes<HTMLAnchorElement>,
    "href"
  >
>(function RouterLink({ to, ...props }, ref) {
  return <a {...props} ref={ref} href={to} />;
});

let warn: MockInstance;
beforeEach(() => {
  warn = vi.spyOn(console, "warn");
});
afterEach(() => {
  warn.mockRestore();
});

function mismatchWarnings() {
  return warn.mock.calls.filter((call) => RENDER_MISMATCH.test(String(call[0])));
}

function renderMenu(item: React.ReactNode) {
  renderWithUi(
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button">Account</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>{item}</DropdownMenuContent>
    </DropdownMenu>,
  );
}

describe("DropdownMenuItem asChild link (react-aria render element)", () => {
  it("an <a href> child renders as RAC's link item without a render-element warning", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn((event: React.MouseEvent) => event.preventDefault());
    renderMenu(
      <DropdownMenuItem asChild>
        <a href="/settings" onClick={onClick}>
          Settings
        </a>
      </DropdownMenuItem>,
    );
    await user.click(screen.getByRole("button", { name: "Account" }));
    const item = screen.getByRole("menuitem", { name: "Settings" });
    expect(item.tagName).toBe("A");
    expect(item).toHaveAttribute("href", "/settings");

    await user.click(item);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(mismatchWarnings()).toEqual([]);
  });

  it("Enter on a link item fires the child's click exactly once", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn((event: React.MouseEvent) => event.preventDefault());
    renderMenu(
      <DropdownMenuItem asChild>
        <a href="/settings" onClick={onClick}>
          Settings
        </a>
      </DropdownMenuItem>,
    );
    await user.click(screen.getByRole("button", { name: "Account" }));
    screen.getByRole("menuitem", { name: "Settings" }).focus();
    await user.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(mismatchWarnings()).toEqual([]);
  });

  it("a router link the library cannot read takes its href from the item", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn((event: React.MouseEvent) => event.preventDefault());
    renderMenu(
      <DropdownMenuItem asChild href="/ja/collection/">
        <RouterLink to="/ja/collection/" onClick={onClick}>
          Collection
        </RouterLink>
      </DropdownMenuItem>,
    );
    await user.click(screen.getByRole("button", { name: "Account" }));
    const item = screen.getByRole("menuitem", { name: "Collection" });
    expect(item.tagName).toBe("A");
    expect(item).toHaveAttribute("href", "/ja/collection/");

    await user.click(item);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(mismatchWarnings()).toEqual([]);
  });
});
