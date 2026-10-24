import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";
import { Button } from "../../general/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../dropdown-menu";

/**
 * `DropdownMenuLabel` is react-aria's collection `Header`, whose element is `<header>`; RAC warns in
 * dev when the `render` prop returns anything else ("Expected <header>, got <div>"). The label used
 * to render a `<div>` to stay out of `banner` (a bare `<header>` outside sectioning content is a
 * banner landmark, and `role="menu"` may not own one — axe aria-required-children). It now renders
 * the `<header>` RAC expects with `role="presentation"`, which drops the landmark — ARIA in HTML
 * allows `none` / `presentation` on `header` — so both constraints hold.
 */
const RENDER_MISMATCH = /Unexpected DOM element returned by custom `render` function/;

let warn: MockInstance;
beforeEach(() => {
  warn = vi.spyOn(console, "warn");
});
afterEach(() => {
  warn.mockRestore();
});

describe("DropdownMenuLabel (react-aria Header element)", () => {
  it("renders RAC's <header> without a banner role and without a render-element warning", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button">Account</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>me@example.test</DropdownMenuLabel>
          <DropdownMenuItem>Sign out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    await user.click(screen.getByRole("button", { name: "Account" }));

    const label = screen.getByText("me@example.test");
    expect(label.tagName).toBe("HEADER");
    expect(label).toHaveAttribute("role", "presentation");
    expect(label).toHaveAttribute("data-slot", "dropdown-menu-label");
    expect(screen.queryByRole("banner")).not.toBeInTheDocument();
    expect(warn.mock.calls.filter((call) => RENDER_MISMATCH.test(String(call[0])))).toEqual([]);
  });
});
