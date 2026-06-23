import { describe, it } from "vitest";
import { Button } from "../../general/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "../dropdown-menu";
import { expectNoA11yViolations } from "@/test/a11y";

// Render the menu OPEN (defaultOpen) so the menuitems live in the DOM and axe can
// assert the menu/menuitem/menuitemcheckbox/menuitemradio ARIA wiring is valid.
describe("DropdownMenu a11y", () => {
  it("has no axe violations with an open, fully-composed menu", async () => {
    await expectNoA11yViolations(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger asChild>
          <Button type="button">Hành động</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Tác vụ</DropdownMenuLabel>
          <DropdownMenuItem>
            Sửa
            <DropdownMenuShortcut>Ctrl+E</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuCheckboxItem checked>Nhận thông báo</DropdownMenuCheckboxItem>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value="air">
            <DropdownMenuRadioItem value="air">Đường bay</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="sea">Đường biển</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">Xóa</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
  });
});
