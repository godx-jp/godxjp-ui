import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "../navigation-menu";
import { expectNoA11yViolations } from "@/test/a11y";

function Demo() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>勘定</NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuLink href="/journal">仕訳</NavigationMenuLink>
            <NavigationMenuLink href="/ledger">元帳</NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="/reports">レポート</NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

describe("NavigationMenu", () => {
  it("renders a navigation landmark with its top-level entries", () => {
    render(<Demo />);
    expect(screen.getByRole("navigation")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /勘定/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "レポート" })).toBeInTheDocument();
  });

  it("the trigger is collapsed until activated", () => {
    render(<Demo />);
    expect(screen.getByRole("button", { name: /勘定/ })).toHaveAttribute("aria-expanded", "false");
  });

  it("activating the trigger reveals its links", async () => {
    const user = userEvent.setup();
    render(<Demo />);
    await user.click(screen.getByRole("button", { name: /勘定/ }));
    expect(screen.getByRole("button", { name: /勘定/ })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", { name: "仕訳" })).toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    await expectNoA11yViolations(<Demo />);
  });
});
