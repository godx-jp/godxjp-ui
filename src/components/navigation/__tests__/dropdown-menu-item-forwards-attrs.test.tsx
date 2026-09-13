import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";

import { Button } from "../../general/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../dropdown-menu";

/**
 * `id` AND EVERY `data-*` REACH THE ITEM'S ROOT (gh#631).
 *
 * The trigger of this same component got that treatment in 20.0.0, for the reason the CHANGELOG
 * recorded: *"`data-*` / `id` now reach the trigger — they were swallowed before, so a consumer's
 * e2e selector came loose in silence."* The ITEM never did, so the two halves of one component
 * behaved in opposite ways.
 *
 * TYPESCRIPT CANNOT CATCH THIS, which is why it needs a test. JSX passes any hyphenated attribute
 * through unchecked, so `data-testid` compiles clean, `tsc` is green, the build is green — and it
 * fails only at runtime, in the one place nobody looks: an e2e selector that no longer matches.
 * `id` is worse still, because it is what `aria-activedescendant` points at, and it disappeared
 * without a word.
 *
 * The consumer's workaround was `asChild` around a bare `<div>` purely to carry the attribute —
 * documented as "somewhere to put a `<Link>` in a menu item", so using it to rescue an attribute is
 * abuse, and it adds a DOM layer that exists only for tests.
 */
describe("DropdownMenuItem — forwards identity attributes", () => {
  const renderMenu = () =>
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger asChild>
          <Button data-testid="trigger">open</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem data-testid="item" id="item-id" data-kind="language">
            item
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

  it("keeps the trigger's attributes — the half that already worked", () => {
    renderMenu();
    expect(document.querySelector('[data-testid="trigger"]')).not.toBeNull();
  });

  it("forwards data-testid to the item", () => {
    renderMenu();
    expect(document.querySelector('[data-testid="item"]')).not.toBeNull();
  });

  it("forwards an arbitrary data-* to the item, not just data-testid", () => {
    renderMenu();
    expect(document.querySelector('[data-kind="language"]')).not.toBeNull();
  });

  it("forwards id — what aria-activedescendant points at", () => {
    renderMenu();
    expect(document.querySelector("#item-id")).not.toBeNull();
  });

  it("puts them on the SAME element as the item's own slot, not a wrapper", () => {
    renderMenu();
    const byTestId = document.querySelector('[data-testid="item"]');
    expect(byTestId?.getAttribute("data-slot")).toBe("dropdown-menu-item");
    expect(byTestId?.getAttribute("role")).toBe("menuitem");
  });

  it("does not let a forwarded attribute clobber the item's own bookkeeping", () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger asChild>
          <Button>open</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem data-testid="plain">plain</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    const item = document.querySelector('[data-testid="plain"]');
    expect(item?.getAttribute("data-variant")).toBe("default");
  });
});
