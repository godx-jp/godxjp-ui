import { describe, it } from "vitest";
import { Topbar } from "../topbar";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "../../navigation/dropdown-menu";
import { expectNoA11yViolations } from "@/test/a11y";

// Topbar emits a row of icon/text chrome buttons that must all carry accessible
// names (toggle, search, notifications, tweaks, product/project chips).
describe("Topbar a11y", () => {
  it("has no axe violations with a fully-composed app topbar", async () => {
    await expectNoA11yViolations(
      <header>
        <Topbar
          product={{ name: "CoreBooks", color: "hsl(var(--attention))" }}
          project={{ name: "FY2026" }}
          collapsed={false}
          onToggleCollapsed={() => {}}
          onSearchOpen={() => {}}
          onNotificationsOpen={() => {}}
          onTweaksOpen={() => {}}
          unread
          productMenu={
            <DropdownMenuContent>
              <DropdownMenuLabel>Sản phẩm</DropdownMenuLabel>
              <DropdownMenuItem>CoreBooks</DropdownMenuItem>
              <DropdownMenuItem>CorePay</DropdownMenuItem>
            </DropdownMenuContent>
          }
        />
      </header>,
    );
  });
});
